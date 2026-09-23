(function () {
  "use strict";

  /* ================================================================
   * <inverse-monotonie-widget> — atelier interactif : deux points x1, x2
   * déplaçables librement sur y=1/x (n'importe où sur les deux branches),
   * pour découvrir soi-même le piège de la section : 1/x est décroissante
   * sur CHAQUE branche séparément, mais pas globalement — dès que les deux
   * points sont sur des branches différentes, x1<x2 n'implique plus
   * f(x1)>f(x2). Réglages par défaut (x1=−1, x2=1) reproduisent exactement
   * le contre-exemple du texte. Web Component (Shadow DOM).
   * ================================================================ */

  var DEFAUT = { x1: -1, x2: 1 };
  var BORNES_X = { min: -4, max: 4, step: 0.1, zoneMorte: 0.2 };
  var X_MIN = -4, X_MAX = 4, Y_MIN = -6, Y_MAX = 6;
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
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:12px;}' +
    'svg{width:100%;max-width:420px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.4;}' +
    '.fleche{fill:var(--ink-soft,#6b6055);}' +
    '.asymptote{stroke:var(--ink-faint,#9c9083);stroke-width:1.2;stroke-dasharray:4 3;}' +
    '.courbe{stroke:var(--accent,#a8471f);stroke-width:2.4;fill:none;}' +
    '.guide-x1{stroke:var(--good,#2f7a4f);stroke-width:1.2;stroke-dasharray:3 3;}' +
    '.guide-x2{stroke:var(--plan,#5b4ea3);stroke-width:1.2;stroke-dasharray:3 3;}' +
    '.point-x1{fill:var(--good,#2f7a4f);}' +
    '.point-x2{fill:var(--plan,#5b4ea3);}' +
    '.etiquette-point{font-size:11.5px;font-weight:700;font-family:var(--mono,monospace);}' +
    '.etiquette-x1{fill:var(--good,#2f7a4f);}' +
    '.etiquette-x2{fill:var(--plan,#5b4ea3);}' +
    '.etiquette{font-size:12px;fill:var(--ink-soft,#6b6055);font-family:var(--sans,sans-serif);}' +
    '.verdict{text-align:center;font-size:0.9rem;font-weight:600;margin:0 0 18px;padding:10px 14px;border-radius:var(--radius,3px);}' +
    '.verdict-ok{color:var(--good,#2f7a4f);background:var(--surface-2,#faf6f0);}' +
    '.verdict-piege{color:var(--bad,#b23a3a);background:var(--surface-2,#faf6f0);}' +
    '.controles{display:flex;flex-direction:column;gap:12px;}' +
    '.curseur{display:flex;flex-direction:column;gap:6px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;}' +
    '.curseur.x1 label{color:var(--good,#2f7a4f);}' +
    '.curseur.x2 label{color:var(--plan,#5b4ea3);}' +
    '.curseur-row{display:flex;align-items:center;gap:12px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;}' +
    '.curseur.x1 input[type="range"]{accent-color:var(--good,#2f7a4f);}' +
    '.curseur.x2 input[type="range"]{accent-color:var(--plan,#5b4ea3);}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:56px;text-align:right;font-size:0.92rem;}' +
    '.btn-reset{margin-top:2px;padding:8px 14px;border-radius:var(--radius,3px);border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font-weight:600;cursor:pointer;font-size:0.88rem;font-family:inherit;align-self:center;}' +
    '.btn-reset:hover{background:var(--accent-soft-line,#e8c4a4);}' +
    '</style>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" xmlns="http://www.w3.org/2000/svg"></svg></div>' +
    '<p class="verdict" id="verdict"></p>' +
    '<div class="controles">' +
    '<div class="curseur x1"><label for="x1">x₁</label><div class="curseur-row">' +
    '<input type="range" id="x1" min="' + BORNES_X.min + '" max="' + BORNES_X.max + '" step="' + BORNES_X.step + '" value="' + DEFAUT.x1 + '">' +
    '<span class="curseur-valeur" id="x1-valeur"></span></div></div>' +
    '<div class="curseur x2"><label for="x2">x₂</label><div class="curseur-row">' +
    '<input type="range" id="x2" min="' + BORNES_X.min + '" max="' + BORNES_X.max + '" step="' + BORNES_X.step + '" value="' + DEFAUT.x2 + '">' +
    '<span class="curseur-valeur" id="x2-valeur"></span></div></div>' +
    '<button class="btn-reset" id="reset" type="button">Réinitialiser</button>' +
    '</div>';

  class InverseMonotonieWidgetClass extends HTMLElement {
    constructor() {
      super();
      this._init();
    }
  }

  InverseMonotonieWidgetClass.prototype._init = function () {
    var shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this._x1 = DEFAUT.x1;
    this._x2 = DEFAUT.x2;
    this._svg = shadow.getElementById("svg");
    this._verdict = shadow.getElementById("verdict");
    this._inputX1 = shadow.getElementById("x1");
    this._inputX2 = shadow.getElementById("x2");
    this._valeurX1 = shadow.getElementById("x1-valeur");
    this._valeurX2 = shadow.getElementById("x2-valeur");
    this._resetBtn = shadow.getElementById("reset");
  };

  // x ne peut jamais tomber dans ]−zoneMorte ; zoneMorte[ (0 est hors domaine) — curseur repoussé
  // au pas le plus proche, dans le sens du déplacement, même technique que pour a=1 ailleurs.
  function repousserZero(v, ancien) {
    if (Math.abs(v) < BORNES_X.zoneMorte) {
      return v >= ancien ? BORNES_X.zoneMorte : -BORNES_X.zoneMorte;
    }
    return v;
  }

  InverseMonotonieWidgetClass.prototype.connectedCallback = function () {
    var self = this;
    this._onInputX1 = function () {
      var v = repousserZero(parseFloat(self._inputX1.value), self._x1);
      self._inputX1.value = String(v);
      self._x1 = v;
      self._rendre();
    };
    this._onInputX2 = function () {
      var v = repousserZero(parseFloat(self._inputX2.value), self._x2);
      self._inputX2.value = String(v);
      self._x2 = v;
      self._rendre();
    };
    this._onReset = function () {
      self._x1 = DEFAUT.x1; self._x2 = DEFAUT.x2;
      self._inputX1.value = String(DEFAUT.x1);
      self._inputX2.value = String(DEFAUT.x2);
      self._rendre();
    };
    this._inputX1.addEventListener("input", this._onInputX1);
    this._inputX2.addEventListener("input", this._onInputX2);
    this._resetBtn.addEventListener("click", this._onReset);
    this._rendre();
  };

  InverseMonotonieWidgetClass.prototype.disconnectedCallback = function () {
    this._inputX1.removeEventListener("input", this._onInputX1);
    this._inputX2.removeEventListener("input", this._onInputX2);
    this._resetBtn.removeEventListener("click", this._onReset);
  };

  InverseMonotonieWidgetClass.prototype._toPx = function (xMath, yMath) {
    var px = MARGE + (xMath - X_MIN) / (X_MAX - X_MIN) * (LARGEUR - 2 * MARGE);
    var py = HAUTEUR - MARGE - (yMath - Y_MIN) / (Y_MAX - Y_MIN) * (HAUTEUR - 2 * MARGE);
    return [px, py];
  };

  InverseMonotonieWidgetClass.prototype._traceIntervalle = function (svg, ns, xMin, xMax) {
    var self = this;
    var n = 200, segments = [], courant = "", dernierValide = false;
    for (var i = 0; i <= n; i++) {
      var xx = xMin + (i / n) * (xMax - xMin);
      var yy = 1 / xx;
      var valide = isFinite(yy) && yy >= Y_MIN - 0.3 && yy <= Y_MAX + 0.3;
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

  InverseMonotonieWidgetClass.prototype._rendre = function () {
    var x1 = this._x1, x2 = this._x2;
    var y1 = 1 / x1, y2 = 1 / x2;
    this._valeurX1.textContent = formatNombreFr(x1, 1);
    this._valeurX2.textContent = formatNombreFr(x2, 1);

    var xa = Math.min(x1, x2), xb = Math.max(x1, x2);
    var ya = xa === x1 ? y1 : y2, yb = xa === x1 ? y2 : y1;
    var memeBranche = (xa < 0) === (xb < 0);

    if (memeBranche) {
      this._verdict.className = "verdict verdict-ok";
      this._verdict.textContent =
        "Même branche : " + formatNombreFr(xa, 1) + " < " + formatNombreFr(xb, 1) + " et f(" + formatNombreFr(xa, 1) + ") = " +
        formatNombreFr(ya, 2) + " > f(" + formatNombreFr(xb, 1) + ") = " + formatNombreFr(yb, 2) + " — décroissante, comme attendu sur une branche.";
    } else {
      this._verdict.className = "verdict verdict-piege";
      this._verdict.textContent =
        "Branches différentes ! " + formatNombreFr(xa, 1) + " < " + formatNombreFr(xb, 1) + " mais f(" + formatNombreFr(xa, 1) + ") = " +
        formatNombreFr(ya, 2) + " < f(" + formatNombreFr(xb, 1) + ") = " + formatNombreFr(yb, 2) + " — la monotonie ne se prolonge PAS à travers x=0 !";
    }

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

    var pAsymV0 = self._toPx(0, Y_MIN), pAsymV1 = self._toPx(0, Y_MAX);
    svg.appendChild(svgEl(ns, "line", { x1: pAsymV0[0].toFixed(2), y1: pAsymV0[1].toFixed(2), x2: pAsymV1[0].toFixed(2), y2: pAsymV1[1].toFixed(2), class: "asymptote" }));

    this._traceIntervalle(svg, ns, X_MIN, -0.05);
    this._traceIntervalle(svg, ns, 0.05, X_MAX);

    function dessinerPoint(x, y, classePoint, classeGuide, classeEtiquette, label) {
      var p = self._toPx(x, Math.max(Y_MIN, Math.min(Y_MAX, y)));
      var pAxe = self._toPx(x, 0);
      var pY = self._toPx(0, Math.max(Y_MIN, Math.min(Y_MAX, y)));
      svg.appendChild(svgEl(ns, "line", { x1: p[0].toFixed(2), y1: pAxe[1].toFixed(2), x2: p[0].toFixed(2), y2: p[1].toFixed(2), class: classeGuide }));
      svg.appendChild(svgEl(ns, "line", { x1: pY[0].toFixed(2), y1: p[1].toFixed(2), x2: p[0].toFixed(2), y2: p[1].toFixed(2), class: classeGuide }));
      svg.appendChild(svgEl(ns, "circle", { cx: p[0].toFixed(2), cy: p[1].toFixed(2), r: 5.5, class: classePoint }));
      var proche = p[0] > LARGEUR - 70;
      var et = svgEl(ns, "text", { x: (p[0] + (proche ? -9 : 9)).toFixed(2), y: (p[1] - 9).toFixed(2), "text-anchor": proche ? "end" : "start", class: "etiquette-point " + classeEtiquette });
      et.textContent = label;
      svg.appendChild(et);
    }
    dessinerPoint(x1, y1, "point-x1", "guide-x1", "etiquette-x1", "x₁=" + formatNombreFr(x1, 1));
    dessinerPoint(x2, y2, "point-x2", "guide-x2", "etiquette-x2", "x₂=" + formatNombreFr(x2, 1));
  };

  if (!customElements.get("inverse-monotonie-widget")) {
    customElements.define("inverse-monotonie-widget", InverseMonotonieWidgetClass);
  }
})();
