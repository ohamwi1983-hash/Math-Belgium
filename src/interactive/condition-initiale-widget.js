(function () {
  "use strict";

  /* ================================================================
   * <condition-initiale-widget> — atelier interactif : choix de f (2x,
   * cos x, eˣ, 1/x), point (x₀ ; y₀) réglable, C résolu EN DIRECT par
   * « F(x₀) + C = y₀ ⟹ C = y₀ − F(x₀) » (jamais fixé à 0 au préalable — le
   * piège central de la section). La primitive qui passe par le point est
   * tracée en accent, sur fond de quelques primitives fanées de la même
   * famille. Pour 1/x, seule la branche qui contient x₀ est fixée : l'autre
   * reste libre (ℝ₀ n'est pas un intervalle). Les abscisses x₀ sont prises
   * dans des listes de valeurs « propres » (multiples de π/6 pour cos, x₀ ≠ 0
   * pour 1/x) pour que les calculs se fassent de tête. Réglage par défaut
   * (f = 2x, (1 ; 4), C = 3) identique à l'illustration statique. Web
   * Component (Shadow DOM).
   * ================================================================ */

  var LARGEUR = 420, HAUTEUR = 300, MARGE = 34;
  var C_FANEES = [-2, 1, 3.5];

  function fmt(n, dmax) {
    if (Math.abs(n) < 1e-12) n = 0;
    var s = n.toFixed(dmax);
    if (s.indexOf(".") >= 0) s = s.replace(/0+$/, "").replace(/\.$/, "");
    if (s === "-0") s = "0";
    return s.replace(".", ",").replace("-", "−");
  }

  function approx(n) {
    // « = 0 » si exact à 4 décimales, sinon « ≈ 0,351 ».
    var r = Math.round(n * 1000) / 1000;
    return (Math.abs(n - r) < 1e-9 ? "= " : "≈ ") + fmt(r, 3);
  }

  function liste(min, max, pas, exclure0) {
    var out = [];
    for (var v = min; v <= max + 1e-9; v += pas) {
      var r = Math.round(v * 100) / 100;
      if (exclure0 && Math.abs(r) < 1e-9) continue;
      out.push({ v: r, txt: fmt(r, 2) });
    }
    return out;
  }

  var PI_TXT = ["−π", "−5π/6", "−2π/3", "−π/2", "−π/3", "−π/6", "0", "π/6", "π/3", "π/2", "2π/3", "5π/6", "π"];
  var LISTE_PI = PI_TXT.map(function (t, i) { return { v: (i - 6) * Math.PI / 6, txt: t }; });
  // sin(kπ/6), valeurs exactes affichées.
  var SIN_TXT = ["0", "−1/2", "−√3/2", "−1", "−√3/2", "−1/2", "0", "1/2", "√3/2", "1", "√3/2", "1/2", "0"];

  var FONCTIONS = {
    x2: {
      label: "f(x) = 2x", Ftexte: "x²",
      win: { xMin: -2.4, xMax: 2.4, yMin: -2, yMax: 9 },
      F: function (x) { return x * x; },
      xs: liste(-2, 2, 0.1, false), defautX: 1,
      y0: { min: -2, max: 9, step: 0.5 }, defautY: 4,
      Fde: function (o) { return o.txt.indexOf("−") === 0 ? "(" + o.txt + ")²" : o.txt + "²"; },
      Fval: function (o) { return fmt(o.v * o.v, 2); },
    },
    cos: {
      label: "f(x) = cos(x)", Ftexte: "sin(x)",
      win: { xMin: -3.6, xMax: 3.6, yMin: -4.5, yMax: 4.5 },
      F: function (x) { return Math.sin(x); },
      xs: LISTE_PI, defautX: Math.PI,
      y0: { min: -3, max: 3, step: 0.5 }, defautY: 1,
      Fde: function (o) { return "sin(" + o.txt + ")"; },
      Fval: function (o, i) { return SIN_TXT[i]; },
    },
    exp: {
      label: "f(x) = eˣ", Ftexte: "eˣ",
      win: { xMin: -3, xMax: 2.2, yMin: -3, yMax: 8.5 },
      F: function (x) { return Math.exp(x); },
      xs: liste(-2, 1.5, 0.5, false), defautX: 0,
      y0: { min: -2, max: 8, step: 0.5 }, defautY: 3,
      Fde: function (o) { return "exp(" + o.txt + ")"; },
      Fval: function (o) { return o.v === 0 ? "1" : "≈ " + fmt(Math.exp(o.v), 3); },
    },
    inv: {
      label: "f(x) = 1/x", Ftexte: "ln|x|",
      win: { xMin: -4, xMax: 4, yMin: -4.5, yMax: 4.5 },
      F: function (x) { return Math.log(Math.abs(x)); },
      xs: liste(-3, 3, 0.5, true), defautX: -1,
      y0: { min: -3, max: 3, step: 0.5 }, defautY: 2,
      Fde: function (o) { return "ln|" + o.txt + "|"; },
      Fval: function (o) { return Math.abs(Math.abs(o.v) - 1) < 1e-9 ? "0" : "≈ " + fmt(Math.log(Math.abs(o.v)), 3); },
    },
  };

  function indexDe(xs, v) {
    var best = 0;
    for (var i = 0; i < xs.length; i++) if (Math.abs(xs[i].v - v) < Math.abs(xs[best].v - v)) best = i;
    return best;
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
    '.ligne-select{display:flex;align-items:center;gap:10px;justify-content:center;flex-wrap:wrap;margin-bottom:12px;}' +
    '.ligne-select label{font-weight:600;color:var(--ink,#241f1a);}' +
    'select{font:inherit;min-height:44px;padding:6px 10px;border-radius:var(--radius,3px);border:1px solid var(--line,#e2d8c8);background:var(--surface,#fff);color:var(--ink,#241f1a);}' +
    '.formule{text-align:center;font-family:var(--serif,serif);font-style:italic;font-size:1.05rem;font-weight:600;color:var(--ink,#241f1a);margin:0 0 12px;overflow-wrap:anywhere;}' +
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:12px;}' +
    'svg{width:100%;max-width:420px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.4;}' +
    '.fleche{fill:var(--ink-soft,#6b6055);}' +
    '.courbe-fanee{stroke:var(--ink-faint,#c9beae);stroke-width:1.5;fill:none;}' +
    '.courbe-libre{stroke:var(--ink-faint,#c9beae);stroke-width:1.5;fill:none;stroke-dasharray:5 4;}' +
    '.courbe-active{stroke:var(--accent,#a8471f);stroke-width:2.6;fill:none;}' +
    '.asymptote{stroke:var(--ink-faint,#c9beae);stroke-width:1.2;stroke-dasharray:4 4;}' +
    '.point-condition{fill:var(--bad,#b23a3a);stroke:var(--surface,#fff);stroke-width:2;}' +
    '.etiquette-point{font-size:11.5px;font-weight:700;fill:var(--bad,#b23a3a);font-family:var(--mono,monospace);paint-order:stroke;stroke:var(--surface-2,#faf6f0);stroke-width:3px;stroke-linejoin:round;}' +
    '.etiquette{font-size:12px;fill:var(--ink-soft,#6b6055);font-family:var(--sans,sans-serif);}' +
    '.etiquette-libre{font-size:11px;font-weight:600;fill:var(--ink-soft,#6b6055);font-family:var(--sans,sans-serif);}' +
    '.calcul{margin:0 0 18px;padding:10px 14px;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);font-family:var(--mono,monospace);font-size:0.9rem;color:var(--ink,#241f1a);line-height:1.6;}' +
    '.calcul .ligne{display:block;}' +
    '.calcul .final{font-weight:700;color:var(--accent-ink,#7a3212);}' +
    '.calcul .libre{font-family:var(--sans,sans-serif);font-size:0.86rem;color:var(--ink-soft,#6b6055);}' +
    '.controles{display:flex;flex-direction:column;gap:12px;}' +
    '.curseur{display:flex;flex-direction:column;gap:6px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3212);}' +
    '.curseur-row{display:flex;align-items:center;gap:12px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;min-width:0;min-height:44px;accent-color:var(--accent,#a8471f);}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:60px;text-align:right;font-size:0.92rem;}' +
    '.btn-reset{min-height:44px;margin-top:2px;padding:8px 16px;border-radius:var(--radius,3px);border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font-weight:600;cursor:pointer;font-size:0.88rem;font-family:inherit;align-self:center;}' +
    '.btn-reset:hover{background:var(--accent-soft-line,#e8c4a4);}' +
    '</style>' +
    '<div class="ligne-select"><label for="fonction">Fonction f</label>' +
    '<select id="fonction">' +
    '<option value="x2">f(x) = 2x</option>' +
    '<option value="cos">f(x) = cos(x)</option>' +
    '<option value="exp">f(x) = eˣ</option>' +
    '<option value="inv">f(x) = 1/x</option>' +
    '</select></div>' +
    '<p class="formule" id="formule"></p>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" xmlns="http://www.w3.org/2000/svg"></svg></div>' +
    '<div class="calcul" id="calcul"></div>' +
    '<div class="controles">' +
    '<div class="curseur"><label for="x0">x₀</label><div class="curseur-row">' +
    '<input type="range" id="x0" min="0" max="1" step="1" value="0">' +
    '<span class="curseur-valeur" id="x0-valeur"></span></div></div>' +
    '<div class="curseur"><label for="y0">y₀</label><div class="curseur-row">' +
    '<input type="range" id="y0" min="0" max="1" step="0.5" value="0">' +
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
    this._select = shadow.getElementById("fonction");
    this._formule = shadow.getElementById("formule");
    this._svg = shadow.getElementById("svg");
    this._calcul = shadow.getElementById("calcul");
    this._inputX0 = shadow.getElementById("x0");
    this._inputY0 = shadow.getElementById("y0");
    this._valeurX0 = shadow.getElementById("x0-valeur");
    this._valeurY0 = shadow.getElementById("y0-valeur");
    this._resetBtn = shadow.getElementById("reset");
  };

  ConditionInitialeWidgetClass.prototype._choisir = function (cle) {
    var def = FONCTIONS[cle];
    this._cle = cle;
    this._select.value = cle;
    this._iX = indexDe(def.xs, def.defautX);
    this._y0 = def.defautY;
    this._inputX0.min = "0";
    this._inputX0.max = String(def.xs.length - 1);
    this._inputX0.value = String(this._iX);
    this._inputY0.min = String(def.y0.min);
    this._inputY0.max = String(def.y0.max);
    this._inputY0.step = String(def.y0.step);
    this._inputY0.value = String(def.defautY);
  };

  ConditionInitialeWidgetClass.prototype.connectedCallback = function () {
    var self = this;
    this._onSelect = function () { self._choisir(self._select.value); self._rendre(); };
    this._onInputX0 = function () { self._iX = parseInt(self._inputX0.value, 10); self._rendre(); };
    this._onInputY0 = function () { self._y0 = parseFloat(self._inputY0.value); self._rendre(); };
    this._onReset = function () { self._choisir("x2"); self._rendre(); };
    this._select.addEventListener("change", this._onSelect);
    this._inputX0.addEventListener("input", this._onInputX0);
    this._inputY0.addEventListener("input", this._onInputY0);
    this._resetBtn.addEventListener("click", this._onReset);
    this._choisir("x2");
    this._rendre();
  };

  ConditionInitialeWidgetClass.prototype.disconnectedCallback = function () {
    this._select.removeEventListener("change", this._onSelect);
    this._inputX0.removeEventListener("input", this._onInputX0);
    this._inputY0.removeEventListener("input", this._onInputY0);
    this._resetBtn.removeEventListener("click", this._onReset);
  };

  ConditionInitialeWidgetClass.prototype._toPx = function (xMath, yMath) {
    var w = this._win;
    var px = MARGE + (xMath - w.xMin) / (w.xMax - w.xMin) * (LARGEUR - 2 * MARGE);
    var py = HAUTEUR - MARGE - (yMath - w.yMin) / (w.yMax - w.yMin) * (HAUTEUR - 2 * MARGE);
    return [px, py];
  };

  ConditionInitialeWidgetClass.prototype._trace = function (svg, ns, g, x0, x1, classe) {
    var w = this._win, n = 220, d = "", dedans = false;
    for (var i = 0; i <= n; i++) {
      var x = x0 + (i / n) * (x1 - x0);
      var y = g(x);
      if (!isFinite(y) || y < w.yMin - 0.5 || y > w.yMax + 0.5) { dedans = false; continue; }
      var p = this._toPx(x, Math.max(w.yMin, Math.min(w.yMax, y)));
      d += (dedans ? "L" : "M") + p[0].toFixed(2) + " " + p[1].toFixed(2) + " ";
      dedans = true;
    }
    if (d) svg.appendChild(svgEl(ns, "path", { d: d.trim(), class: classe }));
  };

  ConditionInitialeWidgetClass.prototype._rendre = function () {
    var self = this;
    var def = FONCTIONS[this._cle];
    var inv = this._cle === "inv";
    this._win = def.win;
    var w = def.win;
    var o = def.xs[this._iX];
    var x0 = o.v, y0 = this._y0;
    var c = y0 - def.F(x0);

    this._valeurX0.textContent = o.txt;
    this._valeurY0.textContent = fmt(y0, 1);
    this._formule.textContent = def.label + " — primitive générale F(x) = " + def.Ftexte + " + C";

    var signe = c >= 0 ? " + " : " − ";
    var valF = def.Fval(o, this._iX).replace(/^≈ /, "");
    if (valF.indexOf("−") === 0) valF = "(" + valF + ")";
    var cTxt = fmt(Math.abs(Math.round(c * 1000) / 1000), 3);
    var html =
      '<span class="ligne">F(x₀) + C = y₀ ⟹ C = y₀ − F(x₀)</span>' +
      '<span class="ligne">C = ' + fmt(y0, 1) + " − " + def.Fde(o) + "</span>" +
      '<span class="ligne">C = ' + fmt(y0, 1) + " − " + valF + " " + approx(c) + "</span>";
    if (inv) {
      var branche = x0 < 0 ? "]−∞ ; 0[" : "]0 ; +∞[";
      var autre = x0 < 0 ? "]0 ; +∞[" : "]−∞ ; 0[";
      html += '<span class="ligne final">F(x) = ln|x|' + signe + cTxt + " sur " + branche + "</span>";
      html += '<span class="ligne libre">La branche ' + autre + " reste libre : sa constante n'est pas fixée par ce point (ℝ₀ n'est pas un intervalle).</span>";
    } else {
      html += '<span class="ligne final">F(x) = ' + def.Ftexte + signe + cTxt + "</span>";
    }
    this._calcul.innerHTML = html;

    var ns = "http://www.w3.org/2000/svg";
    var svg = this._svg;
    svg.innerHTML = "";
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

    var gauche = [w.xMin, -0.02], droite = [0.02, w.xMax];
    if (inv) {
      svg.appendChild(svgEl(ns, "line", { x1: origine[0].toFixed(2), x2: origine[0].toFixed(2), y1: MARGE, y2: HAUTEUR - MARGE, class: "asymptote" }));
      var fixe = x0 < 0 ? gauche : droite;
      var libre = x0 < 0 ? droite : gauche;
      C_FANEES.forEach(function (cf) {
        self._trace(svg, ns, function (x) { return def.F(x) + cf; }, fixe[0], fixe[1], "courbe-fanee");
        self._trace(svg, ns, function (x) { return def.F(x) + cf; }, libre[0], libre[1], "courbe-libre");
      });
      self._trace(svg, ns, function (x) { return def.F(x) + c; }, fixe[0], fixe[1], "courbe-active");
      var xLib = x0 < 0 ? 2.2 : -2.2;
      var pLib = self._toPx(xLib, w.yMax - 0.6);
      var tl = svgEl(ns, "text", { x: pLib[0].toFixed(2), y: pLib[1].toFixed(2), "text-anchor": "middle", class: "etiquette-libre" });
      tl.textContent = "branche libre";
      svg.appendChild(tl);
    } else {
      C_FANEES.forEach(function (cf) { self._trace(svg, ns, function (x) { return def.F(x) + cf; }, w.xMin, w.xMax, "courbe-fanee"); });
      self._trace(svg, ns, function (x) { return def.F(x) + c; }, w.xMin, w.xMax, "courbe-active");
    }

    var pCond = self._toPx(x0, Math.max(w.yMin, Math.min(w.yMax, y0)));
    svg.appendChild(svgEl(ns, "circle", { cx: pCond[0].toFixed(2), cy: pCond[1].toFixed(2), r: 5.5, class: "point-condition" }));
    var proche = pCond[0] > LARGEUR - 90;
    var etCond = svgEl(ns, "text", { x: (pCond[0] + (proche ? -9 : 9)).toFixed(2), y: (pCond[1] + (pCond[1] < MARGE + 16 ? 18 : -9)).toFixed(2), "text-anchor": proche ? "end" : "start", class: "etiquette-point" });
    etCond.textContent = "(" + o.txt + " ; " + fmt(y0, 1) + ")";
    svg.appendChild(etCond);
  };

  if (!customElements.get("condition-initiale-widget")) {
    customElements.define("condition-initiale-widget", ConditionInitialeWidgetClass);
  }
})();
