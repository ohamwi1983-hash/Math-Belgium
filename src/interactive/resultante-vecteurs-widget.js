(function () {
  "use strict";

  /* ================================================================
   * <resultante-vecteurs-widget> — atelier interactif : F₁, F₂ (curseurs,
   * en N), θ (angle entre les deux, curseur) — règle du parallélogramme
   * en direct, R et la déviation recalculés par la loi des cosinus/sinus.
   * Réglage par défaut (F₁=50N, F₂=30N, θ=60°) reproduit exactement
   * l'exemple résolu : R=70N, déviation≈21,8°. Web Component
   * (Shadow DOM).
   * ================================================================ */

  var D2R = Math.PI / 180;
  var DEFAUT = { f1: 50, f2: 30, theta: 60 };
  var BORNES_F = { min: 20, max: 70, step: 1 };
  var BORNES_THETA = { min: 20, max: 160, step: 1 };
  var ECHELLE = 0.08;

  var X_MIN = -6, X_MAX = 13, Y_MIN = -2, Y_MAX = 7;
  var LARGEUR = 420, HAUTEUR = 300, MARGE = 32;

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
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:12px;}' +
    'svg{width:100%;max-width:420px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.4;}' +
    '.fleche{fill:var(--ink-soft,#6b6055);}' +
    '.vecteur-f1{stroke:var(--good,#2f7a4f);stroke-width:2.2;}' +
    '.vecteur-f2{stroke:var(--attn,#a8791f);stroke-width:2.2;}' +
    '.vecteur-r{stroke:var(--accent,#a8471f);stroke-width:2.6;}' +
    '.parallelogramme{stroke:var(--ink-faint,#9c9083);stroke-width:1.2;stroke-dasharray:4 3;}' +
    '.angle-arc{stroke:var(--accent,#a8471f);stroke-width:1.3;fill:none;}' +
    '.etiquette{font-size:12px;font-weight:700;font-family:var(--sans,sans-serif);}' +
    '.etiquette-f1{fill:var(--good,#2f7a4f);}' +
    '.etiquette-f2{fill:var(--attn-ink,#7a5a12);}' +
    '.etiquette-r{fill:var(--accent-ink,#7a3212);}' +
    '.lecture{text-align:center;font-size:0.86rem;font-weight:600;margin:0 0 18px;padding:10px 14px;border-radius:var(--radius,3px);color:var(--accent-ink,#7a3212);background:var(--surface-2,#faf6f0);line-height:1.7;font-variant-numeric:tabular-nums;}' +
    '.controles{display:flex;flex-direction:column;gap:12px;}' +
    '.curseur{display:flex;flex-direction:column;gap:6px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3212);}' +
    '.curseur-row{display:flex;align-items:center;gap:12px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;accent-color:var(--accent,#a8471f);}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:56px;text-align:right;font-size:0.92rem;}' +
    '.btn-reset{margin-top:2px;padding:8px 14px;border-radius:var(--radius,3px);border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font-weight:600;cursor:pointer;font-size:0.88rem;font-family:inherit;align-self:center;}' +
    '.btn-reset:hover{background:var(--accent-soft-line,#e8c4a4);}' +
    '</style>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" xmlns="http://www.w3.org/2000/svg"></svg></div>' +
    '<p class="lecture" id="lecture"></p>' +
    '<div class="controles">' +
    '<div class="curseur"><label for="f1">F₁ (N)</label><div class="curseur-row">' +
    '<input type="range" id="f1" min="' + BORNES_F.min + '" max="' + BORNES_F.max + '" step="' + BORNES_F.step + '" value="' + DEFAUT.f1 + '">' +
    '<span class="curseur-valeur" id="f1-valeur"></span></div></div>' +
    '<div class="curseur"><label for="f2">F₂ (N)</label><div class="curseur-row">' +
    '<input type="range" id="f2" min="' + BORNES_F.min + '" max="' + BORNES_F.max + '" step="' + BORNES_F.step + '" value="' + DEFAUT.f2 + '">' +
    '<span class="curseur-valeur" id="f2-valeur"></span></div></div>' +
    '<div class="curseur"><label for="theta">θ (angle entre F₁ et F₂)</label><div class="curseur-row">' +
    '<input type="range" id="theta" min="' + BORNES_THETA.min + '" max="' + BORNES_THETA.max + '" step="' + BORNES_THETA.step + '" value="' + DEFAUT.theta + '">' +
    '<span class="curseur-valeur" id="theta-valeur"></span></div></div>' +
    '<button class="btn-reset" id="reset" type="button">Réinitialiser</button>' +
    '</div>';

  class ResultanteVecteursWidgetClass extends HTMLElement {
    constructor() {
      super();
      this._init();
    }
  }

  ResultanteVecteursWidgetClass.prototype._init = function () {
    var shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this._f1 = DEFAUT.f1; this._f2 = DEFAUT.f2; this._theta = DEFAUT.theta;
    this._svg = shadow.getElementById("svg");
    this._lecture = shadow.getElementById("lecture");
    this._inputF1 = shadow.getElementById("f1");
    this._inputF2 = shadow.getElementById("f2");
    this._inputTheta = shadow.getElementById("theta");
    this._valeurF1 = shadow.getElementById("f1-valeur");
    this._valeurF2 = shadow.getElementById("f2-valeur");
    this._valeurTheta = shadow.getElementById("theta-valeur");
    this._resetBtn = shadow.getElementById("reset");
  };

  ResultanteVecteursWidgetClass.prototype.connectedCallback = function () {
    var self = this;
    this._onInputF1 = function () { self._f1 = parseFloat(self._inputF1.value); self._rendre(); };
    this._onInputF2 = function () { self._f2 = parseFloat(self._inputF2.value); self._rendre(); };
    this._onInputTheta = function () { self._theta = parseFloat(self._inputTheta.value); self._rendre(); };
    this._onReset = function () {
      self._f1 = DEFAUT.f1; self._f2 = DEFAUT.f2; self._theta = DEFAUT.theta;
      self._inputF1.value = String(DEFAUT.f1);
      self._inputF2.value = String(DEFAUT.f2);
      self._inputTheta.value = String(DEFAUT.theta);
      self._rendre();
    };
    this._inputF1.addEventListener("input", this._onInputF1);
    this._inputF2.addEventListener("input", this._onInputF2);
    this._inputTheta.addEventListener("input", this._onInputTheta);
    this._resetBtn.addEventListener("click", this._onReset);
    this._rendre();
  };

  ResultanteVecteursWidgetClass.prototype.disconnectedCallback = function () {
    this._inputF1.removeEventListener("input", this._onInputF1);
    this._inputF2.removeEventListener("input", this._onInputF2);
    this._inputTheta.removeEventListener("input", this._onInputTheta);
    this._resetBtn.removeEventListener("click", this._onReset);
  };

  ResultanteVecteursWidgetClass.prototype._toPx = function (xMath, yMath) {
    var px = MARGE + (xMath - X_MIN) / (X_MAX - X_MIN) * (LARGEUR - 2 * MARGE);
    var py = HAUTEUR - MARGE - (yMath - Y_MIN) / (Y_MAX - Y_MIN) * (HAUTEUR - 2 * MARGE);
    return [px, py];
  };

  ResultanteVecteursWidgetClass.prototype._rendre = function () {
    var f1 = this._f1, f2 = this._f2, thetaDeg = this._theta;
    this._valeurF1.textContent = formatNombreFr(f1, 0) + " N";
    this._valeurF2.textContent = formatNombreFr(f2, 0) + " N";
    this._valeurTheta.textContent = formatNombreFr(thetaDeg, 0) + "°";

    var thetaRad = thetaDeg * D2R;
    var v1 = { x: f1 * ECHELLE, y: 0 };
    var v2 = { x: f2 * Math.cos(thetaRad) * ECHELLE, y: f2 * Math.sin(thetaRad) * ECHELLE };
    var vR = { x: v1.x + v2.x, y: v1.y + v2.y };

    var rCarre = f1 * f1 + f2 * f2 + 2 * f1 * f2 * Math.cos(thetaRad);
    var r = Math.sqrt(rCarre);
    var sinDeviation = (f2 * Math.sin(thetaRad)) / r;
    var deviation = Math.asin(Math.max(-1, Math.min(1, sinDeviation))) / D2R;

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

    var pO = self._toPx(0, 0), pV1 = self._toPx(v1.x, v1.y), pV2 = self._toPx(v2.x, v2.y), pR = self._toPx(vR.x, vR.y);

    svg.appendChild(svgEl(ns, "line", { x1: pV1[0].toFixed(2), y1: pV1[1].toFixed(2), x2: pR[0].toFixed(2), y2: pR[1].toFixed(2), class: "parallelogramme" }));
    svg.appendChild(svgEl(ns, "line", { x1: pV2[0].toFixed(2), y1: pV2[1].toFixed(2), x2: pR[0].toFixed(2), y2: pR[1].toFixed(2), class: "parallelogramme" }));

    var rArc = 22;
    svg.appendChild(svgEl(ns, "path", {
      d: "M" + (pO[0] + rArc) + " " + pO[1] + " A" + rArc + " " + rArc + " 0 0 0 " + (pO[0] + rArc * Math.cos(thetaRad)).toFixed(2) + " " + (pO[1] - rArc * Math.sin(thetaRad)).toFixed(2),
      class: "angle-arc",
    }));

    svg.appendChild(svgEl(ns, "line", { x1: pO[0].toFixed(2), y1: pO[1].toFixed(2), x2: pV1[0].toFixed(2), y2: pV1[1].toFixed(2), class: "vecteur-f1" }));
    svg.appendChild(svgEl(ns, "line", { x1: pO[0].toFixed(2), y1: pO[1].toFixed(2), x2: pV2[0].toFixed(2), y2: pV2[1].toFixed(2), class: "vecteur-f2" }));
    svg.appendChild(svgEl(ns, "line", { x1: pO[0].toFixed(2), y1: pO[1].toFixed(2), x2: pR[0].toFixed(2), y2: pR[1].toFixed(2), class: "vecteur-r" }));

    function etiquette(p, texte, classe, procheGauche) {
      var et = svgEl(ns, "text", { x: (p[0] + (procheGauche ? -9 : 9)).toFixed(2), y: (p[1] - 8).toFixed(2), "text-anchor": procheGauche ? "end" : "start", class: "etiquette " + classe });
      et.textContent = texte;
      svg.appendChild(et);
    }
    etiquette(pV1, "F₁=" + formatNombreFr(f1, 0) + "N", "etiquette-f1", false);
    etiquette(pV2, "F₂=" + formatNombreFr(f2, 0) + "N", "etiquette-f2", v2.x > (X_MAX + X_MIN) / 2);
    etiquette(pR, "R", "etiquette-r", false);

    this._lecture.textContent =
      "R² = " + formatNombreFr(f1, 0) + "² + " + formatNombreFr(f2, 0) + "² + 2×" + formatNombreFr(f1, 0) + "×" + formatNombreFr(f2, 0) + "×cos " + formatNombreFr(thetaDeg, 0) + "° = " + formatNombreFr(rCarre, 0) +
      "  →  R = " + formatNombreFr(r, 1) + " N, déviation ≈ " + formatNombreFr(deviation, 1) + "° par rapport à F₁";
  };

  if (!customElements.get("resultante-vecteurs-widget")) {
    customElements.define("resultante-vecteurs-widget", ResultanteVecteursWidgetClass);
  }
})();
