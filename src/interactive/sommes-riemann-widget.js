(function () {
  "use strict";

  /* ================================================================
   * <sommes-riemann-widget> — atelier interactif : curseur n (nombre de
   * sous-intervalles) et sélecteur minorant/majorant/trapèzes pour
   * ∫₀⁴x²dx — reprend mot pour mot l'affirmation de la méthode : « plus n
   * est grand, plus cette approximation est précise ». Réglage par défaut
   * (n=4, trapèzes) reproduit exactement l'exemple résolu : approximation
   * 22, valeur exacte 64/3≈21,33. Web Component (Shadow DOM).
   * ================================================================ */

  var A = 0, B = 4;
  var DEFAUT_N = 4;
  var BORNES_N = { min: 1, max: 20, step: 1 };
  var DEFAUT_MODE = "trapezes";
  var EXACT = 64 / 3;

  var X_MIN = -0.5, X_MAX = 4.6, Y_MIN = -1.6, Y_MAX = 18;
  var LARGEUR = 420, HAUTEUR = 300, MARGE = 34;

  function f(x) { return x * x; }

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
    '.ligne-select{display:flex;align-items:center;gap:10px;justify-content:center;margin-bottom:12px;}' +
    '.ligne-select label{font-weight:600;color:var(--ink,#241f1a);}' +
    'select{font:inherit;padding:6px 10px;border-radius:var(--radius,3px);border:1px solid var(--line,#e2d8c8);background:var(--surface,#fff);color:var(--ink,#241f1a);}' +
    '.formule{text-align:center;font-family:var(--serif,serif);font-style:italic;font-size:1.05rem;font-weight:600;color:var(--ink,#241f1a);margin:0 0 12px;}' +
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:12px;}' +
    'svg{width:100%;max-width:420px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.4;}' +
    '.fleche{fill:var(--ink-soft,#6b6055);}' +
    '.courbe{stroke:var(--ink,#241f1a);stroke-width:2.2;fill:none;}' +
    '.forme-minorant{fill:var(--accent,#a8471f);fill-opacity:0.32;stroke:var(--accent,#a8471f);stroke-width:1;}' +
    '.forme-majorant{fill:var(--good,#2f7a4f);fill-opacity:0.32;stroke:var(--good,#2f7a4f);stroke-width:1;}' +
    '.forme-trapeze{fill:var(--plan,#5b4ea3);fill-opacity:0.32;stroke:var(--plan,#5b4ea3);stroke-width:1;}' +
    '.etiquette{font-size:12px;fill:var(--ink-soft,#6b6055);font-family:var(--sans,sans-serif);}' +
    '.stats{display:flex;align-items:stretch;justify-content:center;gap:6px;flex-wrap:wrap;margin-bottom:18px;}' +
    '.stat{flex:1 1 100px;min-width:0;border:1px solid var(--line,#e2d8c8);border-radius:var(--radius,3px);padding:8px 4px;text-align:center;background:var(--surface,#fff);}' +
    '.stat-label{display:block;font-family:var(--mono,monospace);font-size:10px;letter-spacing:0.02em;color:var(--ink-faint,#9c9083);margin-bottom:5px;}' +
    '.stat-value{display:block;font-variant-numeric:tabular-nums;font-size:0.94rem;font-weight:600;color:var(--ink,#241f1a);white-space:nowrap;}' +
    '.controles{display:flex;flex-direction:column;gap:12px;}' +
    '.curseur{display:flex;flex-direction:column;gap:6px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3212);}' +
    '.curseur-row{display:flex;align-items:center;gap:12px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;accent-color:var(--accent,#a8471f);}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:40px;text-align:right;font-size:0.92rem;}' +
    '.btn-reset{margin-top:2px;padding:8px 14px;border-radius:var(--radius,3px);border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font-weight:600;cursor:pointer;font-size:0.88rem;font-family:inherit;align-self:center;}' +
    '.btn-reset:hover{background:var(--accent-soft-line,#e8c4a4);}' +
    '</style>' +
    '<div class="ligne-select"><label for="mode">Méthode</label>' +
    '<select id="mode">' +
    '<option value="minorant">rectangles minorants</option>' +
    '<option value="majorant">rectangles majorants</option>' +
    '<option value="trapezes">trapèzes</option>' +
    '</select></div>' +
    '<p class="formule" id="formule"></p>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" xmlns="http://www.w3.org/2000/svg"></svg></div>' +
    '<div class="stats">' +
    '<div class="stat"><span class="stat-label">approximation</span><span class="stat-value" id="val-approx"></span></div>' +
    '<div class="stat"><span class="stat-label">valeur exacte</span><span class="stat-value" id="val-exact"></span></div>' +
    '<div class="stat"><span class="stat-label">erreur</span><span class="stat-value" id="val-erreur"></span></div>' +
    '</div>' +
    '<div class="controles">' +
    '<div class="curseur"><label for="n">n — sous-intervalles</label><div class="curseur-row">' +
    '<input type="range" id="n" min="' + BORNES_N.min + '" max="' + BORNES_N.max + '" step="' + BORNES_N.step + '" value="' + DEFAUT_N + '">' +
    '<span class="curseur-valeur" id="n-valeur"></span></div></div>' +
    '<button class="btn-reset" id="reset" type="button">Réinitialiser</button>' +
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
    this._selectMode = shadow.getElementById("mode");
    this._formule = shadow.getElementById("formule");
    this._svg = shadow.getElementById("svg");
    this._valApprox = shadow.getElementById("val-approx");
    this._valExact = shadow.getElementById("val-exact");
    this._valErreur = shadow.getElementById("val-erreur");
    this._inputN = shadow.getElementById("n");
    this._valeurN = shadow.getElementById("n-valeur");
    this._resetBtn = shadow.getElementById("reset");
    this._selectMode.value = this._mode;
  };

  SommesRiemannWidgetClass.prototype.connectedCallback = function () {
    var self = this;
    this._onChangeMode = function () { self._mode = self._selectMode.value; self._rendre(); };
    this._onInputN = function () { self._n = parseInt(self._inputN.value, 10); self._rendre(); };
    this._onReset = function () {
      self._n = DEFAUT_N; self._mode = DEFAUT_MODE;
      self._selectMode.value = DEFAUT_MODE;
      self._inputN.value = String(DEFAUT_N);
      self._rendre();
    };
    this._selectMode.addEventListener("change", this._onChangeMode);
    this._inputN.addEventListener("input", this._onInputN);
    this._resetBtn.addEventListener("click", this._onReset);
    this._rendre();
  };

  SommesRiemannWidgetClass.prototype.disconnectedCallback = function () {
    this._selectMode.removeEventListener("change", this._onChangeMode);
    this._inputN.removeEventListener("input", this._onInputN);
    this._resetBtn.removeEventListener("click", this._onReset);
  };

  SommesRiemannWidgetClass.prototype._toPx = function (xMath, yMath) {
    var px = MARGE + (xMath - X_MIN) / (X_MAX - X_MIN) * (LARGEUR - 2 * MARGE);
    var py = HAUTEUR - MARGE - (yMath - Y_MIN) / (Y_MAX - Y_MIN) * (HAUTEUR - 2 * MARGE);
    return [px, py];
  };

  var LABEL_MODE = { minorant: "rectangles minorants", majorant: "rectangles majorants", trapezes: "trapèzes" };

  SommesRiemannWidgetClass.prototype._rendre = function () {
    var self = this;
    var n = this._n, mode = this._mode;
    var dx = (B - A) / n;
    var points = [];
    for (var i = 0; i <= n; i++) points.push(A + i * dx);

    var approx;
    if (mode === "minorant") {
      approx = 0;
      for (var im = 0; im < n; im++) approx += f(points[im]) * dx;
    } else if (mode === "majorant") {
      approx = 0;
      for (var iM = 1; iM <= n; iM++) approx += f(points[iM]) * dx;
    } else {
      var somme = f(points[0]) + f(points[n]);
      for (var it = 1; it < n; it++) somme += 2 * f(points[it]);
      approx = (dx / 2) * somme;
    }
    var erreur = Math.abs(approx - EXACT);

    this._formule.textContent = "∫₀⁴ x² dx ≈ " + LABEL_MODE[mode] + ", n = " + n + " sous-intervalles (Δx=" + formatNombreFr(dx, 2) + ")";
    this._valeurN.textContent = String(n);
    this._valApprox.textContent = formatNombreFr(approx, 2);
    this._valExact.textContent = formatNombreFr(EXACT, 2);
    this._valErreur.textContent = formatNombreFr(erreur, 3);

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

    var classeForme = mode === "minorant" ? "forme-minorant" : mode === "majorant" ? "forme-majorant" : "forme-trapeze";
    for (var i2 = 0; i2 < n; i2++) {
      var xLo = points[i2], xHi = points[i2 + 1];
      var pXLo = self._toPx(xLo, 0), pXHi = self._toPx(xHi, 0);
      var d;
      if (mode === "trapezes") {
        var pA = self._toPx(xLo, f(xLo)), pB = self._toPx(xHi, f(xHi));
        d = "M" + pXLo[0].toFixed(2) + " " + pXLo[1].toFixed(2) +
          " L" + pA[0].toFixed(2) + " " + pA[1].toFixed(2) +
          " L" + pB[0].toFixed(2) + " " + pB[1].toFixed(2) +
          " L" + pXHi[0].toFixed(2) + " " + pXHi[1].toFixed(2) + " Z";
      } else {
        var hauteurX = mode === "minorant" ? xLo : xHi;
        var pHaut = self._toPx(xLo, f(hauteurX)), pHaut2 = self._toPx(xHi, f(hauteurX));
        d = "M" + pXLo[0].toFixed(2) + " " + pXLo[1].toFixed(2) +
          " L" + pHaut[0].toFixed(2) + " " + pHaut[1].toFixed(2) +
          " L" + pHaut2[0].toFixed(2) + " " + pHaut2[1].toFixed(2) +
          " L" + pXHi[0].toFixed(2) + " " + pXHi[1].toFixed(2) + " Z";
      }
      svg.appendChild(svgEl(ns, "path", { d: d, class: classeForme }));
    }

    var nCourbe = 120, courant = "";
    for (var ic = 0; ic <= nCourbe; ic++) {
      var xx = X_MIN + (ic / nCourbe) * (X_MAX - X_MIN);
      if (xx < A - 0.1) continue;
      var yy = f(xx);
      if (yy > Y_MAX + 0.5) continue;
      var p = self._toPx(xx, Math.min(Y_MAX, yy));
      courant += (courant === "" ? "M" : "L") + p[0].toFixed(2) + " " + p[1].toFixed(2) + " ";
    }
    svg.appendChild(svgEl(ns, "path", { d: courant.trim(), class: "courbe" }));
  };

  if (!customElements.get("sommes-riemann-widget")) {
    customElements.define("sommes-riemann-widget", SommesRiemannWidgetClass);
  }
})();
