(function () {
  "use strict";

  /* ================================================================
   * <arithmetique-ou-geometrique-widget> — atelier interactif, défi de
   * reconnaissance : cinq premiers termes d'une suite tirée dans un banc
   * (arithmétiques, géométriques, pièges : carrés, nombres triangulaires,
   * alternées, Fibonacci, suite constante). L'élève peut faire calculer
   * les différences uₙ₊₁ − uₙ et les rapports uₙ₊₁ / uₙ, puis choisit
   * parmi quatre réponses. Un seul essai (le choix est fermé et se
   * gagnerait par élimination), puis la correction justifiée. Pas de
   * score : c'est un atelier d'apprentissage. Calculs exacts en fractions.
   * Web Component (Shadow DOM).
   * ================================================================ */

  // ---------- fractions exactes ----------
  function pgcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = b; b = a % b; a = t; } return a || 1; }
  function fr(num, den) {
    if (den === undefined) den = 1;
    if (den < 0) { num = -num; den = -den; }
    var g = pgcd(num, den);
    return { num: num / g, den: den / g };
  }
  function sous(a, b) { return fr(a.num * b.den - b.num * a.den, a.den * b.den); }
  function div(a, b) { return fr(a.num * b.den, a.den * b.num); }
  function egal(a, b) { return a.num === b.num && a.den === b.den; }

  function decimalFini(den) {
    while (den % 2 === 0) den /= 2;
    while (den % 5 === 0) den /= 5;
    return den === 1;
  }

  // Écriture française : « − » typographique, virgule décimale si l'écriture décimale est
  // finie et courte, sinon fraction a/b.
  function ecrire(f) {
    var signe = f.num < 0 ? "−" : "";
    var n = Math.abs(f.num);
    if (f.den === 1) return signe + n;
    if (decimalFini(f.den)) {
      var v = n / f.den;
      var s = String(Math.round(v * 10000) / 10000);
      if (s.replace(/^\d+\.?/, "").length <= 4) return signe + s.replace(".", ",");
    }
    return signe + n + "/" + f.den;
  }

  function aleaEntier(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  function choisir(t) { return t[Math.floor(Math.random() * t.length)]; }
  function nonNul(a, b) { var v; do { v = aleaEntier(a, b); } while (v === 0); return v; }

  // ---------- banc de suites ----------
  // Chaque générateur renvoie { famille, termes: [fr…], nom?, indice? } ; famille ∈
  // arith | geo | deux | aucune. Jamais de terme nul (un rapport ne doit pas diviser par 0).
  var BANC = [
    { cle: "arith-entier", gen: function () {
      var r = nonNul(-9, 9), u1, ok, t;
      do { u1 = aleaEntier(-12, 15); t = []; ok = true; for (var k = 0; k < 5; k++) { var v = u1 + k * r; if (v === 0) ok = false; t.push(fr(v)); } } while (!ok);
      return { famille: "arith", termes: t };
    } },
    { cle: "arith-decimal", gen: function () {
      // raison en quarts ou en demis : 0,5 ; 1,5 ; −0,25 ; 2,5…
      var den = choisir([2, 4]), rNum = nonNul(-7, 7), u1Num, ok, t;
      if (rNum % den === 0) rNum += 1;
      do { u1Num = aleaEntier(-10, 20); t = []; ok = true; for (var k = 0; k < 5; k++) { var v = u1Num + k * rNum; if (v === 0) ok = false; t.push(fr(v, den)); } } while (!ok);
      return { famille: "arith", termes: t };
    } },
    { cle: "geo-entier", gen: function () {
      var q = choisir([2, 3, -2, -3]), u1 = choisir([1, 2, 3, 5, -1, -2]), t = [];
      if (Math.abs(q) === 3 && Math.abs(u1) > 3) u1 = u1 > 0 ? 1 : -1;
      for (var k = 0; k < 5; k++) t.push(fr(u1 * Math.pow(q, k)));
      return { famille: "geo", termes: t };
    } },
    { cle: "geo-fraction", gen: function () {
      var c = choisir([
        { p: 1, d: 2, u1: 48 }, { p: 1, d: 2, u1: 80 }, { p: 1, d: 3, u1: 81 }, { p: 2, d: 3, u1: 81 },
        { p: 3, d: 2, u1: 16 }, { p: -1, d: 2, u1: 32 }, { p: 1, d: 4, u1: 256 }, { p: 1, d: 10, u1: 5000 },
      ]);
      var t = [];
      for (var k = 0; k < 5; k++) t.push(fr(c.u1 * Math.pow(c.p, k), Math.pow(c.d, k)));
      return { famille: "geo", termes: t };
    } },
    { cle: "carres", gen: function () {
      var d = aleaEntier(0, 3), t = [];
      for (var k = 1; k <= 5; k++) t.push(fr((k + d) * (k + d)));
      return { famille: "aucune", termes: t, explication: d === 0 ? "C’est la suite des carrés : uₙ = n²." : "Ce sont des carrés consécutifs : uₙ = (n + " + d + ")²." };
    } },
    { cle: "triangulaires", gen: function () {
      var t = [];
      for (var k = 1; k <= 5; k++) t.push(fr(k * (k + 1) / 2));
      return { famille: "aucune", termes: t, explication: "Ce sont les nombres triangulaires uₙ = n(n + 1)/2 : ce sont leurs différences 2, 3, 4, 5 qui forment une suite arithmétique, pas les termes eux-mêmes." };
    } },
    { cle: "alternee-geo", gen: function () {
      var u1 = nonNul(-6, 6), t = [];
      for (var k = 0; k < 5; k++) t.push(fr(u1 * (k % 2 === 0 ? 1 : -1)));
      return { famille: "geo", termes: t, explication: "Elle oscille entre deux valeurs opposées : c’est une suite géométrique de raison q = −1." };
    } },
    { cle: "alternee-aucune", gen: function () {
      var t = [];
      for (var k = 1; k <= 5; k++) t.push(fr((k % 2 === 0 ? 1 : -1) * k));
      return { famille: "aucune", termes: t, explication: "Les signes alternent, mais la valeur absolue augmente de 1 à chaque rang : uₙ = (−1)ⁿ × n n’est ni l’une ni l’autre." };
    } },
    { cle: "fibonacci", gen: function () {
      var a = choisir([1, 2, 3]), b = a + choisir([0, 1, 2]), t = [fr(a), fr(b)];
      for (var k = 2; k < 5; k++) t.push(fr(t[k - 1].num + t[k - 2].num));
      return { famille: "aucune", termes: t, explication: "Chaque terme est la somme des deux précédents : c’est une suite de type Fibonacci." };
    } },
    { cle: "constante", gen: function () {
      var c = choisir([fr(nonNul(-9, 9)), fr(choisir([3, 5, 7]), 2)]), t = [];
      for (var k = 0; k < 5; k++) t.push(c);
      return { famille: "deux", termes: t };
    } },
  ];

  // Familles tirées en priorité égale : arith (2 cases), geo (3), pièges (5) — on tire d'abord
  // la catégorie, puis la case, pour que les pièges ne dominent pas.
  var CATEGORIES = [
    ["arith-entier", "arith-decimal"],
    ["geo-entier", "geo-fraction", "alternee-geo"],
    ["carres", "triangulaires", "alternee-aucune", "fibonacci"],
    ["constante"],
  ];
  var POIDS = [3, 3, 3, 1];

  function tirerCle(precedente) {
    var cle;
    do {
      var total = POIDS.reduce(function (a, b) { return a + b; }, 0), x = Math.random() * total, i = 0;
      while (x >= POIDS[i]) { x -= POIDS[i]; i++; }
      cle = choisir(CATEGORIES[i]);
    } while (cle === precedente);
    return cle;
  }

  var REPONSES = [
    { id: "arith", texte: "Arithmétique" },
    { id: "geo", texte: "Géométrique" },
    { id: "deux", texte: "Les deux" },
    { id: "aucune", texte: "Ni l’une ni l’autre" },
  ];

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' +
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);color:var(--ink,#241f1a);}' +
    '*{box-sizing:border-box;}' +
    '.consigne{margin:0 0 10px;font-size:0.95rem;line-height:1.5;}' +
    '.grille{display:grid;justify-content:center;align-items:center;gap:4px 6px;margin:0 auto 12px;font-variant-numeric:tabular-nums;}' +
    '.horiz{grid-template-columns:auto repeat(9,auto);}' +
    '.vert{grid-template-columns:auto auto auto auto;display:none;row-gap:0;}' +
    '.vert .terme{padding:3px 8px;font-size:1.05rem;}' +
    '.vert .entre{line-height:1.2;}' +
    '@media (max-width:600px){.horiz{display:none;}.vert{display:grid;}}' +
    '.titre{font-size:0.8rem;font-weight:600;color:var(--ink-soft,#6b6055);text-align:right;padding-right:6px;}' +
    '.vert .titre{text-align:center;padding:0 4px 4px;}' +
    '.terme{font-family:var(--serif,serif);font-size:1.15rem;font-weight:700;background:var(--surface-2,#faf6f0);border:1px solid var(--line,#e2d8c8);border-radius:var(--radius,3px);min-width:52px;padding:6px 8px;text-align:center;}' +
    '.rang{font-size:0.82rem;color:var(--ink-soft,#6b6055);text-align:center;}' +
    '.entre{font-size:0.9rem;text-align:center;padding:0 4px;white-space:nowrap;}' +
    '.entre.vide{color:var(--line,#e2d8c8);}' +
    '.entre.constant{color:var(--good,#2f7a4f);font-weight:700;}' +
    '.entre.varie{color:var(--bad,#b23a3a);}' +
    '.boutons{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin-bottom:12px;}' +
    '.btn{min-height:44px;padding:8px 14px;border-radius:var(--radius,3px);border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font-weight:600;cursor:pointer;font-size:0.9rem;font-family:inherit;}' +
    '.btn:hover:not(:disabled){background:var(--accent-soft-line,#e8c4a4);}' +
    '.btn:disabled{opacity:0.55;cursor:default;}' +
    '.btn:focus-visible{outline:2px solid var(--accent,#a8471f);outline-offset:2px;}' +
    '.choix{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-bottom:12px;}' +
    '@media (min-width:640px){.choix{grid-template-columns:repeat(4,minmax(0,1fr));}}' +
    '.choix .btn{background:var(--surface,#fff);border-color:var(--line,#e2d8c8);color:var(--ink,#241f1a);}' +
    '.choix .btn.juste{background:var(--good,#2f7a4f);border-color:var(--good,#2f7a4f);color:var(--surface,#fff);opacity:1;}' +
    '.choix .btn.faux{background:var(--bad,#b23a3a);border-color:var(--bad,#b23a3a);color:var(--surface,#fff);opacity:1;}' +
    '.correction{border-radius:var(--radius,3px);padding:10px 14px;margin:0 0 12px;font-size:0.93rem;line-height:1.55;background:var(--surface-2,#faf6f0);border-left:4px solid var(--line,#e2d8c8);}' +
    '.correction p{margin:0 0 4px;}' +
    '.correction p:last-child{margin:0;}' +
    '.correction.bien{border-left-color:var(--good,#2f7a4f);}' +
    '.correction.mal{border-left-color:var(--bad,#b23a3a);}' +
    '.verdict-bien{color:var(--good,#2f7a4f);font-weight:700;}' +
    '.verdict-mal{color:var(--bad,#b23a3a);font-weight:700;}' +
    '.nouvelle{display:flex;justify-content:center;}' +
    '</style>' +
    '<p class="consigne">Voici les cinq premiers termes d’une suite. En supposant que la régularité continue, est-elle arithmétique, géométrique, les deux, ou ni l’une ni l’autre ? Tu as droit à un seul essai.</p>' +
    '<div class="grille horiz" id="grille-h" role="table" aria-label="Termes, différences et rapports"></div>' +
    '<div class="grille vert" id="grille-v" role="table" aria-label="Termes, différences et rapports"></div>' +
    '<div class="boutons">' +
    '<button class="btn" id="btn-diff" type="button">Calculer les différences</button>' +
    '<button class="btn" id="btn-rapp" type="button">Calculer les rapports</button>' +
    '</div>' +
    '<div class="choix" id="choix" role="group" aria-label="Ta réponse"></div>' +
    '<div class="correction" id="correction" hidden aria-live="polite"></div>' +
    '<div class="nouvelle"><button class="btn" id="nouvelle" type="button">Nouvelle suite</button></div>';

  class ArithmetiqueOuGeometriqueWidget extends HTMLElement {
    constructor() {
      super();
      var shadow = this.attachShadow({ mode: "open" });
      shadow.appendChild(TEMPLATE.content.cloneNode(true));
      this._shadow = shadow;
      this._grilleH = shadow.getElementById("grille-h");
      this._grilleV = shadow.getElementById("grille-v");
      this._btnDiff = shadow.getElementById("btn-diff");
      this._btnRapp = shadow.getElementById("btn-rapp");
      this._zoneChoix = shadow.getElementById("choix");
      this._correction = shadow.getElementById("correction");
      this._btnNouvelle = shadow.getElementById("nouvelle");
      var self = this;
      this._boutonsChoix = REPONSES.map(function (r) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "btn";
        b.textContent = r.texte;
        b.setAttribute("data-reponse", r.id);
        self._zoneChoix.appendChild(b);
        return b;
      });
    }

    connectedCallback() {
      var self = this;
      this._onDiff = function () { self._diffVisibles = true; self._rendreLignes(); };
      this._onRapp = function () { self._rappVisibles = true; self._rendreLignes(); };
      this._onChoix = function (e) { self._repondre(e.currentTarget.getAttribute("data-reponse")); };
      this._onNouvelle = function () { self._nouvelle(); };
      this._btnDiff.addEventListener("click", this._onDiff);
      this._btnRapp.addEventListener("click", this._onRapp);
      this._boutonsChoix.forEach(function (b) { b.addEventListener("click", self._onChoix); });
      this._btnNouvelle.addEventListener("click", this._onNouvelle);
      if (!this._suite) this._nouvelle();
    }

    disconnectedCallback() {
      var self = this;
      this._btnDiff.removeEventListener("click", this._onDiff);
      this._btnRapp.removeEventListener("click", this._onRapp);
      this._boutonsChoix.forEach(function (b) { b.removeEventListener("click", self._onChoix); });
      this._btnNouvelle.removeEventListener("click", this._onNouvelle);
    }

    _nouvelle() {
      var cle = tirerCle(this._cle);
      this._cle = cle;
      var entree = BANC.filter(function (b) { return b.cle === cle; })[0];
      var s = entree.gen();
      var t = s.termes;
      s.diffs = []; s.rapps = [];
      for (var k = 0; k < 4; k++) { s.diffs.push(sous(t[k + 1], t[k])); s.rapps.push(div(t[k + 1], t[k])); }
      s.diffConstante = s.diffs.every(function (d) { return egal(d, s.diffs[0]); });
      s.rappConstant = s.rapps.every(function (r) { return egal(r, s.rapps[0]); });
      this._suite = s;
      this._diffVisibles = false;
      this._rappVisibles = false;
      this._repondu = false;
      this._correction.hidden = true;
      this._correction.innerHTML = "";
      this._boutonsChoix.forEach(function (b) { b.disabled = false; b.classList.remove("juste", "faux"); b.removeAttribute("aria-pressed"); });
      this._rendreLignes();
    }

    _rendreLignes() {
      var s = this._suite;
      var dv = this._diffVisibles, rv = this._rappVisibles;
      function cellule(classe, ligne, col, contenu) {
        return '<div class="' + classe + '" style="grid-row:' + ligne + ';grid-column:' + col + '">' + contenu + "</div>";
      }
      function diffTexte(v) { return v.num < 0 ? ecrire(v) : "+" + ecrire(v); }
      function classeEntre(visible, constant) { return "entre " + (visible ? (constant ? "constant" : "varie") : "vide"); }
      // Horizontal : termes en colonnes paires, différences et rapports entre deux termes.
      var h = cellule("titre", 1, 1, "uₙ") + cellule("titre", 2, 1, "différence") + cellule("titre", 3, 1, "rapport");
      s.termes.forEach(function (t, i) { h += cellule("terme", 1, 2 + 2 * i, ecrire(t)); });
      for (var k = 0; k < 4; k++) {
        h += cellule(classeEntre(dv, s.diffConstante), 2, 3 + 2 * k, dv ? diffTexte(s.diffs[k]) : "·");
        h += cellule(classeEntre(rv, s.rappConstant), 3, 3 + 2 * k, rv ? "×\u00a0" + ecrire(s.rapps[k]) : "·");
      }
      this._grilleH.innerHTML = h;
      // Vertical (écran étroit) : un terme par ligne, différence et rapport entre deux lignes.
      var v = cellule("titre", 1, 1, "n") + cellule("titre", 1, 2, "uₙ") + cellule("titre", 1, 3, "uₙ₊₁ − uₙ") + cellule("titre", 1, 4, "uₙ₊₁ ÷ uₙ");
      s.termes.forEach(function (t, i) {
        v += cellule("rang", 2 + 2 * i, 1, String(i + 1)) + cellule("terme", 2 + 2 * i, 2, ecrire(t));
      });
      for (var j = 0; j < 4; j++) {
        v += cellule(classeEntre(dv, s.diffConstante), 3 + 2 * j, 3, dv ? diffTexte(s.diffs[j]) : "·");
        v += cellule(classeEntre(rv, s.rappConstant), 3 + 2 * j, 4, rv ? "×\u00a0" + ecrire(s.rapps[j]) : "·");
      }
      this._grilleV.innerHTML = v;
      this._btnDiff.disabled = dv;
      this._btnRapp.disabled = rv;
    }

    _repondre(id) {
      if (this._repondu) return;
      this._repondu = true;
      var s = this._suite;
      var juste = id === s.famille;
      this._diffVisibles = true;
      this._rappVisibles = true;
      this._rendreLignes();
      this._boutonsChoix.forEach(function (b) {
        var rid = b.getAttribute("data-reponse");
        b.disabled = true;
        if (rid === s.famille) b.classList.add("juste");
        else if (rid === id) b.classList.add("faux");
        if (rid === id) b.setAttribute("aria-pressed", "true");
      });
      var listeD = s.diffs.map(ecrire).join(" ; "), listeR = s.rapps.map(ecrire).join(" ; ");
      var lignes = [];
      if (s.famille === "arith") {
        lignes.push("Les différences sont toutes égales à " + ecrire(s.diffs[0]) + " : la suite est arithmétique de raison r = " + ecrire(s.diffs[0]) + ".");
        lignes.push("Les rapports " + listeR + " ne sont pas constants : elle n’est pas géométrique.");
      } else if (s.famille === "geo") {
        lignes.push("Les rapports sont tous égaux à " + ecrire(s.rapps[0]) + " : la suite est géométrique de raison q = " + ecrire(s.rapps[0]) + ".");
        lignes.push("Les différences " + listeD + " ne sont pas constantes : elle n’est pas arithmétique.");
      } else if (s.famille === "deux") {
        lignes.push("Les différences sont toutes nulles (r = 0) et les rapports tous égaux à 1 (q = 1) : une suite constante est à la fois arithmétique et géométrique.");
      } else {
        lignes.push("Les différences " + listeD + " ne sont pas constantes, et les rapports " + listeR + " non plus : la suite n’est ni arithmétique, ni géométrique.");
      }
      if (s.explication) lignes.push(s.explication);
      this._correction.className = "correction " + (juste ? "bien" : "mal");
      this._correction.innerHTML = '<p class="' + (juste ? "verdict-bien" : "verdict-mal") + '">' +
        (juste ? "Exact." : "Pas tout à fait : la bonne réponse est « " + REPONSES.filter(function (r) { return r.id === s.famille; })[0].texte + " ».") + "</p>" +
        lignes.map(function (l) { return "<p>" + l + "</p>"; }).join("");
      this._correction.hidden = false;
    }
  }

  if (!customElements.get("arithmetique-ou-geometrique-widget")) {
    customElements.define("arithmetique-ou-geometrique-widget", ArithmetiqueOuGeometriqueWidget);
  }
})();
