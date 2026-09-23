(function () {
  "use strict";

  /* ================================================================
   * <condition-initiale-widget> — atelier interactif : point (x₀;y₀)
   * déplaçable, C = y₀ − x₀² résolu EN DIRECT (jamais fixé à 0 au
   * préalable — le piège central de la section), la primitive F(x)=x²+C
   * passant par ce point tracée en accent, sur fond de quelques primitives
   * de la même famille en fané. Réglages par défaut (x₀=1, y₀=4)
   * reproduisent exactement l'illustration statique (C=3). Web Component
   * (Shadow DOM).
   * ================================================================ */

  var DEFAUT = { x0: 1, y0: 4 };
  var BORNES_X0 = { min: -2, max: 2, step: 0.1 };
  var BORNES_Y0 = { min: -2, max: 9, step: 0.5 };
  var C_FANEES = [-2, 1, 6];

  var X_MIN = -2.4, X_MAX = 2.4, Y_MIN = -2, Y_MAX = 9;
  var LARGEUR = 420, HAUTEUR = 300, MARGE = 34;

  function formatNombreFr(n, decimales) {
    var facteur = Math.pow(10, decimales);
    var arrondi = Math.round(n * facteur) / facteur;
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
    '.formule{text-align:center;font-family:var(--serif,serif);font-style:italic;font-size:1.05rem;font-weight:600;color:var(--ink,#241f1a);margin:0 0 12px;}' +
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:12px;}' +
    'svg{width:100%;max-width:420px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.4;}' +
    '.fleche{fill:var(--ink-soft,#6b6055);}' +
    '.courbe-fanee{stroke:var(--ink-faint,#c9beae);stroke-width:1.6;fill:none;}' +
    '.courbe-active{stroke:var(--accent,#a8471f);stroke-width:2.6;fill:none;}' +
    '.point-condition{fill:var(--bad,#b23a3a);stroke:var(--surface,#fff);stroke-width:2;}' +
    '.etiquette-point{font-size:11.5px;font-weight:700;fill:var(--bad,#b23a3a);font-family:var(--mono,monospace);}' +
    '.etiquette{font-size:12px;fill:var(--ink-soft,#6b6055);font-family:var(--sans,sans-serif);}' +
    '.resultat{text-align:center;font-family:var(--mono,monospace);font-size:0.98rem;font-weight:700;color:var(--accent-ink,#7a3212);margin:0 0 18px;}' +
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
    '<p class="resultat" id="resultat"></p>' +
    '<div class="controles">' +
    '<div class="curseur"><label for="x0">x₀</label><div class="curseur-row">' +
    '<input type="range" id="x0" min="' + BORNES_X0.min + '" max="' + BORNES_X0.max + '" step="' + BORNES_X0.step + '" value="' + DEFAUT.x0 + '">' +
    '<span class="curseur-valeur" id="x0-valeur"></span></div></div>' +
    '<div class="curseur"><label for="y0">y₀</label><div class="curseur-row">' +
    '<input type="range" id="y0" min="' + BORNES_Y0.min + '" max="' + BORNES_Y0.max + '" step="' + BORNES_Y0.step + '" value="' + DEFAUT.y0 + '">' +
    '<span class="curseur-valeur" id="y0-valeur"></span></div></div>' +
    '<button class="btn-reset" id="reset" type="button">Réinitialiser</button>' +
    '</div>';

  class ConditionInitialeWidgetClass extends HTMLElement {
    constructor() {
      super();
      this._init();
    }
  }

  ConditionInitialeWidgetClass.prototype._init = function () {
    var shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this._x0 = DEFAUT.x0;
    this._y0 = DEFAUT.y0;
    this._formule = shadow.getElementById("formule");
    this._svg = shadow.getElementById("svg");
    this._resultat = shadow.getElementById("resultat");
    this._inputX0 = shadow.getElementById("x0");
    this._inputY0 = shadow.getElementById("y0");
    this._valeurX0 = shadow.getElementById("x0-valeur");
    this._valeurY0 = shadow.getElementById("y0-valeur");
    this._resetBtn = shadow.getElementById("reset");
  };

  ConditionInitialeWidgetClass.prototype.connectedCallback = function () {
    var self = this;
    this._onInputX0 = function () { self._x0 = parseFloat(self._inputX0.value); self._rendre(); };
    this._onInputY0 = function () { self._y0 = parseFloat(self._inputY0.value); self._rendre(); };
    this._onReset = function () {
      self._x0 = DEFAUT.x0; self._y0 = DEFAUT.y0;
      self._inputX0.value = String(DEFAUT.x0);
      self._inputY0.value = String(DEFAUT.y0);
      self._rendre();
    };
    this._inputX0.addEventListener("input", this._onInputX0);
    this._inputY0.addEventListener("input", this._onInputY0);
    this._resetBtn.addEventListener("click", this._onReset);
    this._rendre();
  };

  ConditionInitialeWidgetClass.prototype.disconnectedCallback = function () {
    this._inputX0.removeEventListener("input", this._onInputX0);
    this._inputY0.removeEventListener("input", this._onInputY0);
    this._resetBtn.removeEventListener("click", this._onReset);
  };

  ConditionInitialeWidgetClass.prototype._toPx = function (xMath, yMath) {
    var px = MARGE + (xMath - X_MIN) / (X_MAX - X_MIN) * (LARGEUR - 2 * MARGE);
    var py = HAUTEUR - MARGE - (yMath - Y_MIN) / (Y_MAX - Y_MIN) * (HAUTEUR - 2 * MARGE);
    return [px, py];
  };

  ConditionInitialeWidgetClass.prototype._traceCourbe = function (svg, ns, c, classe) {
    var self = this;
    var n = 160, courant = "";
    for (var i = 0; i <= n; i++) {
      var xx = X_MIN + (i / n) * (X_MAX - X_MIN);
      var yy = xx * xx + c;
      var p = self._toPx(xx, Math.max(Y_MIN - 1, Math.min(Y_MAX + 1, yy)));
      courant += (i === 0 ? "M" : "L") + p[0].toFixed(2) + " " + p[1].toFixed(2) + " ";
    }
    svg.appendChild(svgEl(ns, "path", { d: courant.trim(), class: classe }));
  };

  ConditionInitialeWidgetClass.prototype._rendre = function () {
    var x0 = this._x0, y0 = this._y0;
    var c = y0 - x0 * x0;

    this._formule.textContent = "f(x) = 2x — F(x₀) = y₀ ⟹ C = y₀ − x₀²";
    this._valeurX0.textContent = formatNombreFr(x0, 1);
    this._valeurY0.textContent = formatNombreFr(y0, 1);
    this._resultat.textContent = "C = " + formatNombreFr(y0, 1) + " − " + formatNombreFr(x0, 1) + "² = " + formatNombreFr(c, 2) + "  ⟹  F(x) = x² " + (c >= 0 ? "+ " : "− ") + formatNombreFr(Math.abs(c), 2);

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
    var etiqX = svgEl(ns, "text", { x: LARGEUR - MARGE + 6, y: origine[1] + 4, class: "etiquette" });
    etiqX.textContent = "x";
    svg.appendChild(etiqX);

    C_FANEES.forEach(function (cf) { self._traceCourbe(svg, ns, cf, "courbe-fanee"); });
    this._traceCourbe(svg, ns, c, "courbe-active");

    var pCond = self._toPx(x0, Math.max(Y_MIN, Math.min(Y_MAX, y0)));
    svg.appendChild(svgEl(ns, "circle", { cx: pCond[0].toFixed(2), cy: pCond[1].toFixed(2), r: 5.5, class: "point-condition" }));
    var proche = pCond[0] > LARGEUR - 70;
    var etCond = svgEl(ns, "text", { x: (pCond[0] + (proche ? -9 : 9)).toFixed(2), y: (pCond[1] - 9).toFixed(2), "text-anchor": proche ? "end" : "start", class: "etiquette-point" });
    etCond.textContent = "(" + formatNombreFr(x0, 1) + ";" + formatNombreFr(y0, 1) + ")";
    svg.appendChild(etCond);
  };

  if (!customElements.get("condition-initiale-widget")) {
    customElements.define("condition-initiale-widget", ConditionInitialeWidgetClass);
  }
})();
