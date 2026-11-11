(function () {
  "use strict";

  /* ================================================================
   * <signe-produit-widget> — atelier interactif, trois modes :
   * - « Produit » (défaut) : 2 ou 3 facteurs du premier degré (x − rᵢ) à racine
   *   réglable, grille de signes construite en direct (une ligne par facteur + la
   *   ligne produit), courbe colorée selon l'ensemble-solution, symbole ◇. Reprend
   *   par défaut l'exemple (x−1)·x·(x−3) > 0 résolu dans la section.
   * - « Quotient » : chaque facteur peut passer au dénominateur ; la colonne de sa
   *   racine est marquée ∄ (double barre), la courbe a une asymptote verticale, et S
   *   exclut toujours ces valeurs, même avec ≤/≥. Défaut : (x − 2)/(x + 1) ≥ 0, l'exemple
   *   de la section « Inéquations rationnelles ».
   * - « Piège : produit en croix » : (x − r₁)/(x − r₂) ◇ k. À gauche, la méthode FAUSSE
   *   (multiplier les deux membres par le dénominateur sans regarder son signe) ; à
   *   droite, la bonne (tout à gauche, même dénominateur, tableau). Les x où le
   *   dénominateur est négatif — là où le sens aurait dû s'inverser — sont colorés.
   * Web Component (Shadow DOM).
   * ================================================================ */

  var DEFAUT = { r1: 0, r2: 1, r3: 3, trois: true, symbole: "gt" };
  var DEFAUT_QUOTIENT = { r1: 2, r2: -1, r3: 3, trois: false, symbole: "ge", den: [false, true, false] };
  var DEFAUT_PIEGE = { r1: 0, r2: 1, k: 2, symbole: "le" };
  var BORNES_R = { min: -6, max: 6, step: 0.5 };
  var BORNES_K = { min: -3, max: 3, step: 1 };
  var X_MIN = -7, X_MAX = 7;
  var LARGEUR = 420, HAUTEUR = 260, MARGE = 32;
  var SYMBOLE_TEXTE = { gt: ">", ge: "≥", lt: "<", le: "≤" };

  function nombreCourt(n) {
    var arrondi = Math.round(n * 100) / 100;
    if (Math.abs(arrondi) < 1e-12) arrondi = 0;
    var t = String(arrondi);
    if (t.indexOf("e") >= 0) t = arrondi.toFixed(2);
    return t.replace(".", ",").replace("-", "−");
  }

  function pgcd(a, b) { while (b) { var t = a % b; a = b; b = t; } return a || 1; }

  // Borne exacte : entier, décimal court, ou fraction p/q (dénominateur ≤ 12).
  function nombreExact(v) {
    for (var d = 1; d <= 12; d++) {
      var num = Math.round(v * d);
      if (Math.abs(num / d - v) < 1e-9) {
        var g = pgcd(Math.abs(num), d), p = num / g, q = d / g;
        if (q === 1) return nombreCourt(p);
        if (Math.abs(Math.round((p / q) * 100) / 100 - p / q) < 1e-9) return nombreCourt(p / q);
        return (p < 0 ? "−" : "") + Math.abs(p) + "/" + q;
      }
    }
    return nombreCourt(v);
  }

  function svgEl(ns, tag, attrs) {
    var el = document.createElementNS(ns, tag);
    for (var key in attrs) el.setAttribute(key, attrs[key]);
    return el;
  }

  function labelFacteur(r) {
    if (Math.abs(r) < 1e-9) return "x";
    return "x " + (r > 0 ? "− " + nombreExact(r) : "+ " + nombreExact(-r));
  }

  // « (x − 2) », mais « x » seul sans parenthèses.
  function facteurParen(r) {
    var l = labelFacteur(r);
    return l === "x" ? "x" : "(" + l + ")";
  }

  function borneTexte(v) {
    if (v === -Infinity) return "−∞";
    if (v === Infinity) return "+∞";
    return nombreExact(v);
  }

  /* Ensemble-solution générique de « g(x) ◇ 0 » : `points` = valeurs critiques triées, chacune
   * { x, statut: "zero" | "indef" } ; le signe de g est évalué au milieu de chaque intervalle.
   * Un point « zéro » est inclus seulement pour ≤/≥ ; un point « indéfini » n'est JAMAIS inclus. */
  function ensembleSolution(g, points, symbole) {
    var large = symbole === "ge" || symbole === "le";
    var veutPositif = symbole === "gt" || symbole === "ge";
    var bornes = [-Infinity].concat(points.map(function (p) { return p.x; })).concat([Infinity]);
    // Suite ordonnée : intervalle₀, point₀, intervalle₁, point₁, …, intervalleₙ.
    var elements = [];
    for (var i = 0; i < bornes.length - 1; i++) {
      var lo = bornes[i], hi = bornes[i + 1];
      var mid = lo === -Infinity ? hi - 3 : hi === Infinity ? lo + 3 : (lo + hi) / 2;
      var v = g(mid);
      elements.push({ type: "intervalle", lo: lo, hi: hi, ok: isFinite(v) && Math.abs(v) > 1e-12 && (v > 0) === veutPositif });
      if (i < points.length) elements.push({ type: "point", x: points[i].x, ok: points[i].statut === "zero" && large });
    }
    // Séquences maximales d'éléments retenus consécutifs.
    var morceaux = [], courant = null;
    elements.forEach(function (e) {
      if (e.ok) { if (!courant) courant = []; courant.push(e); }
      else if (courant) { morceaux.push(courant); courant = null; }
    });
    if (courant) morceaux.push(courant);
    if (!morceaux.length) return "S = ∅";
    var textes = morceaux.map(function (m) {
      if (m.length === 1 && m[0].type === "point") return "{" + borneTexte(m[0].x) + "}";
      var premier = m[0], dernier = m[m.length - 1];
      var lo = premier.type === "point" ? premier.x : premier.lo;
      var hi = dernier.type === "point" ? dernier.x : dernier.hi;
      if (lo === -Infinity && hi === Infinity) return "ℝ";
      var ouvrant = premier.type === "point" ? "[" : "]";
      var fermant = dernier.type === "point" ? "]" : "[";
      return ouvrant + borneTexte(lo) + " ; " + borneTexte(hi) + fermant;
    });
    if (textes.length === 1 && textes[0] === "ℝ") return "S = ℝ";
    // ℝ privé de valeurs isolées : ]−∞ ; a[ ∪ ]a ; +∞[ s'écrit aussi ℝ \ {a} (on garde la forme du cours).
    return "S = " + textes.join(" ∪ ");
  }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' +
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);}' +
    '*{box-sizing:border-box;}' +
    '[hidden]{display:none !important;}' +
    '.modes{display:flex;justify-content:center;gap:8px;margin-bottom:14px;flex-wrap:wrap;}' +
    '.modes button{min-height:44px;padding:8px 12px;border-radius:var(--radius,3px);border:1px solid var(--line,#e2d8c8);background:var(--surface,#fff);color:var(--ink,#241f1a);font-weight:600;font-family:inherit;font-size:0.88rem;cursor:pointer;}' +
    '.modes button[aria-pressed="true"]{background:var(--accent-soft,#f6e2d3);border-color:var(--accent-soft-line,#e8c4a4);color:var(--accent-ink,#7a3212);}' +
    '.formule-row{display:flex;align-items:center;justify-content:center;gap:10px;flex-wrap:wrap;margin-bottom:14px;}' +
    '.formule{font-family:var(--serif,serif);font-style:italic;font-size:1.1rem;font-weight:600;color:var(--ink,#241f1a);text-align:center;}' +
    '.formule-row select{min-height:44px;font-family:inherit;font-size:1.05rem;font-weight:700;color:var(--accent-ink,#7a3212);background:var(--surface,#fff);border:1px solid var(--line,#e2d8c8);border-radius:var(--radius,3px);padding:3px 8px;cursor:pointer;}' +
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:12px;}' +
    'svg{width:100%;max-width:420px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.4;}' +
    '.fleche{fill:var(--ink-soft,#6b6055);}' +
    '.segment-pos{stroke:var(--good,#2f7a4f);stroke-width:2.4;fill:none;}' +
    '.segment-neg{stroke:var(--bad,#a8322f);stroke-width:2.4;fill:none;}' +
    '.asymptote{stroke:var(--ink-faint,#9c9083);stroke-width:1.3;stroke-dasharray:5 4;}' +
    '.ligne-k{stroke:var(--plan,#6b4fa3);stroke-width:1.4;stroke-dasharray:6 4;}' +
    '.bande-dneg{fill:var(--bad,#a8322f);opacity:0.10;}' +
    '.racine{fill:var(--ink,#241f1a);}' +
    '.trou{fill:var(--surface-2,#faf6f0);stroke:var(--ink,#241f1a);stroke-width:1.6;}' +
    '.etiquette{font-size:12px;fill:var(--ink-soft,#6b6055);font-family:var(--sans,sans-serif);}' +
    '.etiquette-k{font-size:11.5px;font-weight:600;fill:var(--plan,#6b4fa3);font-family:var(--mono,monospace);}' +
    '.etiquette-bande{font-size:11px;font-weight:600;fill:var(--bad,#a8322f);font-family:var(--sans,sans-serif);}' +
    '.table-zone{margin-bottom:14px;overflow-x:auto;}' +
    'table.grille{border-collapse:collapse;font-family:var(--mono,monospace);font-size:12.5px;margin:0 auto;}' +
    'table.grille th,table.grille td{border:1px solid var(--line,#e2d8c8);padding:6px 9px;text-align:center;min-width:30px;}' +
    'table.grille th{background:var(--surface-2,#faf6f0);color:var(--ink-faint,#9c9083);font-weight:500;}' +
    'table.grille td.rowlabel{text-align:left;font-family:var(--sans,sans-serif);font-weight:600;color:var(--ink-soft,#6b6055);background:var(--surface-2,#faf6f0);white-space:nowrap;}' +
    'table.grille tr.produit td.rowlabel{color:var(--accent-ink,#7a3212);}' +
    'table.grille td.pos{color:var(--good,#2f7a4f);font-weight:700;}' +
    'table.grille td.neg{color:var(--bad,#a8322f);font-weight:700;}' +
    'table.grille td.zero{color:var(--ink-faint,#9c9083);}' +
    'table.grille td.indef{color:var(--ink,#241f1a);font-weight:700;letter-spacing:-1px;}' +
    'table.grille tr.produit td.pos,table.grille tr.produit td.neg{font-size:1.05em;}' +
    '.solution{text-align:center;font-family:var(--mono,monospace);font-size:0.98rem;font-weight:700;color:var(--accent-ink,#7a3212);margin:0 0 10px;}' +
    '.note{text-align:center;font-size:0.88rem;color:var(--ink-soft,#6b6055);margin:0 0 16px;}' +
    '.piege-zone{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px;}' +
    '@media (max-width:520px){.piege-zone{grid-template-columns:1fr;}}' +
    '.piege-carte{border:1px solid var(--line,#e2d8c8);border-radius:var(--radius,3px);padding:10px 12px;background:var(--surface,#fff);font-size:0.88rem;line-height:1.45;}' +
    '.piege-carte h4{margin:0 0 6px;font-size:0.9rem;}' +
    '.piege-carte.faux{border-color:var(--bad,#a8322f);}' +
    '.piege-carte.faux h4{color:var(--bad,#a8322f);}' +
    '.piege-carte.juste{border-color:var(--good,#2f7a4f);}' +
    '.piege-carte.juste h4{color:var(--good,#2f7a4f);}' +
    '.piege-carte .ens{font-family:var(--mono,monospace);font-weight:700;display:block;margin-top:6px;}' +
    '.controles{display:flex;flex-direction:column;gap:12px;}' +
    '.curseur{display:flex;flex-direction:column;gap:6px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3212);}' +
    '.curseur-row{display:flex;align-items:center;gap:12px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;min-height:44px;accent-color:var(--accent,#a8471f);}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:56px;text-align:right;font-size:0.92rem;}' +
    '.case{display:flex;align-items:center;justify-content:center;gap:7px;font-weight:600;font-size:0.92rem;cursor:pointer;min-height:44px;}' +
    '.case input[type="checkbox"]{width:18px;height:18px;cursor:pointer;accent-color:var(--accent,#a8471f);}' +
    '.curseur label.case-den{justify-content:flex-start;font-family:var(--sans,sans-serif);font-style:normal;font-weight:500;font-size:0.86rem;color:var(--ink-soft,#6b6055);min-height:44px;}' +
    '.btn-reset{margin-top:2px;min-height:44px;padding:8px 14px;border-radius:var(--radius,3px);border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font-weight:600;cursor:pointer;font-size:0.88rem;font-family:inherit;align-self:center;}' +
    '.btn-reset:hover{background:var(--accent-soft-line,#e8c4a4);}' +
    '</style>' +
    '<div class="modes"><button type="button" data-mode="produit" aria-pressed="true">Produit</button>' +
    '<button type="button" data-mode="quotient" aria-pressed="false">Quotient</button>' +
    '<button type="button" data-mode="piege" aria-pressed="false">Piège : produit en croix</button></div>' +
    '<div class="formule-row"><span class="formule" id="formule"></span>' +
    '<select id="symbole">' +
    '<option value="gt">&gt;</option>' +
    '<option value="ge">&ge;</option>' +
    '<option value="lt">&lt;</option>' +
    '<option value="le">&le;</option>' +
    '</select><span class="formule" id="second-membre"></span></div>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" xmlns="http://www.w3.org/2000/svg"></svg></div>' +
    '<div class="piege-zone" id="piege-zone" hidden>' +
    '<div class="piege-carte faux"><h4>Méthode fausse : multiplier par le dénominateur</h4><div id="piege-faux"></div></div>' +
    '<div class="piege-carte juste"><h4>Bonne méthode : tout à gauche, même dénominateur</h4><div id="piege-juste"></div></div>' +
    '</div>' +
    '<div id="zone-tableau"></div>' +
    '<p class="solution" id="solution"></p>' +
    '<p class="note" id="note"></p>' +
    '<div class="controles">' +
    '<div class="curseur"><label for="r1" id="label-r1">racine du 1er facteur</label><div class="curseur-row">' +
    '<input type="range" id="r1" min="' + BORNES_R.min + '" max="' + BORNES_R.max + '" step="' + BORNES_R.step + '" value="' + DEFAUT.r1 + '">' +
    '<span class="curseur-valeur" id="r1-valeur"></span></div>' +
    '<label class="case case-den" id="den1-wrap"><input type="checkbox" id="den1">au dénominateur</label></div>' +
    '<div class="curseur"><label for="r2" id="label-r2">racine du 2e facteur</label><div class="curseur-row">' +
    '<input type="range" id="r2" min="' + BORNES_R.min + '" max="' + BORNES_R.max + '" step="' + BORNES_R.step + '" value="' + DEFAUT.r2 + '">' +
    '<span class="curseur-valeur" id="r2-valeur"></span></div>' +
    '<label class="case case-den" id="den2-wrap"><input type="checkbox" id="den2">au dénominateur</label></div>' +
    '<label class="case" id="case3-wrap"><input type="checkbox" id="case-3" checked>3 facteurs</label>' +
    '<div class="curseur" id="bloc-r3"><label for="r3">racine du 3e facteur</label><div class="curseur-row">' +
    '<input type="range" id="r3" min="' + BORNES_R.min + '" max="' + BORNES_R.max + '" step="' + BORNES_R.step + '" value="' + DEFAUT.r3 + '">' +
    '<span class="curseur-valeur" id="r3-valeur"></span></div>' +
    '<label class="case case-den" id="den3-wrap"><input type="checkbox" id="den3">au dénominateur</label></div>' +
    '<div class="curseur" id="bloc-k" hidden><label for="k">second membre k</label><div class="curseur-row">' +
    '<input type="range" id="k" min="' + BORNES_K.min + '" max="' + BORNES_K.max + '" step="' + BORNES_K.step + '" value="' + DEFAUT_PIEGE.k + '">' +
    '<span class="curseur-valeur" id="k-valeur"></span></div></div>' +
    '<button class="btn-reset" id="reset" type="button">Réinitialiser</button>' +
    '</div>';

  class SigneProduitWidgetClass extends HTMLElement {
    constructor() {
      super();
      this._init();
    }
  }

  SigneProduitWidgetClass.prototype._init = function () {
    var shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    var $ = function (id) { return shadow.getElementById(id); };
    this._svg = $("svg");
    this._formule = $("formule");
    this._secondMembre = $("second-membre");
    this._selectSymbole = $("symbole");
    this._zoneTableau = $("zone-tableau");
    this._solution = $("solution");
    this._note = $("note");
    this._piegeZone = $("piege-zone");
    this._piegeFaux = $("piege-faux");
    this._piegeJuste = $("piege-juste");
    this._inputR = [$("r1"), $("r2"), $("r3")];
    this._valeurR = [$("r1-valeur"), $("r2-valeur"), $("r3-valeur")];
    this._caseDen = [$("den1"), $("den2"), $("den3")];
    this._wrapDen = [$("den1-wrap"), $("den2-wrap"), $("den3-wrap")];
    this._labelR = [$("label-r1"), $("label-r2")];
    this._case3 = $("case-3");
    this._case3Wrap = $("case3-wrap");
    this._blocR3 = $("bloc-r3");
    this._blocK = $("bloc-k");
    this._inputK = $("k");
    this._valeurK = $("k-valeur");
    this._resetBtn = $("reset");
    this._boutonsMode = shadow.querySelectorAll("[data-mode]");
    this._mode = "produit";
    this._appliquerDefauts();
  };

  SigneProduitWidgetClass.prototype._appliquerDefauts = function () {
    var d = this._mode === "quotient" ? DEFAUT_QUOTIENT : this._mode === "piege" ? DEFAUT_PIEGE : DEFAUT;
    this._r = [d.r1, d.r2, d.r3 !== undefined ? d.r3 : DEFAUT.r3];
    this._trois = this._mode === "piege" ? false : d.trois;
    this._den = d.den ? d.den.slice() : [false, false, false];
    if (this._mode === "piege") this._den = [false, true, false];
    this._k = DEFAUT_PIEGE.k;
    this._symbole = d.symbole;
    for (var i = 0; i < 3; i++) { this._inputR[i].value = String(this._r[i]); this._caseDen[i].checked = this._den[i]; }
    this._case3.checked = this._trois;
    this._inputK.value = String(this._k);
    this._selectSymbole.value = this._symbole;
  };

  SigneProduitWidgetClass.prototype.connectedCallback = function () {
    var self = this;
    this._handlers = [];
    var on = function (el, ev, fn) { el.addEventListener(ev, fn); self._handlers.push([el, ev, fn]); };
    [0, 1, 2].forEach(function (i) {
      on(self._inputR[i], "input", function () { self._r[i] = parseFloat(self._inputR[i].value); self._rendre(); });
      on(self._caseDen[i], "change", function () { self._den[i] = self._caseDen[i].checked; self._rendre(); });
    });
    on(this._case3, "change", function () { self._trois = self._case3.checked; self._rendre(); });
    on(this._inputK, "input", function () { self._k = parseFloat(self._inputK.value); self._rendre(); });
    on(this._selectSymbole, "change", function () { self._symbole = self._selectSymbole.value; self._rendre(); });
    on(this._resetBtn, "click", function () { self._appliquerDefauts(); self._rendre(); });
    for (var b = 0; b < this._boutonsMode.length; b++) {
      (function (btn) {
        on(btn, "click", function () {
          self._mode = btn.getAttribute("data-mode");
          for (var j = 0; j < self._boutonsMode.length; j++) self._boutonsMode[j].setAttribute("aria-pressed", self._boutonsMode[j] === btn ? "true" : "false");
          self._appliquerDefauts();
          self._rendre();
        });
      })(this._boutonsMode[b]);
    }
    this._rendre();
  };

  SigneProduitWidgetClass.prototype.disconnectedCallback = function () {
    (this._handlers || []).forEach(function (h) { h[0].removeEventListener(h[1], h[2]); });
    this._handlers = [];
  };

  SigneProduitWidgetClass.prototype._fenetreY = function () {
    return this._mode === "produit" ? { min: -30, max: 30 } : { min: -8, max: 8 };
  };

  SigneProduitWidgetClass.prototype._toPx = function (xMath, yMath) {
    var fy = this._fenetreY();
    var px = MARGE + (xMath - X_MIN) / (X_MAX - X_MIN) * (LARGEUR - 2 * MARGE);
    var py = HAUTEUR - MARGE - (yMath - fy.min) / (fy.max - fy.min) * (HAUTEUR - 2 * MARGE);
    return [px, py];
  };

  SigneProduitWidgetClass.prototype._traceIntervalle = function (svg, ns, xMin, xMax, f, classe) {
    var self = this, fy = this._fenetreY();
    if (xMax - xMin < 1e-6) return;
    var n = Math.max(6, Math.round(220 * (xMax - xMin) / (X_MAX - X_MIN)));
    var segments = [], courant = "", dernierValide = false;
    for (var i = 0; i <= n; i++) {
      var xx = xMin + (i / n) * (xMax - xMin);
      var yy = f(xx);
      var valide = isFinite(yy) && yy >= fy.min - 1 && yy <= fy.max + 1;
      if (valide) {
        var p = self._toPx(xx, Math.max(fy.min, Math.min(fy.max, yy)));
        courant += (!dernierValide ? "M" : "L") + p[0].toFixed(2) + " " + p[1].toFixed(2) + " ";
      } else if (dernierValide && courant) {
        segments.push(courant.trim());
        courant = "";
      }
      dernierValide = valide;
    }
    if (courant) segments.push(courant.trim());
    segments.forEach(function (seg) { svg.appendChild(svgEl(ns, "path", { d: seg, class: classe })); });
  };

  // Courbe coupée aux valeurs critiques (racines et valeurs interdites), colorée selon S :
  // vert si l'intervalle satisfait l'inéquation, rouge sinon (un petit écart autour d'une
  // valeur interdite évite de relier les deux branches à travers l'asymptote).
  SigneProduitWidgetClass.prototype._traceCourbe = function (svg, ns, f, testSigne, critiques, interdits) {
    var bornes = [X_MIN].concat(critiques.filter(function (r) { return r > X_MIN && r < X_MAX; })).concat([X_MAX]);
    for (var i = 0; i < bornes.length - 1; i++) {
      var lo = bornes[i], hi = bornes[i + 1];
      if (hi - lo < 1e-6) continue;
      var loT = interdits.some(function (r) { return Math.abs(r - lo) < 1e-9; }) ? lo + 0.02 : lo;
      var hiT = interdits.some(function (r) { return Math.abs(r - hi) < 1e-9; }) ? hi - 0.02 : hi;
      var mid = (lo + hi) / 2;
      this._traceIntervalle(svg, ns, loT, hiT, f, testSigne(f(mid)) ? "segment-pos" : "segment-neg");
    }
  };

  SigneProduitWidgetClass.prototype._axes = function (svg, ns) {
    var defs = svgEl(ns, "defs", {});
    var marker = svgEl(ns, "marker", { id: "fleche", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" });
    marker.appendChild(svgEl(ns, "path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche" }));
    defs.appendChild(marker);
    svg.appendChild(defs);
    var origine = this._toPx(0, 0);
    svg.appendChild(svgEl(ns, "line", { x1: MARGE, x2: LARGEUR - MARGE, y1: origine[1].toFixed(2), y2: origine[1].toFixed(2), class: "axe", "marker-end": "url(#fleche)" }));
    svg.appendChild(svgEl(ns, "line", { x1: origine[0].toFixed(2), x2: origine[0].toFixed(2), y1: HAUTEUR - MARGE, y2: MARGE, class: "axe", "marker-end": "url(#fleche)" }));
    var etiqX = svgEl(ns, "text", { x: LARGEUR - MARGE + 6, y: origine[1] + 4, class: "etiquette" });
    etiqX.textContent = "x";
    svg.appendChild(etiqX);
    return origine;
  };

  /* Grille : une ligne par facteur (avec N ou D en quotient) + la ligne résultat. Les cellules
   * sont évaluées DIRECTEMENT (jamais déduites) ; dans la ligne résultat, une colonne de valeur
   * interdite affiche « ‖ » (non défini). */
  SigneProduitWidgetClass.prototype._construireTableau = function (lignes, bornesTriees, interdits, libelleResultat, fResultat) {
    var bornes = [-Infinity].concat(bornesTriees).concat([Infinity]);
    var headCells = "";
    for (var i = 0; i < bornes.length; i++) {
      headCells += "<th>" + borneTexte(bornes[i]) + "</th>";
      if (i < bornes.length - 1) headCells += "<th></th>";
    }
    var ligneHtml = function (label, fn, emphase) {
      var cells = "";
      for (var i = 0; i < bornes.length; i++) {
        var xBorne = bornes[i] === -Infinity ? bornes[1] - 3 : bornes[i] === Infinity ? bornes[bornes.length - 2] + 3 : bornes[i];
        var estInterdit = emphase && i > 0 && i < bornes.length - 1 && interdits.some(function (r) { return Math.abs(r - bornes[i]) < 1e-9; });
        if (estInterdit) {
          cells += '<td class="indef">‖</td>';
        } else {
          var v = fn(xBorne);
          var estZero = Math.abs(v) < 1e-9;
          cells += '<td class="' + (estZero ? "zero" : v > 0 ? "pos" : "neg") + '">' + (estZero ? "0" : v > 0 ? "+" : "−") + "</td>";
        }
        if (i < bornes.length - 1) {
          var lo = bornes[i], hi = bornes[i + 1];
          var mid = lo === -Infinity ? hi - 3 : hi === Infinity ? lo + 3 : (lo + hi) / 2;
          var vg = fn(mid);
          cells += '<td class="' + (vg > 0 ? "pos" : "neg") + '">' + (vg > 0 ? "+" : "−") + "</td>";
        }
      }
      return '<tr class="' + (emphase ? "produit" : "") + '"><td class="rowlabel">' + label + "</td>" + cells + "</tr>";
    };
    var corps = lignes.map(function (l) { return ligneHtml(l.label, l.fn, false); }).join("") + ligneHtml(libelleResultat, fResultat, true);
    return '<div class="table-zone"><table class="grille"><tr><th></th>' + headCells + "</tr>" + corps + "</table></div>";
  };

  SigneProduitWidgetClass.prototype._rendre = function () {
    var mode = this._mode;
    var piege = mode === "piege", quotient = mode === "quotient";
    // Visibilité des réglages selon le mode.
    this._case3Wrap.hidden = piege;
    this._blocR3.hidden = piege || !this._trois;
    this._blocK.hidden = !piege;
    this._piegeZone.hidden = !piege;
    for (var i = 0; i < 3; i++) this._wrapDen[i].hidden = !quotient;
    this._labelR[0].textContent = piege ? "racine du numérateur" : "racine du 1er facteur";
    this._labelR[1].textContent = piege ? "racine du dénominateur" : "racine du 2e facteur";
    for (var j = 0; j < 3; j++) this._valeurR[j].textContent = nombreExact(this._r[j]);
    this._valeurK.textContent = nombreExact(this._k);
    if (piege) this._rendrePiege(); else this._rendreProduitQuotient(quotient);
  };

  SigneProduitWidgetClass.prototype._rendreProduitQuotient = function (quotient) {
    var self = this;
    var n = this._trois ? 3 : 2;
    var facteurs = [];
    for (var i = 0; i < n; i++) {
      (function (r, auDen) { facteurs.push({ r: r, den: quotient && auDen, fn: function (x) { return x - r; } }); })(this._r[i], this._den[i]);
    }
    var numer = facteurs.filter(function (f) { return !f.den; });
    var denom = facteurs.filter(function (f) { return f.den; });
    var produit = function (liste, x) { var v = 1; for (var i = 0; i < liste.length; i++) v *= liste[i].fn(x); return v; };
    var f = function (x) { return produit(numer, x) / produit(denom, x); };
    var paren = function (liste) {
      if (!liste.length) return "1";
      var morceaux = liste.map(function (fa) { return facteurParen(fa.r); });
      return morceaux.join(morceaux.indexOf("x") >= 0 ? "·" : "");
    };
    var formule = denom.length ? paren(numer) + " / " + paren(denom) : paren(facteurs);
    this._formule.textContent = formule;
    this._secondMembre.textContent = "0";

    var interdits = denom.map(function (fa) { return fa.r; });
    var critiques = facteurs.map(function (fa) { return fa.r; }).sort(function (a, b) { return a - b; })
      .filter(function (r, i, arr) { return i === 0 || Math.abs(r - arr[i - 1]) > 1e-9; });
    var points = critiques.map(function (r) {
      return { x: r, statut: interdits.some(function (d) { return Math.abs(d - r) < 1e-9; }) ? "indef" : "zero" };
    });

    var ns = "http://www.w3.org/2000/svg", svg = this._svg;
    svg.innerHTML = "";
    var origine = this._axes(svg, ns);
    interdits.forEach(function (r) {
      if (r <= X_MIN || r >= X_MAX) return;
      var p = self._toPx(r, 0);
      svg.appendChild(svgEl(ns, "line", { x1: p[0].toFixed(2), x2: p[0].toFixed(2), y1: MARGE, y2: HAUTEUR - MARGE, class: "asymptote" }));
    });
    var veutPositif = this._symbole === "gt" || this._symbole === "ge";
    this._traceCourbe(svg, ns, f, function (v) { return (v > 0) === veutPositif; }, critiques, interdits);
    points.forEach(function (pt) {
      if (pt.x < X_MIN || pt.x > X_MAX) return;
      var p = self._toPx(pt.x, 0);
      svg.appendChild(svgEl(ns, "circle", { cx: p[0].toFixed(2), cy: origine[1].toFixed(2), r: 4, class: pt.statut === "indef" ? "trou" : "racine" }));
    });

    var lignes = facteurs.map(function (fa) { return { label: labelFacteur(fa.r) + (quotient ? (fa.den ? " (D)" : " (N)") : ""), fn: fa.fn }; });
    this._zoneTableau.innerHTML = this._construireTableau(lignes, critiques, interdits, denom.length ? "quotient" : "produit", f);
    this._solution.textContent = ensembleSolution(f, points, this._symbole);
    var large = this._symbole === "ge" || this._symbole === "le";
    if (denom.length) {
      this._note.textContent = "Une valeur qui annule le dénominateur (‖ dans le tableau, rond vide sur l'axe) n'est jamais une solution" +
        (large ? ", même avec " + SYMBOLE_TEXTE[this._symbole] + " : son crochet reste ouvert." : ".");
    } else {
      this._note.textContent = large ? "Avec " + SYMBOLE_TEXTE[this._symbole] + ", les racines (où le produit vaut 0) font partie de S." : "";
    }
  };

  // Mode « piège » : (x − r₁)/(x − r₂) ◇ k.
  SigneProduitWidgetClass.prototype._rendrePiege = function () {
    var self = this;
    var r1 = this._r[0], r2 = this._r[1], k = this._k, sym = this._symbole;
    var symT = SYMBOLE_TEXTE[sym];
    var N = function (x) { return x - r1; }, D = function (x) { return x - r2; };
    var q = function (x) { return N(x) / D(x); };
    this._formule.textContent = facteurParen(r1) + " / " + facteurParen(r2);
    this._secondMembre.textContent = nombreExact(k);

    // Bonne méthode : (N − kD)/D ◇ 0, avec N − kD = (1 − k)x − r₁ + k·r₂.
    var A = 1 - k, B = -r1 + k * r2;
    var g = function (x) { return (A * x + B) / D(x); };
    var points = [{ x: r2, statut: "indef" }];
    if (Math.abs(A) > 1e-9) {
      var x0 = -B / A;
      if (Math.abs(x0 - r2) > 1e-9) points.push({ x: x0, statut: "zero" });
    }
    points.sort(function (a, b) { return a.x - b.x; });
    var sJuste = ensembleSolution(g, points, sym);
    var numTexte = (function () {
      if (Math.abs(A) < 1e-9) return nombreExact(B);
      var coef = Math.abs(A - 1) < 1e-9 ? "" : Math.abs(A + 1) < 1e-9 ? "−" : nombreExact(A);
      var t = coef + "x";
      if (Math.abs(B) > 1e-9) t += (B > 0 ? " + " : " − ") + nombreExact(Math.abs(B));
      return t;
    })();
    this._piegeJuste.innerHTML =
      (Math.abs(k) < 1e-9 ? "Le second membre est déjà 0." : facteurParen(r1) + " / " + facteurParen(r2) + " − " + nombreExact(k) + " " + symT + " 0, " +
        "puis même dénominateur : (" + numTexte + ") / " + facteurParen(r2) + " " + symT + " 0.") +
      " Tableau de signes, et " + nombreExact(r2) + " reste exclu." +
      '<span class="ens">' + sJuste + "</span>";

    // Méthode fausse : on multiplie par (x − r₂) sans regarder son signe → x − r₁ ◇ k(x − r₂),
    // soit A·x ◇ −B, résolu comme une inéquation du premier degré (et la CE oubliée).
    var sFaux;
    if (Math.abs(A) < 1e-9) {
      var vrai = { gt: 0 > B, ge: 0 >= B, lt: 0 < B, le: 0 <= B }[sym];
      sFaux = vrai ? "S = ℝ" : "S = ∅";
    } else {
      var seuil = -B / A;
      var sens = A > 0 ? sym : { gt: "lt", ge: "le", lt: "gt", le: "ge" }[sym];
      var largeF = sens === "ge" || sens === "le";
      sFaux = (sens === "gt" || sens === "ge")
        ? "S = " + (largeF ? "[" : "]") + nombreExact(seuil) + " ; +∞["
        : "S = ]−∞ ; " + nombreExact(seuil) + (largeF ? "]" : "[");
    }
    this._piegeFaux.innerHTML =
      labelFacteur(r1) + " " + symT + " " + nombreExact(k) + "(" + labelFacteur(r2) + ")" +
      " : on a multiplié les deux membres par " + labelFacteur(r2) + " sans savoir s'il est positif. Là où il est négatif (zone rouge), le sens aurait dû s'inverser — et la valeur interdite est oubliée." +
      '<span class="ens">' + sFaux + "</span>";

    var ns = "http://www.w3.org/2000/svg", svg = this._svg;
    svg.innerHTML = "";
    var fy = this._fenetreY();
    // Bande où le dénominateur est négatif : x < r₂.
    var pR2 = this._toPx(r2, 0);
    var xBande = Math.max(MARGE, Math.min(LARGEUR - MARGE, pR2[0]));
    svg.appendChild(svgEl(ns, "rect", { x: MARGE, y: MARGE, width: Math.max(0, xBande - MARGE).toFixed(2), height: HAUTEUR - 2 * MARGE, class: "bande-dneg" }));
    if (xBande - MARGE > 70) {
      var eb = svgEl(ns, "text", { x: (MARGE + 6).toFixed(2), y: (MARGE + 14).toFixed(2), class: "etiquette-bande" });
      eb.textContent = "dénominateur < 0";
      svg.appendChild(eb);
    }
    var origine = this._axes(svg, ns);
    if (r2 > X_MIN && r2 < X_MAX) svg.appendChild(svgEl(ns, "line", { x1: pR2[0].toFixed(2), x2: pR2[0].toFixed(2), y1: MARGE, y2: HAUTEUR - MARGE, class: "asymptote" }));
    var pk = this._toPx(0, Math.max(fy.min, Math.min(fy.max, k)));
    svg.appendChild(svgEl(ns, "line", { x1: MARGE, x2: LARGEUR - MARGE, y1: pk[1].toFixed(2), y2: pk[1].toFixed(2), class: "ligne-k" }));
    var ek = svgEl(ns, "text", { x: (LARGEUR - MARGE - 4).toFixed(2), y: (pk[1] - 6).toFixed(2), "text-anchor": "end", class: "etiquette-k" });
    ek.textContent = "y = " + nombreExact(k);
    svg.appendChild(ek);
    var critiques = points.map(function (p) { return p.x; });
    var veut = { gt: function (v) { return v > 0; }, ge: function (v) { return v > 0; }, lt: function (v) { return v < 0; }, le: function (v) { return v < 0; } }[sym];
    // Couleur de la courbe de q selon la VRAIE solution (signe de q − k = g).
    var qMoinsK = function (x) { return q(x) - k; };
    var bornes = [X_MIN].concat(critiques.filter(function (r) { return r > X_MIN && r < X_MAX; })).concat([X_MAX]);
    for (var i = 0; i < bornes.length - 1; i++) {
      var lo = bornes[i], hi = bornes[i + 1];
      var loT = Math.abs(lo - r2) < 1e-9 ? lo + 0.02 : lo, hiT = Math.abs(hi - r2) < 1e-9 ? hi - 0.02 : hi;
      this._traceIntervalle(svg, ns, loT, hiT, q, veut(qMoinsK((lo + hi) / 2)) ? "segment-pos" : "segment-neg");
    }
    points.forEach(function (pt) {
      if (pt.x < X_MIN || pt.x > X_MAX) return;
      var p = self._toPx(pt.x, 0);
      svg.appendChild(svgEl(ns, "circle", { cx: p[0].toFixed(2), cy: origine[1].toFixed(2), r: 4, class: pt.statut === "indef" ? "trou" : "racine" }));
    });
    this._zoneTableau.innerHTML = "";
    this._solution.textContent = sJuste;
    this._note.textContent = sFaux === sJuste
      ? "Ici, les deux ensembles coïncident par hasard — change r₂ ou k pour voir la méthode fausse échouer."
      : "Les deux ensembles diffèrent : on ne multiplie jamais une inéquation par une expression dont on ne connaît pas le signe.";
  };

  if (!customElements.get("signe-produit-widget")) {
    customElements.define("signe-produit-widget", SigneProduitWidgetClass);
  }
})();
