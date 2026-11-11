(function () {
  "use strict";

  /* ================================================================
   * <valeur-aberrante-widget> — atelier interactif (4e, statistique,
   * section « Médiane, quartiles et mode ») : 8 matchs d'un basketteur
   * sur un nuage de points ; chaque point se déplace au doigt, à la
   * souris ou au clavier. La MOYENNE et la MÉDIANE (règle du seuil du
   * chapitre : première valeur dont l'effectif cumulé dépasse
   * STRICTEMENT n/2) sont recalculées en direct. Pousser le seul match
   * exceptionnel vers la droite fait s'envoler la moyenne, jamais la
   * médiane — version manipulable de l'intuition « château » et de
   * l'application « basketteur » (réglage « Match exceptionnel » = 50 :
   * moyenne 22,75, médiane 20, exactement les valeurs du chapitre).
   * Fenêtre FIXE (10 → 60), jamais recalculée depuis les points.
   * Web Component (Shadow DOM).
   * ================================================================ */

  var DEPART = [15, 17, 18, 19, 20, 21, 22, 23];
  var INDEX_EXCEPTIONNEL = 7;
  var X_MIN = 10, X_MAX = 60, PAS = 1;
  var LARGEUR = 420, HAUTEUR = 214, MARGE_G = 24, MARGE_D = 30;
  var Y_AXE = 150, ECART_PILE = 10, R_POINT = 3.8, R_CIBLE = 19;
  var NS = "http://www.w3.org/2000/svg";

  function formatNombreFr(n, decimales) {
    var facteur = Math.pow(10, decimales);
    var arrondi = Math.round(n * facteur) / facteur;
    var texte = arrondi.toFixed(decimales);
    if (decimales > 0) texte = texte.replace(/0+$/, "").replace(/\.$/, "");
    return texte.replace(".", ",").replace("-", "−");
  }

  function signeFr(n) {
    if (Math.abs(n) < 0.005) return "0";
    return (n > 0 ? "+" : "−") + formatNombreFr(Math.abs(n), 2);
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

  function moyenne(valeurs) {
    var s = 0;
    for (var i = 0; i < valeurs.length; i++) s += valeurs[i];
    return s / valeurs.length;
  }

  /** Règle du seuil du chapitre : la médiane est la première valeur (dans l'ordre croissant) dont
   * l'effectif cumulé dépasse STRICTEMENT n/2, c'est-à-dire la valeur de rang ⌊n/2⌋ + 1. */
  function medianeSeuil(valeurs) {
    var triees = valeurs.slice().sort(function (a, b) { return a - b; });
    return { valeur: triees[Math.floor(triees.length / 2)], rang: Math.floor(triees.length / 2) + 1 };
  }

  /** Position verticale de chaque point : les valeurs égales s'empilent (nuage de points). */
  function hauteursEmpilees(valeurs) {
    var vus = {};
    return valeurs.map(function (v) {
      var cle = String(v);
      vus[cle] = (vus[cle] || 0) + 1;
      return vus[cle] - 1;
    });
  }

  /** Étiquette d'un repère vertical : ancrée pour ne jamais sortir du cadre. */
  function ancrage(px) {
    if (px < 70) return { anchor: "start", x: Math.max(px - 4, 4) };
    if (px > LARGEUR - 70) return { anchor: "end", x: Math.min(px + 4, LARGEUR - 4) };
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
    '.repere-moyenne{stroke:var(--plan,#5b4ea3);stroke-width:2.4;}' +
    '.repere-mediane{stroke:var(--good,#2e7d4f);stroke-width:2.4;}' +
    '.etiquette-moyenne{font-size:12px;font-weight:700;fill:var(--plan,#5b4ea3);font-family:var(--mono,monospace);}' +
    '.etiquette-mediane{font-size:12px;font-weight:700;fill:var(--good,#2e7d4f);font-family:var(--mono,monospace);}' +
    '.point{fill:var(--accent,#a8471f);stroke:var(--surface,#fff);stroke-width:1.2;pointer-events:none;}' +
    '.point-exceptionnel{fill:var(--bad,#b3261e);}' +
    '.cible{fill:transparent;stroke:none;cursor:grab;touch-action:none;outline:none;}' +
    '.cible:focus-visible{stroke:var(--accent,#a8471f);stroke-width:2;stroke-dasharray:3 2;}' +
    '.cible-active{cursor:grabbing;}' +
    '.etiquette-point{font-size:11.5px;font-weight:700;fill:var(--ink,#241f1a);font-family:var(--mono,monospace);pointer-events:none;}' +
    '.legende{font-size:0.86rem;color:var(--ink-soft,#6b6055);text-align:center;margin:0 0 10px;}' +
    '.stats{display:flex;align-items:stretch;justify-content:center;gap:6px;flex-wrap:wrap;margin-top:10px;}' +
    '.stat{flex:1 1 110px;min-width:0;border:1px solid var(--line,#e2d8c8);border-radius:var(--radius,3px);padding:8px 4px;text-align:center;background:var(--surface,#fff);}' +
    '.stat-label{display:block;font-family:var(--mono,monospace);font-size:10px;letter-spacing:0.02em;color:var(--ink-faint,#9c9083);margin-bottom:5px;}' +
    '.stat-value{display:block;font-variant-numeric:tabular-nums;font-size:0.98rem;font-weight:600;color:var(--ink,#241f1a);white-space:nowrap;}' +
    '.stat-moyenne .stat-value{color:var(--plan,#5b4ea3);}' +
    '.stat-mediane .stat-value{color:var(--good,#2e7d4f);}' +
    '.message{margin:12px 0 0;font-size:0.92rem;line-height:1.45;color:var(--ink,#241f1a);text-align:center;}' +
    '.boutons{display:flex;justify-content:center;gap:8px;flex-wrap:wrap;margin-top:12px;}' +
    '.btn{padding:8px 14px;border-radius:var(--radius,3px);border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font-weight:600;cursor:pointer;font-size:0.88rem;font-family:inherit;min-height:36px;}' +
    '.btn:hover{background:var(--accent-soft-line,#e8c4a4);}' +
    '</style>' +
    '<p class="legende">Points marqués lors de 8 matchs — fais glisser un point (ou sélectionne-le avec Tab, puis ← →).</p>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" xmlns="http://www.w3.org/2000/svg" aria-label="Nuage de points des 8 matchs"></svg></div>' +
    '<div class="stats">' +
    '<div class="stat stat-moyenne"><span class="stat-label">moyenne</span><span class="stat-value" id="val-moyenne"></span></div>' +
    '<div class="stat stat-mediane"><span class="stat-label">médiane</span><span class="stat-value" id="val-mediane"></span></div>' +
    '<div class="stat"><span class="stat-label">depuis le départ</span><span class="stat-value" id="val-ecart"></span></div>' +
    '</div>' +
    '<p class="message" id="message" aria-live="polite"></p>' +
    '<div class="boutons">' +
    '<button class="btn" id="exceptionnel" type="button">Match exceptionnel : 50 points</button>' +
    '<button class="btn" id="reset" type="button">Réinitialiser</button>' +
    '</div>';

  class ValeurAberranteWidgetClass extends HTMLElement {
    constructor() {
      super();
      var shadow = this.attachShadow({ mode: "open" });
      shadow.appendChild(TEMPLATE.content.cloneNode(true));
      this._valeurs = DEPART.slice();
      this._glisse = null;
      this._svg = shadow.getElementById("svg");
      this._valMoyenne = shadow.getElementById("val-moyenne");
      this._valMediane = shadow.getElementById("val-mediane");
      this._valEcart = shadow.getElementById("val-ecart");
      this._message = shadow.getElementById("message");
      this._btnExceptionnel = shadow.getElementById("exceptionnel");
      this._btnReset = shadow.getElementById("reset");
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
        if (self._glisse === null) return;
        self._deplacerVers(e);
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
        else if (e.key === "PageUp") v += 5 * PAS;
        else if (e.key === "PageDown") v -= 5 * PAS;
        else if (e.key === "Home") v = X_MIN;
        else if (e.key === "End") v = X_MAX;
        else return;
        e.preventDefault();
        self._valeurs[i] = Math.min(X_MAX, Math.max(X_MIN, v));
        self._rendre();
        var nouvelle = self._svg.querySelector('[data-index="' + i + '"]');
        if (nouvelle) nouvelle.focus();
      };
      this._onExceptionnel = function () {
        self._valeurs = DEPART.slice();
        self._valeurs[INDEX_EXCEPTIONNEL] = 50;
        self._rendre();
      };
      this._onReset = function () {
        self._valeurs = DEPART.slice();
        self._rendre();
      };
      this._svg.addEventListener("pointerdown", this._onPointerDown);
      this._svg.addEventListener("pointermove", this._onPointerMove);
      this._svg.addEventListener("pointerup", this._onPointerUp);
      this._svg.addEventListener("pointercancel", this._onPointerUp);
      this._svg.addEventListener("keydown", this._onKeyDown);
      this._btnExceptionnel.addEventListener("click", this._onExceptionnel);
      this._btnReset.addEventListener("click", this._onReset);
      this._rendre();
    }

    disconnectedCallback() {
      this._svg.removeEventListener("pointerdown", this._onPointerDown);
      this._svg.removeEventListener("pointermove", this._onPointerMove);
      this._svg.removeEventListener("pointerup", this._onPointerUp);
      this._svg.removeEventListener("pointercancel", this._onPointerUp);
      this._svg.removeEventListener("keydown", this._onKeyDown);
      this._btnExceptionnel.removeEventListener("click", this._onExceptionnel);
      this._btnReset.removeEventListener("click", this._onReset);
    }

    _deplacerVers(e) {
      var ctm = this._svg.getScreenCTM();
      if (!ctm) return;
      var pt = this._svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      var local = pt.matrixTransform(ctm.inverse());
      var v = Math.round(xDepuisPx(local.x) / PAS) * PAS;
      v = Math.min(X_MAX, Math.max(X_MIN, v));
      if (v !== this._valeurs[this._glisse]) {
        this._valeurs[this._glisse] = v;
        this._rendre();
      }
    }

    _rendre() {
      var valeurs = this._valeurs;
      var n = valeurs.length;
      var xb = moyenne(valeurs);
      var med = medianeSeuil(valeurs);
      var xbDepart = moyenne(DEPART);
      var medDepart = medianeSeuil(DEPART).valeur;

      this._valMoyenne.textContent = formatNombreFr(xb, 2);
      this._valMediane.textContent = formatNombreFr(med.valeur, 2);
      this._valEcart.textContent = "x̄ " + signeFr(xb - xbDepart) + " · Me " + signeFr(med.valeur - medDepart);

      var auDessous = valeurs.filter(function (v) { return v < xb; }).length;
      this._message.textContent =
        "La moyenne (" + formatNombreFr(xb, 2) + ") dépasse " + auDessous + " des " + n + " valeurs. " +
        "La médiane (" + formatNombreFr(med.valeur, 2) + ", la " + med.rang + "e valeur dans l'ordre croissant) " +
        "ne regarde que le rang : pousser le plus grand score encore plus loin ne la change pas.";

      var svg = this._svg;
      svg.innerHTML = "";
      var defs = svgEl("defs", {});
      var marqueur = svgEl("marker", { id: "fleche", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" });
      marqueur.appendChild(svgEl("path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche" }));
      defs.appendChild(marqueur);
      svg.appendChild(defs);

      svg.appendChild(svgEl("line", { x1: xPx(X_MIN) - 6, x2: xPx(X_MAX) + 14, y1: Y_AXE, y2: Y_AXE, class: "axe", "marker-end": "url(#fleche)" }));
      for (var t = X_MIN; t <= X_MAX; t += 5) {
        var px = xPx(t);
        svg.appendChild(svgEl("line", { x1: px.toFixed(2), x2: px.toFixed(2), y1: Y_AXE - 4, y2: Y_AXE + 4, class: "tick" }));
        if (t % 10 === 0) {
          var et = svgEl("text", { x: px.toFixed(2), y: Y_AXE + 18, "text-anchor": "middle", class: "etiquette-tick" });
          et.textContent = String(t);
          svg.appendChild(et);
        }
      }

      // Moyenne : repère vers le HAUT, étiquette en haut ; médiane : repère vers le BAS, étiquette en
      // bas — jamais superposées même quand les deux valeurs sont proches.
      var pxMoy = xPx(xb);
      svg.appendChild(svgEl("line", { x1: pxMoy.toFixed(2), x2: pxMoy.toFixed(2), y1: 26, y2: Y_AXE, class: "repere-moyenne" }));
      var aMoy = ancrage(pxMoy);
      var etMoy = svgEl("text", { x: aMoy.x.toFixed(2), y: 18, "text-anchor": aMoy.anchor, class: "etiquette-moyenne" });
      etMoy.textContent = "moyenne = " + formatNombreFr(xb, 2);
      svg.appendChild(etMoy);

      var pxMed = xPx(med.valeur);
      svg.appendChild(svgEl("line", { x1: pxMed.toFixed(2), x2: pxMed.toFixed(2), y1: Y_AXE, y2: Y_AXE + 36, class: "repere-mediane" }));
      var aMed = ancrage(pxMed);
      var etMed = svgEl("text", { x: aMed.x.toFixed(2), y: Y_AXE + 52, "text-anchor": aMed.anchor, class: "etiquette-mediane" });
      etMed.textContent = "médiane = " + formatNombreFr(med.valeur, 2);
      svg.appendChild(etMed);

      var piles = hauteursEmpilees(valeurs);
      var self = this;
      valeurs.forEach(function (v, i) {
        var cx = xPx(v);
        var cy = Y_AXE - 9 - piles[i] * ECART_PILE;
        var classe = "point" + (i === INDEX_EXCEPTIONNEL ? " point-exceptionnel" : "");
        svg.appendChild(svgEl("circle", { cx: cx.toFixed(2), cy: cy.toFixed(2), r: R_POINT, class: classe }));
        var cible = svgEl("circle", {
          cx: cx.toFixed(2), cy: cy.toFixed(2), r: R_CIBLE,
          class: "cible" + (self._glisse === i ? " cible-active" : ""),
          "data-index": String(i), tabindex: "0", role: "slider",
          "aria-label": "Match " + (i + 1), "aria-valuemin": String(X_MIN), "aria-valuemax": String(X_MAX),
          "aria-valuenow": String(v), "aria-valuetext": formatNombreFr(v, 0) + " points",
        });
        svg.appendChild(cible);
        if (self._glisse === i) {
          var a = ancrage(cx);
          var etP = svgEl("text", { x: a.x.toFixed(2), y: (cy - 12).toFixed(2), "text-anchor": a.anchor, class: "etiquette-point" });
          etP.textContent = formatNombreFr(v, 0);
          svg.appendChild(etP);
        }
      });
    }
  }

  if (!customElements.get("valeur-aberrante-widget")) {
    customElements.define("valeur-aberrante-widget", ValeurAberranteWidgetClass);
  }
})();
