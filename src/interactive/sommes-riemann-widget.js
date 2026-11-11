(function () {
  "use strict";

  /* ================================================================
   * <sommes-riemann-widget> — atelier interactif : choix de la fonction
   * (x² sur [0 ; 4], sin x sur [0 ; π], eˣ sur [0 ; 1], 1/x sur [1 ; e]),
   * curseur n et méthode (rectangles minorants, majorants, point milieu,
   * trapèzes). Les minorants/majorants utilisent le VRAI minimum/maximum
   * de f sur chaque sous-intervalle (bornes + points critiques intérieurs :
   * sin atteint son maximum en π/2 au milieu de [0 ; π]). L'encadrement
   * « minorant ≤ I ≤ majorant » est affiché à chaque n, avec l'erreur de la
   * méthode choisie par rapport à la valeur exacte. Réglage par défaut
   * (x², n = 4, trapèzes) = l'exemple résolu : 22 contre 64/3. Fenêtres
   * fixes par fonction. Web Component (Shadow DOM).
   * ================================================================ */

  var DEFAUT_N = 4;
  var BORNES_N = { min: 1, max: 20, step: 1 };
  var DEFAUT_MODE = "trapezes";
  var LARGEUR = 420, HAUTEUR = 300, MARGE = 34;

  var FONCTIONS = {
    x2: {
      titre: "∫₀⁴ x² dx", a: 0, b: 4, aTxt: "0", bTxt: "4",
      f: function (x) { return x * x; }, critiques: [],
      exact: 64 / 3, exactTxt: "64/3 ≈ 21,33",
      win: { xMin: -0.5, xMax: 4.6, yMin: -1.6, yMax: 18 },
    },
    sin: {
      titre: "∫ sin(x) dx sur [0 ; π]", a: 0, b: Math.PI, aTxt: "0", bTxt: "π",
      f: function (x) { return Math.sin(x); }, critiques: [Math.PI / 2],
      exact: 2, exactTxt: "2",
      win: { xMin: -0.35, xMax: 3.6, yMin: -0.14, yMax: 1.25 },
    },
    exp: {
      titre: "∫₀¹ eˣ dx", a: 0, b: 1, aTxt: "0", bTxt: "1",
      f: function (x) { return Math.exp(x); }, critiques: [],
      exact: Math.E - 1, exactTxt: "e − 1 ≈ 1,72",
      win: { xMin: -0.12, xMax: 1.15, yMin: -0.3, yMax: 3.05 },
    },
    inv: {
      titre: "∫ (1/x) dx sur [1 ; e]", a: 1, b: Math.E, aTxt: "1", bTxt: "e",
      f: function (x) { return 1 / x; }, critiques: [],
      exact: 1, exactTxt: "1",
      win: { xMin: -0.2, xMax: 3.05, yMin: -0.12, yMax: 1.2 },
    },
  };

  function fmt(n, d) {
    var facteur = Math.pow(10, d);
    var arrondi = Math.round(n * facteur) / facteur;
    if (Math.abs(arrondi) < 1e-12) arrondi = 0;
    return arrondi.toFixed(d).replace(".", ",").replace("-", "−");
  }

  function svgEl(ns, tag, attrs) {
    var el = document.createElementNS(ns, tag);
    for (var key in attrs) el.setAttribute(key, attrs[key]);
    return el;
  }

  // Minimum et maximum EXACTS de f sur [u ; v] : bornes + points critiques intérieurs.
  function minMax(def, u, v) {
    var candidats = [u, v];
    def.critiques.forEach(function (c) { if (c > u && c < v) candidats.push(c); });
    var vals = candidats.map(def.f);
    return { min: Math.min.apply(null, vals), max: Math.max.apply(null, vals) };
  }

  function somme(def, n, mode) {
    var dx = (def.b - def.a) / n, s = 0;
    for (var i = 0; i < n; i++) {
      var u = def.a + i * dx, v = u + dx;
      if (mode === "minorant") s += minMax(def, u, v).min;
      else if (mode === "majorant") s += minMax(def, u, v).max;
      else if (mode === "milieu") s += def.f((u + v) / 2);
      else s += (def.f(u) + def.f(v)) / 2;
    }
    return s * dx;
  }

  var LABEL_MODE = { minorant: "rectangles minorants", majorant: "rectangles majorants", milieu: "point milieu", trapezes: "trapèzes" };

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' +
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);}' +
    '*{box-sizing:border-box;}' +
    '.selects{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin-bottom:12px;}' +
    '.ligne-select{display:flex;align-items:center;gap:8px;flex-wrap:wrap;justify-content:center;}' +
    '.ligne-select label{font-weight:600;color:var(--ink,#241f1a);}' +
    'select{font:inherit;min-height:44px;max-width:100%;padding:6px 10px;border-radius:var(--radius,3px);border:1px solid var(--line,#e2d8c8);background:var(--surface,#fff);color:var(--ink,#241f1a);}' +
    '.formule{text-align:center;font-family:var(--serif,serif);font-style:italic;font-size:1.02rem;font-weight:600;color:var(--ink,#241f1a);margin:0 0 12px;overflow-wrap:anywhere;}' +
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:12px;}' +
    'svg{width:100%;max-width:420px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.4;}' +
    '.fleche{fill:var(--ink-soft,#6b6055);}' +
    '.courbe{stroke:var(--ink,#241f1a);stroke-width:2.2;fill:none;}' +
    '.forme-minorant{fill:var(--accent,#a8471f);fill-opacity:0.32;stroke:var(--accent,#a8471f);stroke-width:1;}' +
    '.forme-majorant{fill:var(--good,#2f7a4f);fill-opacity:0.32;stroke:var(--good,#2f7a4f);stroke-width:1;}' +
    '.forme-milieu{fill:var(--bad,#b23a3a);fill-opacity:0.25;stroke:var(--bad,#b23a3a);stroke-width:1;}' +
    '.forme-trapeze{fill:var(--plan,#5b4ea3);fill-opacity:0.32;stroke:var(--plan,#5b4ea3);stroke-width:1;}' +
    '.point-milieu{fill:var(--bad,#b23a3a);}' +
    '.graduation{stroke:var(--ink-soft,#6b6055);stroke-width:1.2;}' +
    '.etiquette{font-size:12px;fill:var(--ink-soft,#6b6055);font-family:var(--sans,sans-serif);}' +
    '.encadrement{text-align:center;margin:16px 0 0;padding:10px 12px;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);font-variant-numeric:tabular-nums;font-size:0.92rem;color:var(--ink,#241f1a);}' +
    '.encadrement .lbl{display:block;font-family:var(--mono,monospace);font-size:10.5px;color:var(--ink-faint,#9c9083);margin-bottom:4px;}' +
    '.encadrement .min{color:var(--accent-ink,#7a3212);font-weight:700;}' +
    '.encadrement .max{color:var(--good,#2f7a4f);font-weight:700;}' +
    '.stats{display:flex;align-items:stretch;justify-content:center;gap:6px;flex-wrap:wrap;margin-top:10px;}' +
    '.stat{flex:1 1 90px;min-width:0;border:1px solid var(--line,#e2d8c8);border-radius:var(--radius,3px);padding:8px 4px;text-align:center;background:var(--surface,#fff);}' +
    '.stat-label{display:block;font-family:var(--mono,monospace);font-size:10px;letter-spacing:0.02em;color:var(--ink-faint,#9c9083);margin-bottom:5px;}' +
    '.stat-value{display:block;font-variant-numeric:tabular-nums;font-size:0.94rem;font-weight:600;color:var(--ink,#241f1a);white-space:nowrap;}' +
    '.controles{display:flex;flex-direction:column;gap:12px;}' +
    '.curseur{display:flex;flex-direction:column;gap:6px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3212);}' +
    '.curseur-row{display:flex;align-items:center;gap:12px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;min-width:0;min-height:44px;accent-color:var(--accent,#a8471f);}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:40px;text-align:right;font-size:0.92rem;}' +
    '.btn-reset{min-height:44px;margin-top:2px;padding:8px 16px;border-radius:var(--radius,3px);border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font-weight:600;cursor:pointer;font-size:0.88rem;font-family:inherit;align-self:center;}' +
    '.btn-reset:hover{background:var(--accent-soft-line,#e8c4a4);}' +
    '</style>' +
    '<div class="selects">' +
    '<div class="ligne-select"><label for="fonction">Fonction</label>' +
    '<select id="fonction">' +
    '<option value="x2">x² sur [0 ; 4]</option>' +
    '<option value="sin">sin(x) sur [0 ; π]</option>' +
    '<option value="exp">eˣ sur [0 ; 1]</option>' +
    '<option value="inv">1/x sur [1 ; e]</option>' +
    '</select></div>' +
    '<div class="ligne-select"><label for="mode">Méthode</label>' +
    '<select id="mode">' +
    '<option value="minorant">rectangles minorants</option>' +
    '<option value="majorant">rectangles majorants</option>' +
    '<option value="milieu">point milieu</option>' +
    '<option value="trapezes">trapèzes</option>' +
    '</select></div>' +
    '</div>' +
    '<p class="formule" id="formule"></p>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" xmlns="http://www.w3.org/2000/svg"></svg></div>' +
    '<div class="controles">' +
    '<div class="curseur"><label for="n">n — sous-intervalles</label><div class="curseur-row">' +
    '<input type="range" id="n" min="' + BORNES_N.min + '" max="' + BORNES_N.max + '" step="' + BORNES_N.step + '" value="' + DEFAUT_N + '">' +
    '<span class="curseur-valeur" id="n-valeur"></span></div></div>' +
    '<button class="btn-reset" id="reset" type="button">Réinitialiser</button>' +
    '</div>' +
    '<p class="encadrement" id="encadrement"></p>' +
    '<div class="stats">' +
    '<div class="stat"><span class="stat-label" id="lbl-approx">approximation</span><span class="stat-value" id="val-approx"></span></div>' +
    '<div class="stat"><span class="stat-label">valeur exacte</span><span class="stat-value" id="val-exact"></span></div>' +
    '<div class="stat"><span class="stat-label">erreur</span><span class="stat-value" id="val-erreur"></span></div>' +
    '</div>';

  class SommesRiemannWidgetClass extends HTMLElement {
    constructor() {
      super();
      this._init();
    }
  }

  SommesRiemannWidgetClass.prototype._init = function () {
    var shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this._n = DEFAUT_N;
    this._mode = DEFAUT_MODE;
    this._cle = "x2";
    this._selectFonction = shadow.getElementById("fonction");
    this._selectMode = shadow.getElementById("mode");
    this._formule = shadow.getElementById("formule");
    this._svg = shadow.getElementById("svg");
    this._encadrement = shadow.getElementById("encadrement");
    this._lblApprox = shadow.getElementById("lbl-approx");
    this._valApprox = shadow.getElementById("val-approx");
    this._valExact = shadow.getElementById("val-exact");
    this._valErreur = shadow.getElementById("val-erreur");
    this._inputN = shadow.getElementById("n");
    this._valeurN = shadow.getElementById("n-valeur");
    this._resetBtn = shadow.getElementById("reset");
    this._selectMode.value = this._mode;
    this._selectFonction.value = this._cle;
  };

  SommesRiemannWidgetClass.prototype.connectedCallback = function () {
    var self = this;
    this._onChangeMode = function () { self._mode = self._selectMode.value; self._rendre(); };
    this._onChangeFonction = function () { self._cle = self._selectFonction.value; self._rendre(); };
    this._onInputN = function () { self._n = parseInt(self._inputN.value, 10); self._rendre(); };
    this._onReset = function () {
      self._n = DEFAUT_N; self._mode = DEFAUT_MODE; self._cle = "x2";
      self._selectMode.value = DEFAUT_MODE;
      self._selectFonction.value = "x2";
      self._inputN.value = String(DEFAUT_N);
      self._rendre();
    };
    this._selectMode.addEventListener("change", this._onChangeMode);
    this._selectFonction.addEventListener("change", this._onChangeFonction);
    this._inputN.addEventListener("input", this._onInputN);
    this._resetBtn.addEventListener("click", this._onReset);
    this._rendre();
  };

  SommesRiemannWidgetClass.prototype.disconnectedCallback = function () {
    this._selectMode.removeEventListener("change", this._onChangeMode);
    this._selectFonction.removeEventListener("change", this._onChangeFonction);
    this._inputN.removeEventListener("input", this._onInputN);
    this._resetBtn.removeEventListener("click", this._onReset);
  };

  SommesRiemannWidgetClass.prototype._toPx = function (xMath, yMath) {
    var w = this._win;
    var px = MARGE + (xMath - w.xMin) / (w.xMax - w.xMin) * (LARGEUR - 2 * MARGE);
    var py = HAUTEUR - MARGE - (yMath - w.yMin) / (w.yMax - w.yMin) * (HAUTEUR - 2 * MARGE);
    return [px, py];
  };

  SommesRiemannWidgetClass.prototype._rendre = function () {
    var self = this;
    var def = FONCTIONS[this._cle];
    this._win = def.win;
    var w = def.win;
    var n = this._n, mode = this._mode;
    var dx = (def.b - def.a) / n;

    var approx = somme(def, n, mode);
    var sMin = somme(def, n, "minorant");
    var sMax = somme(def, n, "majorant");
    var erreur = Math.abs(approx - def.exact);

    var dxExact = Math.abs(dx * 1000 - Math.round(dx * 1000)) < 1e-9;
    this._formule.textContent = def.titre + " ≈ " + LABEL_MODE[mode] + ", n = " + n +
      " (Δx " + (dxExact ? "= " : "≈ ") + fmt(dx, 3).replace(/0+$/, "").replace(/,$/, "") + ")";
    this._valeurN.textContent = String(n);
    this._lblApprox.textContent = LABEL_MODE[mode];
    this._valApprox.textContent = fmt(approx, 4);
    this._valExact.textContent = def.exactTxt;
    this._valErreur.textContent = fmt(erreur, 4);
    this._encadrement.innerHTML =
      '<span class="lbl">encadrement — minorant ≤ I ≤ majorant</span>' +
      '<span class="min">' + fmt(sMin, 4) + '</span> ≤ ' + fmt(def.exact, 4) + ' ≤ <span class="max">' + fmt(sMax, 4) + '</span>' +
      '  (écart ' + fmt(sMax - sMin, 4) + ')';

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

    var classeForme = { minorant: "forme-minorant", majorant: "forme-majorant", milieu: "forme-milieu", trapezes: "forme-trapeze" }[mode];
    for (var i = 0; i < n; i++) {
      var xLo = def.a + i * dx, xHi = xLo + dx;
      var pLo = self._toPx(xLo, 0), pHi = self._toPx(xHi, 0);
      var hG, hD;
      if (mode === "trapezes") { hG = def.f(xLo); hD = def.f(xHi); }
      else {
        var h = mode === "minorant" ? minMax(def, xLo, xHi).min : mode === "majorant" ? minMax(def, xLo, xHi).max : def.f((xLo + xHi) / 2);
        hG = h; hD = h;
      }
      var pA = self._toPx(xLo, Math.min(w.yMax, hG)), pB = self._toPx(xHi, Math.min(w.yMax, hD));
      var d = "M" + pLo[0].toFixed(2) + " " + pLo[1].toFixed(2) +
        " L" + pA[0].toFixed(2) + " " + pA[1].toFixed(2) +
        " L" + pB[0].toFixed(2) + " " + pB[1].toFixed(2) +
        " L" + pHi[0].toFixed(2) + " " + pHi[1].toFixed(2) + " Z";
      svg.appendChild(svgEl(ns, "path", { d: d, class: classeForme }));
      if (mode === "milieu" && n <= 12) {
        var pm = self._toPx((xLo + xHi) / 2, def.f((xLo + xHi) / 2));
        svg.appendChild(svgEl(ns, "circle", { cx: pm[0].toFixed(2), cy: pm[1].toFixed(2), r: 3, class: "point-milieu" }));
      }
    }

    // Courbe de f, tracée sur la fenêtre (1/x seulement pour x > 0).
    var nC = 200, chemin = "", dedans = false;
    for (var ic = 0; ic <= nC; ic++) {
      var xx = w.xMin + (ic / nC) * (w.xMax - w.xMin);
      if (this._cle === "inv" && xx < 0.35) { dedans = false; continue; }
      if (this._cle === "x2" && xx < -0.1) { dedans = false; continue; }
      var yy = def.f(xx);
      if (yy > w.yMax + 0.05 || yy < w.yMin - 0.05) { dedans = false; continue; }
      var p = self._toPx(xx, yy);
      chemin += (dedans ? "L" : "M") + p[0].toFixed(2) + " " + p[1].toFixed(2) + " ";
      dedans = true;
    }
    svg.appendChild(svgEl(ns, "path", { d: chemin.trim(), class: "courbe" }));

    // Bornes a et b graduées sur l'axe des x.
    [[def.a, def.aTxt], [def.b, def.bTxt]].forEach(function (bt) {
      if (Math.abs(bt[0]) < 1e-9) return;
      var pg = self._toPx(bt[0], 0);
      svg.appendChild(svgEl(ns, "line", { x1: pg[0].toFixed(2), x2: pg[0].toFixed(2), y1: (pg[1] - 4).toFixed(2), y2: (pg[1] + 4).toFixed(2), class: "graduation" }));
      var t = svgEl(ns, "text", { x: pg[0].toFixed(2), y: (pg[1] + 17).toFixed(2), "text-anchor": "middle", class: "etiquette" });
      t.textContent = bt[1];
      svg.appendChild(t);
    });
  };

  if (!customElements.get("sommes-riemann-widget")) {
    customElements.define("sommes-riemann-widget", SommesRiemannWidgetClass);
  }
})();
