(function () {
  "use strict";

  /* ================================================================
   * <boite-moustaches-vivante-widget> — atelier interactif (4e,
   * statistique, section « La boîte à moustaches ») : 12 valeurs sur un
   * nuage de points, chacune déplaçable au doigt, à la souris ou au
   * clavier ; la boîte à moustaches se recalcule en direct sous le
   * nuage. Min, Q₁, médiane, Q₃, max suivent la règle du seuil du
   * chapitre (première valeur dont le cumulé dépasse STRICTEMENT n/4,
   * n/2, 3n/4) ; écart interquartile Q₃ − Q₁. Les nombres qui changent
   * au dernier déplacement sont signalés : déplacer une valeur extrême
   * ne fait bouger qu'une moustache. Réglage de départ = fil rouge du
   * chapitre (2 / 6 / 6 / 9 / 12, médiane collée au bord gauche de la
   * boîte). Fenêtre FIXE (0 → 16). Web Component (Shadow DOM).
   * ================================================================ */

  var DEPART = [2, 3, 5, 6, 6, 6, 6, 8, 9, 9, 11, 12];
  var X_MIN = 0, X_MAX = 16, PAS = 1;
  var LARGEUR = 420, HAUTEUR = 226, MARGE_G = 24, MARGE_D = 30;
  var Y_AXE = 150, R_POINT = 6, R_CIBLE = 19;
  var Y_BOITE = Y_AXE + 30, H_BOITE = 30;
  var NS = "http://www.w3.org/2000/svg";
  var NOMS = { min: "le minimum", q1: "Q₁", me: "la médiane", q3: "Q₃", max: "le maximum" };
  var ORDRE = ["min", "q1", "me", "q3", "max"];

  function formatNombreFr(n) {
    var arrondi = Math.round(n * 100) / 100;
    return String(arrondi).replace(".", ",").replace("-", "−");
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

  /** Règle du seuil : première valeur (ordre croissant) dont l'effectif cumulé dépasse STRICTEMENT
   * le seuil s — c'est la valeur de rang ⌊s⌋ + 1. */
  function valeurSeuil(triees, s) {
    return triees[Math.min(triees.length - 1, Math.floor(s))];
  }

  function cinqNombres(valeurs) {
    var t = valeurs.slice().sort(function (a, b) { return a - b; });
    var n = t.length;
    return { min: t[0], q1: valeurSeuil(t, n / 4), me: valeurSeuil(t, n / 2), q3: valeurSeuil(t, 3 * n / 4), max: t[n - 1] };
  }

  function hauteursEmpilees(valeurs) {
    var vus = {};
    return valeurs.map(function (v) {
      var cle = String(v);
      vus[cle] = (vus[cle] || 0) + 1;
      return vus[cle] - 1;
    });
  }

  function ancrage(px) {
    if (px < 40) return { anchor: "start", x: Math.max(px - 4, 4) };
    if (px > LARGEUR - 40) return { anchor: "end", x: Math.min(px + 4, LARGEUR - 4) };
    return { anchor: "middle", x: px };
  }

  function listeFr(mots) {
    if (mots.length <= 1) return mots.join("");
    return mots.slice(0, -1).join(", ") + " et " + mots[mots.length - 1];
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
    '.boite{fill:var(--accent-soft,#f6e2d3);stroke:var(--accent,#a8471f);stroke-width:2;}' +
    '.moustache{stroke:var(--accent,#a8471f);stroke-width:2;}' +
    '.mediane{stroke:var(--good,#2e7d4f);stroke-width:3.5;}' +
    '.point{fill:var(--accent,#a8471f);stroke:var(--surface,#fff);stroke-width:2;pointer-events:none;}' +
    '.cible{fill:transparent;stroke:none;cursor:grab;touch-action:none;outline:none;}' +
    '.cible:focus-visible{stroke:var(--accent,#a8471f);stroke-width:2;stroke-dasharray:3 2;}' +
    '.cible-active{cursor:grabbing;}' +
    '.etiquette-point{font-size:11.5px;font-weight:700;fill:var(--ink,#241f1a);font-family:var(--mono,monospace);pointer-events:none;}' +
    '.legende{font-size:0.86rem;color:var(--ink-soft,#6b6055);text-align:center;margin:0 0 10px;}' +
    '.stats{display:flex;align-items:stretch;justify-content:center;gap:6px;flex-wrap:wrap;margin-top:10px;}' +
    '.stat{flex:1 1 62px;min-width:0;border:1px solid var(--line,#e2d8c8);border-radius:var(--radius,3px);padding:7px 3px;text-align:center;background:var(--surface,#fff);transition:background-color 0.25s,border-color 0.25s;}' +
    '.stat-label{display:block;font-family:var(--mono,monospace);font-size:10px;letter-spacing:0.02em;color:var(--ink-faint,#9c9083);margin-bottom:4px;}' +
    '.stat-value{display:block;font-variant-numeric:tabular-nums;font-size:0.98rem;font-weight:600;color:var(--ink,#241f1a);white-space:nowrap;}' +
    '.stat-me .stat-value{color:var(--good,#2e7d4f);}' +
    '.stat-change{background:var(--tip-soft,#fdf3d6);border-color:var(--tip,#b7860b);}' +
    '.message{margin:12px 0 0;font-size:0.92rem;line-height:1.45;color:var(--ink,#241f1a);text-align:center;min-height:2.9em;}' +
    '.boutons{display:flex;justify-content:center;gap:8px;flex-wrap:wrap;margin-top:12px;}' +
    '.btn{padding:8px 14px;border-radius:var(--radius,3px);border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font-weight:600;cursor:pointer;font-size:0.88rem;font-family:inherit;min-height:36px;}' +
    '.btn:hover{background:var(--accent-soft-line,#e8c4a4);}' +
    '</style>' +
    '<p class="legende">12 valeurs — fais glisser un point (ou sélectionne-le avec Tab, puis ← →) : la boîte se redessine.</p>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" xmlns="http://www.w3.org/2000/svg" aria-label="Nuage de points et boîte à moustaches"></svg></div>' +
    '<div class="stats">' +
    '<div class="stat" id="stat-min"><span class="stat-label">min</span><span class="stat-value" id="val-min"></span></div>' +
    '<div class="stat" id="stat-q1"><span class="stat-label">Q₁</span><span class="stat-value" id="val-q1"></span></div>' +
    '<div class="stat stat-me" id="stat-me"><span class="stat-label">médiane</span><span class="stat-value" id="val-me"></span></div>' +
    '<div class="stat" id="stat-q3"><span class="stat-label">Q₃</span><span class="stat-value" id="val-q3"></span></div>' +
    '<div class="stat" id="stat-max"><span class="stat-label">max</span><span class="stat-value" id="val-max"></span></div>' +
    '<div class="stat" id="stat-iqr"><span class="stat-label">Q₃ − Q₁</span><span class="stat-value" id="val-iqr"></span></div>' +
    '</div>' +
    '<p class="message" id="message" aria-live="polite"></p>' +
    '<div class="boutons"><button class="btn" id="reset" type="button">Réinitialiser</button></div>';

  class BoiteMoustachesVivanteWidgetClass extends HTMLElement {
    constructor() {
      super();
      var shadow = this.attachShadow({ mode: "open" });
      shadow.appendChild(TEMPLATE.content.cloneNode(true));
      this._shadow = shadow;
      this._valeurs = DEPART.slice();
      this._glisse = null;
      this._precedents = null;
      this._minuteur = null;
      this._svg = shadow.getElementById("svg");
      this._message = shadow.getElementById("message");
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
      this._onReset = function () {
        self._valeurs = DEPART.slice();
        self._precedents = null;
        self._rendre();
      };
      this._svg.addEventListener("pointerdown", this._onPointerDown);
      this._svg.addEventListener("pointermove", this._onPointerMove);
      this._svg.addEventListener("pointerup", this._onPointerUp);
      this._svg.addEventListener("pointercancel", this._onPointerUp);
      this._svg.addEventListener("keydown", this._onKeyDown);
      this._btnReset.addEventListener("click", this._onReset);
      this._rendre();
    }

    disconnectedCallback() {
      this._svg.removeEventListener("pointerdown", this._onPointerDown);
      this._svg.removeEventListener("pointermove", this._onPointerMove);
      this._svg.removeEventListener("pointerup", this._onPointerUp);
      this._svg.removeEventListener("pointercancel", this._onPointerUp);
      this._svg.removeEventListener("keydown", this._onKeyDown);
      this._btnReset.removeEventListener("click", this._onReset);
      if (this._minuteur) clearTimeout(this._minuteur);
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
      var c = cinqNombres(this._valeurs);
      var shadow = this._shadow;
      ORDRE.forEach(function (cle) { shadow.getElementById("val-" + cle).textContent = formatNombreFr(c[cle]); });
      shadow.getElementById("val-iqr").textContent = formatNombreFr(c.q3 - c.q1);

      // Nombres modifiés par le dernier déplacement : surlignés un instant + phrase explicative.
      var precedents = this._precedents;
      var changes = precedents ? ORDRE.filter(function (cle) { return precedents[cle] !== c[cle]; }) : [];
      if (precedents && changes.length > 0) {
        changes.forEach(function (cle) { shadow.getElementById("stat-" + cle).classList.add("stat-change"); });
        if (precedents.q3 - precedents.q1 !== c.q3 - c.q1) shadow.getElementById("stat-iqr").classList.add("stat-change");
        if (this._minuteur) clearTimeout(this._minuteur);
        this._minuteur = setTimeout(function () {
          ORDRE.concat(["iqr"]).forEach(function (cle) { shadow.getElementById("stat-" + cle).classList.remove("stat-change"); });
        }, 900);
        var seulsExtremes = changes.every(function (cle) { return cle === "min" || cle === "max"; });
        this._message.textContent = seulsExtremes
          ? (changes.length === 1 ? "Seul " : "Seuls ") + listeFr(changes.map(function (cle) { return NOMS[cle]; })) +
            (changes.length === 1 ? " a changé" : " ont changé") + " : une moustache s'allonge ou se raccourcit, la boîte et la médiane ne bougent pas."
          : (changes.length === 1 ? "A changé : " : "Ont changé : ") + listeFr(changes.map(function (cle) { return NOMS[cle]; })) +
            ". La boîte contient toujours la moitié « centrale » des valeurs, de Q₁ à Q₃.";
      } else if (precedents && this._valeursPrecedentes && this._valeursPrecedentes.join() !== this._valeurs.join()) {
        this._message.textContent = "Aucun des 5 nombres n'a changé : ce point a bougé sans franchir de quartile ni devenir un extrême.";
      } else if (!precedents) {
        this._message.textContent = "Ici Q₁ = médiane = 6 : la médiane est collée au bord gauche de la boîte. Déplace la plus grande valeur vers la droite et regarde ce qui change.";
      }
      this._precedents = c;
      this._valeursPrecedentes = this._valeurs.slice();

      var svg = this._svg;
      svg.innerHTML = "";
      var defs = svgEl("defs", {});
      var marqueur = svgEl("marker", { id: "fleche", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" });
      marqueur.appendChild(svgEl("path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche" }));
      defs.appendChild(marqueur);
      svg.appendChild(defs);

      svg.appendChild(svgEl("line", { x1: xPx(X_MIN) - 6, x2: xPx(X_MAX) + 14, y1: Y_AXE, y2: Y_AXE, class: "axe", "marker-end": "url(#fleche)" }));
      for (var t = X_MIN; t <= X_MAX; t += 1) {
        var px = xPx(t);
        svg.appendChild(svgEl("line", { x1: px.toFixed(2), x2: px.toFixed(2), y1: Y_AXE - 4, y2: Y_AXE + 4, class: "tick" }));
        if (t % 2 === 0) {
          var et = svgEl("text", { x: px.toFixed(2), y: Y_AXE + 18, "text-anchor": "middle", class: "etiquette-tick" });
          et.textContent = String(t);
          svg.appendChild(et);
        }
      }

      // Boîte à moustaches, sous l'axe, sur la même échelle que le nuage.
      var yMilieu = Y_BOITE + H_BOITE / 2;
      svg.appendChild(svgEl("line", { x1: xPx(c.min), x2: xPx(c.q1), y1: yMilieu, y2: yMilieu, class: "moustache" }));
      svg.appendChild(svgEl("line", { x1: xPx(c.q3), x2: xPx(c.max), y1: yMilieu, y2: yMilieu, class: "moustache" }));
      [c.min, c.max].forEach(function (v) {
        svg.appendChild(svgEl("line", { x1: xPx(v), x2: xPx(v), y1: Y_BOITE + 7, y2: Y_BOITE + H_BOITE - 7, class: "moustache" }));
      });
      svg.appendChild(svgEl("rect", { x: xPx(c.q1), y: Y_BOITE, width: Math.max(xPx(c.q3) - xPx(c.q1), 0.5), height: H_BOITE, class: "boite" }));
      svg.appendChild(svgEl("line", { x1: xPx(c.me), x2: xPx(c.me), y1: Y_BOITE - 3, y2: Y_BOITE + H_BOITE + 3, class: "mediane" }));

      var piles = hauteursEmpilees(this._valeurs);
      var maxPile = Math.max.apply(null, piles) + 1;
      var ecart = Math.min(14, 112 / Math.max(maxPile, 1));
      var self = this;
      this._valeurs.forEach(function (v, i) {
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
          var a = ancrage(cx);
          var etP = svgEl("text", { x: a.x.toFixed(2), y: (cy - 12).toFixed(2), "text-anchor": a.anchor, class: "etiquette-point" });
          etP.textContent = formatNombreFr(v);
          svg.appendChild(etP);
        }
      });
    }
  }

  if (!customElements.get("boite-moustaches-vivante-widget")) {
    customElements.define("boite-moustaches-vivante-widget", BoiteMoustachesVivanteWidgetClass);
  }
})();
