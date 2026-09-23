(function () {
  "use strict";

  /* ================================================================
   * <degre-asymptote-widget> — atelier interactif : dénominateur D(x)=x−1
   * fixe, sélecteur du DEGRÉ du numérateur N (0, 1, 2 ou 3) — matérialise
   * en direct les 4 cas de la méthode « lien avec le degré » : deg(N)<
   * deg(D) → y=0 ; deg(N)=deg(D) → horizontale ; deg(N)=deg(D)+1 →
   * oblique ; deg(N)≥deg(D)+2 → aucune asymptote de cette forme. Le
   * réglage par défaut (degré 2) reproduit exactement l'exemple résolu
   * (x²−3x+5)/(x−1) → y=x−2. Web Component (Shadow DOM).
   * ================================================================ */

  var PRESETS = [
    { deg: 0, formuleN: "5", n: function () { return 5; }, asymptote: { type: "horizontale", y: 0 }, texteAsymptote: "y = 0" },
    { deg: 1, formuleN: "3x+2", n: function (x) { return 3 * x + 2; }, asymptote: { type: "horizontale", y: 3 }, texteAsymptote: "y = 3" },
    { deg: 2, formuleN: "x²−3x+5", n: function (x) { return x * x - 3 * x + 5; }, asymptote: { type: "oblique", a: 1, b: -2 }, texteAsymptote: "y = x−2" },
    { deg: 3, formuleN: "x³−3x+5", n: function (x) { return x * x * x - 3 * x + 5; }, asymptote: null, texteAsymptote: null },
  ];
  var DEFAUT_INDEX = 2;
  var DEG_D = 1; // D(x) = x-1, degré 1, fixe

  var X_MIN = -6, X_MAX = 10, Y_MIN = -12, Y_MAX = 12;
  var LARGEUR = 420, HAUTEUR = 300, MARGE = 34;

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
    '.ligne-select{display:flex;align-items:center;gap:10px;justify-content:center;margin-bottom:12px;}' +
    '.ligne-select label{font-weight:600;color:var(--ink,#241f1a);}' +
    'select{font:inherit;padding:6px 10px;border-radius:var(--radius,3px);border:1px solid var(--line,#e2d8c8);background:var(--surface,#fff);color:var(--ink,#241f1a);}' +
    '.formule{text-align:center;font-family:var(--serif,serif);font-style:italic;font-size:1.05rem;font-weight:600;color:var(--ink,#241f1a);margin:0 0 12px;}' +
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:12px;}' +
    'svg{width:100%;max-width:420px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.4;}' +
    '.fleche{fill:var(--ink-soft,#6b6055);}' +
    '.courbe{stroke:var(--accent,#a8471f);stroke-width:2.4;fill:none;}' +
    '.asymptote-ligne{stroke:var(--good,#2f7a4f);stroke-width:1.8;stroke-dasharray:5 4;}' +
    '.gouffre{stroke:var(--plan,#5b4ea3);stroke-width:1.4;stroke-dasharray:4 3;}' +
    '.etiquette-asymptote{font-size:11.5px;font-weight:700;fill:var(--good,#2f7a4f);font-family:var(--mono,monospace);}' +
    '.etiquette{font-size:12px;fill:var(--ink-soft,#6b6055);font-family:var(--sans,sans-serif);}' +
    '.verdict{text-align:center;font-size:0.88rem;font-weight:600;margin:0 0 18px;padding:10px 14px;border-radius:var(--radius,3px);}' +
    '.verdict-ok{color:var(--good,#2f7a4f);background:var(--surface-2,#faf6f0);}' +
    '.verdict-aucune{color:var(--plan,#5b4ea3);background:var(--surface-2,#faf6f0);}' +
    '.controles{display:flex;flex-direction:column;gap:12px;}' +
    '</style>' +
    '<div class="ligne-select"><label for="deg">Degré de N(x)</label>' +
    '<select id="deg">' +
    '<option value="0">0 (constante)</option>' +
    '<option value="1">1</option>' +
    '<option value="2">2</option>' +
    '<option value="3">3</option>' +
    '</select></div>' +
    '<p class="formule" id="formule"></p>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" xmlns="http://www.w3.org/2000/svg"></svg></div>' +
    '<p class="verdict" id="verdict"></p>';

  class DegreAsymptoteWidgetClass extends HTMLElement {
    constructor() {
      super();
      this._init();
    }
  }

  DegreAsymptoteWidgetClass.prototype._init = function () {
    var shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this._index = DEFAUT_INDEX;
    this._selectDeg = shadow.getElementById("deg");
    this._formule = shadow.getElementById("formule");
    this._svg = shadow.getElementById("svg");
    this._verdict = shadow.getElementById("verdict");
    this._selectDeg.value = String(PRESETS[DEFAUT_INDEX].deg);
  };

  DegreAsymptoteWidgetClass.prototype.connectedCallback = function () {
    var self = this;
    this._onChangeDeg = function () {
      var deg = parseInt(self._selectDeg.value, 10);
      self._index = PRESETS.findIndex(function (p) { return p.deg === deg; });
      self._rendre();
    };
    this._selectDeg.addEventListener("change", this._onChangeDeg);
    this._rendre();
  };

  DegreAsymptoteWidgetClass.prototype.disconnectedCallback = function () {
    this._selectDeg.removeEventListener("change", this._onChangeDeg);
  };

  DegreAsymptoteWidgetClass.prototype._toPx = function (xMath, yMath) {
    var px = MARGE + (xMath - X_MIN) / (X_MAX - X_MIN) * (LARGEUR - 2 * MARGE);
    var py = HAUTEUR - MARGE - (yMath - Y_MIN) / (Y_MAX - Y_MIN) * (HAUTEUR - 2 * MARGE);
    return [px, py];
  };

  DegreAsymptoteWidgetClass.prototype._traceIntervalle = function (svg, ns, xMin, xMax, f) {
    var self = this;
    if (xMax - xMin < 1e-6) return;
    var n = Math.max(4, Math.round(260 * (xMax - xMin) / (X_MAX - X_MIN)));
    var segments = [], courant = "", dernierValide = false;
    for (var i = 0; i <= n; i++) {
      var xx = xMin + (i / n) * (xMax - xMin);
      var yy = f(xx);
      var valide = isFinite(yy) && yy >= Y_MIN - 0.5 && yy <= Y_MAX + 0.5;
      if (valide) {
        var p = self._toPx(xx, Math.max(Y_MIN, Math.min(Y_MAX, yy)));
        courant += (!dernierValide ? "M" : "L") + p[0].toFixed(2) + " " + p[1].toFixed(2) + " ";
      } else if (dernierValide && courant) {
        segments.push(courant.trim());
        courant = "";
      }
      dernierValide = valide;
    }
    if (courant) segments.push(courant.trim());
    segments.forEach(function (seg) {
      svg.appendChild(svgEl(ns, "path", { d: seg, class: "courbe" }));
    });
  };

  DegreAsymptoteWidgetClass.prototype._rendre = function () {
    var preset = PRESETS[this._index];
    var f = function (x) { return preset.n(x) / (x - 1); };

    this._formule.textContent = "f(x) = (" + preset.formuleN + ") / (x−1)";

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

    var pGouffre0 = self._toPx(1, Y_MIN), pGouffre1 = self._toPx(1, Y_MAX);
    svg.appendChild(svgEl(ns, "line", { x1: pGouffre0[0].toFixed(2), y1: pGouffre0[1].toFixed(2), x2: pGouffre1[0].toFixed(2), y2: pGouffre1[1].toFixed(2), class: "gouffre" }));

    this._traceIntervalle(svg, ns, X_MIN, 1 - 0.03, f);
    this._traceIntervalle(svg, ns, 1 + 0.03, X_MAX, f);

    var texteDegre = "deg(N)=" + preset.deg + ", deg(D)=" + DEG_D + " ";
    if (preset.asymptote && preset.asymptote.type === "horizontale") {
      var y = preset.asymptote.y;
      var p0 = self._toPx(X_MIN, y), p1 = self._toPx(X_MAX, y);
      svg.appendChild(svgEl(ns, "line", { x1: p0[0].toFixed(2), y1: p0[1].toFixed(2), x2: p1[0].toFixed(2), y2: p1[1].toFixed(2), class: "asymptote-ligne" }));
      var et = svgEl(ns, "text", { x: (LARGEUR - MARGE - 4).toFixed(2), y: (p0[1] - 6).toFixed(2), "text-anchor": "end", class: "etiquette-asymptote" });
      et.textContent = preset.texteAsymptote;
      svg.appendChild(et);
      this._verdict.className = "verdict verdict-ok";
      var cas = preset.deg < DEG_D ? "deg(N) < deg(D)" : "deg(N) = deg(D)";
      this._verdict.textContent = texteDegre + "(" + cas + ") → asymptote HORIZONTALE, " + preset.texteAsymptote + ".";
    } else if (preset.asymptote && preset.asymptote.type === "oblique") {
      var a = preset.asymptote.a, b = preset.asymptote.b;
      var q0 = self._toPx(X_MIN, a * X_MIN + b), q1 = self._toPx(X_MAX, a * X_MAX + b);
      svg.appendChild(svgEl(ns, "line", { x1: q0[0].toFixed(2), y1: q0[1].toFixed(2), x2: q1[0].toFixed(2), y2: q1[1].toFixed(2), class: "asymptote-ligne" }));
      var etO = svgEl(ns, "text", { x: (LARGEUR - MARGE - 4).toFixed(2), y: (q1[1] - 6).toFixed(2), "text-anchor": "end", class: "etiquette-asymptote" });
      etO.textContent = preset.texteAsymptote;
      svg.appendChild(etO);
      this._verdict.className = "verdict verdict-ok";
      this._verdict.textContent = texteDegre + "(deg(N) = deg(D)+1) → asymptote OBLIQUE, " + preset.texteAsymptote + " — le reste tend vers 0, jamais inclus dans l'équation.";
    } else {
      this._verdict.className = "verdict verdict-aucune";
      this._verdict.textContent = texteDegre + "(deg(N) ≥ deg(D)+2) → AUCUNE asymptote de cette forme : la courbe diverge plus vite qu'aucune droite ne peut suivre.";
    }
  };

  if (!customElements.get("degre-asymptote-widget")) {
    customElements.define("degre-asymptote-widget", DegreAsymptoteWidgetClass);
  }
})();
