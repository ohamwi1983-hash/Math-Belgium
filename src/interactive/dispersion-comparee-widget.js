(function () {
  "use strict";

  /* ================================================================
   * <dispersion-comparee-widget> — atelier interactif (4e, statistique,
   * section « Étendue, variance et écart-type ») : 10 valeurs sur un
   * nuage de points, chacune déplaçable au doigt, à la souris ou au
   * clavier. x̄, la variance (division par n), l'écart-type (racine de
   * la variance arrondie à 2 décimales — convention du chapitre) et la
   * bande [x̄ − σ ; x̄ + σ] sont recalculés en direct. Deux réglages :
   * « série resserrée » (départ, x̄ = 12, σ ≈ 1,1) et « exemple du
   * texte » (moitié à 4, moitié à 20 : x̄ = 12, σ = 8) — même moyenne,
   * dispersions sans rapport. Fenêtre FIXE (0 → 24), jamais recalculée
   * depuis les points. Web Component (Shadow DOM).
   * ================================================================ */

  var RESSERREE = [10, 11, 11, 12, 12, 12, 12, 13, 13, 14];
  var EXEMPLE_TEXTE = [4, 4, 4, 4, 4, 20, 20, 20, 20, 20];
  var X_MIN = 0, X_MAX = 24, PAS = 1;
  var LARGEUR = 420, HAUTEUR = 214, MARGE_G = 24, MARGE_D = 30;
  var Y_AXE = 150, Y_HAUT = 26, R_POINT = 6, R_CIBLE = 19;
  var NS = "http://www.w3.org/2000/svg";

  function formatNombreFr(n, decimales) {
    var facteur = Math.pow(10, decimales);
    var arrondi = Math.round(n * facteur) / facteur;
    var texte = arrondi.toFixed(decimales);
    if (decimales > 0) texte = texte.replace(/0+$/, "").replace(/\.$/, "");
    return texte.replace(".", ",").replace("-", "−");
  }

  function svgEl(tag, attrs) {
    var el = document.createElementNS(NS, tag);
    for (var cle in attrs) el.setAttribute(cle, attrs[cle]);
    return el;
  }

  function xPx(x) {
    return MARGE_G + (x - X_MIN) / (X_MAX - X_MIN) * (LARGEUR - MARGE_G - MARGE_D);
  }

  function xDepuisPx(px) {
    return X_MIN + (px - MARGE_G) / (LARGEUR - MARGE_G - MARGE_D) * (X_MAX - X_MIN);
  }

  /** Convention du chapitre : variance = Σ(xᵢ − x̄)² / n, arrondie à 2 décimales ; écart-type = racine
   * de cette variance DÉJÀ arrondie. */
  function parametres(valeurs) {
    var n = valeurs.length, s = 0, i;
    for (i = 0; i < n; i++) s += valeurs[i];
    var xb = s / n, sc = 0;
    for (i = 0; i < n; i++) sc += (valeurs[i] - xb) * (valeurs[i] - xb);
    var variance = Math.round(sc / n * 100) / 100;
    return { n: n, moyenne: xb, variance: variance, ecartType: Math.sqrt(variance) };
  }

  function hauteursEmpilees(valeurs) {
    var vus = {};
    return valeurs.map(function (v) {
      var cle = String(v);
      vus[cle] = (vus[cle] || 0) + 1;
      return vus[cle] - 1;
    });
  }

  function ancrage(px, largeurTexte) {
    var demi = largeurTexte / 2;
    if (px - demi < 4) return { anchor: "start", x: 4 };
    if (px + demi > LARGEUR - 4) return { anchor: "end", x: LARGEUR - 4 };
    return { anchor: "middle", x: px };
  }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' +
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);}' +
    '*{box-sizing:border-box;}' +
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:8px;}' +
    'svg{width:100%;max-width:440px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);user-select:none;-webkit-user-select:none;}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.6;}' +
    '.fleche{fill:var(--ink-soft,#6b6055);}' +
    '.tick{stroke:var(--ink-soft,#6b6055);stroke-width:1.2;}' +
    '.etiquette-tick{font-size:11px;fill:var(--ink-soft,#6b6055);font-family:var(--mono,monospace);}' +
    '.bande{fill:var(--accent-soft,#f6e2d3);stroke:var(--accent,#a8471f);stroke-width:1.2;stroke-dasharray:4 3;}' +
    '.repere-moyenne{stroke:var(--plan,#5b4ea3);stroke-width:2.4;}' +
    '.etiquette-moyenne{font-size:12px;font-weight:700;fill:var(--plan,#5b4ea3);font-family:var(--mono,monospace);}' +
    '.accolade{stroke:var(--accent,#a8471f);stroke-width:1.6;fill:none;}' +
    '.etiquette-ecart{font-size:11.5px;font-weight:600;fill:var(--accent-ink,#7a3212);font-family:var(--sans,sans-serif);}' +
    '.point{fill:var(--accent,#a8471f);stroke:var(--surface,#fff);stroke-width:2;pointer-events:none;}' +
    '.cible{fill:transparent;stroke:none;cursor:grab;touch-action:none;outline:none;}' +
    '.cible:focus-visible{stroke:var(--accent,#a8471f);stroke-width:2;stroke-dasharray:3 2;}' +
    '.cible-active{cursor:grabbing;}' +
    '.etiquette-point{font-size:11.5px;font-weight:700;fill:var(--ink,#241f1a);font-family:var(--mono,monospace);pointer-events:none;}' +
    '.legende{font-size:0.86rem;color:var(--ink-soft,#6b6055);text-align:center;margin:0 0 10px;}' +
    '.stats{display:flex;align-items:stretch;justify-content:center;gap:6px;flex-wrap:wrap;margin-top:10px;}' +
    '.stat{flex:1 1 80px;min-width:0;border:1px solid var(--line,#e2d8c8);border-radius:var(--radius,3px);padding:7px 3px;text-align:center;background:var(--surface,#fff);}' +
    '.stat-label{display:block;font-family:var(--mono,monospace);font-size:10px;letter-spacing:0.02em;color:var(--ink-faint,#9c9083);margin-bottom:4px;}' +
    '.stat-value{display:block;font-variant-numeric:tabular-nums;font-size:0.98rem;font-weight:600;color:var(--ink,#241f1a);white-space:nowrap;}' +
    '.stat-moyenne .stat-value{color:var(--plan,#5b4ea3);}' +
    '.message{margin:12px 0 0;font-size:0.92rem;line-height:1.45;color:var(--ink,#241f1a);text-align:center;}' +
    '.boutons{display:flex;justify-content:center;gap:8px;flex-wrap:wrap;margin-top:12px;}' +
    '.btn{padding:8px 14px;border-radius:var(--radius,3px);border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font-weight:600;cursor:pointer;font-size:0.88rem;font-family:inherit;min-height:36px;}' +
    '.btn:hover{background:var(--accent-soft-line,#e8c4a4);}' +
    '</style>' +
    '<p class="legende">10 valeurs — fais glisser un point (ou sélectionne-le avec Tab, puis ← →).</p>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" xmlns="http://www.w3.org/2000/svg" aria-label="Nuage de points, moyenne et bande x̄ ± σ"></svg></div>' +
    '<div class="stats">' +
    '<div class="stat stat-moyenne"><span class="stat-label">x̄</span><span class="stat-value" id="val-moyenne"></span></div>' +
    '<div class="stat"><span class="stat-label">variance</span><span class="stat-value" id="val-variance"></span></div>' +
    '<div class="stat"><span class="stat-label">écart-type</span><span class="stat-value" id="val-ecarttype"></span></div>' +
    '<div class="stat"><span class="stat-label">dans x̄ ± σ</span><span class="stat-value" id="val-dedans"></span></div>' +
    '</div>' +
    '<p class="message" id="message" aria-live="polite"></p>' +
    '<div class="boutons">' +
    '<button class="btn" id="resserree" type="button">Série resserrée</button>' +
    '<button class="btn" id="exemple" type="button">Exemple du texte : moitié à 4, moitié à 20</button>' +
    '</div>';

  class DispersionCompareeWidgetClass extends HTMLElement {
    constructor() {
      super();
      var shadow = this.attachShadow({ mode: "open" });
      shadow.appendChild(TEMPLATE.content.cloneNode(true));
      this._valeurs = RESSERREE.slice();
      this._glisse = null;
      this._svg = shadow.getElementById("svg");
      this._valMoyenne = shadow.getElementById("val-moyenne");
      this._valVariance = shadow.getElementById("val-variance");
      this._valEcartType = shadow.getElementById("val-ecarttype");
      this._valDedans = shadow.getElementById("val-dedans");
      this._message = shadow.getElementById("message");
      this._btnResserree = shadow.getElementById("resserree");
      this._btnExemple = shadow.getElementById("exemple");
    }

    connectedCallback() {
      var self = this;
      this._onPointerDown = function (e) {
        var cible = e.target.closest ? e.target.closest("[data-index]") : null;
        if (!cible) return;
        self._glisse = Number(cible.getAttribute("data-index"));
        self._svg.setPointerCapture(e.pointerId);
        e.preventDefault();
        self._deplacerVers(e);
      };
      this._onPointerMove = function (e) {
        if (self._glisse !== null) self._deplacerVers(e);
      };
      this._onPointerUp = function (e) {
        if (self._glisse === null) return;
        self._glisse = null;
        if (self._svg.hasPointerCapture(e.pointerId)) self._svg.releasePointerCapture(e.pointerId);
        self._rendre();
      };
      this._onKeyDown = function (e) {
        var cible = e.target.closest ? e.target.closest("[data-index]") : null;
        if (!cible) return;
        var i = Number(cible.getAttribute("data-index"));
        var v = self._valeurs[i];
        if (e.key === "ArrowRight" || e.key === "ArrowUp") v += PAS;
        else if (e.key === "ArrowLeft" || e.key === "ArrowDown") v -= PAS;
        else if (e.key === "Home") v = X_MIN;
        else if (e.key === "End") v = X_MAX;
        else return;
        e.preventDefault();
        self._valeurs[i] = Math.min(X_MAX, Math.max(X_MIN, v));
        self._rendre();
        var nouvelle = self._svg.querySelector('[data-index="' + i + '"]');
        if (nouvelle) nouvelle.focus();
      };
      this._onResserree = function () { self._valeurs = RESSERREE.slice(); self._rendre(); };
      this._onExemple = function () { self._valeurs = EXEMPLE_TEXTE.slice(); self._rendre(); };
      this._svg.addEventListener("pointerdown", this._onPointerDown);
      this._svg.addEventListener("pointermove", this._onPointerMove);
      this._svg.addEventListener("pointerup", this._onPointerUp);
      this._svg.addEventListener("pointercancel", this._onPointerUp);
      this._svg.addEventListener("keydown", this._onKeyDown);
      this._btnResserree.addEventListener("click", this._onResserree);
      this._btnExemple.addEventListener("click", this._onExemple);
      this._rendre();
    }

    disconnectedCallback() {
      this._svg.removeEventListener("pointerdown", this._onPointerDown);
      this._svg.removeEventListener("pointermove", this._onPointerMove);
      this._svg.removeEventListener("pointerup", this._onPointerUp);
      this._svg.removeEventListener("pointercancel", this._onPointerUp);
      this._svg.removeEventListener("keydown", this._onKeyDown);
      this._btnResserree.removeEventListener("click", this._onResserree);
      this._btnExemple.removeEventListener("click", this._onExemple);
    }

    _deplacerVers(e) {
      var ctm = this._svg.getScreenCTM();
      if (!ctm) return;
      var pt = this._svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      var local = pt.matrixTransform(ctm.inverse());
      var v = Math.min(X_MAX, Math.max(X_MIN, Math.round(xDepuisPx(local.x) / PAS) * PAS));
      if (v !== this._valeurs[this._glisse]) {
        this._valeurs[this._glisse] = v;
        this._rendre();
      }
    }

    _rendre() {
      var valeurs = this._valeurs;
      var p = parametres(valeurs);
      var a = p.moyenne - p.ecartType, b = p.moyenne + p.ecartType;
      var dedans = valeurs.filter(function (v) { return v >= a - 1e-9 && v <= b + 1e-9; }).length;

      this._valMoyenne.textContent = formatNombreFr(p.moyenne, 2);
      this._valVariance.textContent = formatNombreFr(p.variance, 2);
      this._valEcartType.textContent = formatNombreFr(p.ecartType, 2);
      this._valDedans.textContent = dedans + " / " + p.n;
      this._message.textContent =
        "Distance typique d'une valeur à x̄ = " + formatNombreFr(p.moyenne, 2) + " : environ σ = " +
        formatNombreFr(p.ecartType, 2) + ". Compare les deux réglages : même moyenne 12, mais un écart-type de 1,1 contre 8.";

      var svg = this._svg;
      svg.innerHTML = "";
      var defs = svgEl("defs", {});
      var marqueur = svgEl("marker", { id: "fleche", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" });
      marqueur.appendChild(svgEl("path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche" }));
      defs.appendChild(marqueur);
      svg.appendChild(defs);

      var aVisible = Math.max(a, X_MIN), bVisible = Math.min(b, X_MAX);
      if (bVisible - aVisible > 0.001) {
        svg.appendChild(svgEl("rect", {
          x: xPx(aVisible).toFixed(2), y: Y_HAUT, width: (xPx(bVisible) - xPx(aVisible)).toFixed(2),
          height: Y_AXE - Y_HAUT, class: "bande",
        }));
      }

      svg.appendChild(svgEl("line", { x1: xPx(X_MIN) - 6, x2: xPx(X_MAX) + 14, y1: Y_AXE, y2: Y_AXE, class: "axe", "marker-end": "url(#fleche)" }));
      for (var t = X_MIN; t <= X_MAX; t += 2) {
        var px = xPx(t);
        svg.appendChild(svgEl("line", { x1: px.toFixed(2), x2: px.toFixed(2), y1: Y_AXE - 4, y2: Y_AXE + 4, class: "tick" }));
        if (t % 4 === 0) {
          var et = svgEl("text", { x: px.toFixed(2), y: Y_AXE + 18, "text-anchor": "middle", class: "etiquette-tick" });
          et.textContent = String(t);
          svg.appendChild(et);
        }
      }

      var pxMoy = xPx(p.moyenne);
      svg.appendChild(svgEl("line", { x1: pxMoy.toFixed(2), x2: pxMoy.toFixed(2), y1: Y_HAUT - 2, y2: Y_AXE, class: "repere-moyenne" }));
      var texteMoy = "x̄ = " + formatNombreFr(p.moyenne, 2);
      var aMoy = ancrage(pxMoy, texteMoy.length * 7);
      var etMoy = svgEl("text", { x: aMoy.x.toFixed(2), y: Y_HAUT - 8, "text-anchor": aMoy.anchor, class: "etiquette-moyenne" });
      etMoy.textContent = texteMoy;
      svg.appendChild(etMoy);

      // Accolade sous l'axe : de x̄ − σ à x̄ + σ (coupée au cadre), avec la valeur de l'écart-type.
      if (p.ecartType > 0.01) {
        var pG = xPx(aVisible), pD = xPx(bVisible), yAcc = Y_AXE + 40;
        svg.appendChild(svgEl("path", {
          d: "M" + pG.toFixed(2) + " " + (Y_AXE + 26) + " Q" + pG.toFixed(2) + " " + yAcc + " " + ((pG + pD) / 2).toFixed(2) + " " + yAcc +
            " Q" + pD.toFixed(2) + " " + yAcc + " " + pD.toFixed(2) + " " + (Y_AXE + 26),
          class: "accolade",
        }));
        var texteEcart = "x̄ ± σ (σ ≈ " + formatNombreFr(p.ecartType, 2) + ")";
        var aE = ancrage((pG + pD) / 2, texteEcart.length * 6.4);
        var etE = svgEl("text", { x: aE.x.toFixed(2), y: yAcc + 14, "text-anchor": aE.anchor, class: "etiquette-ecart" });
        etE.textContent = texteEcart;
        svg.appendChild(etE);
      }

      var piles = hauteursEmpilees(valeurs);
      var maxPile = Math.max.apply(null, piles) + 1;
      var ecart = Math.min(14, 104 / Math.max(maxPile, 1));
      var self = this;
      valeurs.forEach(function (v, i) {
        var cx = xPx(v);
        var cy = Y_AXE - 12 - piles[i] * ecart;
        svg.appendChild(svgEl("circle", { cx: cx.toFixed(2), cy: cy.toFixed(2), r: R_POINT, class: "point" }));
        svg.appendChild(svgEl("circle", {
          cx: cx.toFixed(2), cy: cy.toFixed(2), r: R_CIBLE,
          class: "cible" + (self._glisse === i ? " cible-active" : ""),
          "data-index": String(i), tabindex: "0", role: "slider",
          "aria-label": "Valeur " + (i + 1), "aria-valuemin": String(X_MIN), "aria-valuemax": String(X_MAX),
          "aria-valuenow": String(v),
        }));
        if (self._glisse === i) {
          var aP = ancrage(cx, 20);
          var etP = svgEl("text", { x: aP.x.toFixed(2), y: (cy - 12).toFixed(2), "text-anchor": aP.anchor, class: "etiquette-point" });
          etP.textContent = formatNombreFr(v, 0);
          svg.appendChild(etP);
        }
      });
    }
  }

  if (!customElements.get("dispersion-comparee-widget")) {
    customElements.define("dispersion-comparee-widget", DispersionCompareeWidgetClass);
  }
})();
