(function () {
  "use strict";

  /* ================================================================
   * <log-exp-miroir-widget> — atelier interactif : reprend le mécanisme
   * miroir déjà utilisé au chapitre 1 (reciproque-miroir-widget), appliqué
   * ici à expₐ/logₐ avec la base a réglable en continu (pas un sélecteur
   * fermé de fonctions). Point (r;aʳ) sur expₐ, son symétrique (aʳ;r) sur
   * logₐ, par rapport à y=x. Web Component (Shadow DOM).
   * ================================================================ */

  var DEFAUT = { a: 2, r: 0.8 }; // reprend exactement le point (r;s) de l'illustration statique
  var BORNES_A = { min: 0.3, max: 2.6, step: 0.02 };
  var R_MIN = -1.5, R_MAX = 1.5;
  var TAILLE = 340, MARGE = 30;

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
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:16px;}' +
    'svg{width:100%;max-width:340px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.4;}' +
    '.diagonale{stroke:var(--ink-faint,#9c9083);stroke-width:1.3;stroke-dasharray:5 4;}' +
    '.courbe-exp{stroke:var(--good,#2f7a4f);stroke-width:2.6;fill:none;}' +
    '.courbe-log{stroke:var(--accent,#a8471f);stroke-width:2.6;fill:none;}' +
    '.guide-miroir{stroke:var(--plan,#5b4ea3);stroke-width:1.2;stroke-dasharray:4 3;opacity:0.75;}' +
    '.point-exp{fill:var(--good,#2f7a4f);}' +
    '.point-log{fill:var(--accent,#a8471f);}' +
    '.etiquette-point{font-size:11px;font-weight:600;font-family:var(--mono,monospace);}' +
    '.etiquette-point-exp{fill:var(--good,#2f7a4f);}' +
    '.etiquette-point-log{fill:var(--accent-ink,#7a3212);}' +
    '.legende{font-size:11.5px;font-weight:600;font-family:var(--sans,sans-serif);}' +
    '.legende-exp{fill:var(--good,#2f7a4f);}' +
    '.legende-log{fill:var(--accent-ink,#7a3212);}' +
    '.legende-diag{fill:var(--ink-faint,#9c9083);}' +
    '.stats{display:flex;align-items:stretch;justify-content:center;gap:6px;margin-bottom:20px;flex-wrap:wrap;}' +
    '.stat{flex:1 1 130px;min-width:0;border:1px solid var(--line,#e2d8c8);border-radius:var(--radius,3px);padding:8px 6px;text-align:center;background:var(--surface,#fff);}' +
    '.stat-label{display:block;font-family:var(--mono,monospace);font-size:10px;letter-spacing:0.02em;color:var(--ink-faint,#9c9083);margin-bottom:5px;}' +
    '.stat-value{display:block;font-variant-numeric:tabular-nums;font-size:0.94rem;font-weight:600;color:var(--ink,#241f1a);white-space:nowrap;}' +
    '.curseur{display:flex;flex-direction:column;gap:6px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3212);text-align:center;}' +
    '.curseur-row{display:flex;align-items:center;gap:12px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;accent-color:var(--accent,#a8471f);}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:56px;text-align:right;font-size:0.92rem;}' +
    '</style>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + TAILLE + ' ' + TAILLE + '" xmlns="http://www.w3.org/2000/svg"></svg></div>' +
    '<div class="stats">' +
    '<div class="stat"><span class="stat-label">point sur expₐ</span><span class="stat-value" id="val-point-exp"></span></div>' +
    '<div class="stat"><span class="stat-label">symétrique sur logₐ</span><span class="stat-value" id="val-point-log"></span></div>' +
    '</div>' +
    '<div class="curseur"><label for="a">a — base</label><div class="curseur-row">' +
    '<input type="range" id="a" min="' + BORNES_A.min + '" max="' + BORNES_A.max + '" step="' + BORNES_A.step + '" value="' + DEFAUT.a + '">' +
    '<span class="curseur-valeur" id="a-valeur"></span></div></div>' +
    '<div class="curseur"><label for="r">r</label><div class="curseur-row">' +
    '<input type="range" id="r" min="' + R_MIN + '" max="' + R_MAX + '" step="0.02" value="' + DEFAUT.r + '">' +
    '<span class="curseur-valeur" id="r-valeur"></span></div></div>';

  class LogExpMiroirWidgetClass extends HTMLElement {
    constructor() {
      super();
      this._init();
    }
  }

  LogExpMiroirWidgetClass.prototype._init = function () {
    var shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this._a = DEFAUT.a;
    this._r = DEFAUT.r;
    this._svg = shadow.getElementById("svg");
    this._inputA = shadow.getElementById("a");
    this._inputR = shadow.getElementById("r");
    this._valeurA = shadow.getElementById("a-valeur");
    this._valeurR = shadow.getElementById("r-valeur");
    this._valPointExp = shadow.getElementById("val-point-exp");
    this._valPointLog = shadow.getElementById("val-point-log");
  };

  LogExpMiroirWidgetClass.prototype.connectedCallback = function () {
    var self = this;
    // a ne peut jamais valoir 1 (logₐ n'existe pas en base 1) : un curseur qui franchit 1 est
    // repoussé au pas le plus proche, dans le sens du déplacement.
    this._onInputA = function () {
      var v = parseFloat(self._inputA.value);
      if (Math.abs(v - 1) < BORNES_A.step / 2) {
        v = v >= self._a ? 1 + BORNES_A.step : 1 - BORNES_A.step;
        self._inputA.value = String(v);
      }
      self._a = v;
      self._rendre();
    };
    this._onInputR = function () { self._r = parseFloat(self._inputR.value); self._rendre(); };
    this._inputA.addEventListener("input", this._onInputA);
    this._inputR.addEventListener("input", this._onInputR);
    this._rendre();
  };

  LogExpMiroirWidgetClass.prototype.disconnectedCallback = function () {
    this._inputA.removeEventListener("input", this._onInputA);
    this._inputR.removeEventListener("input", this._onInputR);
  };

  LogExpMiroirWidgetClass.prototype._toPx = function (win, xMath, yMath) {
    var px = MARGE + (xMath - win.min) / (win.max - win.min) * (TAILLE - 2 * MARGE);
    var py = TAILLE - MARGE - (yMath - win.min) / (win.max - win.min) * (TAILLE - 2 * MARGE);
    return [px, py];
  };

  LogExpMiroirWidgetClass.prototype._traceFonction = function (svg, ns, win, xMin, xMax, f, classe) {
    var self = this;
    var n = 220, segments = [], courant = "", dernierValide = false;
    for (var i = 0; i <= n; i++) {
      var xx = xMin + (i / n) * (xMax - xMin);
      var yy = f(xx);
      var valide = isFinite(yy) && yy >= win.min - 0.5 && yy <= win.max + 0.5;
      if (valide) {
        var p = self._toPx(win, xx, Math.max(win.min, Math.min(win.max, yy)));
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

  // Étiquette d'un point, ancrée à gauche ou à droite selon la proximité du bord du cadre — évite
  // le rognage (overflow:hidden implicite d'un <svg> racine).
  LogExpMiroirWidgetClass.prototype._etiquettePoint = function (svg, ns, px, py, texte, classe) {
    var procheDroite = px > TAILLE - 70;
    var procheHaut = py < MARGE + 18;
    var ancre = procheDroite ? "end" : "start";
    var dx = procheDroite ? -8 : 8;
    var dy = procheHaut ? 16 : -8;
    var t = svgEl(ns, "text", { x: (px + dx).toFixed(2), y: (py + dy).toFixed(2), "text-anchor": ancre, class: classe });
    t.textContent = texte;
    svg.appendChild(t);
  };

  LogExpMiroirWidgetClass.prototype._rendre = function () {
    var a = this._a, r = this._r;
    var expA = function (x) { return Math.pow(a, x); };
    var logA = function (x) { return x > 0 ? Math.log(x) / Math.log(a) : NaN; };
    var s = expA(r);

    this._valeurA.textContent = formatNombreFr(a, 2);
    this._valeurR.textContent = formatNombreFr(r, 2);
    this._valPointExp.textContent = "(" + formatNombreFr(r, 2) + " ; " + formatNombreFr(s, 2) + ")";
    this._valPointLog.textContent = "(" + formatNombreFr(s, 2) + " ; " + formatNombreFr(r, 2) + ")";

    // Fenêtre carrée dynamique : combine le domaine de r et l'étendue réellement atteinte par
    // expₐ sur ce domaine, pour que y=x reste à 45° quelle que soit la base choisie.
    var sMin = Infinity, sMax = -Infinity;
    for (var i = 0; i <= 60; i++) {
      var rr = R_MIN + (i / 60) * (R_MAX - R_MIN);
      var vv = expA(rr);
      if (vv < sMin) sMin = vv;
      if (vv > sMax) sMax = vv;
    }
    var lo = Math.min(R_MIN, sMin), hi = Math.max(R_MAX, sMax);
    var marge = (hi - lo) * 0.08;
    var win = { min: lo - marge, max: hi + marge };

    var ns = "http://www.w3.org/2000/svg";
    var svg = this._svg;
    svg.innerHTML = "";
    var self = this;

    var origine = self._toPx(win, 0, 0);
    svg.appendChild(svgEl(ns, "line", { x1: MARGE, x2: TAILLE - MARGE, y1: origine[1].toFixed(2), y2: origine[1].toFixed(2), class: "axe" }));
    svg.appendChild(svgEl(ns, "line", { x1: origine[0].toFixed(2), x2: origine[0].toFixed(2), y1: MARGE, y2: TAILLE - MARGE, class: "axe" }));

    var pD0 = self._toPx(win, win.min, win.min);
    var pD1 = self._toPx(win, win.max, win.max);
    svg.appendChild(svgEl(ns, "line", { x1: pD0[0].toFixed(2), y1: pD0[1].toFixed(2), x2: pD1[0].toFixed(2), y2: pD1[1].toFixed(2), class: "diagonale" }));

    this._traceFonction(svg, ns, win, R_MIN, R_MAX, expA, "courbe-exp");
    var logXmin = Math.max(0.01, win.min);
    this._traceFonction(svg, ns, win, logXmin, win.max, logA, "courbe-log");

    var pExp = self._toPx(win, r, s);
    var pLog = self._toPx(win, s, r);
    svg.appendChild(svgEl(ns, "line", { x1: pExp[0].toFixed(2), y1: pExp[1].toFixed(2), x2: pLog[0].toFixed(2), y2: pLog[1].toFixed(2), class: "guide-miroir" }));
    svg.appendChild(svgEl(ns, "circle", { cx: pExp[0].toFixed(2), cy: pExp[1].toFixed(2), r: 4.5, class: "point-exp" }));
    svg.appendChild(svgEl(ns, "circle", { cx: pLog[0].toFixed(2), cy: pLog[1].toFixed(2), r: 4.5, class: "point-log" }));
    self._etiquettePoint(svg, ns, pExp[0], pExp[1], "(" + formatNombreFr(r, 2) + ";" + formatNombreFr(s, 2) + ")", "etiquette-point etiquette-point-exp");
    self._etiquettePoint(svg, ns, pLog[0], pLog[1], "(" + formatNombreFr(s, 2) + ";" + formatNombreFr(r, 2) + ")", "etiquette-point etiquette-point-log");

    var yLegende = MARGE + 4;
    var legExp = svgEl(ns, "text", { x: MARGE + 4, y: yLegende, class: "legende legende-exp" });
    legExp.textContent = formatNombreFr(a, 2) + "ˣ";
    svg.appendChild(legExp);
    var legLog = svgEl(ns, "text", { x: MARGE + 4, y: yLegende + 15, class: "legende legende-log" });
    legLog.textContent = "logₐ(x)";
    svg.appendChild(legLog);
    var legDiag = svgEl(ns, "text", { x: MARGE + 4, y: yLegende + 30, class: "legende legende-diag" });
    legDiag.textContent = "y = x";
    svg.appendChild(legDiag);
  };

  if (!customElements.get("log-exp-miroir-widget")) {
    customElements.define("log-exp-miroir-widget", LogExpMiroirWidgetClass);
  }
})();
