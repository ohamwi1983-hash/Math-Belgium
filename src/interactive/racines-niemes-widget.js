(function () {
  "use strict";

  /* ================================================================
   * <racines-niemes-widget> — atelier interactif : z=r·e^{iθ}, curseurs
   * n (entier), r (module), θ (argument, degrés) — affiche les n racines
   * n-ièmes de z, régulièrement réparties sur un cercle de rayon r^{1/n},
   * reliées en un polygone régulier à n côtés (matérialise la méthode de
   * la section). L'isobarycentre (astuce : somme nulle dès n≥2) est
   * toujours marqué à l'origine. Réglage par défaut (n=4, r=1, θ=0)
   * reproduit exactement l'exemple du texte : les 4 racines quatrièmes
   * de l'unité sont 1, i, −1, −i. Web Component (Shadow DOM).
   * ================================================================ */

  var D2R = Math.PI / 180;
  var DEFAUT = { n: 4, r: 1, thetaDeg: 0 };
  var BORNES_N = { min: 2, max: 8, step: 1 };
  var BORNES_R = { min: 0.3, max: 2, step: 0.05 };
  var BORNES_THETA = { min: 0, max: 360, step: 1 };

  var X_MIN = -2, X_MAX = 2, Y_MIN = -2, Y_MAX = 2;
  var LARGEUR = 340, HAUTEUR = 340, MARGE = 30;

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
    '.formule{text-align:center;font-size:0.9rem;color:var(--ink,#241f1a);margin:0 0 12px;font-family:var(--mono,monospace);font-weight:700;}' +
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:12px;}' +
    'svg{width:100%;max-width:340px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.3;}' +
    '.fleche{fill:var(--ink-soft,#6b6055);}' +
    '.cercle-racines{stroke:var(--ink-faint,#9c9083);stroke-width:1.3;fill:none;}' +
    '.polygone{stroke:var(--accent,#a8471f);stroke-width:1.8;fill:var(--accent,#a8471f);fill-opacity:0.06;}' +
    '.point-racine{fill:var(--accent,#a8471f);}' +
    '.point-z0{fill:var(--good,#2f7a4f);}' +
    '.point-origine{fill:var(--plan,#5b4ea3);}' +
    '.angle-arc{stroke:var(--good,#2f7a4f);stroke-width:1.4;fill:none;}' +
    '.etiquette{font-size:11px;font-weight:700;font-family:var(--sans,sans-serif);fill:var(--accent-ink,#7a3212);}' +
    '.etiquette-z0{fill:var(--good,#2f7a4f);}' +
    '.etiquette-origine{font-size:10px;fill:var(--plan,#5b4ea3);font-family:var(--sans,sans-serif);}' +
    '.lecture{text-align:center;font-size:0.86rem;font-weight:600;margin:0 0 18px;padding:10px 14px;border-radius:var(--radius,3px);color:var(--accent-ink,#7a3212);background:var(--surface-2,#faf6f0);line-height:1.6;}' +
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
    '<p class="lecture" id="lecture"></p>' +
    '<div class="controles">' +
    '<div class="curseur"><label for="n">n</label><div class="curseur-row">' +
    '<input type="range" id="n" min="' + BORNES_N.min + '" max="' + BORNES_N.max + '" step="' + BORNES_N.step + '" value="' + DEFAUT.n + '">' +
    '<span class="curseur-valeur" id="n-valeur"></span></div></div>' +
    '<div class="curseur"><label for="r">r = |z|</label><div class="curseur-row">' +
    '<input type="range" id="r" min="' + BORNES_R.min + '" max="' + BORNES_R.max + '" step="' + BORNES_R.step + '" value="' + DEFAUT.r + '">' +
    '<span class="curseur-valeur" id="r-valeur"></span></div></div>' +
    '<div class="curseur"><label for="theta">θ = arg(z)</label><div class="curseur-row">' +
    '<input type="range" id="theta" min="' + BORNES_THETA.min + '" max="' + BORNES_THETA.max + '" step="' + BORNES_THETA.step + '" value="' + DEFAUT.thetaDeg + '">' +
    '<span class="curseur-valeur" id="theta-valeur"></span></div></div>' +
    '<button class="btn-reset" id="reset" type="button">Réinitialiser</button>' +
    '</div>';

  class RacinesNiemesWidgetClass extends HTMLElement {
    constructor() {
      super();
      this._init();
    }
  }

  RacinesNiemesWidgetClass.prototype._init = function () {
    var shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this._n = DEFAUT.n;
    this._r = DEFAUT.r;
    this._thetaDeg = DEFAUT.thetaDeg;
    this._formule = shadow.getElementById("formule");
    this._svg = shadow.getElementById("svg");
    this._lecture = shadow.getElementById("lecture");
    this._inputN = shadow.getElementById("n");
    this._inputR = shadow.getElementById("r");
    this._inputTheta = shadow.getElementById("theta");
    this._valeurN = shadow.getElementById("n-valeur");
    this._valeurR = shadow.getElementById("r-valeur");
    this._valeurTheta = shadow.getElementById("theta-valeur");
    this._resetBtn = shadow.getElementById("reset");
  };

  RacinesNiemesWidgetClass.prototype.connectedCallback = function () {
    var self = this;
    this._onInputN = function () { self._n = parseInt(self._inputN.value, 10); self._rendre(); };
    this._onInputR = function () { self._r = parseFloat(self._inputR.value); self._rendre(); };
    this._onInputTheta = function () { self._thetaDeg = parseFloat(self._inputTheta.value); self._rendre(); };
    this._onReset = function () {
      self._n = DEFAUT.n; self._r = DEFAUT.r; self._thetaDeg = DEFAUT.thetaDeg;
      self._inputN.value = String(DEFAUT.n);
      self._inputR.value = String(DEFAUT.r);
      self._inputTheta.value = String(DEFAUT.thetaDeg);
      self._rendre();
    };
    this._inputN.addEventListener("input", this._onInputN);
    this._inputR.addEventListener("input", this._onInputR);
    this._inputTheta.addEventListener("input", this._onInputTheta);
    this._resetBtn.addEventListener("click", this._onReset);
    this._rendre();
  };

  RacinesNiemesWidgetClass.prototype.disconnectedCallback = function () {
    this._inputN.removeEventListener("input", this._onInputN);
    this._inputR.removeEventListener("input", this._onInputR);
    this._inputTheta.removeEventListener("input", this._onInputTheta);
    this._resetBtn.removeEventListener("click", this._onReset);
  };

  RacinesNiemesWidgetClass.prototype._toPx = function (xMath, yMath) {
    var px = MARGE + (xMath - X_MIN) / (X_MAX - X_MIN) * (LARGEUR - 2 * MARGE);
    var py = HAUTEUR - MARGE - (yMath - Y_MIN) / (Y_MAX - Y_MIN) * (HAUTEUR - 2 * MARGE);
    return [px, py];
  };

  RacinesNiemesWidgetClass.prototype._rendre = function () {
    var n = this._n, r = this._r, thetaDeg = this._thetaDeg;
    this._valeurN.textContent = String(n);
    this._valeurR.textContent = formatNombreFr(r, 2);
    this._valeurTheta.textContent = formatNombreFr(thetaDeg, 0) + "°";
    this._formule.textContent = "z = " + formatNombreFr(r, 2) + "·e^(i·" + formatNombreFr(thetaDeg, 0) + "°)";

    var rRacine = Math.pow(r, 1 / n);
    var thetaRad = thetaDeg * D2R;

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
    var etRe = svgEl(ns, "text", { x: LARGEUR - MARGE + 6, y: origine[1] + 4, class: "etiquette-origine" });
    etRe.textContent = "Re";
    svg.appendChild(etRe);
    var etIm = svgEl(ns, "text", { x: origine[0] + 6, y: MARGE - 8, class: "etiquette-origine" });
    etIm.textContent = "Im";
    svg.appendChild(etIm);

    var rayonPx = (rRacine / (X_MAX - X_MIN)) * (LARGEUR - 2 * MARGE);
    svg.appendChild(svgEl(ns, "circle", { cx: origine[0].toFixed(2), cy: origine[1].toFixed(2), r: rayonPx.toFixed(2), class: "cercle-racines" }));

    var racines = [];
    for (var k = 0; k < n; k++) {
      var angleK = (thetaRad + 2 * Math.PI * k) / n;
      racines.push({ x: rRacine * Math.cos(angleK), y: rRacine * Math.sin(angleK), angle: angleK });
    }

    var chemin = racines.map(function (pt, i) {
      var p = self._toPx(pt.x, pt.y);
      return (i === 0 ? "M" : "L") + p[0].toFixed(2) + " " + p[1].toFixed(2);
    }).join(" ") + " Z";
    svg.appendChild(svgEl(ns, "path", { d: chemin, class: "polygone" }));

    var rArc = 18;
    var arcEnd = self._toPx(rArc / ((LARGEUR - 2 * MARGE) / (X_MAX - X_MIN)) * Math.cos(racines[0].angle), rArc / ((LARGEUR - 2 * MARGE) / (X_MAX - X_MIN)) * Math.sin(racines[0].angle));
    svg.appendChild(svgEl(ns, "path", {
      d: "M" + (origine[0] + rArc) + " " + origine[1] + " A" + rArc + " " + rArc + " 0 " + (racines[0].angle > Math.PI ? 1 : 0) + " 0 " + arcEnd[0].toFixed(2) + " " + arcEnd[1].toFixed(2),
      class: "angle-arc",
    }));

    racines.forEach(function (pt, i) {
      var p = self._toPx(pt.x, pt.y);
      svg.appendChild(svgEl(ns, "circle", { cx: p[0].toFixed(2), cy: p[1].toFixed(2), r: 5, class: i === 0 ? "point-z0" : "point-racine" }));
      var procheDroite = p[0] > LARGEUR - 55;
      var et = svgEl(ns, "text", { x: (p[0] + (procheDroite ? -9 : 9)).toFixed(2), y: (p[1] - 8).toFixed(2), "text-anchor": procheDroite ? "end" : "start", class: "etiquette " + (i === 0 ? "etiquette-z0" : "") });
      et.textContent = "z" + i;
      svg.appendChild(et);
    });

    svg.appendChild(svgEl(ns, "circle", { cx: origine[0].toFixed(2), cy: origine[1].toFixed(2), r: 3.5, class: "point-origine" }));

    var espacementDeg = 360 / n;
    this._lecture.textContent =
      n + " racines, module r^(1/n)=" + formatNombreFr(rRacine, 3) + ", espacées de " + formatNombreFr(espacementDeg, 1) +
      "° (=360°/" + n + ") — isobarycentre en O, la somme des " + n + " racines vaut toujours 0.";
  };

  if (!customElements.get("racines-niemes-widget")) {
    customElements.define("racines-niemes-widget", RacinesNiemesWidgetClass);
  }
})();
