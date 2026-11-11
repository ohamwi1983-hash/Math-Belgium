(function () {
  "use strict";

  /* ================================================================
   * <comparaison-suites-widget> — atelier interactif : deux suites
   * concurrentes, A arithmétique et B géométrique, balayées en direct sur
   * 20 ans. Repère le VRAI rang de bascule (la condition devient vraie ET
   * elle était fausse au rang précédent — le premier piège de
   * l'Attention) et traduit le rang en année (le second piège).
   * - Trois préréglages : « Deux villes » (l'exemple résolu du texte,
   *   bascule en 2032), « Intérêts simples contre composés » (deux comptes
   *   en euros) et « Pas de bascule » (B décroît).
   * - Tableau de balayage sous le graphique : lignes n−1 (« non »), n
   *   (« oui — bascule ici ») et n+1 surlignées ; bouton pour voir les
   *   20 ans.
   * - Mode « Je parie d'abord » : la conclusion, le tableau et le repère
   *   de bascule sont masqués jusqu'à ce que l'élève propose une année.
   * Web Component (Shadow DOM).
   * ================================================================ */

  var N_ANNEES = 20;
  var NBSP = " "; // espace fine insécable (séparateur de milliers)

  // Chaque scénario fixe SA fenêtre (jamais recalculée depuis les curseurs) : au-delà, les points
  // sortent de la fenêtre et sont simplement clippés.
  var SCENARIOS = {
    villes: {
      titreA: "Ville A", titreB: "Ville B", unite: "habitants", uniteCourte: "hab.",
      anneeDepart: 2020,
      labelA1: "Ville A — population initiale",
      labelRa: "Ville A — croissance (+ hab./an)",
      labelB1: "Ville B — population initiale",
      labelQb: "Ville B — croissance (% par an)",
      a1: { min: 20000, max: 80000, step: 5000 },
      ra: { min: 500, max: 4000, step: 500 },
      b1: { min: 10000, max: 60000, step: 5000 },
      qb: { min: -5, max: 15, step: 0.5 },
      raEnPct: false,
      yMax: 250000, yTicks: [50000, 100000, 150000, 200000],
      decimales: 0
    },
    comptes: {
      titreA: "Compte A", titreB: "Compte B", unite: "€", uniteCourte: "€",
      anneeDepart: 2025,
      labelA1: "Compte A — capital de départ",
      labelRa: "Compte A — intérêts simples (% du capital de départ, par an)",
      labelB1: "Compte B — capital de départ",
      labelQb: "Compte B — intérêts composés (% par an)",
      a1: { min: 500, max: 2000, step: 100 },
      ra: { min: 1, max: 10, step: 0.5 },
      b1: { min: 500, max: 2000, step: 100 },
      qb: { min: 1, max: 12, step: 0.5 },
      raEnPct: true,
      yMax: 3500, yTicks: [1000, 2000, 3000],
      decimales: 2
    }
  };
  var PRESETS = {
    villes: { scenario: "villes", a1: 50000, ra: 2000, b1: 30000, qb: 8 },
    comptes: { scenario: "comptes", a1: 1000, ra: 5, b1: 800, qb: 6 },
    sansBascule: { scenario: "villes", a1: 50000, ra: 2000, b1: 30000, qb: -3 }
  };

  var LARGEUR = 460, HAUTEUR = 300, MARGE_G = 56, MARGE_D = 20, MARGE_H = 18, MARGE_B = 34;

  function groupes(entier) {
    var s = String(Math.abs(entier)), out = "";
    for (var i = 0; i < s.length; i++) {
      if (i > 0 && (s.length - i) % 3 === 0) out += NBSP;
      out += s[i];
    }
    return out;
  }
  function formatNombreFr(n, decimales) {
    var facteur = Math.pow(10, decimales);
    var arrondi = Math.round(n * facteur) / facteur;
    var signe = arrondi < 0 ? "−" : "";
    var abs = Math.abs(arrondi);
    var entier = Math.floor(abs + 1e-9);
    var txt = signe + groupes(entier);
    if (decimales > 0) {
      var frac = Math.round((abs - entier) * facteur);
      if (frac >= facteur) { frac = 0; txt = signe + groupes(entier + 1); }
      txt += "," + String(frac).padStart(decimales, "0");
    }
    return txt;
  }
  function decimalesUtiles(x, max) {
    for (var d = 0; d < max; d++) { if (Math.abs(Math.round(x * Math.pow(10, d)) - x * Math.pow(10, d)) < 1e-6) return d; }
    return max;
  }
  function formatTaux(pct) {
    var t = formatNombreFr(Math.abs(pct), decimalesUtiles(pct, 1));
    return (pct < 0 ? "−" : "+") + t + NBSP + "%";
  }
  function exposantUnicode(txt) {
    var map = { "n": "ⁿ", "−": "⁻", "1": "¹" };
    return txt.split("").map(function (c) { return map[c] || c; }).join("");
  }

  function svgEl(ns, tag, attrs) {
    var el = document.createElementNS(ns, tag);
    for (var key in attrs) el.setAttribute(key, attrs[key]);
    return el;
  }

  function curseur(id, classe) {
    return '<div class="curseur ' + classe + '"><label for="' + id + '" id="' + id + '-label"></label><div class="curseur-row">' +
      '<input type="range" id="' + id + '">' +
      '<span class="curseur-valeur" id="' + id + '-valeur"></span></div></div>';
  }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' +
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);}' +
    '*{box-sizing:border-box;}' +
    '[hidden]{display:none!important;}' +
    '.presets{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin:0 0 12px;}' +
    '.preset{min-height:44px;padding:8px 12px;border-radius:var(--radius,3px);border:1px solid var(--line,#e2d8c8);background:var(--surface,#fff);color:var(--ink,#241f1a);font:inherit;font-size:0.86rem;font-weight:600;cursor:pointer;}' +
    '.preset[aria-pressed="true"]{border-color:var(--accent,#a8471f);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);}' +
    '.formule{text-align:center;font-family:var(--serif,serif);font-style:italic;font-size:0.98rem;font-weight:600;color:var(--ink,#241f1a);margin:0 0 12px;line-height:1.5;}' +
    '.formule span{display:inline-block;margin:0 6px;}' +
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:14px;}' +
    'svg{width:100%;max-width:460px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.4;}' +
    '.fleche{fill:var(--ink-soft,#6b6055);}' +
    '.grille{stroke:var(--line,#e2d8c8);stroke-width:1;}' +
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
    '.verdict{text-align:center;font-size:0.88rem;font-weight:600;margin:0 0 14px;padding:10px 14px;border-radius:var(--radius,3px);color:var(--plan,#5b4ea3);background:var(--surface-2,#faf6f0);line-height:1.45;}' +
    '.pari{display:flex;flex-direction:column;gap:8px;margin:0 0 14px;padding:10px 12px;border:1px solid var(--line,#e2d8c8);border-radius:var(--radius,3px);}' +
    '.case{display:flex;align-items:center;gap:10px;min-height:44px;cursor:pointer;font-weight:600;color:var(--ink,#241f1a);}' +
    '.case input{width:22px;height:22px;accent-color:var(--plan,#5b4ea3);}' +
    '.pari-ligne{display:flex;flex-wrap:wrap;align-items:center;gap:10px;}' +
    '.pari-ligne label{font-size:0.9rem;color:var(--ink,#241f1a);}' +
    '.pari-ligne input{width:96px;min-height:44px;padding:6px 10px;font:inherit;font-variant-numeric:tabular-nums;border:1px solid var(--line,#e2d8c8);border-radius:var(--radius,3px);background:var(--surface,#fff);color:var(--ink,#241f1a);}' +
    '.btn{min-height:44px;padding:8px 14px;border-radius:var(--radius,3px);border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font-weight:600;cursor:pointer;font-size:0.88rem;font-family:inherit;}' +
    '.btn:hover{background:var(--accent-soft-line,#e8c4a4);}' +
    '.retour{margin:0;font-size:0.88rem;font-weight:600;line-height:1.45;}' +
    '.retour-ok{color:var(--good,#2f7a4f);}' +
    '.retour-ko{color:var(--bad,#b23a3a);}' +
    '.tableau-zone{margin:0 0 16px;}' +
    '.tableau-defile{overflow-x:auto;}' +
    'table{width:100%;border-collapse:collapse;font-size:0.84rem;font-variant-numeric:tabular-nums;color:var(--ink,#241f1a);}' +
    'th,td{padding:6px 6px;border-bottom:1px solid var(--line,#e2d8c8);text-align:right;white-space:nowrap;}' +
    'th{font-weight:700;color:var(--ink-soft,#6b6055);background:var(--surface-2,#faf6f0);}' +
    'th:last-child,td:last-child{text-align:left;}' +
    'tr.avant td{background:var(--surface-2,#faf6f0);}' +
    'tr.bascule td{background:var(--accent-soft,#f6e2d3);font-weight:700;color:var(--plan,#5b4ea3);}' +
    'tr.apres td{background:var(--surface-2,#faf6f0);}' +
    '.tableau-pied{display:flex;justify-content:center;margin-top:8px;}' +
    '.controles{display:flex;flex-direction:column;gap:12px;}' +
    '.curseur{display:flex;flex-direction:column;gap:6px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;}' +
    '.curseur.cote-a label{color:var(--good,#2f7a4f);}' +
    '.curseur.cote-b label{color:var(--accent-ink,#7a3212);}' +
    '.curseur-row{display:flex;align-items:center;gap:12px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;min-height:44px;accent-color:var(--accent,#a8471f);min-width:0;}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:84px;text-align:right;font-size:0.9rem;}' +
    '.btn-reset{align-self:center;}' +
    '</style>' +
    '<div class="presets" role="group" aria-label="Préréglages">' +
    '<button type="button" class="preset" data-preset="villes">Deux villes</button>' +
    '<button type="button" class="preset" data-preset="comptes">Intérêts simples contre composés</button>' +
    '<button type="button" class="preset" data-preset="sansBascule">Pas de bascule</button>' +
    '</div>' +
    '<p class="formule" id="formule"></p>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" xmlns="http://www.w3.org/2000/svg"></svg></div>' +
    '<div class="pari">' +
    '<label class="case"><input type="checkbox" id="pari-on"> Je parie d\'abord (la réponse est masquée)</label>' +
    '<div class="pari-ligne" id="pari-ligne" hidden>' +
    '<label for="pari-annee">B dépasse A à partir de l\'année</label>' +
    '<input type="number" id="pari-annee" inputmode="numeric" step="1">' +
    '<button type="button" class="btn" id="pari-verifier">Vérifier</button>' +
    '</div>' +
    '<p class="retour" id="pari-retour" hidden></p>' +
    '</div>' +
    '<p class="verdict" id="verdict"></p>' +
    '<div class="tableau-zone" id="tableau-zone">' +
    '<div class="tableau-defile"><table><thead><tr><th>n</th><th>année</th><th id="th-a">Aₙ</th><th id="th-b">Bₙ</th><th>B &gt; A ?</th></tr></thead><tbody id="tbody"></tbody></table></div>' +
    '<div class="tableau-pied"><button type="button" class="btn" id="tout-voir">Voir les 20 ans</button></div>' +
    '</div>' +
    '<div class="controles">' +
    curseur("a1", "cote-a") + curseur("ra", "cote-a") + curseur("b1", "cote-b") + curseur("qb", "cote-b") +
    '<button class="btn btn-reset" id="reset" type="button">Réinitialiser</button>' +
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
    this._shadow = shadow;
    this._preset = "villes";
    this._toutVoir = false;
    this._pariOn = false;
    this._revele = false;
    this._formule = shadow.getElementById("formule");
    this._svg = shadow.getElementById("svg");
    this._verdict = shadow.getElementById("verdict");
    this._tbody = shadow.getElementById("tbody");
    this._tableauZone = shadow.getElementById("tableau-zone");
    this._btnToutVoir = shadow.getElementById("tout-voir");
    this._casePari = shadow.getElementById("pari-on");
    this._lignePari = shadow.getElementById("pari-ligne");
    this._inputPari = shadow.getElementById("pari-annee");
    this._btnVerifier = shadow.getElementById("pari-verifier");
    this._retourPari = shadow.getElementById("pari-retour");
    this._inputs = {};
    var self = this;
    ["a1", "ra", "b1", "qb"].forEach(function (k) {
      self._inputs[k] = { input: shadow.getElementById(k), label: shadow.getElementById(k + "-label"), valeur: shadow.getElementById(k + "-valeur") };
    });
    this._presetBtns = Array.prototype.slice.call(shadow.querySelectorAll(".preset"));
    this._resetBtn = shadow.getElementById("reset");
  };

  ComparaisonSuitesWidgetClass.prototype._appliquerPreset = function (nom) {
    var p = PRESETS[nom];
    var sc = SCENARIOS[p.scenario];
    this._preset = nom;
    this._scenario = p.scenario;
    this._v = { a1: p.a1, ra: p.ra, b1: p.b1, qb: p.qb };
    var labels = { a1: sc.labelA1, ra: sc.labelRa, b1: sc.labelB1, qb: sc.labelQb };
    for (var k in this._inputs) {
      var b = sc[k], el = this._inputs[k].input;
      el.min = String(b.min); el.max = String(b.max); el.step = String(b.step);
      el.value = String(this._v[k]);
      this._inputs[k].label.textContent = labels[k];
    }
    this._shadow.getElementById("th-a").textContent = "Aₙ (" + sc.uniteCourte + ")";
    this._shadow.getElementById("th-b").textContent = "Bₙ (" + sc.uniteCourte + ")";
    this._presetBtns.forEach(function (btn) { btn.setAttribute("aria-pressed", btn.dataset.preset === nom ? "true" : "false"); });
    this._revele = false;
    this._inputPari.value = "";
    this._retourPari.hidden = true;
  };

  ComparaisonSuitesWidgetClass.prototype.connectedCallback = function () {
    var self = this;
    this._handlers = [];
    function on(el, ev, fn) { el.addEventListener(ev, fn); self._handlers.push([el, ev, fn]); }
    Object.keys(this._inputs).forEach(function (k) {
      on(self._inputs[k].input, "input", function () {
        self._v[k] = parseFloat(self._inputs[k].input.value);
        self._revele = false; self._retourPari.hidden = true;
        self._rendre();
      });
    });
    this._presetBtns.forEach(function (btn) {
      on(btn, "click", function () { self._appliquerPreset(btn.dataset.preset); self._rendre(); });
    });
    on(this._resetBtn, "click", function () {
      self._toutVoir = false; self._pariOn = false; self._casePari.checked = false;
      self._appliquerPreset("villes"); self._rendre();
    });
    on(this._btnToutVoir, "click", function () { self._toutVoir = !self._toutVoir; self._rendre(); });
    on(this._casePari, "change", function () {
      self._pariOn = self._casePari.checked; self._revele = false; self._retourPari.hidden = true; self._rendre();
    });
    on(this._btnVerifier, "click", function () { self._verifierPari(); });
    on(this._inputPari, "keydown", function (e) { if (e.key === "Enter") self._verifierPari(); });
    this._appliquerPreset(this._preset);
    this._rendre();
  };

  ComparaisonSuitesWidgetClass.prototype.disconnectedCallback = function () {
    (this._handlers || []).forEach(function (h) { h[0].removeEventListener(h[1], h[2]); });
    this._handlers = [];
  };

  ComparaisonSuitesWidgetClass.prototype._calculer = function () {
    var sc = SCENARIOS[this._scenario], v = this._v;
    var pasA = sc.raEnPct ? v.a1 * v.ra / 100 : v.ra;
    var qb = 1 + v.qb / 100;
    var A = [], B = [], rang = -1;
    for (var n = 1; n <= N_ANNEES; n++) {
      // Valeurs arrondies à l'affichage (centime ou habitant) AVANT la comparaison : le tableau
      // et la conclusion ne peuvent jamais se contredire.
      var f = Math.pow(10, sc.decimales);
      var a = Math.round((v.a1 + (n - 1) * pasA) * f) / f;
      var b = Math.round(v.b1 * Math.pow(qb, n - 1) * f) / f;
      A.push(a); B.push(b);
      if (rang === -1 && b > a) rang = n;
    }
    return { sc: sc, pasA: pasA, qb: qb, A: A, B: B, rang: rang };
  };

  ComparaisonSuitesWidgetClass.prototype._verifierPari = function () {
    var c = this._calculer(), sc = c.sc;
    var annee = parseInt(this._inputPari.value, 10);
    this._retourPari.hidden = false;
    if (isNaN(annee)) {
      this._retourPari.className = "retour retour-ko";
      this._retourPari.textContent = "Écris une année (un nombre entier), puis vérifie.";
      return;
    }
    this._revele = true;
    if (c.rang === -1) {
      this._retourPari.className = "retour retour-ko";
      this._retourPari.textContent = "Piège : B ne dépasse jamais A sur ces 20 ans — aucune année ne convient.";
    } else {
      var anneeB = sc.anneeDepart + c.rang - 1;
      if (annee === anneeB) {
        this._retourPari.className = "retour retour-ok";
        this._retourPari.textContent = "Juste ! B dépasse A à partir de " + anneeB + ".";
      } else if (annee < anneeB) {
        var i = annee - sc.anneeDepart;
        var detail = i >= 0 && i < N_ANNEES
          ? " (A = " + formatNombreFr(c.A[i], sc.decimales) + NBSP + sc.uniteCourte + ", B = " + formatNombreFr(c.B[i], sc.decimales) + NBSP + sc.uniteCourte + ")"
          : "";
        this._retourPari.className = "retour retour-ko";
        this._retourPari.textContent = "Trop tôt : en " + annee + ", B ne dépasse pas encore A" + detail + ". La bascule a lieu en " + anneeB + ".";
      } else {
        this._retourPari.className = "retour retour-ko";
        this._retourPari.textContent = "Trop tard : B dépasse déjà A en " + anneeB + " — vérifie toujours l'année précédente.";
      }
    }
    this._rendre();
  };

  ComparaisonSuitesWidgetClass.prototype._rendre = function () {
    var c = this._calculer(), sc = c.sc, v = this._v, self = this;
    var masque = this._pariOn && !this._revele;

    // Curseurs
    this._inputs.a1.valeur.textContent = formatNombreFr(v.a1, 0) + NBSP + sc.uniteCourte;
    this._inputs.ra.valeur.textContent = sc.raEnPct ? formatNombreFr(v.ra, decimalesUtiles(v.ra, 1)) + NBSP + "%" : "+" + formatNombreFr(v.ra, 0);
    this._inputs.b1.valeur.textContent = formatNombreFr(v.b1, 0) + NBSP + sc.uniteCourte;
    this._inputs.qb.valeur.textContent = formatTaux(v.qb);

    // Formules
    this._formule.innerHTML = "";
    var fA = document.createElement("span");
    fA.textContent = "Aₙ = " + formatNombreFr(v.a1, 0) + " + (n − 1) × " + formatNombreFr(c.pasA, decimalesUtiles(c.pasA, 2));
    var fB = document.createElement("span");
    fB.textContent = "Bₙ = " + formatNombreFr(v.b1, 0) + " × " + formatNombreFr(c.qb, Math.max(2, decimalesUtiles(c.qb, 3))) + exposantUnicode("n−1");
    this._formule.appendChild(fA);
    this._formule.appendChild(fB);

    // Pari
    this._lignePari.hidden = !this._pariOn;
    if (!this._pariOn) this._retourPari.hidden = true;
    this._inputPari.min = String(sc.anneeDepart);
    this._inputPari.max = String(sc.anneeDepart + N_ANNEES - 1);
    this._inputPari.placeholder = String(sc.anneeDepart + 10);

    // Conclusion
    this._verdict.hidden = masque;
    if (c.rang === -1) {
      this._verdict.textContent = "B ne dépasse jamais A sur ces 20 ans" + (v.qb < 0 ? " : B diminue chaque année, A augmente." : ".");
    } else if (c.rang === 1) {
      this._verdict.textContent = "B dépasse A dès le départ (n = 1, année " + sc.anneeDepart + ") : il n'y a pas de bascule à chercher.";
    } else {
      var anneeB = sc.anneeDepart + c.rang - 1;
      this._verdict.textContent =
        "Bascule au rang n = " + c.rang + " (année " + anneeB + ") — vérifié : au rang n = " + (c.rang - 1) +
        " (année " + (anneeB - 1) + "), B était encore ≤ A. B dépasse donc A à partir de " + anneeB + ".";
    }

    // Tableau de balayage
    this._tableauZone.hidden = masque;
    this._tbody.innerHTML = "";
    var debut, fin;
    if (this._toutVoir) { debut = 1; fin = N_ANNEES; }
    else if (c.rang > 1) { debut = Math.max(1, c.rang - 2); fin = Math.min(N_ANNEES, c.rang + 1); }
    else if (c.rang === 1) { debut = 1; fin = 3; }
    else { debut = N_ANNEES - 2; fin = N_ANNEES; }
    for (var n = debut; n <= fin; n++) {
      var tr = document.createElement("tr");
      var oui = c.B[n - 1] > c.A[n - 1];
      var etat = oui ? "oui" : "non";
      if (c.rang > 1 && n === c.rang - 1) tr.className = "avant";
      if (c.rang > 0 && n === c.rang) { tr.className = "bascule"; if (c.rang > 1) etat = "oui — bascule ici"; }
      if (c.rang > 0 && n === c.rang + 1) tr.className = "apres";
      [String(n), String(sc.anneeDepart + n - 1), formatNombreFr(c.A[n - 1], sc.decimales), formatNombreFr(c.B[n - 1], sc.decimales), etat].forEach(function (t) {
        var td = document.createElement("td"); td.textContent = t; tr.appendChild(td);
      });
      this._tbody.appendChild(tr);
    }
    this._btnToutVoir.textContent = this._toutVoir ? "Ne garder que la bascule" : "Voir les 20 ans";

    // Graphique
    var ns = "http://www.w3.org/2000/svg";
    var svg = this._svg;
    svg.innerHTML = "";
    var yMax = sc.yMax;
    function toPx(n) { return MARGE_G + ((n - 1) / (N_ANNEES - 1)) * (LARGEUR - MARGE_G - MARGE_D); }
    function toPy(val) {
      var vc = Math.max(0, Math.min(yMax, val));
      return HAUTEUR - MARGE_B - (vc / yMax) * (HAUTEUR - MARGE_H - MARGE_B);
    }
    var defs = svgEl(ns, "defs", {});
    var fleche = svgEl(ns, "marker", { id: "fleche", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" });
    fleche.appendChild(svgEl(ns, "path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche" }));
    defs.appendChild(fleche);
    var clip = svgEl(ns, "clipPath", { id: "zone" });
    clip.appendChild(svgEl(ns, "rect", { x: MARGE_G, y: MARGE_H - 4, width: LARGEUR - MARGE_G - MARGE_D + 4, height: HAUTEUR - MARGE_H - MARGE_B + 4 }));
    defs.appendChild(clip);
    svg.appendChild(defs);

    sc.yTicks.forEach(function (t) {
      var y = toPy(t);
      svg.appendChild(svgEl(ns, "line", { x1: MARGE_G, x2: LARGEUR - MARGE_D, y1: y.toFixed(2), y2: y.toFixed(2), class: "grille" }));
      var et = svgEl(ns, "text", { x: MARGE_G - 6, y: (y + 4).toFixed(2), "text-anchor": "end", class: "etiquette" });
      et.textContent = t >= 10000 ? formatNombreFr(t / 1000, 0) + NBSP + "k" : formatNombreFr(t, 0);
      svg.appendChild(et);
    });
    var zeroY = toPy(0);
    svg.appendChild(svgEl(ns, "line", { x1: MARGE_G, x2: LARGEUR - MARGE_D + 8, y1: zeroY.toFixed(2), y2: zeroY.toFixed(2), class: "axe", "marker-end": "url(#fleche)" }));
    svg.appendChild(svgEl(ns, "line", { x1: MARGE_G, x2: MARGE_G, y1: HAUTEUR - MARGE_B, y2: MARGE_H - 8, class: "axe", "marker-end": "url(#fleche)" }));
    var etiqX = svgEl(ns, "text", { x: LARGEUR - MARGE_D + 10, y: HAUTEUR - MARGE_B + 16, "text-anchor": "end", class: "etiquette" });
    etiqX.textContent = "année";
    svg.appendChild(etiqX);
    var etiqY = svgEl(ns, "text", { x: MARGE_G + 6, y: MARGE_H - 8, class: "etiquette" });
    etiqY.textContent = sc.unite;
    svg.appendChild(etiqY);

    var groupe = svgEl(ns, "g", { "clip-path": "url(#zone)" });
    svg.appendChild(groupe);
    function serie(valeurs, classeLigne, classePoint) {
      var d = "";
      valeurs.forEach(function (val, i) { d += (i === 0 ? "M" : "L") + toPx(i + 1).toFixed(2) + " " + toPy(val).toFixed(2) + " "; });
      groupe.appendChild(svgEl(ns, "path", { d: d.trim(), class: classeLigne }));
      valeurs.forEach(function (val, i) {
        if (val < 0 || val > yMax) return;
        if (i % 3 !== 0 && i !== valeurs.length - 1) return; // 1 point sur 3 + le dernier : lisible sur 20 ans
        groupe.appendChild(svgEl(ns, "circle", { cx: toPx(i + 1).toFixed(2), cy: toPy(val).toFixed(2), r: 3.6, class: classePoint }));
      });
    }
    serie(c.A, "connecteur-a", "point-a");
    serie(c.B, "connecteur-b", "point-b");

    for (var k = 0; k < N_ANNEES; k += 4) {
      var et = svgEl(ns, "text", { x: toPx(k + 1).toFixed(2), y: (HAUTEUR - MARGE_B + 16).toFixed(2), "text-anchor": "middle", class: "etiquette" });
      et.textContent = String(sc.anneeDepart + k);
      svg.appendChild(et);
    }

    if (c.rang > 1 && !masque && c.B[c.rang - 1] <= yMax) {
      var xB = toPx(c.rang), yB = toPy(c.B[c.rang - 1]);
      svg.appendChild(svgEl(ns, "line", { x1: xB.toFixed(2), x2: xB.toFixed(2), y1: (HAUTEUR - MARGE_B).toFixed(2), y2: yB.toFixed(2), class: "guide-bascule" }));
      svg.appendChild(svgEl(ns, "circle", { cx: xB.toFixed(2), cy: yB.toFixed(2), r: 5.5, class: "point-bascule" }));
      var etB = svgEl(ns, "text", { x: Math.min(xB, LARGEUR - MARGE_D - 50).toFixed(2), y: (yB - 10).toFixed(2), "text-anchor": "middle", class: "etiquette-bascule" });
      etB.textContent = "bascule : " + (sc.anneeDepart + c.rang - 1);
      svg.appendChild(etB);
    }

    var legA = svgEl(ns, "text", { x: MARGE_G + 6, y: MARGE_H + 8, class: "legende legende-a" });
    legA.textContent = sc.titreA + " (arithmétique)";
    svg.appendChild(legA);
    var legB = svgEl(ns, "text", { x: MARGE_G + 6, y: MARGE_H + 22, class: "legende legende-b" });
    legB.textContent = sc.titreB + " (géométrique)";
    svg.appendChild(legB);
  };

  if (!customElements.get("comparaison-suites-widget")) {
    customElements.define("comparaison-suites-widget", ComparaisonSuitesWidgetClass);
  }
})();
