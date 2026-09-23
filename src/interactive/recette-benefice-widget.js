(function () {
  "use strict";

  /* ================================================================
   * <recette-benefice-widget> — atelier interactif : R(x)=50x−x² et
   * C(x)=x²+10x+20 FIXES (exactement l'exemple résolu de la section),
   * curseur SEULEMENT sur la quantité x — matérialise en direct
   * l'égalité des marginales R'(x)=C'(x) au bénéfice maximal, et le
   * piège « maximiser la recette n'est pas maximiser le bénéfice »
   * (rappelé en texte fixe : à x=25, R est maximale mais B est déjà
   * négatif). x=10 (défaut) reproduit exactement l'exemple (R=400,
   * C=220, B=180, Rm=Cm=30). Web Component (Shadow DOM).
   * ================================================================ */

  var DEFAUT_X = 10;
  var BORNES_X = { min: 0, max: 20, step: 0.1 };
  var TOLERANCE_MARGINALES = 1;

  var X_MIN = -1, X_MAX = 21, Y_MIN = -10, Y_MAX = 650;
  var LARGEUR = 420, HAUTEUR = 300, MARGE_G = 44, MARGE_D = 20, MARGE_H = 18, MARGE_B = 34;

  function R(x) { return 50 * x - x * x; }
  function C(x) { return x * x + 10 * x + 20; }
  function Rp(x) { return 50 - 2 * x; }
  function Cp(x) { return 2 * x + 10; }

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
    '.formule{text-align:center;font-size:0.88rem;color:var(--ink-soft,#6b6055);margin:0 0 12px;}' +
    '.formule strong{color:var(--ink,#241f1a);}' +
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:12px;}' +
    'svg{width:100%;max-width:420px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.4;}' +
    '.fleche{fill:var(--ink-soft,#6b6055);}' +
    '.courbe-r{stroke:var(--good,#2f7a4f);stroke-width:2.2;fill:none;}' +
    '.courbe-c{stroke:var(--bad,#b23a3a);stroke-width:2.2;fill:none;}' +
    '.repere-x{stroke:var(--accent,#a8471f);stroke-width:1.3;stroke-dasharray:4 3;}' +
    '.ecart{stroke:var(--plan,#5b4ea3);stroke-width:2.4;}' +
    '.point{r:4.5;}' +
    '.point-r{fill:var(--good,#2f7a4f);}' +
    '.point-c{fill:var(--bad,#b23a3a);}' +
    '.etiquette{font-size:11px;font-weight:700;font-family:var(--sans,sans-serif);}' +
    '.etiquette-r{fill:var(--good,#2f7a4f);}' +
    '.etiquette-c{fill:var(--bad,#b23a3a);}' +
    '.lecture{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-bottom:12px;font-size:0.82rem;font-variant-numeric:tabular-nums;}' +
    '.chip{padding:5px 9px;border-radius:var(--radius,3px);background:var(--surface-2,#faf6f0);font-weight:600;}' +
    '.chip-r{color:var(--good,#2f7a4f);}' +
    '.chip-c{color:var(--bad,#b23a3a);}' +
    '.chip-b{color:var(--accent-ink,#7a3212);}' +
    '.verdict{text-align:center;font-size:0.86rem;font-weight:600;margin:0 0 8px;padding:10px 14px;border-radius:var(--radius,3px);}' +
    '.verdict-ok{color:var(--good,#2f7a4f);background:var(--surface-2,#faf6f0);}' +
    '.verdict-non{color:var(--accent-ink,#7a3212);background:var(--surface-2,#faf6f0);}' +
    '.rappel-piege{text-align:center;font-size:0.78rem;color:var(--ink-soft,#6b6055);margin:0 0 18px;font-style:italic;}' +
    '.controles{display:flex;flex-direction:column;gap:12px;}' +
    '.curseur{display:flex;flex-direction:column;gap:6px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3212);}' +
    '.curseur-row{display:flex;align-items:center;gap:12px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;accent-color:var(--accent,#a8471f);}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:56px;text-align:right;font-size:0.92rem;}' +
    '.btn-reset{margin-top:2px;padding:8px 14px;border-radius:var(--radius,3px);border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font-weight:600;cursor:pointer;font-size:0.88rem;font-family:inherit;align-self:center;}' +
    '.btn-reset:hover{background:var(--accent-soft-line,#e8c4a4);}' +
    '</style>' +
    '<p class="formule"><strong>R</strong>(x)=50x−x² (vert) &nbsp;·&nbsp; <strong>C</strong>(x)=x²+10x+20 (rouge)</p>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" xmlns="http://www.w3.org/2000/svg"></svg></div>' +
    '<div class="lecture" id="lecture"></div>' +
    '<p class="verdict" id="verdict"></p>' +
    '<p class="rappel-piege">À x=25 (hors curseur), R est maximale (R\'=0) mais B(25) = 625−895 = −270 € : bien pire qu\'à x=10 !</p>' +
    '<div class="controles">' +
    '<div class="curseur"><label for="x">x — quantité produite</label><div class="curseur-row">' +
    '<input type="range" id="x" min="' + BORNES_X.min + '" max="' + BORNES_X.max + '" step="' + BORNES_X.step + '" value="' + DEFAUT_X + '">' +
    '<span class="curseur-valeur" id="x-valeur"></span></div></div>' +
    '<button class="btn-reset" id="reset" type="button">Réinitialiser</button>' +
    '</div>';

  class RecetteBeneficeWidgetClass extends HTMLElement {
    constructor() {
      super();
      this._init();
    }
  }

  RecetteBeneficeWidgetClass.prototype._init = function () {
    var shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this._x = DEFAUT_X;
    this._svg = shadow.getElementById("svg");
    this._lecture = shadow.getElementById("lecture");
    this._verdict = shadow.getElementById("verdict");
    this._inputX = shadow.getElementById("x");
    this._valeurX = shadow.getElementById("x-valeur");
    this._resetBtn = shadow.getElementById("reset");
  };

  RecetteBeneficeWidgetClass.prototype.connectedCallback = function () {
    var self = this;
    this._onInputX = function () { self._x = parseFloat(self._inputX.value); self._rendre(); };
    this._onReset = function () { self._x = DEFAUT_X; self._inputX.value = String(DEFAUT_X); self._rendre(); };
    this._inputX.addEventListener("input", this._onInputX);
    this._resetBtn.addEventListener("click", this._onReset);
    this._rendre();
  };

  RecetteBeneficeWidgetClass.prototype.disconnectedCallback = function () {
    this._inputX.removeEventListener("input", this._onInputX);
    this._resetBtn.removeEventListener("click", this._onReset);
  };

  RecetteBeneficeWidgetClass.prototype._toPx = function (xMath, yMath) {
    var px = MARGE_G + (xMath - X_MIN) / (X_MAX - X_MIN) * (LARGEUR - MARGE_G - MARGE_D);
    var py = HAUTEUR - MARGE_B - (yMath - Y_MIN) / (Y_MAX - Y_MIN) * (HAUTEUR - MARGE_H - MARGE_B);
    return [px, py];
  };

  RecetteBeneficeWidgetClass.prototype._traceCourbe = function (svg, ns, f, classe) {
    var self = this;
    var n = 160;
    var d = "";
    for (var i = 0; i <= n; i++) {
      var xx = 0 + (i / n) * 20;
      var p = self._toPx(xx, f(xx));
      d += (i === 0 ? "M" : "L") + p[0].toFixed(2) + " " + p[1].toFixed(2) + " ";
    }
    svg.appendChild(svgEl(ns, "path", { d: d.trim(), class: classe }));
  };

  RecetteBeneficeWidgetClass.prototype._rendre = function () {
    var x = this._x;
    this._valeurX.textContent = formatNombreFr(x, 1);

    var rx = R(x), cx = C(x), bx = rx - cx, rpx = Rp(x), cpx = Cp(x);

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
    svg.appendChild(svgEl(ns, "line", { x1: MARGE_G, x2: LARGEUR - MARGE_D, y1: origine[1].toFixed(2), y2: origine[1].toFixed(2), class: "axe", "marker-end": "url(#fleche)" }));
    svg.appendChild(svgEl(ns, "line", { x1: origine[0].toFixed(2), x2: origine[0].toFixed(2), y1: HAUTEUR - MARGE_B, y2: MARGE_H, class: "axe", "marker-end": "url(#fleche)" }));

    self._traceCourbe(svg, ns, R, "courbe-r");
    self._traceCourbe(svg, ns, C, "courbe-c");

    var pxHaut = self._toPx(x, Y_MAX), pxBas = self._toPx(x, Y_MIN);
    svg.appendChild(svgEl(ns, "line", { x1: pxHaut[0].toFixed(2), y1: pxHaut[1].toFixed(2), x2: pxBas[0].toFixed(2), y2: pxBas[1].toFixed(2), class: "repere-x" }));

    var pR = self._toPx(x, rx), pC = self._toPx(x, cx);
    svg.appendChild(svgEl(ns, "line", { x1: pR[0].toFixed(2), y1: pR[1].toFixed(2), x2: pC[0].toFixed(2), y2: pC[1].toFixed(2), class: "ecart" }));
    svg.appendChild(svgEl(ns, "circle", { cx: pR[0].toFixed(2), cy: pR[1].toFixed(2), r: 4.5, class: "point-r" }));
    svg.appendChild(svgEl(ns, "circle", { cx: pC[0].toFixed(2), cy: pC[1].toFixed(2), r: 4.5, class: "point-c" }));
    var etR = svgEl(ns, "text", { x: pR[0].toFixed(2), y: (pR[1] - 10).toFixed(2), "text-anchor": "middle", class: "etiquette etiquette-r" });
    etR.textContent = "R=" + formatNombreFr(rx, 0) + "€";
    svg.appendChild(etR);
    var etC = svgEl(ns, "text", { x: pC[0].toFixed(2), y: (pC[1] + 18).toFixed(2), "text-anchor": "middle", class: "etiquette etiquette-c" });
    etC.textContent = "C=" + formatNombreFr(cx, 0) + "€";
    svg.appendChild(etC);

    this._lecture.innerHTML =
      '<span class="chip chip-r">R(' + formatNombreFr(x, 1) + ')=' + formatNombreFr(rx, 1) + '€</span>' +
      '<span class="chip chip-c">C(' + formatNombreFr(x, 1) + ')=' + formatNombreFr(cx, 1) + '€</span>' +
      '<span class="chip chip-b">B(' + formatNombreFr(x, 1) + ')=' + formatNombreFr(bx, 1) + '€</span>' +
      '<span class="chip">R\'=' + formatNombreFr(rpx, 1) + '</span>' +
      '<span class="chip">C\'=' + formatNombreFr(cpx, 1) + '</span>';

    if (Math.abs(rpx - cpx) < TOLERANCE_MARGINALES) {
      this._verdict.className = "verdict verdict-ok";
      this._verdict.textContent = "Rm ≈ Cm (" + formatNombreFr(rpx, 1) + " ≈ " + formatNombreFr(cpx, 1) + ") → bénéfice MAXIMAL, B=" + formatNombreFr(bx, 1) + "€.";
    } else if (rpx > cpx) {
      this._verdict.className = "verdict verdict-non";
      this._verdict.textContent = "Rm > Cm (" + formatNombreFr(rpx, 1) + " > " + formatNombreFr(cpx, 1) + ") → produire UNE unité de plus reste rentable, le bénéfice peut encore augmenter.";
    } else {
      this._verdict.className = "verdict verdict-non";
      this._verdict.textContent = "Rm < Cm (" + formatNombreFr(rpx, 1) + " < " + formatNombreFr(cpx, 1) + ") → produire une unité de plus coûte plus qu'elle ne rapporte, le bénéfice diminue déjà.";
    }
  };

  if (!customElements.get("recette-benefice-widget")) {
    customElements.define("recette-benefice-widget", RecetteBeneficeWidgetClass);
  }
})();
