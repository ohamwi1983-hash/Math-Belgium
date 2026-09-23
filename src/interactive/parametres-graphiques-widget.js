(function () {
  "use strict";

  /* ================================================================
   * <parametres-graphiques-widget> — atelier interactif : curseurs a, b
   * pour f(x)=a+b·ln(x), point (1;a) toujours affiché, tangente en x=1 de
   * pente b tracée, et une case à cocher pour révéler le point en x=e
   * (f(e)=a+b, le piège de la section). Reprend l'exemple résolu
   * (a=1,b=2) comme réglage par défaut. Web Component (Shadow DOM).
   * ================================================================ */

  var E = Math.E;
  var DEFAUT = { a: 1, b: 2 };
  var BORNES_A = { min: -3, max: 5, step: 0.5 };
  var BORNES_B = { min: -4, max: 4, step: 0.5 };
  var X_MIN = -0.6;
  var LARGEUR = 420, HAUTEUR = 320, MARGE = 34;

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
    '.formule{text-align:center;font-family:var(--serif,serif);font-style:italic;font-size:1.2rem;font-weight:600;color:var(--ink,#241f1a);margin:0 0 14px;}' +
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:12px;}' +
    'svg{width:100%;max-width:420px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.4;}' +
    '.asymptote{stroke:var(--ink-faint,#9c9083);stroke-width:1.3;stroke-dasharray:5 4;}' +
    '.courbe-f{stroke:var(--accent,#a8471f);stroke-width:2.6;fill:none;}' +
    '.tangente{stroke:var(--plan,#5b4ea3);stroke-width:2.2;}' +
    '.point-1{fill:var(--accent,#a8471f);}' +
    '.point-e{fill:var(--good,#2f7a4f);}' +
    '.guide-e{stroke:var(--good,#2f7a4f);stroke-width:1.2;stroke-dasharray:4 3;opacity:0.8;}' +
    '.etiquette{font-size:12px;fill:var(--ink-soft,#6b6055);font-family:var(--sans,sans-serif);}' +
    '.etiquette-1{font-size:11.5px;font-weight:600;fill:var(--accent-ink,#7a3212);font-family:var(--mono,monospace);}' +
    '.etiquette-e{font-size:11.5px;font-weight:600;fill:var(--good,#2f7a4f);font-family:var(--mono,monospace);}' +
    '.case{display:flex;align-items:center;justify-content:center;gap:7px;font-weight:600;font-size:0.92rem;cursor:pointer;color:var(--good,#2f7a4f);margin-bottom:16px;}' +
    '.case input[type="checkbox"]{width:16px;height:16px;cursor:pointer;accent-color:var(--good,#2f7a4f);}' +
    '.stats{display:flex;align-items:stretch;justify-content:center;gap:6px;margin-bottom:20px;flex-wrap:wrap;}' +
    '.stat{flex:1 1 130px;min-width:0;border:1px solid var(--line,#e2d8c8);border-radius:var(--radius,3px);padding:8px 6px;text-align:center;background:var(--surface,#fff);}' +
    '.stat-label{display:block;font-family:var(--mono,monospace);font-size:10px;letter-spacing:0.02em;color:var(--ink-faint,#9c9083);margin-bottom:5px;}' +
    '.stat-value{display:block;font-variant-numeric:tabular-nums;font-size:0.94rem;font-weight:600;color:var(--accent-ink,#7a3212);white-space:nowrap;}' +
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
    '<label class="case"><input type="checkbox" id="case-e">Révéler le point en x=e</label>' +
    '<div class="stats">' +
    '<div class="stat"><span class="stat-label">f(1) = a</span><span class="stat-value" id="val-f1"></span></div>' +
    '<div class="stat"><span class="stat-label">f\'(1) = b</span><span class="stat-value" id="val-fp1"></span></div>' +
    '</div>' +
    '<div class="controles">' +
    '<div class="curseur"><label for="a">a</label><div class="curseur-row">' +
    '<input type="range" id="a" min="' + BORNES_A.min + '" max="' + BORNES_A.max + '" step="' + BORNES_A.step + '" value="' + DEFAUT.a + '">' +
    '<span class="curseur-valeur" id="a-valeur"></span></div></div>' +
    '<div class="curseur"><label for="b">b</label><div class="curseur-row">' +
    '<input type="range" id="b" min="' + BORNES_B.min + '" max="' + BORNES_B.max + '" step="' + BORNES_B.step + '" value="' + DEFAUT.b + '">' +
    '<span class="curseur-valeur" id="b-valeur"></span></div></div>' +
    '<button class="btn-reset" id="reset" type="button">Réinitialiser</button>' +
    '</div>';

  class ParametresGraphiquesWidgetClass extends HTMLElement {
    constructor() {
      super();
      this._init();
    }
  }

  ParametresGraphiquesWidgetClass.prototype._init = function () {
    var shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this._a = DEFAUT.a;
    this._b = DEFAUT.b;
    this._montrerE = false;
    this._svg = shadow.getElementById("svg");
    this._formule = shadow.getElementById("formule");
    this._caseE = shadow.getElementById("case-e");
    this._inputA = shadow.getElementById("a");
    this._inputB = shadow.getElementById("b");
    this._valeurA = shadow.getElementById("a-valeur");
    this._valeurB = shadow.getElementById("b-valeur");
    this._valF1 = shadow.getElementById("val-f1");
    this._valFp1 = shadow.getElementById("val-fp1");
    this._resetBtn = shadow.getElementById("reset");
  };

  ParametresGraphiquesWidgetClass.prototype.connectedCallback = function () {
    var self = this;
    this._onInputA = function () { self._a = parseFloat(self._inputA.value); self._rendre(); };
    this._onInputB = function () { self._b = parseFloat(self._inputB.value); self._rendre(); };
    this._onToggleE = function () { self._montrerE = self._caseE.checked; self._rendre(); };
    this._onReset = function () {
      self._a = DEFAUT.a; self._b = DEFAUT.b; self._montrerE = false;
      self._inputA.value = String(DEFAUT.a);
      self._inputB.value = String(DEFAUT.b);
      self._caseE.checked = false;
      self._rendre();
    };
    this._inputA.addEventListener("input", this._onInputA);
    this._inputB.addEventListener("input", this._onInputB);
    this._caseE.addEventListener("change", this._onToggleE);
    this._resetBtn.addEventListener("click", this._onReset);
    this._rendre();
  };

  ParametresGraphiquesWidgetClass.prototype.disconnectedCallback = function () {
    this._inputA.removeEventListener("input", this._onInputA);
    this._inputB.removeEventListener("input", this._onInputB);
    this._caseE.removeEventListener("change", this._onToggleE);
    this._resetBtn.removeEventListener("click", this._onReset);
  };

  ParametresGraphiquesWidgetClass.prototype._toPx = function (win, xMath, yMath) {
    var px = MARGE + (xMath - X_MIN) / (win.xMax - X_MIN) * (LARGEUR - 2 * MARGE);
    var py = HAUTEUR - MARGE - (yMath - win.yMin) / (win.yMax - win.yMin) * (HAUTEUR - 2 * MARGE);
    return [px, py];
  };

  ParametresGraphiquesWidgetClass.prototype._traceFonction = function (svg, ns, win, f, xMin, xMax, classe) {
    var self = this;
    var n = 240, segments = [], courant = "", dernierValide = false;
    for (var i = 0; i <= n; i++) {
      var xx = xMin + (i / n) * (xMax - xMin);
      var yy = f(xx);
      var valide = isFinite(yy) && yy >= win.yMin - 0.5 && yy <= win.yMax + 0.5;
      if (valide) {
        var p = self._toPx(win, xx, Math.max(win.yMin, Math.min(win.yMax, yy)));
        courant += (!dernierValide ? "M" : "L") + p[0].toFixed(2) + " " + p[1].toFixed(2) + " ";
      } else if (dernierValide && courant) {
        segments.push(courant.trim());
        courant = "";
      }
      dernierValide = valide;
    }
    if (courant) segments.push(courant.trim());
    segments.forEach(function (seg) {
      svg.appendChild(svgEl(ns, "path", { d: seg, class: classe }));
    });
  };

  ParametresGraphiquesWidgetClass.prototype._segmentTangente = function (win, x0, y0, m) {
    var tXmin = X_MIN - x0, tXmax = win.xMax - x0;
    var tA = (win.yMin - y0) / m, tB = (win.yMax - y0) / m;
    var tYmin = Math.min(tA, tB), tYmax = Math.max(tA, tB);
    var tMin = Math.max(tXmin, tYmin), tMax = Math.min(tXmax, tYmax);
    if (tMin > tMax) return null;
    return [[x0 + tMin, y0 + m * tMin], [x0 + tMax, y0 + m * tMax]];
  };

  ParametresGraphiquesWidgetClass.prototype._rendre = function () {
    var a = this._a, b = this._b;
    var f = function (x) { return x > 0 ? a + b * Math.log(x) : NaN; };
    var fe = a + b; // f(e) = a + b·ln(e) = a + b

    this._formule.textContent = "f(x) = " + formatNombreFr(a, 1) + " + " + formatNombreFr(b, 1) + "·ln(x)";
    this._valeurA.textContent = formatNombreFr(a, 1);
    this._valeurB.textContent = formatNombreFr(b, 1);
    this._valF1.textContent = formatNombreFr(a, 1);
    this._valFp1.textContent = formatNombreFr(b, 1);

    var xMax = 8;
    // Fenêtre Y calculée par échantillonnage (jamais une formule dérivée à la main) sur le
    // domaine affiché, pour rester correcte quels que soient a et b.
    var yMin = Infinity, yMax = -Infinity;
    for (var i = 1; i <= 200; i++) {
      var xx = 0.02 + (i / 200) * (xMax - 0.02);
      var yy = f(xx);
      if (isFinite(yy)) { if (yy < yMin) yMin = yy; if (yy > yMax) yMax = yy; }
    }
    if (yMin > yMax) { yMin = -1; yMax = 1; }
    if (yMin > 0) yMin = 0;
    if (yMax < 0) yMax = 0;
    var margeY = Math.max(1, (yMax - yMin) * 0.12);
    var win = { xMax: xMax, yMin: yMin - margeY, yMax: yMax + margeY };

    var ns = "http://www.w3.org/2000/svg";
    var svg = this._svg;
    svg.innerHTML = "";
    var self = this;

    var origine = self._toPx(win, 0, 0);
    svg.appendChild(svgEl(ns, "line", { x1: MARGE, x2: LARGEUR - MARGE, y1: origine[1].toFixed(2), y2: origine[1].toFixed(2), class: "axe" }));
    var pAxeY0 = self._toPx(win, 0, win.yMin), pAxeY1 = self._toPx(win, 0, win.yMax);
    svg.appendChild(svgEl(ns, "line", { x1: pAxeY0[0].toFixed(2), y1: pAxeY0[1].toFixed(2), x2: pAxeY1[0].toFixed(2), y2: pAxeY1[1].toFixed(2), class: "asymptote" }));
    var etiqX = svgEl(ns, "text", { x: LARGEUR - MARGE + 6, y: origine[1] + 4, class: "etiquette" });
    etiqX.textContent = "x";
    svg.appendChild(etiqX);

    var pente = b; // f'(x) = b/x, donc f'(1) = b
    var seg = self._segmentTangente(win, 1, a, pente);
    if (seg) {
      var pT0 = self._toPx(win, seg[0][0], seg[0][1]);
      var pT1 = self._toPx(win, seg[1][0], seg[1][1]);
      svg.appendChild(svgEl(ns, "line", { x1: pT0[0].toFixed(2), y1: pT0[1].toFixed(2), x2: pT1[0].toFixed(2), y2: pT1[1].toFixed(2), class: "tangente" }));
    }

    this._traceFonction(svg, ns, win, f, 0.02, xMax, "courbe-f");

    var p1 = self._toPx(win, 1, a);
    svg.appendChild(svgEl(ns, "circle", { cx: p1[0].toFixed(2), cy: p1[1].toFixed(2), r: 4.5, class: "point-1" }));
    var et1 = svgEl(ns, "text", { x: (p1[0] + 8).toFixed(2), y: (p1[1] - 8).toFixed(2), class: "etiquette-1" });
    et1.textContent = "(1;" + formatNombreFr(a, 1) + ")";
    svg.appendChild(et1);

    if (this._montrerE && fe >= win.yMin && fe <= win.yMax) {
      var pE = self._toPx(win, E, fe);
      var pEaxe = self._toPx(win, E, win.yMin);
      var pEy = self._toPx(win, 0, fe);
      svg.appendChild(svgEl(ns, "line", { x1: pE[0].toFixed(2), y1: pEaxe[1].toFixed(2), x2: pE[0].toFixed(2), y2: pE[1].toFixed(2), class: "guide-e" }));
      svg.appendChild(svgEl(ns, "line", { x1: pE[0].toFixed(2), y1: pE[1].toFixed(2), x2: pEy[0].toFixed(2), y2: pE[1].toFixed(2), class: "guide-e" }));
      svg.appendChild(svgEl(ns, "circle", { cx: pE[0].toFixed(2), cy: pE[1].toFixed(2), r: 4.5, class: "point-e" }));
      var etE = svgEl(ns, "text", { x: (pE[0] + 8).toFixed(2), y: (pE[1] - 8).toFixed(2), class: "etiquette-e" });
      etE.textContent = "f(e)=a+b=" + formatNombreFr(fe, 1);
      svg.appendChild(etE);
    }
  };

  if (!customElements.get("parametres-graphiques-widget")) {
    customElements.define("parametres-graphiques-widget", ParametresGraphiquesWidgetClass);
  }
})();
