(function () {
  "use strict";

  /* ================================================================
   * <extrema-bornes-widget> — atelier interactif : f(t)=t³−6t²+9t+2 FIXE
   * (exactement l'exemple résolu de la section), curseur SEULEMENT sur la
   * borne droite b de l'intervalle [0;b] — matérialise en direct le
   * piège : l'extremum absolu peut basculer d'un extremum LOCAL vers une
   * valeur AUX BORNES. b=5 (défaut) reproduit exactement l'exemple
   * (max absolu=22 en t=5). Le basculement a lieu exactement en b=4
   * (racine double de f(b)=6, valeur du max local) : b<4 → le max local
   * (6) gagne, b>4 → la borne f(b) gagne. Web Component (Shadow DOM).
   * ================================================================ */

  var DEFAUT_B = 5;
  var BORNES_B = { min: 3.5, max: 6, step: 0.05 };

  var X_MIN = -0.3, X_MAX = 6.3, Y_MIN = -2, Y_MAX = 42;
  var LARGEUR = 420, HAUTEUR = 300, MARGE = 34;

  function f(t) { return t * t * t - 6 * t * t + 9 * t + 2; }

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
    '.formule{text-align:center;font-family:var(--serif,serif);font-style:italic;font-size:1.05rem;font-weight:600;color:var(--ink,#241f1a);margin:0 0 12px;}' +
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:12px;}' +
    'svg{width:100%;max-width:420px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.4;}' +
    '.fleche{fill:var(--ink-soft,#6b6055);}' +
    '.hors-domaine{stroke:var(--ink-faint,#9c9083);stroke-width:1.8;fill:none;opacity:0.5;}' +
    '.courbe{stroke:var(--accent,#a8471f);stroke-width:2.4;fill:none;}' +
    '.borne{stroke:var(--ink-soft,#6b6055);stroke-width:1.3;stroke-dasharray:4 3;}' +
    '.point-max-local{fill:var(--good,#2f7a4f);}' +
    '.point-min-local{fill:var(--bad,#b23a3a);}' +
    '.point-borne{fill:var(--accent,#a8471f);}' +
    '.etiquette{font-size:11px;font-weight:700;font-family:var(--sans,sans-serif);}' +
    '.etiquette-max{fill:var(--good,#2f7a4f);}' +
    '.etiquette-min{fill:var(--bad,#b23a3a);}' +
    '.etiquette-borne{fill:var(--accent-ink,#7a3212);}' +
    '.verdict{text-align:center;font-size:0.86rem;font-weight:600;margin:0 0 18px;padding:10px 14px;border-radius:var(--radius,3px);}' +
    '.verdict-local{color:var(--good,#2f7a4f);background:var(--surface-2,#faf6f0);}' +
    '.verdict-borne{color:var(--accent-ink,#7a3212);background:var(--surface-2,#faf6f0);}' +
    '.controles{display:flex;flex-direction:column;gap:12px;}' +
    '.curseur{display:flex;flex-direction:column;gap:6px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3212);}' +
    '.curseur-row{display:flex;align-items:center;gap:12px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;accent-color:var(--accent,#a8471f);}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:56px;text-align:right;font-size:0.92rem;}' +
    '.btn-reset{margin-top:2px;padding:8px 14px;border-radius:var(--radius,3px);border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font-weight:600;cursor:pointer;font-size:0.88rem;font-family:inherit;align-self:center;}' +
    '.btn-reset:hover{background:var(--accent-soft-line,#e8c4a4);}' +
    '</style>' +
    '<p class="formule">f(t) = t³ − 6t² + 9t + 2, sur [0 ; b]</p>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" xmlns="http://www.w3.org/2000/svg"></svg></div>' +
    '<p class="verdict" id="verdict"></p>' +
    '<div class="controles">' +
    '<div class="curseur"><label for="b">b (borne droite)</label><div class="curseur-row">' +
    '<input type="range" id="b" min="' + BORNES_B.min + '" max="' + BORNES_B.max + '" step="' + BORNES_B.step + '" value="' + DEFAUT_B + '">' +
    '<span class="curseur-valeur" id="b-valeur"></span></div></div>' +
    '<button class="btn-reset" id="reset" type="button">Réinitialiser</button>' +
    '</div>';

  class ExtremaBornesWidgetClass extends HTMLElement {
    constructor() {
      super();
      this._init();
    }
  }

  ExtremaBornesWidgetClass.prototype._init = function () {
    var shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this._b = DEFAUT_B;
    this._svg = shadow.getElementById("svg");
    this._verdict = shadow.getElementById("verdict");
    this._inputB = shadow.getElementById("b");
    this._valeurB = shadow.getElementById("b-valeur");
    this._resetBtn = shadow.getElementById("reset");
  };

  ExtremaBornesWidgetClass.prototype.connectedCallback = function () {
    var self = this;
    this._onInputB = function () { self._b = parseFloat(self._inputB.value); self._rendre(); };
    this._onReset = function () { self._b = DEFAUT_B; self._inputB.value = String(DEFAUT_B); self._rendre(); };
    this._inputB.addEventListener("input", this._onInputB);
    this._resetBtn.addEventListener("click", this._onReset);
    this._rendre();
  };

  ExtremaBornesWidgetClass.prototype.disconnectedCallback = function () {
    this._inputB.removeEventListener("input", this._onInputB);
    this._resetBtn.removeEventListener("click", this._onReset);
  };

  ExtremaBornesWidgetClass.prototype._toPx = function (xMath, yMath) {
    var px = MARGE + (xMath - X_MIN) / (X_MAX - X_MIN) * (LARGEUR - 2 * MARGE);
    var py = HAUTEUR - MARGE - (yMath - Y_MIN) / (Y_MAX - Y_MIN) * (HAUTEUR - 2 * MARGE);
    return [px, py];
  };

  ExtremaBornesWidgetClass.prototype._traceIntervalle = function (svg, ns, xMin, xMax, classe) {
    var self = this;
    if (xMax - xMin < 1e-6) return;
    var n = Math.max(4, Math.round(200 * (xMax - xMin) / (X_MAX - X_MIN)));
    var d = "";
    for (var i = 0; i <= n; i++) {
      var xx = xMin + (i / n) * (xMax - xMin);
      var p = self._toPx(xx, f(xx));
      d += (i === 0 ? "M" : "L") + p[0].toFixed(2) + " " + p[1].toFixed(2) + " ";
    }
    svg.appendChild(svgEl(ns, "path", { d: d.trim(), class: classe }));
  };

  ExtremaBornesWidgetClass.prototype._rendre = function () {
    var b = this._b;
    this._valeurB.textContent = formatNombreFr(b, 2);

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

    self._traceIntervalle(svg, ns, b, X_MAX, "hors-domaine");
    self._traceIntervalle(svg, ns, X_MIN < 0 ? 0 : X_MIN, b, "courbe");

    var pBorneHaut = self._toPx(b, Y_MAX), pBorneBas = self._toPx(b, Y_MIN);
    svg.appendChild(svgEl(ns, "line", { x1: pBorneHaut[0].toFixed(2), y1: pBorneHaut[1].toFixed(2), x2: pBorneBas[0].toFixed(2), y2: pBorneBas[1].toFixed(2), class: "borne" }));

    var f0 = f(0), f1 = f(1), f3 = f(3), fb = f(b);

    function point(x, y, classe, etiquetteTexte, classeEtiquette, au_dessus) {
      var p = self._toPx(x, y);
      svg.appendChild(svgEl(ns, "circle", { cx: p[0].toFixed(2), cy: p[1].toFixed(2), r: 5, class: classe }));
      var et = svgEl(ns, "text", { x: p[0].toFixed(2), y: (p[1] + (au_dessus ? -10 : 18)).toFixed(2), "text-anchor": "middle", class: "etiquette " + classeEtiquette });
      et.textContent = etiquetteTexte;
      svg.appendChild(et);
    }

    point(0, f0, "point-borne", "f(0)=" + formatNombreFr(f0, 0), "etiquette-borne", false);
    point(1, f1, "point-max-local", "max local (1;" + formatNombreFr(f1, 0) + ")", "etiquette-max", true);
    if (b >= 3) point(3, f3, "point-min-local", "min local (3;" + formatNombreFr(f3, 0) + ")", "etiquette-min", false);
    point(b, fb, "point-borne", "f(b)=" + formatNombreFr(fb, 2), "etiquette-borne", true);

    var candidats = [{ v: f0, nom: "f(0)=" + formatNombreFr(f0, 2) }, { v: f1, nom: "max local f(1)=" + formatNombreFr(f1, 2) }];
    if (b >= 3) candidats.push({ v: f3, nom: "min local f(3)=" + formatNombreFr(f3, 2) });
    candidats.push({ v: fb, nom: "borne f(b)=" + formatNombreFr(fb, 2) });
    var maxCandidat = candidats.reduce(function (acc, c) { return c.v > acc.v ? c : acc; });

    if (Math.abs(fb - f1) < 0.02) {
      this._verdict.className = "verdict verdict-borne";
      this._verdict.textContent = "b=" + formatNombreFr(b, 2) + " (cas limite) : f(b) ≈ max local (1;" + formatNombreFr(f1, 2) + ") — le basculement a lieu ici.";
    } else if (maxCandidat.nom.indexOf("borne") === 0) {
      this._verdict.className = "verdict verdict-borne";
      this._verdict.textContent = "Maximum ABSOLU = " + maxCandidat.nom + ", atteint À LA BORNE — bien plus grand que le max local (" + formatNombreFr(f1, 2) + ") !";
    } else {
      this._verdict.className = "verdict verdict-local";
      this._verdict.textContent = "Maximum ABSOLU = " + maxCandidat.nom + " — l'extremum LOCAL l'emporte encore sur la valeur à la borne (" + formatNombreFr(fb, 2) + ").";
    }
  };

  if (!customElements.get("extrema-bornes-widget")) {
    customElements.define("extrema-bornes-widget", ExtremaBornesWidgetClass);
  }
})();
