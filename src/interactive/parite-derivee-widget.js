(function () {
  "use strict";

  /* ================================================================
   * <parite-derivee-widget> — atelier interactif : point mobile x et son
   * symétrique −x sur une fonction PAIRE, avec les deux tangentes affichées
   * et leurs pentes — pour voir concrètement que f'(−x) = −f'(x) (la dérivée
   * d'une fonction paire est impaire). Reprend l'exemple résolu de la
   * section (cosh/sinh) comme préréglage par défaut. Web Component (Shadow
   * DOM), tangentes clippées au cadre sur le modèle de
   * cyclometrique-tangente-widget.
   * ================================================================ */

  var PRESETS = [
    {
      nom: "f(x) = (eˣ+e⁻ˣ)/2  (l'exemple résolu ci-dessus)",
      f: function (x) { return (Math.exp(x) + Math.exp(-x)) / 2; },
      fPrime: function (x) { return (Math.exp(x) - Math.exp(-x)) / 2; },
      xMin: -2.3, xMax: 2.3, xDefaut: 1.2,
      win: { xMin: -2.5, xMax: 2.5, yMin: -5, yMax: 6.5 },
    },
    {
      nom: "f(x) = e⁻ˣ²",
      f: function (x) { return Math.exp(-x * x); },
      fPrime: function (x) { return -2 * x * Math.exp(-x * x); },
      xMin: -2, xMax: 2, xDefaut: 1,
      win: { xMin: -2.2, xMax: 2.2, yMin: -1.6, yMax: 1.6 },
    },
  ];

  var LARGEUR = 420, HAUTEUR = 300, MARGE = 32;

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
    '.select-row{display:flex;justify-content:center;margin-bottom:12px;}' +
    '.select-row select{font-family:inherit;font-size:0.9rem;font-weight:600;color:var(--ink,#241f1a);background:var(--surface,#fff);border:1px solid var(--line,#e2d8c8);border-radius:var(--radius,3px);padding:6px 10px;cursor:pointer;max-width:100%;}' +
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:16px;}' +
    'svg{width:100%;max-width:420px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.4;}' +
    '.courbe-f{stroke:var(--ink,#241f1a);stroke-width:2.4;fill:none;opacity:0.8;}' +
    '.tangente-x{stroke:var(--accent,#a8471f);stroke-width:2.2;}' +
    '.tangente-mx{stroke:var(--good,#2f7a4f);stroke-width:2.2;}' +
    '.point-x{fill:var(--accent,#a8471f);}' +
    '.point-mx{fill:var(--good,#2f7a4f);}' +
    '.etiquette{font-size:12px;fill:var(--ink-soft,#6b6055);font-family:var(--sans,sans-serif);}' +
    '.stats{display:flex;align-items:stretch;justify-content:center;gap:6px;margin-bottom:20px;flex-wrap:wrap;}' +
    '.stat{flex:1 1 130px;min-width:0;border:1px solid var(--line,#e2d8c8);border-radius:var(--radius,3px);padding:8px 6px;text-align:center;background:var(--surface,#fff);}' +
    '.stat-label{display:block;font-family:var(--mono,monospace);font-size:10px;letter-spacing:0.02em;color:var(--ink-faint,#9c9083);margin-bottom:5px;}' +
    '.stat-value{display:block;font-variant-numeric:tabular-nums;font-size:0.94rem;font-weight:600;white-space:nowrap;}' +
    '.stat-value.accent{color:var(--accent-ink,#7a3212);}' +
    '.stat-value.good{color:var(--good,#2f7a4f);}' +
    '.curseur{display:flex;flex-direction:column;gap:6px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3212);text-align:center;}' +
    '.curseur-row{display:flex;align-items:center;gap:12px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;accent-color:var(--accent,#a8471f);}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:56px;text-align:right;font-size:0.92rem;}' +
    '</style>' +
    '<div class="select-row"><select id="preset"></select></div>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" xmlns="http://www.w3.org/2000/svg"></svg></div>' +
    '<div class="stats">' +
    '<div class="stat"><span class="stat-label">f\'(x)</span><span class="stat-value accent" id="val-fpx"></span></div>' +
    '<div class="stat"><span class="stat-label">f\'(−x)</span><span class="stat-value good" id="val-fpmx"></span></div>' +
    '</div>' +
    '<div class="curseur"><label for="x">x</label><div class="curseur-row">' +
    '<input type="range" id="x" min="0" max="2.3" step="0.02" value="1.2">' +
    '<span class="curseur-valeur" id="x-valeur"></span></div></div>';

  class PariteDeriveeWidgetClass extends HTMLElement {
    constructor() {
      super();
      this._init();
    }
  }

  PariteDeriveeWidgetClass.prototype._init = function () {
    var shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this._presetIndex = 0;
    this._svg = shadow.getElementById("svg");
    this._selectPreset = shadow.getElementById("preset");
    this._inputX = shadow.getElementById("x");
    this._valeurX = shadow.getElementById("x-valeur");
    this._valFpx = shadow.getElementById("val-fpx");
    this._valFpmx = shadow.getElementById("val-fpmx");
    PRESETS.forEach(function (p, i) {
      var opt = document.createElement("option");
      opt.value = String(i);
      opt.textContent = p.nom;
      shadow.getElementById("preset").appendChild(opt);
    });
    this._x = PRESETS[0].xDefaut;
  };

  PariteDeriveeWidgetClass.prototype.connectedCallback = function () {
    var self = this;
    this._onChangePreset = function () {
      self._presetIndex = parseInt(self._selectPreset.value, 10);
      var p = PRESETS[self._presetIndex];
      self._x = p.xDefaut;
      self._inputX.min = "0";
      self._inputX.max = String(p.xMax);
      self._inputX.value = String(p.xDefaut);
      self._rendre();
    };
    this._onInputX = function () { self._x = parseFloat(self._inputX.value); self._rendre(); };
    this._selectPreset.addEventListener("change", this._onChangePreset);
    this._inputX.addEventListener("input", this._onInputX);
    var p0 = PRESETS[0];
    this._inputX.max = String(p0.xMax);
    this._inputX.value = String(p0.xDefaut);
    this._rendre();
  };

  PariteDeriveeWidgetClass.prototype.disconnectedCallback = function () {
    this._selectPreset.removeEventListener("change", this._onChangePreset);
    this._inputX.removeEventListener("input", this._onInputX);
  };

  PariteDeriveeWidgetClass.prototype._toPx = function (win, xMath, yMath) {
    var px = MARGE + (xMath - win.xMin) / (win.xMax - win.xMin) * (LARGEUR - 2 * MARGE);
    var py = HAUTEUR - MARGE - (yMath - win.yMin) / (win.yMax - win.yMin) * (HAUTEUR - 2 * MARGE);
    return [px, py];
  };

  PariteDeriveeWidgetClass.prototype._traceFonction = function (svg, ns, win, f, xMin, xMax, classe) {
    var self = this;
    var n = 260, segments = [], courant = "", dernierValide = false;
    for (var i = 0; i <= n; i++) {
      var xx = xMin + (i / n) * (xMax - xMin);
      var yy = f(xx);
      var valide = isFinite(yy) && yy >= win.yMin - 0.3 && yy <= win.yMax + 0.3;
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

  // Segment de tangente clippé au cadre par intersection droite/rectangle (jamais coupé net ni
  // laissé déborder) — même technique que cyclometrique-tangente-widget.
  PariteDeriveeWidgetClass.prototype._segmentTangente = function (win, x0, y0, m) {
    var tXmin = win.xMin - x0, tXmax = win.xMax - x0;
    var tMin, tMax;
    if (Math.abs(m) < 1e-9) {
      tMin = tXmin; tMax = tXmax;
    } else {
      var tA = (win.yMin - y0) / m, tB = (win.yMax - y0) / m;
      var tYmin = Math.min(tA, tB), tYmax = Math.max(tA, tB);
      tMin = Math.max(tXmin, tYmin);
      tMax = Math.min(tXmax, tYmax);
    }
    if (tMin > tMax) return null;
    return [[x0 + tMin, y0 + m * tMin], [x0 + tMax, y0 + m * tMax]];
  };

  PariteDeriveeWidgetClass.prototype._rendre = function () {
    var preset = PRESETS[this._presetIndex];
    var win = preset.win;
    var x = this._x;
    var y = preset.f(x);
    var ym = preset.f(-x);
    var pente = preset.fPrime(x);
    var penteM = preset.fPrime(-x);

    this._valeurX.textContent = formatNombreFr(x, 2);
    this._valFpx.textContent = formatNombreFr(pente, 2);
    this._valFpmx.textContent = formatNombreFr(penteM, 2);

    var ns = "http://www.w3.org/2000/svg";
    var svg = this._svg;
    svg.innerHTML = "";
    var self = this;

    var origine = self._toPx(win, 0, 0);
    svg.appendChild(svgEl(ns, "line", { x1: MARGE, x2: LARGEUR - MARGE, y1: origine[1].toFixed(2), y2: origine[1].toFixed(2), class: "axe" }));
    svg.appendChild(svgEl(ns, "line", { x1: origine[0].toFixed(2), x2: origine[0].toFixed(2), y1: MARGE, y2: HAUTEUR - MARGE, class: "axe" }));
    var etiqX = svgEl(ns, "text", { x: LARGEUR - MARGE + 6, y: origine[1] + 4, class: "etiquette" });
    etiqX.textContent = "x";
    svg.appendChild(etiqX);

    var segX = self._segmentTangente(win, x, y, pente);
    if (segX) {
      var pT0 = self._toPx(win, segX[0][0], segX[0][1]);
      var pT1 = self._toPx(win, segX[1][0], segX[1][1]);
      svg.appendChild(svgEl(ns, "line", { x1: pT0[0].toFixed(2), y1: pT0[1].toFixed(2), x2: pT1[0].toFixed(2), y2: pT1[1].toFixed(2), class: "tangente-x" }));
    }
    var segMx = self._segmentTangente(win, -x, ym, penteM);
    if (segMx) {
      var pM0 = self._toPx(win, segMx[0][0], segMx[0][1]);
      var pM1 = self._toPx(win, segMx[1][0], segMx[1][1]);
      svg.appendChild(svgEl(ns, "line", { x1: pM0[0].toFixed(2), y1: pM0[1].toFixed(2), x2: pM1[0].toFixed(2), y2: pM1[1].toFixed(2), class: "tangente-mx" }));
    }

    this._traceFonction(svg, ns, win, preset.f, win.xMin, win.xMax, "courbe-f");

    var pX = self._toPx(win, x, y);
    svg.appendChild(svgEl(ns, "circle", { cx: pX[0].toFixed(2), cy: pX[1].toFixed(2), r: 4.5, class: "point-x" }));
    var pMx = self._toPx(win, -x, ym);
    svg.appendChild(svgEl(ns, "circle", { cx: pMx[0].toFixed(2), cy: pMx[1].toFixed(2), r: 4.5, class: "point-mx" }));
  };

  if (!customElements.get("parite-derivee-widget")) {
    customElements.define("parite-derivee-widget", PariteDeriveeWidgetClass);
  }
})();
