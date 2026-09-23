(function () {
  "use strict";

  /* ================================================================
   * <comparaison-suites-widget> — atelier interactif : curseurs A1/rA
   * (ville A, arithmétique) et B1/qB (ville B, géométrique), balayage
   * numérique en direct sur 20 ans, repère le VRAI rang de bascule (celui
   * où la condition devient vraie ET où elle était fausse au rang
   * précédent — le premier piège de l'Attention) et affiche la conclusion
   * traduite en année (le second piège). Reprend exactement les tons
   * good/accent de l'illustration statique déjà présente dans cette
   * section. Web Component (Shadow DOM).
   * ================================================================ */

  var ANNEE_DEPART = 2020;
  var N_ANNEES = 20;
  var DEFAUT = { a1: 50000, ra: 2000, b1: 30000, qbPct: 8 };
  var BORNES_A1 = { min: 20000, max: 80000, step: 5000 };
  var BORNES_RA = { min: 500, max: 4000, step: 500 };
  var BORNES_B1 = { min: 10000, max: 60000, step: 5000 };
  var BORNES_QB = { min: 1, max: 15, step: 0.5 };

  // Fenêtre FIXE (jamais recalculée depuis A1/rA/B1/qB) : couvre largement le scénario de
  // démonstration (A atteint 88 000, B atteint ≈124 700 sur 20 ans) ; au-delà, les points sortent
  // de la fenêtre et sont simplement clippés.
  var LARGEUR = 460, HAUTEUR = 300, MARGE_G = 48, MARGE_D = 20, MARGE_H = 18, MARGE_B = 34;
  var Y_MIN = 0, Y_MAX = 250000;

  function formatEntierFr(n) {
    var s = Math.round(n).toString();
    var out = "";
    for (var i = 0; i < s.length; i++) {
      if (i > 0 && (s.length - i) % 3 === 0) out += " ";
      out += s[i];
    }
    return out;
  }
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
    '.formule{text-align:center;font-family:var(--serif,serif);font-style:italic;font-size:0.98rem;font-weight:600;color:var(--ink,#241f1a);margin:0 0 12px;}' +
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:14px;}' +
    'svg{width:100%;max-width:460px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.4;}' +
    '.fleche{fill:var(--ink-soft,#6b6055);}' +
    '.connecteur-a{stroke:var(--good,#2f7a4f);stroke-width:1.8;fill:none;}' +
    '.connecteur-b{stroke:var(--accent,#a8471f);stroke-width:1.8;fill:none;}' +
    '.point-a{fill:var(--good,#2f7a4f);}' +
    '.point-b{fill:var(--accent,#a8471f);}' +
    '.point-bascule{fill:var(--plan,#5b4ea3);}' +
    '.guide-bascule{stroke:var(--plan,#5b4ea3);stroke-width:1.4;stroke-dasharray:4 3;}' +
    '.etiquette-bascule{font-size:11.5px;font-weight:700;fill:var(--plan,#5b4ea3);font-family:var(--sans,sans-serif);}' +
    '.etiquette{font-size:11px;fill:var(--ink-soft,#6b6055);font-family:var(--sans,sans-serif);}' +
    '.legende{font-size:11.5px;font-weight:600;font-family:var(--sans,sans-serif);}' +
    '.legende-a{fill:var(--good,#2f7a4f);}' +
    '.legende-b{fill:var(--accent,#a8471f);}' +
    '.verdict{text-align:center;font-size:0.88rem;font-weight:600;margin:0 0 18px;padding:10px 14px;border-radius:var(--radius,3px);color:var(--plan,#5b4ea3);background:var(--surface-2,#faf6f0);}' +
    '.controles{display:flex;flex-direction:column;gap:12px;}' +
    '.curseur{display:flex;flex-direction:column;gap:6px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;}' +
    '.curseur.ville-a label{color:var(--good,#2f7a4f);}' +
    '.curseur.ville-b label{color:var(--accent-ink,#7a3212);}' +
    '.curseur-row{display:flex;align-items:center;gap:12px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;accent-color:var(--accent,#a8471f);}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:70px;text-align:right;font-size:0.92rem;}' +
    '.btn-reset{margin-top:2px;padding:8px 14px;border-radius:var(--radius,3px);border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font-weight:600;cursor:pointer;font-size:0.88rem;font-family:inherit;align-self:center;}' +
    '.btn-reset:hover{background:var(--accent-soft-line,#e8c4a4);}' +
    '</style>' +
    '<p class="formule" id="formule"></p>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" xmlns="http://www.w3.org/2000/svg"></svg></div>' +
    '<p class="verdict" id="verdict"></p>' +
    '<div class="controles">' +
    '<div class="curseur ville-a"><label for="a1">Ville A — population initiale</label><div class="curseur-row">' +
    '<input type="range" id="a1" min="' + BORNES_A1.min + '" max="' + BORNES_A1.max + '" step="' + BORNES_A1.step + '" value="' + DEFAUT.a1 + '">' +
    '<span class="curseur-valeur" id="a1-valeur"></span></div></div>' +
    '<div class="curseur ville-a"><label for="ra">Ville A — croissance (+hab./an)</label><div class="curseur-row">' +
    '<input type="range" id="ra" min="' + BORNES_RA.min + '" max="' + BORNES_RA.max + '" step="' + BORNES_RA.step + '" value="' + DEFAUT.ra + '">' +
    '<span class="curseur-valeur" id="ra-valeur"></span></div></div>' +
    '<div class="curseur ville-b"><label for="b1">Ville B — population initiale</label><div class="curseur-row">' +
    '<input type="range" id="b1" min="' + BORNES_B1.min + '" max="' + BORNES_B1.max + '" step="' + BORNES_B1.step + '" value="' + DEFAUT.b1 + '">' +
    '<span class="curseur-valeur" id="b1-valeur"></span></div></div>' +
    '<div class="curseur ville-b"><label for="qb">Ville B — croissance (%/an)</label><div class="curseur-row">' +
    '<input type="range" id="qb" min="' + BORNES_QB.min + '" max="' + BORNES_QB.max + '" step="' + BORNES_QB.step + '" value="' + DEFAUT.qbPct + '">' +
    '<span class="curseur-valeur" id="qb-valeur"></span></div></div>' +
    '<button class="btn-reset" id="reset" type="button">Réinitialiser</button>' +
    '</div>';

  class ComparaisonSuitesWidgetClass extends HTMLElement {
    constructor() {
      super();
      this._init();
    }
  }

  ComparaisonSuitesWidgetClass.prototype._init = function () {
    var shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this._a1 = DEFAUT.a1;
    this._ra = DEFAUT.ra;
    this._b1 = DEFAUT.b1;
    this._qbPct = DEFAUT.qbPct;
    this._formule = shadow.getElementById("formule");
    this._svg = shadow.getElementById("svg");
    this._verdict = shadow.getElementById("verdict");
    this._inputA1 = shadow.getElementById("a1");
    this._inputRa = shadow.getElementById("ra");
    this._inputB1 = shadow.getElementById("b1");
    this._inputQb = shadow.getElementById("qb");
    this._valeurA1 = shadow.getElementById("a1-valeur");
    this._valeurRa = shadow.getElementById("ra-valeur");
    this._valeurB1 = shadow.getElementById("b1-valeur");
    this._valeurQb = shadow.getElementById("qb-valeur");
    this._resetBtn = shadow.getElementById("reset");
  };

  ComparaisonSuitesWidgetClass.prototype.connectedCallback = function () {
    var self = this;
    this._onInputA1 = function () { self._a1 = parseFloat(self._inputA1.value); self._rendre(); };
    this._onInputRa = function () { self._ra = parseFloat(self._inputRa.value); self._rendre(); };
    this._onInputB1 = function () { self._b1 = parseFloat(self._inputB1.value); self._rendre(); };
    this._onInputQb = function () { self._qbPct = parseFloat(self._inputQb.value); self._rendre(); };
    this._onReset = function () {
      self._a1 = DEFAUT.a1; self._ra = DEFAUT.ra; self._b1 = DEFAUT.b1; self._qbPct = DEFAUT.qbPct;
      self._inputA1.value = String(DEFAUT.a1);
      self._inputRa.value = String(DEFAUT.ra);
      self._inputB1.value = String(DEFAUT.b1);
      self._inputQb.value = String(DEFAUT.qbPct);
      self._rendre();
    };
    this._inputA1.addEventListener("input", this._onInputA1);
    this._inputRa.addEventListener("input", this._onInputRa);
    this._inputB1.addEventListener("input", this._onInputB1);
    this._inputQb.addEventListener("input", this._onInputQb);
    this._resetBtn.addEventListener("click", this._onReset);
    this._rendre();
  };

  ComparaisonSuitesWidgetClass.prototype.disconnectedCallback = function () {
    this._inputA1.removeEventListener("input", this._onInputA1);
    this._inputRa.removeEventListener("input", this._onInputRa);
    this._inputB1.removeEventListener("input", this._onInputB1);
    this._inputQb.removeEventListener("input", this._onInputQb);
    this._resetBtn.removeEventListener("click", this._onReset);
  };

  ComparaisonSuitesWidgetClass.prototype._toPx = function (n) {
    return MARGE_G + ((n - 1) / (N_ANNEES - 1)) * (LARGEUR - MARGE_G - MARGE_D);
  };
  ComparaisonSuitesWidgetClass.prototype._toPy = function (v) {
    var vClamp = Math.max(Y_MIN, Math.min(Y_MAX, v));
    return HAUTEUR - MARGE_B - ((vClamp - Y_MIN) / (Y_MAX - Y_MIN)) * (HAUTEUR - MARGE_H - MARGE_B);
  };

  ComparaisonSuitesWidgetClass.prototype._rendre = function () {
    var a1 = this._a1, ra = this._ra, b1 = this._b1, qb = 1 + this._qbPct / 100;

    this._formule.textContent = "A_n = " + formatEntierFr(a1) + " + (n−1)×" + formatEntierFr(ra) + "   ;   B_n = " + formatEntierFr(b1) + "×" + formatNombreFr(qb, 2) + "^(n−1)";
    this._valeurA1.textContent = formatEntierFr(a1);
    this._valeurRa.textContent = formatEntierFr(ra);
    this._valeurB1.textContent = formatEntierFr(b1);
    this._valeurQb.textContent = formatNombreFr(this._qbPct, 1) + " %";

    var Avals = [], Bvals = [];
    var rangBascule = -1;
    for (var i = 0; i < N_ANNEES; i++) {
      var n = i + 1;
      var A = a1 + (n - 1) * ra;
      var B = b1 * Math.pow(qb, n - 1);
      Avals.push(A);
      Bvals.push(B);
      if (rangBascule === -1 && B > A) rangBascule = n;
    }

    if (rangBascule === -1) {
      this._verdict.textContent = "Sur les " + N_ANNEES + " ans affichés, B ne dépasse jamais A.";
    } else {
      var anneeBascule = ANNEE_DEPART + rangBascule - 1;
      var anneePrecedente = anneeBascule - 1;
      this._verdict.textContent =
        "Bascule au rang n=" + rangBascule + " (année " + anneeBascule + ") — vérifié : au rang n=" +
        (rangBascule - 1) + " (année " + anneePrecedente + "), B était encore ≤ A. B dépasse donc A à partir de " + anneeBascule + ".";
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

    var zeroY = self._toPy(0);
    svg.appendChild(svgEl(ns, "line", { x1: MARGE_G, x2: LARGEUR - MARGE_D + 8, y1: zeroY.toFixed(2), y2: zeroY.toFixed(2), class: "axe", "marker-end": "url(#fleche)" }));
    svg.appendChild(svgEl(ns, "line", { x1: MARGE_G, x2: MARGE_G, y1: HAUTEUR - MARGE_B, y2: MARGE_H - 8, class: "axe", "marker-end": "url(#fleche)" }));
    var etiqX = svgEl(ns, "text", { x: LARGEUR - MARGE_D + 10, y: HAUTEUR - MARGE_B + 16, "text-anchor": "end", class: "etiquette" });
    etiqX.textContent = "année";
    svg.appendChild(etiqX);
    var etiqY = svgEl(ns, "text", { x: MARGE_G + 6, y: MARGE_H - 10, class: "etiquette" });
    etiqY.textContent = "habitants";
    svg.appendChild(etiqY);

    function dessinerSerie(valeurs, classeLigne, classePoint) {
      var d = "";
      valeurs.forEach(function (v, i) {
        var x = self._toPx(i + 1), y = self._toPy(v);
        d += (i === 0 ? "M" : "L") + x.toFixed(2) + " " + y.toFixed(2) + " ";
      });
      svg.appendChild(svgEl(ns, "path", { d: d.trim(), class: classeLigne }));
      valeurs.forEach(function (v, i) {
        if (v < Y_MIN - 1 || v > Y_MAX + 1) return;
        if (i % 3 !== 0 && i !== valeurs.length - 1) return; // 1 point sur 3 + le dernier, pour rester lisible sur 20 ans
        var x = self._toPx(i + 1), y = self._toPy(v);
        svg.appendChild(svgEl(ns, "circle", { cx: x.toFixed(2), cy: y.toFixed(2), r: 3.6, class: classePoint }));
      });
    }
    dessinerSerie(Avals, "connecteur-a", "point-a");
    dessinerSerie(Bvals, "connecteur-b", "point-b");

    // Étiquettes des axes : une année sur 4 (2020, 2024, 2028...) pour rester lisible.
    for (var k = 0; k < N_ANNEES; k += 4) {
      var xTick = self._toPx(k + 1);
      var etAn = svgEl(ns, "text", { x: xTick.toFixed(2), y: (HAUTEUR - MARGE_B + 16).toFixed(2), "text-anchor": "middle", class: "etiquette" });
      etAn.textContent = String(ANNEE_DEPART + k);
      svg.appendChild(etAn);
    }

    if (rangBascule !== -1) {
      var xB = self._toPx(rangBascule), yB = self._toPy(Bvals[rangBascule - 1]);
      svg.appendChild(svgEl(ns, "line", { x1: xB.toFixed(2), x2: xB.toFixed(2), y1: (HAUTEUR - MARGE_B).toFixed(2), y2: yB.toFixed(2), class: "guide-bascule" }));
      svg.appendChild(svgEl(ns, "circle", { cx: xB.toFixed(2), cy: yB.toFixed(2), r: 5.5, class: "point-bascule" }));
      var etB = svgEl(ns, "text", { x: xB.toFixed(2), y: (yB - 10).toFixed(2), "text-anchor": "middle", class: "etiquette-bascule" });
      etB.textContent = "bascule : " + (ANNEE_DEPART + rangBascule - 1);
      svg.appendChild(etB);
    }

    var legA = svgEl(ns, "text", { x: MARGE_G + 4, y: MARGE_H + 6, class: "legende legende-a" });
    legA.textContent = "A (arithmétique)";
    svg.appendChild(legA);
    var legB = svgEl(ns, "text", { x: MARGE_G + 4, y: MARGE_H + 20, class: "legende legende-b" });
    legB.textContent = "B (géométrique)";
    svg.appendChild(legB);
  };

  if (!customElements.get("comparaison-suites-widget")) {
    customElements.define("comparaison-suites-widget", ComparaisonSuitesWidgetClass);
  }
})();
