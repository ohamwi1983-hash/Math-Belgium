(function () {
  "use strict";

  /* ================================================================
   * <produit-modules-arguments-widget> — atelier interactif : z₁=r₁e^{iθ₁}
   * et z₂=r₂e^{iθ₂}, curseurs r₁,θ₁,r₂,θ₂, sélecteur produit/quotient —
   * matérialise en direct le piège de la section : les MODULES se
   * multiplient (jamais ne s'additionnent), les ARGUMENTS s'additionnent
   * (jamais ne se multiplient) — et l'inverse pour le quotient. Réglage
   * par défaut (r₁=2,θ₁=60°,r₂=3,θ₂=30°, mode produit) reproduit
   * exactement l'exemple résolu : z₁z₂ = 6e^{iπ/2}. Web Component
   * (Shadow DOM).
   * ================================================================ */

  var D2R = Math.PI / 180;
  var DEFAUT = { r1: 2, theta1: 60, r2: 3, theta2: 30, mode: "produit" };
  var BORNES_R = { min: 1, max: 3, step: 0.1 };
  var BORNES_THETA = { min: 0, max: 180, step: 1 };

  var X_MIN = -10, X_MAX = 10, Y_MIN = -10, Y_MAX = 10;
  var LARGEUR = 360, HAUTEUR = 360, MARGE = 26;

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
    '.mode-row{display:flex;justify-content:center;gap:8px;margin-bottom:12px;}' +
    '.mode-row button{flex:1 1 0;max-width:140px;padding:8px 10px;border-radius:var(--radius,3px);border:1px solid var(--line,#e2d8c8);background:var(--surface,#fff);color:var(--ink-soft,#6b6055);font-weight:700;cursor:pointer;font-size:0.9rem;font-family:inherit;}' +
    '.mode-row button.actif{background:var(--accent,#a8471f);border-color:var(--accent,#a8471f);color:#fff;}' +
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:12px;}' +
    'svg{width:100%;max-width:360px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.3;}' +
    '.fleche{fill:var(--ink-soft,#6b6055);}' +
    '.vecteur-z1{stroke:var(--accent,#a8471f);stroke-width:2;}' +
    '.vecteur-z2{stroke:var(--good,#2f7a4f);stroke-width:2;}' +
    '.vecteur-resultat{stroke:var(--bad,#b23a3a);stroke-width:2.4;}' +
    '.point-z1{fill:var(--accent,#a8471f);}' +
    '.point-z2{fill:var(--good,#2f7a4f);}' +
    '.point-resultat{fill:var(--bad,#b23a3a);}' +
    '.angle-arc-1{stroke:var(--accent,#a8471f);stroke-width:1.3;fill:none;opacity:0.8;}' +
    '.angle-arc-2{stroke:var(--good,#2f7a4f);stroke-width:1.3;fill:none;opacity:0.8;}' +
    '.etiquette{font-size:11px;font-weight:700;font-family:var(--sans,sans-serif);}' +
    '.etiquette-z1{fill:var(--accent-ink,#7a3212);}' +
    '.etiquette-z2{fill:var(--good,#2f7a4f);}' +
    '.etiquette-resultat{fill:var(--bad,#b23a3a);}' +
    '.lecture{text-align:center;font-size:0.85rem;font-weight:600;margin:0 0 18px;padding:10px 14px;border-radius:var(--radius,3px);color:var(--accent-ink,#7a3212);background:var(--surface-2,#faf6f0);line-height:1.7;font-variant-numeric:tabular-nums;}' +
    '.controles{display:flex;flex-direction:column;gap:12px;}' +
    '.curseur{display:flex;flex-direction:column;gap:6px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3212);}' +
    '.curseur-row{display:flex;align-items:center;gap:12px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;accent-color:var(--accent,#a8471f);}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:56px;text-align:right;font-size:0.92rem;}' +
    '.btn-reset{margin-top:2px;padding:8px 14px;border-radius:var(--radius,3px);border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font-weight:600;cursor:pointer;font-size:0.88rem;font-family:inherit;align-self:center;}' +
    '.btn-reset:hover{background:var(--accent-soft-line,#e8c4a4);}' +
    '</style>' +
    '<div class="mode-row" id="mode">' +
    '<button type="button" data-mode="produit">z₁ × z₂</button>' +
    '<button type="button" data-mode="quotient">z₁ / z₂</button>' +
    '</div>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" xmlns="http://www.w3.org/2000/svg"></svg></div>' +
    '<p class="lecture" id="lecture"></p>' +
    '<div class="controles">' +
    '<div class="curseur"><label for="r1">r₁ = |z₁|</label><div class="curseur-row">' +
    '<input type="range" id="r1" min="' + BORNES_R.min + '" max="' + BORNES_R.max + '" step="' + BORNES_R.step + '" value="' + DEFAUT.r1 + '">' +
    '<span class="curseur-valeur" id="r1-valeur"></span></div></div>' +
    '<div class="curseur"><label for="theta1">θ₁ = arg(z₁)</label><div class="curseur-row">' +
    '<input type="range" id="theta1" min="' + BORNES_THETA.min + '" max="' + BORNES_THETA.max + '" step="' + BORNES_THETA.step + '" value="' + DEFAUT.theta1 + '">' +
    '<span class="curseur-valeur" id="theta1-valeur"></span></div></div>' +
    '<div class="curseur"><label for="r2">r₂ = |z₂|</label><div class="curseur-row">' +
    '<input type="range" id="r2" min="' + BORNES_R.min + '" max="' + BORNES_R.max + '" step="' + BORNES_R.step + '" value="' + DEFAUT.r2 + '">' +
    '<span class="curseur-valeur" id="r2-valeur"></span></div></div>' +
    '<div class="curseur"><label for="theta2">θ₂ = arg(z₂)</label><div class="curseur-row">' +
    '<input type="range" id="theta2" min="' + BORNES_THETA.min + '" max="' + BORNES_THETA.max + '" step="' + BORNES_THETA.step + '" value="' + DEFAUT.theta2 + '">' +
    '<span class="curseur-valeur" id="theta2-valeur"></span></div></div>' +
    '<button class="btn-reset" id="reset" type="button">Réinitialiser</button>' +
    '</div>';

  class ProduitModulesArgumentsWidgetClass extends HTMLElement {
    constructor() {
      super();
      this._init();
    }
  }

  ProduitModulesArgumentsWidgetClass.prototype._init = function () {
    var shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this._r1 = DEFAUT.r1; this._theta1 = DEFAUT.theta1;
    this._r2 = DEFAUT.r2; this._theta2 = DEFAUT.theta2;
    this._mode = DEFAUT.mode;
    this._svg = shadow.getElementById("svg");
    this._modeWrap = shadow.getElementById("mode");
    this._lecture = shadow.getElementById("lecture");
    this._inputR1 = shadow.getElementById("r1");
    this._inputTheta1 = shadow.getElementById("theta1");
    this._inputR2 = shadow.getElementById("r2");
    this._inputTheta2 = shadow.getElementById("theta2");
    this._valeurR1 = shadow.getElementById("r1-valeur");
    this._valeurTheta1 = shadow.getElementById("theta1-valeur");
    this._valeurR2 = shadow.getElementById("r2-valeur");
    this._valeurTheta2 = shadow.getElementById("theta2-valeur");
    this._resetBtn = shadow.getElementById("reset");
  };

  ProduitModulesArgumentsWidgetClass.prototype.connectedCallback = function () {
    var self = this;
    this._onInputR1 = function () { self._r1 = parseFloat(self._inputR1.value); self._rendre(); };
    this._onInputTheta1 = function () { self._theta1 = parseFloat(self._inputTheta1.value); self._rendre(); };
    this._onInputR2 = function () { self._r2 = parseFloat(self._inputR2.value); self._rendre(); };
    this._onInputTheta2 = function () { self._theta2 = parseFloat(self._inputTheta2.value); self._rendre(); };
    this._onClickMode = function (evt) {
      var btn = evt.target.closest("button[data-mode]");
      if (!btn) return;
      self._mode = btn.getAttribute("data-mode");
      self._rendre();
    };
    this._onReset = function () {
      self._r1 = DEFAUT.r1; self._theta1 = DEFAUT.theta1;
      self._r2 = DEFAUT.r2; self._theta2 = DEFAUT.theta2;
      self._mode = DEFAUT.mode;
      self._inputR1.value = String(DEFAUT.r1);
      self._inputTheta1.value = String(DEFAUT.theta1);
      self._inputR2.value = String(DEFAUT.r2);
      self._inputTheta2.value = String(DEFAUT.theta2);
      self._rendre();
    };
    this._inputR1.addEventListener("input", this._onInputR1);
    this._inputTheta1.addEventListener("input", this._onInputTheta1);
    this._inputR2.addEventListener("input", this._onInputR2);
    this._inputTheta2.addEventListener("input", this._onInputTheta2);
    this._modeWrap.addEventListener("click", this._onClickMode);
    this._resetBtn.addEventListener("click", this._onReset);
    this._rendre();
  };

  ProduitModulesArgumentsWidgetClass.prototype.disconnectedCallback = function () {
    this._inputR1.removeEventListener("input", this._onInputR1);
    this._inputTheta1.removeEventListener("input", this._onInputTheta1);
    this._inputR2.removeEventListener("input", this._onInputR2);
    this._inputTheta2.removeEventListener("input", this._onInputTheta2);
    this._modeWrap.removeEventListener("click", this._onClickMode);
    this._resetBtn.removeEventListener("click", this._onReset);
  };

  ProduitModulesArgumentsWidgetClass.prototype._toPx = function (xMath, yMath) {
    var px = MARGE + (xMath - X_MIN) / (X_MAX - X_MIN) * (LARGEUR - 2 * MARGE);
    var py = HAUTEUR - MARGE - (yMath - Y_MIN) / (Y_MAX - Y_MIN) * (HAUTEUR - 2 * MARGE);
    return [px, py];
  };

  ProduitModulesArgumentsWidgetClass.prototype._rendre = function () {
    var r1 = this._r1, theta1Deg = this._theta1, r2 = this._r2, theta2Deg = this._theta2, mode = this._mode;
    this._valeurR1.textContent = formatNombreFr(r1, 1);
    this._valeurTheta1.textContent = formatNombreFr(theta1Deg, 0) + "°";
    this._valeurR2.textContent = formatNombreFr(r2, 1);
    this._valeurTheta2.textContent = formatNombreFr(theta2Deg, 0) + "°";

    Array.prototype.forEach.call(this._modeWrap.querySelectorAll("button"), function (btn) {
      btn.className = btn.getAttribute("data-mode") === mode ? "actif" : "";
    });

    var theta1 = theta1Deg * D2R, theta2 = theta2Deg * D2R;
    var rRes, thetaResDeg, symbole;
    if (mode === "produit") {
      rRes = r1 * r2;
      thetaResDeg = theta1Deg + theta2Deg;
      symbole = "z₁z₂";
    } else {
      rRes = r1 / r2;
      thetaResDeg = theta1Deg - theta2Deg;
      symbole = "z₁/z₂";
    }
    var thetaRes = thetaResDeg * D2R;

    var z1 = { x: r1 * Math.cos(theta1), y: r1 * Math.sin(theta1) };
    var z2 = { x: r2 * Math.cos(theta2), y: r2 * Math.sin(theta2) };
    var zRes = { x: rRes * Math.cos(thetaRes), y: rRes * Math.sin(thetaRes) };

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

    function dessinerVecteur(pt, classeLigne, classePoint, classeEtiquette, texte) {
      var p = self._toPx(pt.x, pt.y);
      svg.appendChild(svgEl(ns, "line", { x1: origine[0].toFixed(2), y1: origine[1].toFixed(2), x2: p[0].toFixed(2), y2: p[1].toFixed(2), class: classeLigne }));
      svg.appendChild(svgEl(ns, "circle", { cx: p[0].toFixed(2), cy: p[1].toFixed(2), r: 5, class: classePoint }));
      var procheDroite = p[0] > LARGEUR - 60;
      var et = svgEl(ns, "text", { x: (p[0] + (procheDroite ? -9 : 9)).toFixed(2), y: (p[1] - 8).toFixed(2), "text-anchor": procheDroite ? "end" : "start", class: "etiquette " + classeEtiquette });
      et.textContent = texte;
      svg.appendChild(et);
    }

    dessinerVecteur(z1, "vecteur-z1", "point-z1", "etiquette-z1", "z₁");
    dessinerVecteur(z2, "vecteur-z2", "point-z2", "etiquette-z2", "z₂");
    dessinerVecteur(zRes, "vecteur-resultat", "point-resultat", "etiquette-resultat", symbole);

    this._lecture.textContent =
      mode === "produit"
        ? "modules : " + formatNombreFr(r1, 1) + " × " + formatNombreFr(r2, 1) + " = " + formatNombreFr(rRes, 2) +
          "   |   arguments : " + formatNombreFr(theta1Deg, 0) + "° + " + formatNombreFr(theta2Deg, 0) + "° = " + formatNombreFr(((thetaResDeg % 360) + 360) % 360, 0) + "°"
        : "modules : " + formatNombreFr(r1, 1) + " / " + formatNombreFr(r2, 1) + " = " + formatNombreFr(rRes, 2) +
          "   |   arguments : " + formatNombreFr(theta1Deg, 0) + "° − " + formatNombreFr(theta2Deg, 0) + "° = " + formatNombreFr(((thetaResDeg % 360) + 360) % 360, 0) + "°";
  };

  if (!customElements.get("produit-modules-arguments-widget")) {
    customElements.define("produit-modules-arguments-widget", ProduitModulesArgumentsWidgetClass);
  }
})();
