(function () {
  "use strict";

  /* ================================================================
   * <famille-primitives-widget> — atelier interactif : curseur C pour
   * F(x)=x²+C (primitive de f(x)=2x), reprend l'intuition de la section
   * au mot près : « fais-la glisser verticalement [...] toutes ces
   * courbes parallèles ont donc exactement la même dérivée ». Un petit
   * segment tangent en x=1 (pente 2, toujours) matérialise que C ne
   * change JAMAIS la pente. Fenêtre fixe reprenant exactement celle de
   * l'illustration statique déjà présente (C=−2, C=0, C=2). Web Component
   * (Shadow DOM).
   * ================================================================ */

  var DEFAUT_C = 0;
  var BORNES_C = { min: -3, max: 3, step: 0.5 };
  var X_TANGENTE = 1;

  var X_MIN = -2.4, X_MAX = 2.4, Y_MIN = -3.5, Y_MAX = 8.3;
  var LARGEUR = 420, HAUTEUR = 300, MARGE = 34;

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
    '.formule{text-align:center;font-family:var(--serif,serif);font-style:italic;font-size:1.1rem;font-weight:600;color:var(--ink,#241f1a);margin:0 0 12px;}' +
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:12px;}' +
    'svg{width:100%;max-width:420px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.4;}' +
    '.fleche{fill:var(--ink-soft,#6b6055);}' +
    '.courbe{stroke:var(--accent,#a8471f);stroke-width:2.6;fill:none;}' +
    '.tangente{stroke:var(--plan,#5b4ea3);stroke-width:2.2;}' +
    '.point-tangente{fill:var(--plan,#5b4ea3);}' +
    '.etiquette-tangente{font-size:11px;font-weight:600;fill:var(--plan,#5b4ea3);font-family:var(--sans,sans-serif);}' +
    '.etiquette{font-size:12px;fill:var(--ink-soft,#6b6055);font-family:var(--sans,sans-serif);}' +
    '.note{text-align:center;font-size:0.88rem;color:var(--ink-soft,#6b6055);margin:0 0 18px;padding:10px 14px;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}' +
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
    '<p class="note" id="note"></p>' +
    '<div class="controles">' +
    '<div class="curseur"><label for="c">C</label><div class="curseur-row">' +
    '<input type="range" id="c" min="' + BORNES_C.min + '" max="' + BORNES_C.max + '" step="' + BORNES_C.step + '" value="' + DEFAUT_C + '">' +
    '<span class="curseur-valeur" id="c-valeur"></span></div></div>' +
    '<button class="btn-reset" id="reset" type="button">Réinitialiser</button>' +
    '</div>';

  class FamillePrimitivesWidgetClass extends HTMLElement {
    constructor() {
      super();
      this._init();
    }
  }

  FamillePrimitivesWidgetClass.prototype._init = function () {
    var shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this._c = DEFAUT_C;
    this._formule = shadow.getElementById("formule");
    this._svg = shadow.getElementById("svg");
    this._note = shadow.getElementById("note");
    this._inputC = shadow.getElementById("c");
    this._valeurC = shadow.getElementById("c-valeur");
    this._resetBtn = shadow.getElementById("reset");
  };

  FamillePrimitivesWidgetClass.prototype.connectedCallback = function () {
    var self = this;
    this._onInputC = function () { self._c = parseFloat(self._inputC.value); self._rendre(); };
    this._onReset = function () {
      self._c = DEFAUT_C;
      self._inputC.value = String(DEFAUT_C);
      self._rendre();
    };
    this._inputC.addEventListener("input", this._onInputC);
    this._resetBtn.addEventListener("click", this._onReset);
    this._rendre();
  };

  FamillePrimitivesWidgetClass.prototype.disconnectedCallback = function () {
    this._inputC.removeEventListener("input", this._onInputC);
    this._resetBtn.removeEventListener("click", this._onReset);
  };

  FamillePrimitivesWidgetClass.prototype._toPx = function (xMath, yMath) {
    var px = MARGE + (xMath - X_MIN) / (X_MAX - X_MIN) * (LARGEUR - 2 * MARGE);
    var py = HAUTEUR - MARGE - (yMath - Y_MIN) / (Y_MAX - Y_MIN) * (HAUTEUR - 2 * MARGE);
    return [px, py];
  };

  FamillePrimitivesWidgetClass.prototype._rendre = function () {
    var self = this;
    var c = this._c;
    var F = function (x) { return x * x + c; };

    this._formule.textContent = "F(x) = x² " + (c >= 0 ? "+ " : "− ") + formatNombreFr(Math.abs(c), 1) + "   (primitive de f(x)=2x)";
    this._valeurC.textContent = formatNombreFr(c, 1);

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

    var n = 200, courant = "";
    for (var i = 0; i <= n; i++) {
      var xx = X_MIN + (i / n) * (X_MAX - X_MIN);
      var yy = F(xx);
      var p = self._toPx(xx, Math.max(Y_MIN, Math.min(Y_MAX, yy)));
      courant += (i === 0 ? "M" : "L") + p[0].toFixed(2) + " " + p[1].toFixed(2) + " ";
    }
    svg.appendChild(svgEl(ns, "path", { d: courant.trim(), class: "courbe" }));

    // Pente 2 en x=1, TOUJOURS — le petit segment tangent ne bouge jamais horizontalement,
    // seulement verticalement avec C, exactement l'intuition du texte.
    var yTangente = F(X_TANGENTE);
    var pente = 2 * X_TANGENTE;
    var demiLargeur = 0.6;
    var pT0 = self._toPx(X_TANGENTE - demiLargeur, yTangente - pente * demiLargeur);
    var pT1 = self._toPx(X_TANGENTE + demiLargeur, yTangente + pente * demiLargeur);
    svg.appendChild(svgEl(ns, "line", { x1: pT0[0].toFixed(2), y1: pT0[1].toFixed(2), x2: pT1[0].toFixed(2), y2: pT1[1].toFixed(2), class: "tangente" }));
    var pTPoint = self._toPx(X_TANGENTE, yTangente);
    svg.appendChild(svgEl(ns, "circle", { cx: pTPoint[0].toFixed(2), cy: pTPoint[1].toFixed(2), r: 4.5, class: "point-tangente" }));
    var etTangente = svgEl(ns, "text", { x: (pTPoint[0] + 8).toFixed(2), y: (pTPoint[1] - 8).toFixed(2), class: "etiquette-tangente" });
    etTangente.textContent = "pente = 2, toujours";
    svg.appendChild(etTangente);

    this._note.textContent = "F'(x) = 2x, quel que soit C — le glissement vertical ne change jamais la pente en aucun point.";
  };

  if (!customElements.get("famille-primitives-widget")) {
    customElements.define("famille-primitives-widget", FamillePrimitivesWidgetClass);
  }
})();
