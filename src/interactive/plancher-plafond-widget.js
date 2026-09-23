(function () {
  "use strict";

  /* ================================================================
   * <plancher-plafond-widget> — atelier interactif : curseurs coût fixe F
   * et coût variable v pour Cᵤ(x) = v + F/x, plus un point x déplaçable
   * qui lit Cᵤ(x) en direct — matérialise l'astuce de la section : une
   * asymptote horizontale en contexte est un plancher (ou un plafond),
   * JAMAIS atteint, quel que soit x. Réglages par défaut (F=240, v=8)
   * reproduisent exactement l'exemple résolu du coût unitaire. Web
   * Component (Shadow DOM).
   * ================================================================ */

  var DEFAUT = { f: 240, v: 8, x: 20 };
  var BORNES_F = { min: 50, max: 400, step: 10 };
  var BORNES_V = { min: 2, max: 15, step: 1 };
  var BORNES_X = { min: 5, max: 150, step: 1 };

  var X_MIN = 5, X_MAX = 150, Y_MIN = 0, Y_MAX = 60;
  var LARGEUR = 420, HAUTEUR = 300, MARGE_G = 40, MARGE_D = 20, MARGE_H = 18, MARGE_B = 30;

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
    '.courbe{stroke:var(--accent,#a8471f);stroke-width:2.4;fill:none;}' +
    '.plancher{stroke:var(--good,#2f7a4f);stroke-width:1.8;stroke-dasharray:5 4;}' +
    '.guide{stroke:var(--ink-faint,#c9beae);stroke-width:1.1;stroke-dasharray:3 3;}' +
    '.point-x{fill:var(--accent,#a8471f);}' +
    '.etiquette-plancher{font-size:11.5px;font-weight:700;fill:var(--good,#2f7a4f);font-family:var(--mono,monospace);}' +
    '.etiquette{font-size:12px;fill:var(--ink-soft,#6b6055);font-family:var(--sans,sans-serif);}' +
    '.stats{display:flex;align-items:stretch;justify-content:center;gap:6px;flex-wrap:wrap;margin-bottom:18px;}' +
    '.stat{flex:1 1 110px;min-width:0;border:1px solid var(--line,#e2d8c8);border-radius:var(--radius,3px);padding:8px 4px;text-align:center;background:var(--surface,#fff);}' +
    '.stat-label{display:block;font-family:var(--mono,monospace);font-size:10px;letter-spacing:0.02em;color:var(--ink-faint,#9c9083);margin-bottom:5px;}' +
    '.stat-value{display:block;font-variant-numeric:tabular-nums;font-size:0.94rem;font-weight:600;color:var(--ink,#241f1a);white-space:nowrap;}' +
    '.controles{display:flex;flex-direction:column;gap:12px;}' +
    '.curseur{display:flex;flex-direction:column;gap:6px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3212);}' +
    '.curseur-row{display:flex;align-items:center;gap:12px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;accent-color:var(--accent,#a8471f);}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:64px;text-align:right;font-size:0.92rem;}' +
    '.btn-reset{margin-top:2px;padding:8px 14px;border-radius:var(--radius,3px);border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font-weight:600;cursor:pointer;font-size:0.88rem;font-family:inherit;align-self:center;}' +
    '.btn-reset:hover{background:var(--accent-soft-line,#e8c4a4);}' +
    '</style>' +
    '<p class="formule" id="formule"></p>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" xmlns="http://www.w3.org/2000/svg"></svg></div>' +
    '<div class="stats">' +
    '<div class="stat"><span class="stat-label">Cᵤ(x)</span><span class="stat-value" id="val-cu"></span></div>' +
    '<div class="stat"><span class="stat-label">écart au plancher</span><span class="stat-value" id="val-ecart"></span></div>' +
    '</div>' +
    '<div class="controles">' +
    '<div class="curseur"><label for="f">F — coût fixe (€)</label><div class="curseur-row">' +
    '<input type="range" id="f" min="' + BORNES_F.min + '" max="' + BORNES_F.max + '" step="' + BORNES_F.step + '" value="' + DEFAUT.f + '">' +
    '<span class="curseur-valeur" id="f-valeur"></span></div></div>' +
    '<div class="curseur"><label for="v">v — coût variable/unité (€)</label><div class="curseur-row">' +
    '<input type="range" id="v" min="' + BORNES_V.min + '" max="' + BORNES_V.max + '" step="' + BORNES_V.step + '" value="' + DEFAUT.v + '">' +
    '<span class="curseur-valeur" id="v-valeur"></span></div></div>' +
    '<div class="curseur"><label for="x">x — production</label><div class="curseur-row">' +
    '<input type="range" id="x" min="' + BORNES_X.min + '" max="' + BORNES_X.max + '" step="' + BORNES_X.step + '" value="' + DEFAUT.x + '">' +
    '<span class="curseur-valeur" id="x-valeur"></span></div></div>' +
    '<button class="btn-reset" id="reset" type="button">Réinitialiser</button>' +
    '</div>';

  class PlancherPlafondWidgetClass extends HTMLElement {
    constructor() {
      super();
      this._init();
    }
  }

  PlancherPlafondWidgetClass.prototype._init = function () {
    var shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this._f = DEFAUT.f;
    this._v = DEFAUT.v;
    this._x = DEFAUT.x;
    this._formule = shadow.getElementById("formule");
    this._svg = shadow.getElementById("svg");
    this._valCu = shadow.getElementById("val-cu");
    this._valEcart = shadow.getElementById("val-ecart");
    this._inputF = shadow.getElementById("f");
    this._inputV = shadow.getElementById("v");
    this._inputX = shadow.getElementById("x");
    this._valeurF = shadow.getElementById("f-valeur");
    this._valeurV = shadow.getElementById("v-valeur");
    this._valeurX = shadow.getElementById("x-valeur");
    this._resetBtn = shadow.getElementById("reset");
  };

  PlancherPlafondWidgetClass.prototype.connectedCallback = function () {
    var self = this;
    this._onInputF = function () { self._f = parseFloat(self._inputF.value); self._rendre(); };
    this._onInputV = function () { self._v = parseFloat(self._inputV.value); self._rendre(); };
    this._onInputX = function () { self._x = parseFloat(self._inputX.value); self._rendre(); };
    this._onReset = function () {
      self._f = DEFAUT.f; self._v = DEFAUT.v; self._x = DEFAUT.x;
      self._inputF.value = String(DEFAUT.f);
      self._inputV.value = String(DEFAUT.v);
      self._inputX.value = String(DEFAUT.x);
      self._rendre();
    };
    this._inputF.addEventListener("input", this._onInputF);
    this._inputV.addEventListener("input", this._onInputV);
    this._inputX.addEventListener("input", this._onInputX);
    this._resetBtn.addEventListener("click", this._onReset);
    this._rendre();
  };

  PlancherPlafondWidgetClass.prototype.disconnectedCallback = function () {
    this._inputF.removeEventListener("input", this._onInputF);
    this._inputV.removeEventListener("input", this._onInputV);
    this._inputX.removeEventListener("input", this._onInputX);
    this._resetBtn.removeEventListener("click", this._onReset);
  };

  PlancherPlafondWidgetClass.prototype._toPx = function (xMath, yMath) {
    var zoneL = LARGEUR - MARGE_G - MARGE_D;
    var zoneH = HAUTEUR - MARGE_H - MARGE_B;
    var px = MARGE_G + (xMath - X_MIN) / (X_MAX - X_MIN) * zoneL;
    var py = HAUTEUR - MARGE_B - (yMath - Y_MIN) / (Y_MAX - Y_MIN) * zoneH;
    return [px, py];
  };

  PlancherPlafondWidgetClass.prototype._traceIntervalle = function (svg, ns, f) {
    var self = this;
    var n = 300, segments = [], courant = "", dernierValide = false;
    for (var i = 0; i <= n; i++) {
      var xx = X_MIN + (i / n) * (X_MAX - X_MIN);
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

  PlancherPlafondWidgetClass.prototype._rendre = function () {
    var self = this;
    var f = this._f, v = this._v, x = Math.max(X_MIN, this._x);
    var cu = function (xx) { return v + f / xx; };
    var valeurCu = cu(x);

    this._formule.textContent = "Cᵤ(x) = " + formatNombreFr(v, 0) + " + " + formatNombreFr(f, 0) + "/x";
    this._valeurF.textContent = formatNombreFr(f, 0) + " €";
    this._valeurV.textContent = formatNombreFr(v, 0) + " €";
    this._valeurX.textContent = formatNombreFr(x, 0);
    this._valCu.textContent = formatNombreFr(valeurCu, 2) + " €";
    this._valEcart.textContent = "+" + formatNombreFr(valeurCu - v, 2) + " € (jamais 0)";

    var ns = "http://www.w3.org/2000/svg";
    var svg = this._svg;
    svg.innerHTML = "";

    var defs = svgEl(ns, "defs", {});
    var fleche = svgEl(ns, "marker", { id: "fleche", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" });
    fleche.appendChild(svgEl(ns, "path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche" }));
    defs.appendChild(fleche);
    svg.appendChild(defs);

    var origine = self._toPx(X_MIN, 0);
    svg.appendChild(svgEl(ns, "line", { x1: MARGE_G, x2: LARGEUR - MARGE_D + 8, y1: origine[1].toFixed(2), y2: origine[1].toFixed(2), class: "axe", "marker-end": "url(#fleche)" }));
    svg.appendChild(svgEl(ns, "line", { x1: origine[0].toFixed(2), x2: origine[0].toFixed(2), y1: HAUTEUR - MARGE_B, y2: MARGE_H - 8, class: "axe", "marker-end": "url(#fleche)" }));
    var etiqX = svgEl(ns, "text", { x: LARGEUR - MARGE_D + 10, y: origine[1] + 14, "text-anchor": "end", class: "etiquette" });
    etiqX.textContent = "x (unités)";
    svg.appendChild(etiqX);

    var pPlancher0 = self._toPx(X_MIN, v), pPlancher1 = self._toPx(X_MAX, v);
    svg.appendChild(svgEl(ns, "line", { x1: pPlancher0[0].toFixed(2), y1: pPlancher0[1].toFixed(2), x2: pPlancher1[0].toFixed(2), y2: pPlancher1[1].toFixed(2), class: "plancher" }));
    var etPlancher = svgEl(ns, "text", { x: (MARGE_G + 6).toFixed(2), y: (pPlancher0[1] - 6).toFixed(2), class: "etiquette-plancher" });
    etPlancher.textContent = "plancher y=" + formatNombreFr(v, 0) + " — jamais atteint";
    svg.appendChild(etPlancher);

    this._traceIntervalle(svg, ns, cu);

    var pX = self._toPx(x, Math.max(Y_MIN, Math.min(Y_MAX, valeurCu)));
    var pXAxe = self._toPx(x, 0);
    var pXY = self._toPx(X_MIN, Math.max(Y_MIN, Math.min(Y_MAX, valeurCu)));
    svg.appendChild(svgEl(ns, "line", { x1: pX[0].toFixed(2), y1: pXAxe[1].toFixed(2), x2: pX[0].toFixed(2), y2: pX[1].toFixed(2), class: "guide" }));
    svg.appendChild(svgEl(ns, "line", { x1: pXY[0].toFixed(2), y1: pX[1].toFixed(2), x2: pX[0].toFixed(2), y2: pX[1].toFixed(2), class: "guide" }));
    svg.appendChild(svgEl(ns, "circle", { cx: pX[0].toFixed(2), cy: pX[1].toFixed(2), r: 4.5, class: "point-x" }));
  };

  if (!customElements.get("plancher-plafond-widget")) {
    customElements.define("plancher-plafond-widget", PlancherPlafondWidgetClass);
  }
})();
