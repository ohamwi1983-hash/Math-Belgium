(function () {
  "use strict";

  /* ================================================================
   * <tchebychev-garantie-widget> — atelier interactif (4e, statistique,
   * section « L'inégalité de Bienaymé-Tchebychev ») : 4 séries fixes de
   * 40 valeurs (en cloche, uniforme, à deux bosses, avec une valeur
   * extrême) et un curseur k (1,1 → 4). La bande [x̄ − kσ ; x̄ + kσ] est
   * tracée sur le nuage de points ; le widget compare le pourcentage
   * RÉEL de valeurs dans la bande au minimum GARANTI (1 − 1/k²) × 100 %.
   * x̄ et σ suivent la convention du chapitre (division par n). Le réel
   * est TOUJOURS ≥ garanti, quelle que soit la forme (vérifié par calcul
   * pour les 4 séries et tout k de la grille du curseur). Fenêtre FIXE
   * (0 → 40), identique pour les 4 séries : seule la bande bouge.
   * Web Component (Shadow DOM).
   * ================================================================ */

  function depuisEffectifs(effectifs) {
    var valeurs = [];
    Object.keys(effectifs).forEach(function (cle) {
      for (var i = 0; i < effectifs[cle]; i++) valeurs.push(Number(cle));
    });
    return valeurs.sort(function (a, b) { return a - b; });
  }

  var SERIES = {
    cloche: {
      label: "en cloche",
      valeurs: depuisEffectifs({ 13: 1, 14: 1, 15: 1, 16: 2, 17: 3, 18: 4, 19: 5, 20: 6, 21: 5, 22: 4, 23: 3, 24: 2, 25: 1, 26: 1, 27: 1 }),
    },
    uniforme: {
      label: "uniforme",
      valeurs: (function () { var v = []; for (var i = 0; i < 40; i++) v.push(i); return v; })(),
    },
    bosses: {
      label: "à deux bosses",
      valeurs: depuisEffectifs({ 6: 1, 7: 2, 8: 4, 9: 6, 10: 4, 11: 2, 12: 1, 28: 1, 29: 2, 30: 4, 31: 6, 32: 4, 33: 2, 34: 1 }),
    },
    extreme: {
      label: "avec une valeur extrême",
      valeurs: depuisEffectifs({ 12: 2, 13: 5, 14: 8, 15: 9, 16: 8, 17: 5, 18: 2, 39: 1 }),
    },
  };
  var ORDRE_SERIES = ["cloche", "uniforme", "bosses", "extreme"];

  var X_MIN = 0, X_MAX = 40;
  var K_MIN = 1.1, K_MAX = 4, K_PAS = 0.1, K_DEFAUT = 2;
  var LARGEUR = 420, HAUTEUR = 214, MARGE_G = 20, MARGE_D = 30;
  var Y_AXE = 150, Y_HAUT_BANDE = 22, ECART_PILE = 10, R_POINT = 4.5;
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

  function parametres(valeurs) {
    var n = valeurs.length, s = 0, i;
    for (i = 0; i < n; i++) s += valeurs[i];
    var xb = s / n, sc = 0;
    for (i = 0; i < n; i++) sc += (valeurs[i] - xb) * (valeurs[i] - xb);
    return { n: n, moyenne: xb, ecartType: Math.sqrt(sc / n) };
  }

  /** Garantie de Bienaymé-Tchebychev en %, arrondie VERS LE BAS au dixième (elle reste vraie). */
  function garantiePourcent(k) {
    return Math.floor((1 - 1 / (k * k)) * 1000 + 1e-9) / 10;
  }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' +
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);}' +
    '*{box-sizing:border-box;}' +
    '.ligne-select{display:flex;align-items:center;justify-content:center;gap:8px;flex-wrap:wrap;margin-bottom:10px;}' +
    '.ligne-select label{font-weight:600;color:var(--ink,#241f1a);}' +
    'select{font:inherit;padding:6px 10px;border-radius:var(--radius,3px);border:1px solid var(--line,#e2d8c8);background:var(--surface,#fff);color:var(--ink,#241f1a);max-width:100%;}' +
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:12px;}' +
    'svg{width:100%;max-width:440px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.6;}' +
    '.fleche{fill:var(--ink-soft,#6b6055);}' +
    '.tick{stroke:var(--ink-soft,#6b6055);stroke-width:1.2;}' +
    '.etiquette-tick{font-size:11px;fill:var(--ink-soft,#6b6055);font-family:var(--mono,monospace);}' +
    '.bande{fill:var(--good-soft,#dcefe3);stroke:var(--good,#2e7d4f);stroke-width:1.4;stroke-dasharray:4 3;}' +
    '.repere-moyenne{stroke:var(--plan,#5b4ea3);stroke-width:2.2;}' +
    '.etiquette-moyenne{font-size:12px;font-weight:700;fill:var(--plan,#5b4ea3);font-family:var(--mono,monospace);}' +
    '.etiquette-borne{font-size:11px;font-weight:600;fill:var(--good,#2e7d4f);font-family:var(--mono,monospace);}' +
    '.point-dedans{fill:var(--good,#2e7d4f);}' +
    '.point-dehors{fill:var(--bad,#b3261e);}' +
    '.controles{display:flex;flex-direction:column;gap:6px;margin-bottom:6px;}' +
    '.controles label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3212);}' +
    '.curseur-row{display:flex;align-items:center;gap:12px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;accent-color:var(--accent,#a8471f);min-height:32px;}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:44px;text-align:right;font-size:0.95rem;}' +
    '.stats{display:flex;align-items:stretch;justify-content:center;gap:6px;flex-wrap:wrap;margin-top:12px;}' +
    '.stat{flex:1 1 92px;min-width:0;border:1px solid var(--line,#e2d8c8);border-radius:var(--radius,3px);padding:7px 3px;text-align:center;background:var(--surface,#fff);}' +
    '.stat-label{display:block;font-family:var(--mono,monospace);font-size:10px;letter-spacing:0.02em;color:var(--ink-faint,#9c9083);margin-bottom:4px;}' +
    '.stat-value{display:block;font-variant-numeric:tabular-nums;font-size:0.95rem;font-weight:600;color:var(--ink,#241f1a);white-space:nowrap;}' +
    '.stat-reel .stat-value{color:var(--good,#2e7d4f);}' +
    '.stat-garanti .stat-value{color:var(--accent-ink,#7a3212);}' +
    '.verdict{margin:12px 0 0;font-size:0.92rem;line-height:1.45;color:var(--ink,#241f1a);text-align:center;}' +
    '</style>' +
    '<div class="ligne-select"><label for="serie">Forme de la série (40 valeurs) :</label><select id="serie"></select></div>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" xmlns="http://www.w3.org/2000/svg" aria-label="Nuage de points et bande x̄ ± kσ"></svg></div>' +
    '<div class="controles"><label for="k">k — nombre d\'écarts-types</label><div class="curseur-row">' +
    '<input type="range" id="k" min="' + K_MIN + '" max="' + K_MAX + '" step="' + K_PAS + '" value="' + K_DEFAUT + '">' +
    '<span class="curseur-valeur" id="k-valeur"></span></div></div>' +
    '<div class="stats">' +
    '<div class="stat"><span class="stat-label">x̄</span><span class="stat-value" id="val-moyenne"></span></div>' +
    '<div class="stat"><span class="stat-label">σ</span><span class="stat-value" id="val-sigma"></span></div>' +
    '<div class="stat"><span class="stat-label">[x̄ − kσ ; x̄ + kσ]</span><span class="stat-value" id="val-intervalle"></span></div>' +
    '</div>' +
    '<div class="stats">' +
    '<div class="stat stat-reel"><span class="stat-label">réel</span><span class="stat-value" id="val-reel"></span></div>' +
    '<div class="stat stat-garanti"><span class="stat-label">garanti (au moins)</span><span class="stat-value" id="val-garanti"></span></div>' +
    '</div>' +
    '<p class="verdict" id="verdict" aria-live="polite"></p>';

  class TchebychevGarantieWidgetClass extends HTMLElement {
    constructor() {
      super();
      var shadow = this.attachShadow({ mode: "open" });
      shadow.appendChild(TEMPLATE.content.cloneNode(true));
      this._serie = "cloche";
      this._k = K_DEFAUT;
      this._svg = shadow.getElementById("svg");
      this._select = shadow.getElementById("serie");
      this._inputK = shadow.getElementById("k");
      this._valeurK = shadow.getElementById("k-valeur");
      this._valMoyenne = shadow.getElementById("val-moyenne");
      this._valSigma = shadow.getElementById("val-sigma");
      this._valIntervalle = shadow.getElementById("val-intervalle");
      this._valReel = shadow.getElementById("val-reel");
      this._valGaranti = shadow.getElementById("val-garanti");
      this._verdict = shadow.getElementById("verdict");
      var select = this._select;
      ORDRE_SERIES.forEach(function (cle) {
        var opt = document.createElement("option");
        opt.value = cle;
        opt.textContent = SERIES[cle].label;
        select.appendChild(opt);
      });
    }

    connectedCallback() {
      var self = this;
      this._onSerie = function () { self._serie = self._select.value; self._rendre(); };
      this._onK = function () { self._k = Math.round(parseFloat(self._inputK.value) * 10) / 10; self._rendre(); };
      this._select.addEventListener("change", this._onSerie);
      this._inputK.addEventListener("input", this._onK);
      this._rendre();
    }

    disconnectedCallback() {
      this._select.removeEventListener("change", this._onSerie);
      this._inputK.removeEventListener("input", this._onK);
    }

    _rendre() {
      var valeurs = SERIES[this._serie].valeurs;
      var p = parametres(valeurs);
      var k = this._k;
      var a = p.moyenne - k * p.ecartType, b = p.moyenne + k * p.ecartType;
      var dedans = valeurs.filter(function (v) { return v >= a && v <= b; }).length;
      var reel = dedans / p.n * 100;
      var garanti = garantiePourcent(k);

      this._valeurK.textContent = formatNombreFr(k, 1);
      this._valMoyenne.textContent = formatNombreFr(p.moyenne, 2);
      this._valSigma.textContent = formatNombreFr(p.ecartType, 2);
      // Bornes arrondies VERS L'EXTÉRIEUR (la garantie reste vraie), comme dans le chapitre.
      this._valIntervalle.textContent = "[" + formatNombreFr(Math.floor(a * 10) / 10, 1) + " ; " + formatNombreFr(Math.ceil(b * 10) / 10, 1) + "]";
      this._valReel.textContent = formatNombreFr(reel, 1) + " % (" + dedans + "/" + p.n + ")";
      this._valGaranti.textContent = formatNombreFr(garanti, 1) + " %";
      this._verdict.textContent =
        "Réel : " + formatNombreFr(reel, 1) + " % ≥ garanti : " + formatNombreFr(garanti, 1) + " %. " +
        (reel - garanti >= 20
          ? "La garantie tient, et la série la dépasse largement : Bienaymé-Tchebychev donne un minimum, souvent pessimiste."
          : "La garantie tient, quelle que soit la forme de la série.");

      var svg = this._svg;
      svg.innerHTML = "";
      var defs = svgEl("defs", {});
      var marqueur = svgEl("marker", { id: "fleche", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" });
      marqueur.appendChild(svgEl("path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche" }));
      defs.appendChild(marqueur);
      svg.appendChild(defs);

      // Bande [x̄ − kσ ; x̄ + kσ], coupée aux bords de la fenêtre fixe.
      var aVisible = Math.max(a, X_MIN), bVisible = Math.min(b, X_MAX);
      svg.appendChild(svgEl("rect", {
        x: xPx(aVisible).toFixed(2), y: Y_HAUT_BANDE, width: Math.max(xPx(bVisible) - xPx(aVisible), 0).toFixed(2),
        height: Y_AXE - Y_HAUT_BANDE, class: "bande",
      }));

      svg.appendChild(svgEl("line", { x1: xPx(X_MIN) - 6, x2: xPx(X_MAX) + 14, y1: Y_AXE, y2: Y_AXE, class: "axe", "marker-end": "url(#fleche)" }));
      for (var t = X_MIN; t <= X_MAX; t += 5) {
        var px = xPx(t);
        svg.appendChild(svgEl("line", { x1: px.toFixed(2), x2: px.toFixed(2), y1: Y_AXE - 4, y2: Y_AXE + 4, class: "tick" }));
        var et = svgEl("text", { x: px.toFixed(2), y: Y_AXE + 18, "text-anchor": "middle", class: "etiquette-tick" });
        et.textContent = String(t);
        svg.appendChild(et);
      }

      var pxMoy = xPx(p.moyenne);
      svg.appendChild(svgEl("line", { x1: pxMoy.toFixed(2), x2: pxMoy.toFixed(2), y1: Y_HAUT_BANDE - 2, y2: Y_AXE, class: "repere-moyenne" }));
      var etMoy = svgEl("text", { x: pxMoy.toFixed(2), y: Y_HAUT_BANDE - 7, "text-anchor": "middle", class: "etiquette-moyenne" });
      etMoy.textContent = "x̄";
      svg.appendChild(etMoy);

      // Bornes sous l'axe : la gauche ancrée vers la gauche, la droite vers la droite (jamais
      // superposées) ; une borne hors fenêtre est signalée par une flèche au bord.
      var yBornes = Y_AXE + 40;
      var gaucheHors = a < X_MIN, droiteHors = b > X_MAX;
      var texteA = (gaucheHors ? "← " : "") + "x̄ − kσ = " + formatNombreFr(Math.floor(a * 10) / 10, 1);
      var texteB = "x̄ + kσ = " + formatNombreFr(Math.ceil(b * 10) / 10, 1) + (droiteHors ? " →" : "");
      var largeurA = texteA.length * 6.7, largeurB = texteB.length * 6.7;
      // Borne gauche : texte qui FINIT sur la borne, sauf s'il sortirait du cadre (alors il commence au bord).
      var xA = gaucheHors ? 4 : xPx(a);
      var ancreA = gaucheHors || xA - largeurA < 4 ? "start" : "end";
      if (ancreA === "start") xA = Math.max(4, Math.min(xA, LARGEUR - 4 - largeurA));
      // Borne droite : texte qui COMMENCE sur la borne, sauf s'il sortirait du cadre.
      var xB = droiteHors ? LARGEUR - 4 : xPx(b);
      var ancreB = droiteHors || xB + largeurB > LARGEUR - 4 ? "end" : "start";
      if (ancreB === "end") xB = Math.min(LARGEUR - 4, Math.max(xB, 4 + largeurB));
      var etA = svgEl("text", { x: xA.toFixed(2), y: yBornes, "text-anchor": ancreA, class: "etiquette-borne" });
      etA.textContent = texteA;
      svg.appendChild(etA);
      var etB = svgEl("text", { x: xB.toFixed(2), y: yBornes + 15, "text-anchor": ancreB, class: "etiquette-borne" });
      etB.textContent = texteB;
      svg.appendChild(etB);

      var vus = {};
      valeurs.forEach(function (v) {
        var cle = String(v);
        vus[cle] = (vus[cle] || 0) + 1;
        var cy = Y_AXE - 9 - (vus[cle] - 1) * ECART_PILE;
        svg.appendChild(svgEl("circle", {
          cx: xPx(v).toFixed(2), cy: cy.toFixed(2), r: R_POINT,
          class: v >= a && v <= b ? "point-dedans" : "point-dehors",
        }));
      });
    }
  }

  if (!customElements.get("tchebychev-garantie-widget")) {
    customElements.define("tchebychev-garantie-widget", TchebychevGarantieWidgetClass);
  }
})();
