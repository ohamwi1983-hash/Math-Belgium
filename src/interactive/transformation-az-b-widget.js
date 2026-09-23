(function () {
  "use strict";

  /* ================================================================
   * <transformation-az-b-widget> — atelier interactif : z'=az+b, curseurs
   * |a| (module), arg(a) (degrés), bx, by — classe en direct la
   * transformation selon a (translation/rotation/homothétie/similitude,
   * featureTable de la section) et affiche son centre Ω=b/(1−a). Réglage
   * par défaut (|a|=1, arg(a)=90°, b=0) reproduit exactement le cas
   * a=i, b=0 de l'astuce : rotation de centre O et d'angle π/2. Une
   * petite forme (triangle) transformée rend la rotation/réflexion
   * visible sans ambiguïté. Web Component (Shadow DOM).
   * ================================================================ */

  var D2R = Math.PI / 180;
  var DEFAUT = { moduleA: 1, argADeg: 90, bx: 0, by: 0 };
  var BORNES_MODULE = { min: 0.3, max: 2.5, step: 0.05 };
  var BORNES_ARG = { min: 0, max: 360, step: 1 };
  var BORNES_B = { min: -3, max: 3, step: 0.1 };
  var EPS_MODULE = 0.03, EPS_ANGLE_DEG = 2;

  var FORME = [{ x: 2, y: 1 }, { x: 2.7, y: 1.35 }, { x: 2, y: 1.7 }];

  var X_MIN = -7, X_MAX = 9, Y_MIN = -7, Y_MAX = 9;
  var LARGEUR = 380, HAUTEUR = 380, MARGE = 26;

  function formatNombreFr(n, decimales) {
    var facteur = Math.pow(10, decimales);
    var arrondi = Math.round(n * facteur) / facteur;
    if (Object.is(arrondi, -0)) arrondi = 0;
    return arrondi.toFixed(decimales).replace(".", ",").replace("-", "−");
  }

  function svgEl(ns, tag, attrs) {
    var el = document.createElementNS(ns, tag);
    for (var key in attrs) el.setAttribute(key, attrs[key]);
    return el;
  }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' +
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);}' +
    '*{box-sizing:border-box;}' +
    '.formule{text-align:center;font-family:var(--mono,monospace);font-size:0.92rem;font-weight:700;color:var(--ink,#241f1a);margin:0 0 12px;}' +
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:12px;}' +
    'svg{width:100%;max-width:380px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.3;}' +
    '.fleche{fill:var(--ink-soft,#6b6055);}' +
    '.forme-orig{stroke:var(--ink-faint,#9c9083);stroke-width:1.6;fill:var(--ink-faint,#9c9083);fill-opacity:0.12;}' +
    '.forme-image{stroke:var(--accent,#a8471f);stroke-width:2;fill:var(--accent,#a8471f);fill-opacity:0.14;}' +
    '.centre{fill:var(--plan,#5b4ea3);}' +
    '.centre-croix{stroke:var(--plan,#5b4ea3);stroke-width:1.4;}' +
    '.etiquette{font-size:11px;font-weight:700;font-family:var(--sans,sans-serif);}' +
    '.etiquette-orig{fill:var(--ink-soft,#6b6055);}' +
    '.etiquette-image{fill:var(--accent-ink,#7a3212);}' +
    '.etiquette-centre{fill:var(--plan,#5b4ea3);}' +
    '.classification{text-align:center;font-size:0.88rem;font-weight:700;margin:0 0 6px;padding:10px 14px;border-radius:var(--radius,3px);color:var(--accent-ink,#7a3212);background:var(--surface-2,#faf6f0);}' +
    '.centre-texte{text-align:center;font-size:0.8rem;color:var(--ink-soft,#6b6055);margin:0 0 18px;font-variant-numeric:tabular-nums;}' +
    '.controles{display:flex;flex-direction:column;gap:12px;}' +
    '.curseur{display:flex;flex-direction:column;gap:6px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3212);}' +
    '.curseur-row{display:flex;align-items:center;gap:12px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;accent-color:var(--accent,#a8471f);}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:56px;text-align:right;font-size:0.92rem;}' +
    '.btn-reset{margin-top:2px;padding:8px 14px;border-radius:var(--radius,3px);border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font-weight:600;cursor:pointer;font-size:0.88rem;font-family:inherit;align-self:center;}' +
    '.btn-reset:hover{background:var(--accent-soft-line,#e8c4a4);}' +
    '</style>' +
    '<p class="formule" id="formule"></p>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" xmlns="http://www.w3.org/2000/svg"></svg></div>' +
    '<p class="classification" id="classification"></p>' +
    '<p class="centre-texte" id="centre-texte"></p>' +
    '<div class="controles">' +
    '<div class="curseur"><label for="module">|a|</label><div class="curseur-row">' +
    '<input type="range" id="module" min="' + BORNES_MODULE.min + '" max="' + BORNES_MODULE.max + '" step="' + BORNES_MODULE.step + '" value="' + DEFAUT.moduleA + '">' +
    '<span class="curseur-valeur" id="module-valeur"></span></div></div>' +
    '<div class="curseur"><label for="arg">arg(a)</label><div class="curseur-row">' +
    '<input type="range" id="arg" min="' + BORNES_ARG.min + '" max="' + BORNES_ARG.max + '" step="' + BORNES_ARG.step + '" value="' + DEFAUT.argADeg + '">' +
    '<span class="curseur-valeur" id="arg-valeur"></span></div></div>' +
    '<div class="curseur"><label for="bx">Re(b)</label><div class="curseur-row">' +
    '<input type="range" id="bx" min="' + BORNES_B.min + '" max="' + BORNES_B.max + '" step="' + BORNES_B.step + '" value="' + DEFAUT.bx + '">' +
    '<span class="curseur-valeur" id="bx-valeur"></span></div></div>' +
    '<div class="curseur"><label for="by">Im(b)</label><div class="curseur-row">' +
    '<input type="range" id="by" min="' + BORNES_B.min + '" max="' + BORNES_B.max + '" step="' + BORNES_B.step + '" value="' + DEFAUT.by + '">' +
    '<span class="curseur-valeur" id="by-valeur"></span></div></div>' +
    '<button class="btn-reset" id="reset" type="button">Réinitialiser</button>' +
    '</div>';

  class TransformationAzBWidgetClass extends HTMLElement {
    constructor() {
      super();
      this._init();
    }
  }

  TransformationAzBWidgetClass.prototype._init = function () {
    var shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this._moduleA = DEFAUT.moduleA; this._argADeg = DEFAUT.argADeg;
    this._bx = DEFAUT.bx; this._by = DEFAUT.by;
    this._formule = shadow.getElementById("formule");
    this._svg = shadow.getElementById("svg");
    this._classification = shadow.getElementById("classification");
    this._centreTexte = shadow.getElementById("centre-texte");
    this._inputModule = shadow.getElementById("module");
    this._inputArg = shadow.getElementById("arg");
    this._inputBx = shadow.getElementById("bx");
    this._inputBy = shadow.getElementById("by");
    this._valeurModule = shadow.getElementById("module-valeur");
    this._valeurArg = shadow.getElementById("arg-valeur");
    this._valeurBx = shadow.getElementById("bx-valeur");
    this._valeurBy = shadow.getElementById("by-valeur");
    this._resetBtn = shadow.getElementById("reset");
  };

  TransformationAzBWidgetClass.prototype.connectedCallback = function () {
    var self = this;
    this._onInputModule = function () { self._moduleA = parseFloat(self._inputModule.value); self._rendre(); };
    this._onInputArg = function () { self._argADeg = parseFloat(self._inputArg.value); self._rendre(); };
    this._onInputBx = function () { self._bx = parseFloat(self._inputBx.value); self._rendre(); };
    this._onInputBy = function () { self._by = parseFloat(self._inputBy.value); self._rendre(); };
    this._onReset = function () {
      self._moduleA = DEFAUT.moduleA; self._argADeg = DEFAUT.argADeg;
      self._bx = DEFAUT.bx; self._by = DEFAUT.by;
      self._inputModule.value = String(DEFAUT.moduleA);
      self._inputArg.value = String(DEFAUT.argADeg);
      self._inputBx.value = String(DEFAUT.bx);
      self._inputBy.value = String(DEFAUT.by);
      self._rendre();
    };
    this._inputModule.addEventListener("input", this._onInputModule);
    this._inputArg.addEventListener("input", this._onInputArg);
    this._inputBx.addEventListener("input", this._onInputBx);
    this._inputBy.addEventListener("input", this._onInputBy);
    this._resetBtn.addEventListener("click", this._onReset);
    this._rendre();
  };

  TransformationAzBWidgetClass.prototype.disconnectedCallback = function () {
    this._inputModule.removeEventListener("input", this._onInputModule);
    this._inputArg.removeEventListener("input", this._onInputArg);
    this._inputBx.removeEventListener("input", this._onInputBx);
    this._inputBy.removeEventListener("input", this._onInputBy);
    this._resetBtn.removeEventListener("click", this._onReset);
  };

  TransformationAzBWidgetClass.prototype._toPx = function (xMath, yMath) {
    var px = MARGE + (xMath - X_MIN) / (X_MAX - X_MIN) * (LARGEUR - 2 * MARGE);
    var py = HAUTEUR - MARGE - (yMath - Y_MIN) / (Y_MAX - Y_MIN) * (HAUTEUR - 2 * MARGE);
    return [px, py];
  };

  function cMul(u, v) { return { x: u.x * v.x - u.y * v.y, y: u.x * v.y + u.y * v.x }; }
  function cAdd(u, v) { return { x: u.x + v.x, y: u.y + v.y }; }
  function cSub(u, v) { return { x: u.x - v.x, y: u.y - v.y }; }
  function cDiv(u, v) {
    var d = v.x * v.x + v.y * v.y;
    return { x: (u.x * v.x + u.y * v.y) / d, y: (u.y * v.x - u.x * v.y) / d };
  }

  TransformationAzBWidgetClass.prototype._rendre = function () {
    var moduleA = this._moduleA, argADeg = this._argADeg, bx = this._bx, by = this._by;
    this._valeurModule.textContent = formatNombreFr(moduleA, 2);
    this._valeurArg.textContent = formatNombreFr(argADeg, 0) + "°";
    this._valeurBx.textContent = formatNombreFr(bx, 1);
    this._valeurBy.textContent = formatNombreFr(by, 1);

    var argA = argADeg * D2R;
    var a = { x: moduleA * Math.cos(argA), y: moduleA * Math.sin(argA) };
    var b = { x: bx, y: by };

    this._formule.textContent = "z' = (" + formatNombreFr(a.x, 2) + (a.y >= 0 ? "+" : "") + formatNombreFr(a.y, 2) + "i)·z + (" + formatNombreFr(bx, 1) + (by >= 0 ? "+" : "") + formatNombreFr(by, 1) + "i)";

    var image = FORME.map(function (pt) { return cAdd(cMul(a, pt), b); });

    var ns = "http://www.w3.org/2000/svg";
    var svg = this._svg;
    svg.innerHTML = "";
    var self = this;

    var defs = svgEl(ns, "defs", {});
    var fleche = svgEl(ns, "marker", { id: "fleche", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" });
    fleche.appendChild(svgEl(ns, "path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche" }));
    defs.appendChild(fleche);
    svg.appendChild(defs);

    var origine = self._toPx(0, 0);
    svg.appendChild(svgEl(ns, "line", { x1: MARGE, x2: LARGEUR - MARGE, y1: origine[1].toFixed(2), y2: origine[1].toFixed(2), class: "axe", "marker-end": "url(#fleche)" }));
    svg.appendChild(svgEl(ns, "line", { x1: origine[0].toFixed(2), x2: origine[0].toFixed(2), y1: HAUTEUR - MARGE, y2: MARGE, class: "axe", "marker-end": "url(#fleche)" }));

    function chemin(points) {
      return points.map(function (pt, i) {
        var p = self._toPx(pt.x, pt.y);
        return (i === 0 ? "M" : "L") + p[0].toFixed(2) + " " + p[1].toFixed(2);
      }).join(" ") + " Z";
    }
    svg.appendChild(svgEl(ns, "path", { d: chemin(FORME), class: "forme-orig" }));
    svg.appendChild(svgEl(ns, "path", { d: chemin(image), class: "forme-image" }));

    var pOrig = self._toPx(FORME[0].x, FORME[0].y);
    var etOrig = svgEl(ns, "text", { x: pOrig[0].toFixed(2), y: (pOrig[1] - 8).toFixed(2), "text-anchor": "middle", class: "etiquette etiquette-orig" });
    etOrig.textContent = "M";
    svg.appendChild(etOrig);
    var pImage = self._toPx(image[0].x, image[0].y);
    var etImage = svgEl(ns, "text", { x: pImage[0].toFixed(2), y: (pImage[1] - 8).toFixed(2), "text-anchor": "middle", class: "etiquette etiquette-image" });
    etImage.textContent = "M′";
    svg.appendChild(etImage);

    var estA1 = Math.abs(moduleA - 1) < EPS_MODULE && (Math.abs(argADeg % 360) < EPS_ANGLE_DEG || Math.abs((argADeg % 360) - 360) < EPS_ANGLE_DEG);
    var texteClassification, texteCentre;

    if (estA1) {
      texteClassification = "Translation (a=1) — vecteur d'affixe b = " + formatNombreFr(bx, 1) + (by >= 0 ? "+" : "") + formatNombreFr(by, 1) + "i, aucun centre fixe.";
      texteCentre = "";
    } else {
      var un = { x: 1, y: 0 };
      var unMoinsA = cSub(un, a);
      var omega = cDiv(b, unMoinsA);
      var pOmega = self._toPx(omega.x, omega.y);
      svg.appendChild(svgEl(ns, "line", { x1: (pOmega[0] - 7).toFixed(2), y1: pOmega[1].toFixed(2), x2: (pOmega[0] + 7).toFixed(2), y2: pOmega[1].toFixed(2), class: "centre-croix" }));
      svg.appendChild(svgEl(ns, "line", { x1: pOmega[0].toFixed(2), y1: (pOmega[1] - 7).toFixed(2), x2: pOmega[0].toFixed(2), y2: (pOmega[1] + 7).toFixed(2), class: "centre-croix" }));
      svg.appendChild(svgEl(ns, "circle", { cx: pOmega[0].toFixed(2), cy: pOmega[1].toFixed(2), r: 3.5, class: "centre" }));
      var etOmega = svgEl(ns, "text", { x: (pOmega[0] + 9).toFixed(2), y: (pOmega[1] - 9).toFixed(2), class: "etiquette etiquette-centre" });
      etOmega.textContent = "Ω";
      svg.appendChild(etOmega);
      texteCentre = "Centre Ω = b/(1−a) = (" + formatNombreFr(omega.x, 2) + (omega.y >= 0 ? "+" : "") + formatNombreFr(omega.y, 2) + "i)";

      var estRotation = Math.abs(moduleA - 1) < EPS_MODULE;
      var estReel = Math.abs(argADeg % 180) < EPS_ANGLE_DEG || Math.abs((argADeg % 180) - 180) < EPS_ANGLE_DEG;

      if (estRotation) {
        texteClassification = "Rotation pure (|a|=1, a≠1), angle θ=arg(a)=" + formatNombreFr(argADeg, 0) + "°.";
      } else if (estReel) {
        var rapport = Math.abs(argADeg % 360 - 180) < 90 ? -moduleA : moduleA;
        texteClassification = "Homothétie (a réel), rapport k=" + formatNombreFr(rapport, 2) + ".";
      } else {
        texteClassification = "Similitude générale : rapport |a|=" + formatNombreFr(moduleA, 2) + ", angle arg(a)=" + formatNombreFr(argADeg, 0) + "°.";
      }
    }

    this._classification.textContent = texteClassification;
    this._centreTexte.textContent = texteCentre;
  };

  if (!customElements.get("transformation-az-b-widget")) {
    customElements.define("transformation-az-b-widget", TransformationAzBWidgetClass);
  }
})();
