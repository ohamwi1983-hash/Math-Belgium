(function () {
  "use strict";

  /* ================================================================
   * <dispersion-comparee-widget> — atelier interactif : curseur d (demi-
   * écart), série symétrique à deux valeurs x̄−d et x̄+d, même effectif de
   * chaque côté — la moyenne x̄ reste TOUJOURS fixe pendant qu'on fait
   * varier l'étalement, matérialisant directement l'intuition de la
   * section : « deux classes peuvent avoir exactement la même moyenne […]
   * sans se ressembler en rien ». d=8 reproduit exactement l'exemple
   * narratif du texte (moitié à 4, moitié à 20, x̄=12). Web Component
   * (Shadow DOM).
   * ================================================================ */

  var X_BARRE = 12;
  var DEFAUT_D = 3;
  var BORNES_D = { min: 0, max: 8, step: 0.5 };
  var X_MIN = 0, X_MAX = 24;
  var LARGEUR = 420, HAUTEUR = 150, MARGE_G = 30, MARGE_D = 30;
  var Y_LIGNE = 75;

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

  function xPx(xMath) {
    return MARGE_G + (xMath - X_MIN) / (X_MAX - X_MIN) * (LARGEUR - MARGE_G - MARGE_D);
  }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' +
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);}' +
    '*{box-sizing:border-box;}' +
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:14px;}' +
    'svg{width:100%;max-width:420px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}' +
    '.ligne{stroke:var(--ink-soft,#6b6055);stroke-width:1.6;}' +
    '.fleche{fill:var(--ink-soft,#6b6055);}' +
    '.tick{stroke:var(--ink-soft,#6b6055);stroke-width:1.2;}' +
    '.tick-xbarre{stroke:var(--plan,#5b4ea3);stroke-width:2.2;}' +
    '.accolade{stroke:var(--accent,#a8471f);stroke-width:1.6;fill:none;}' +
    '.point-valeur{fill:var(--accent,#a8471f);stroke:var(--surface,#fff);stroke-width:2;}' +
    '.etiquette-tick{font-size:11px;fill:var(--ink-soft,#6b6055);font-family:var(--mono,monospace);}' +
    '.etiquette-xbarre{font-size:12px;font-weight:700;fill:var(--plan,#5b4ea3);font-family:var(--mono,monospace);}' +
    '.etiquette-valeur{font-size:11.5px;font-weight:700;fill:var(--accent-ink,#7a3212);font-family:var(--mono,monospace);}' +
    '.etiquette-ecart{font-size:11.5px;font-weight:600;fill:var(--accent-ink,#7a3212);font-family:var(--sans,sans-serif);}' +
    '.stats{display:flex;align-items:stretch;justify-content:center;gap:6px;flex-wrap:wrap;margin-bottom:18px;}' +
    '.stat{flex:1 1 100px;min-width:0;border:1px solid var(--line,#e2d8c8);border-radius:var(--radius,3px);padding:8px 4px;text-align:center;background:var(--surface,#fff);}' +
    '.stat-label{display:block;font-family:var(--mono,monospace);font-size:10px;letter-spacing:0.02em;color:var(--ink-faint,#9c9083);margin-bottom:5px;}' +
    '.stat-value{display:block;font-variant-numeric:tabular-nums;font-size:0.98rem;font-weight:600;color:var(--ink,#241f1a);white-space:nowrap;}' +
    '.controles{display:flex;flex-direction:column;gap:12px;}' +
    '.curseur{display:flex;flex-direction:column;gap:6px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3212);}' +
    '.curseur-row{display:flex;align-items:center;gap:12px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;accent-color:var(--accent,#a8471f);}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:56px;text-align:right;font-size:0.92rem;}' +
    '.btn-reset{margin-top:2px;padding:8px 14px;border-radius:var(--radius,3px);border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font-weight:600;cursor:pointer;font-size:0.88rem;font-family:inherit;align-self:center;}' +
    '.btn-reset:hover{background:var(--accent-soft-line,#e8c4a4);}' +
    '</style>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" xmlns="http://www.w3.org/2000/svg"></svg></div>' +
    '<div class="stats">' +
    '<div class="stat"><span class="stat-label">x̄ (fixe)</span><span class="stat-value" id="val-xbarre"></span></div>' +
    '<div class="stat"><span class="stat-label">variance</span><span class="stat-value" id="val-variance"></span></div>' +
    '<div class="stat"><span class="stat-label">écart-type</span><span class="stat-value" id="val-ecarttype"></span></div>' +
    '</div>' +
    '<div class="controles">' +
    '<div class="curseur"><label for="d">d — demi-écart à x̄</label><div class="curseur-row">' +
    '<input type="range" id="d" min="' + BORNES_D.min + '" max="' + BORNES_D.max + '" step="' + BORNES_D.step + '" value="' + DEFAUT_D + '">' +
    '<span class="curseur-valeur" id="d-valeur"></span></div></div>' +
    '<button class="btn-reset" id="reset" type="button">Réinitialiser</button>' +
    '</div>';

  class DispersionCompareeWidgetClass extends HTMLElement {
    constructor() {
      super();
      this._init();
    }
  }

  DispersionCompareeWidgetClass.prototype._init = function () {
    var shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this._d = DEFAUT_D;
    this._svg = shadow.getElementById("svg");
    this._valXBarre = shadow.getElementById("val-xbarre");
    this._valVariance = shadow.getElementById("val-variance");
    this._valEcartType = shadow.getElementById("val-ecarttype");
    this._inputD = shadow.getElementById("d");
    this._valeurD = shadow.getElementById("d-valeur");
    this._resetBtn = shadow.getElementById("reset");
  };

  DispersionCompareeWidgetClass.prototype.connectedCallback = function () {
    var self = this;
    this._onInputD = function () { self._d = parseFloat(self._inputD.value); self._rendre(); };
    this._onReset = function () {
      self._d = DEFAUT_D;
      self._inputD.value = String(DEFAUT_D);
      self._rendre();
    };
    this._inputD.addEventListener("input", this._onInputD);
    this._resetBtn.addEventListener("click", this._onReset);
    this._rendre();
  };

  DispersionCompareeWidgetClass.prototype.disconnectedCallback = function () {
    this._inputD.removeEventListener("input", this._onInputD);
    this._resetBtn.removeEventListener("click", this._onReset);
  };

  DispersionCompareeWidgetClass.prototype._rendre = function () {
    var d = this._d;
    var variance = d * d; // série symétrique à effectifs égaux : V = ((d)²·n/2 + (d)²·n/2)/n = d²
    var ecartType = Math.sqrt(variance);

    this._valeurD.textContent = formatNombreFr(d, 1);
    this._valXBarre.textContent = formatNombreFr(X_BARRE, 0);
    this._valVariance.textContent = formatNombreFr(variance, 2);
    this._valEcartType.textContent = formatNombreFr(ecartType, 2);

    var ns = "http://www.w3.org/2000/svg";
    var svg = this._svg;
    svg.innerHTML = "";

    var defs = svgEl(ns, "defs", {});
    var fleche = svgEl(ns, "marker", { id: "fleche", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" });
    fleche.appendChild(svgEl(ns, "path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche" }));
    defs.appendChild(fleche);
    svg.appendChild(defs);

    svg.appendChild(svgEl(ns, "line", { x1: xPx(X_MIN), x2: xPx(X_MAX) + 10, y1: Y_LIGNE, y2: Y_LIGNE, class: "ligne", "marker-end": "url(#fleche)" }));

    for (var t = 0; t <= X_MAX; t += 4) {
      var px = xPx(t);
      svg.appendChild(svgEl(ns, "line", { x1: px.toFixed(2), x2: px.toFixed(2), y1: Y_LIGNE - 6, y2: Y_LIGNE + 6, class: "tick" }));
      var etT = svgEl(ns, "text", { x: px.toFixed(2), y: Y_LIGNE + 22, "text-anchor": "middle", class: "etiquette-tick" });
      etT.textContent = String(t);
      svg.appendChild(etT);
    }

    var pXBarre = xPx(X_BARRE);
    svg.appendChild(svgEl(ns, "line", { x1: pXBarre.toFixed(2), x2: pXBarre.toFixed(2), y1: Y_LIGNE - 30, y2: Y_LIGNE + 6, class: "tick-xbarre" }));
    var etXBarre = svgEl(ns, "text", { x: pXBarre.toFixed(2), y: Y_LIGNE - 36, "text-anchor": "middle", class: "etiquette-xbarre" });
    etXBarre.textContent = "x̄=" + X_BARRE;
    svg.appendChild(etXBarre);

    var xGauche = Math.max(X_MIN, X_BARRE - d), xDroite = Math.min(X_MAX, X_BARRE + d);
    var pG = xPx(xGauche), pD = xPx(xDroite);

    if (d > 0.01) {
      var yAccolade = Y_LIGNE + 34;
      var dAccolade = "M" + pG.toFixed(2) + " " + (Y_LIGNE + 14).toFixed(2) +
        " Q" + pG.toFixed(2) + " " + yAccolade.toFixed(2) + " " + ((pG + pD) / 2).toFixed(2) + " " + yAccolade.toFixed(2) +
        " Q" + pD.toFixed(2) + " " + yAccolade.toFixed(2) + " " + pD.toFixed(2) + " " + (Y_LIGNE + 14).toFixed(2);
      svg.appendChild(svgEl(ns, "path", { d: dAccolade, class: "accolade" }));
      var etEcart = svgEl(ns, "text", { x: ((pG + pD) / 2).toFixed(2), y: (yAccolade + 14).toFixed(2), "text-anchor": "middle", class: "etiquette-ecart" });
      etEcart.textContent = "écart-type = " + formatNombreFr(d, 1);
      svg.appendChild(etEcart);
    }

    [xGauche, xDroite].forEach(function (xv) {
      var pv = xPx(xv);
      svg.appendChild(svgEl(ns, "circle", { cx: pv.toFixed(2), cy: Y_LIGNE, r: 6, class: "point-valeur" }));
      var etV = svgEl(ns, "text", { x: pv.toFixed(2), y: (Y_LIGNE - 12).toFixed(2), "text-anchor": "middle", class: "etiquette-valeur" });
      etV.textContent = formatNombreFr(xv, 1);
      svg.appendChild(etV);
    });
  };

  if (!customElements.get("dispersion-comparee-widget")) {
    customElements.define("dispersion-comparee-widget", DispersionCompareeWidgetClass);
  }
})();
