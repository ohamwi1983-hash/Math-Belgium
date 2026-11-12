(function () {
  "use strict";

  /* ================================================================
   * <detecteur-domaine-widget> — atelier interactif (5e, chapitre 1, §1) :
   * le domaine de définition construit condition par condition.
   * Une famille d'expressions (√(ax+b)/(cx+d), √(N/D), N/√D, dénominateur du
   * 2e degré, racine cubique au dénominateur), des curseurs entiers pour les
   * coefficients ; chaque condition d'existence apparaît en bande sur sa propre
   * droite graduée, puis la droite « intersection » = dom f. Pour √(N/D), le
   * tableau de signes de N, D et N/D se construit en direct. Une sonde x
   * calcule f(x) ou dit pourquoi c'est impossible.
   *
   * Les ensembles sont calculés EXACTEMENT (points critiques + signe entre
   * eux), jamais par échantillonnage : les bornes ouvertes/fermées sont celles
   * de l'algèbre. Fenêtre FIXE x ∈ [−8 ; 8] quelle que soit la famille.
   * Web Component (Shadow DOM).
   * ================================================================ */

  var X_MIN = -8, X_MAX = 8;
  var LARGEUR = 420, MARGE_G = 26, MARGE_D = 26, HAUTEUR = 300;
  var LIGNE_L = LARGEUR - MARGE_G - MARGE_D;
  var Y_LIGNES = [44, 108, 172];
  // La droite « intersection » suit la dernière condition (hauteur selon la FAMILLE, jamais selon un curseur).
  function yIntersection(n) { return Y_LIGNES[n - 1] + 78; }
  var EPS = 1e-9;

  var FAMILLES = [
    {
      id: "racQuotient",
      nom: "√(N/D) — racine d'un quotient",
      forme: "f(x) = √( (ax + b) / (cx + d) )",
      curseurs: ["a", "b", "c", "d"],
      defaut: { a: 1, b: -1, c: 1, d: 2 },
      nonNuls: ["a", "c"],
    },
    {
      id: "racSurAff",
      nom: "√(ax + b) / (cx + d) — racine sur affine",
      forme: "f(x) = √(ax + b) / (cx + d)",
      curseurs: ["a", "b", "c", "d"],
      defaut: { a: 2, b: 6, c: 1, d: -1 },
      nonNuls: ["a", "c"],
    },
    {
      id: "affSurRac",
      nom: "N/√D — racine au dénominateur",
      forme: "f(x) = (ax + b) / √(cx + d)",
      curseurs: ["a", "b", "c", "d"],
      defaut: { a: 1, b: 3, c: -2, d: 6 },
      nonNuls: ["a", "c"],
    },
    {
      id: "denom2",
      nom: "dénominateur du 2e degré",
      forme: "f(x) = (ax + b) / (x² + px + q)",
      curseurs: ["a", "b", "p", "q"],
      defaut: { a: 1, b: 1, p: -5, q: 6 },
      nonNuls: ["a"],
    },
    {
      id: "rac3Denom",
      nom: "∛ au dénominateur — racine cubique",
      forme: "f(x) = (ax + b) / ∛(cx + d)",
      curseurs: ["a", "b", "c", "d"],
      defaut: { a: 1, b: 2, c: 1, d: -4 },
      nonNuls: ["a", "c"],
    },
  ];

  var BORNES = { a: [-4, 4], b: [-6, 6], c: [-4, 4], d: [-6, 6], p: [-6, 6], q: [-6, 6] };

  // ------------------------------------------------------------------
  // Formatage (unicode, « − » typographique, virgule décimale)
  // ------------------------------------------------------------------
  function moins(s) { return String(s).replace(/-/g, "−"); }

  function formatNombreFr(n, decimales) {
    var f = Math.pow(10, decimales);
    var r = Math.round(n * f) / f;
    if (Object.is(r, -0)) r = 0;
    return moins(r.toFixed(decimales).replace(/\.?0+$/, "").replace(".", ","));
  }

  function pgcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = b; b = a % b; a = t; } return a || 1; }

  // −num/den sous forme irréductible, signe sorti : « −5/3 », « 2 », « 1/2 ».
  function fraction(num, den) {
    if (den < 0) { num = -num; den = -den; }
    var g = pgcd(num, den);
    num /= g; den /= g;
    var s = den === 1 ? String(Math.abs(num)) : Math.abs(num) + "/" + den;
    return (num < 0 ? "−" : "") + s;
  }

  // a·x + b lisible : « x − 1 », « −2x + 6 », « 3x », « 4 ».
  function affine(a, b, v) {
    v = v || "x";
    var s = "";
    if (a !== 0) s = (a === 1 ? "" : a === -1 ? "−" : moins(a)) + v;
    if (b !== 0) s += s ? (b > 0 ? " + " + b : " − " + Math.abs(b)) : moins(b);
    return s || "0";
  }

  function trinome(p, q) {
    var s = "x²";
    if (p !== 0) s += (p > 0 ? " + " : " − ") + (Math.abs(p) === 1 ? "" : Math.abs(p)) + "x";
    if (q !== 0) s += (q > 0 ? " + " : " − ") + Math.abs(q);
    return s;
  }

  // ------------------------------------------------------------------
  // Ensembles : réunion d'intervalles calculée par points critiques
  // ------------------------------------------------------------------
  // `points` : [{ v, lab }] ; `pred(x)` : vrai si x est dans l'ensemble (évalué
  // aux points critiques ET en un point de chaque intervalle ouvert entre eux).
  function construireEnsemble(points, pred) {
    var pts = points.slice().sort(function (u, w) { return u.v - w.v; });
    var uniques = [];
    pts.forEach(function (p) { if (!uniques.length || Math.abs(uniques[uniques.length - 1].v - p.v) > EPS) uniques.push(p); });
    var bornes = [{ v: -Infinity }].concat(uniques, [{ v: Infinity }]);
    var morceaux = [];
    for (var i = 0; i < bornes.length - 1; i++) {
      var g = bornes[i], d = bornes[i + 1];
      var test = !isFinite(g.v) ? (isFinite(d.v) ? d.v - 1 : 0) : !isFinite(d.v) ? g.v + 1 : (g.v + d.v) / 2;
      if (pred(test)) {
        var inclG = isFinite(g.v) && pred(g.v);
        var dernier = morceaux[morceaux.length - 1];
        if (dernier && isFinite(g.v) && Math.abs(dernier.b - g.v) < EPS && dernier.inclB) {
          dernier.b = d.v; dernier.labB = d.lab; dernier.inclB = false;
        } else {
          morceaux.push({ a: g.v, labA: g.lab, inclA: inclG, b: d.v, labB: d.lab, inclB: false });
        }
      }
      // Le point critique de droite : inclus ? (on le rattache au morceau courant s'il le prolonge)
      if (isFinite(d.v) && pred(d.v)) {
        var m = morceaux[morceaux.length - 1];
        if (m && Math.abs(m.b - d.v) < EPS) m.inclB = true;
        else morceaux.push({ a: d.v, labA: d.lab, inclA: true, b: d.v, labB: d.lab, inclB: true });
      }
    }
    return morceaux;
  }

  function texteEnsemble(morceaux) {
    if (!morceaux.length) return "∅";
    if (morceaux.length === 1 && !isFinite(morceaux[0].a) && !isFinite(morceaux[0].b)) return "ℝ";
    // ℝ privé de points : tous les morceaux se touchent par des bornes exclues
    var priveDePoints = !isFinite(morceaux[0].a) && !isFinite(morceaux[morceaux.length - 1].b);
    for (var i = 0; i < morceaux.length - 1 && priveDePoints; i++) {
      if (Math.abs(morceaux[i].b - morceaux[i + 1].a) > EPS) priveDePoints = false;
    }
    if (priveDePoints && morceaux.length > 1) {
      var exclus = [];
      for (var k = 0; k < morceaux.length - 1; k++) exclus.push(morceaux[k].labB);
      return "ℝ ∖ {" + exclus.join(" ; ") + "}";
    }
    return morceaux.map(function (m) {
      if (Math.abs(m.a - m.b) < EPS) return "{" + m.labA + "}";
      var g = isFinite(m.a) ? (m.inclA ? "[" : "]") + m.labA : "]−∞";
      var d = isFinite(m.b) ? m.labB + (m.inclB ? "]" : "[") : "+∞[";
      // Espaces insécables DANS un intervalle : le retour à la ligne ne se fait qu'entre deux morceaux.
      return g + "\u00a0;\u00a0" + d;
    }).join(" ∪ ");
  }

  // ------------------------------------------------------------------
  // Conditions par famille : { libelle, pred, points, raison, nature }
  // ------------------------------------------------------------------
  function racineLineaire(a, b) { return { v: -b / a, lab: fraction(-b, a) }; }
  function nul(v) { return Math.abs(v) < EPS; }

  function conditionsDe(fam, c) {
    var N = function (x) { return c.a * x + c.b; };
    var D = function (x) { return c.c * x + c.d; };
    var rN = racineLineaire(c.a, c.b);
    var rD = c.c !== undefined && c.c !== 0 ? racineLineaire(c.c, c.d) : null;
    switch (fam.id) {
      case "racSurAff":
        return [
          { libelle: "CE 1 (racine) : " + affine(c.a, c.b) + " ≥ 0", pred: function (x) { var v = N(x); return v > 0 || nul(v); }, points: [rN], raison: "racine d'un négatif" },
          { libelle: "CE 2 (dénominateur) : " + affine(c.c, c.d) + " ≠ 0", pred: function (x) { return !nul(D(x)); }, points: [rD], raison: "dénominateur nul" },
        ];
      case "racQuotient":
        return [
          { libelle: "CE 1 (dénominateur) : " + affine(c.c, c.d) + " ≠ 0", pred: function (x) { return !nul(D(x)); }, points: [rD], raison: "dénominateur nul" },
          { libelle: "CE 2 (racine) : (" + affine(c.a, c.b) + ") / (" + affine(c.c, c.d) + ") ≥ 0", pred: function (x) { var d = D(x); if (nul(d)) return false; var q = N(x) / d; return q > 0 || nul(N(x)); }, points: [rN, rD], raison: "racine d'un négatif" },
        ];
      case "affSurRac":
        return [
          { libelle: "CE 1 (racine) : " + affine(c.c, c.d) + " ≥ 0", pred: function (x) { var v = D(x); return v > 0 || nul(v); }, points: [rD], raison: "racine d'un négatif" },
          { libelle: "CE 2 (dénominateur) : √(" + affine(c.c, c.d) + ") ≠ 0", pred: function (x) { return !nul(D(x)); }, points: [rD], raison: "dénominateur nul" },
        ];
      case "denom2": {
        var delta = c.p * c.p - 4 * c.q;
        var T = function (x) { return x * x + c.p * x + c.q; };
        var pts = [];
        if (delta === 0) pts = [{ v: -c.p / 2, lab: fraction(-c.p, 2) }];
        else if (delta > 0) {
          var rac = Math.sqrt(delta);
          var carre = Math.round(rac) * Math.round(rac) === delta;
          var lab1, lab2;
          if (carre) { lab1 = fraction(-c.p - Math.round(rac), 2); lab2 = fraction(-c.p + Math.round(rac), 2); }
          else {
            var centre = c.p === 0 ? "" : moins(-c.p);
            lab1 = "(" + (centre ? centre + " − " : "−") + "√" + delta + ")/2";
            lab2 = "(" + (centre ? centre + " + " : "") + "√" + delta + ")/2";
          }
          pts = [{ v: (-c.p - rac) / 2, lab: lab1 }, { v: (-c.p + rac) / 2, lab: lab2 }];
        }
        return [
          { libelle: "CE (dénominateur) : " + trinome(c.p, c.q) + " ≠ 0   (Δ = " + moins(delta) + ")", pred: function (x) { return !nul(T(x)) && !pts.some(function (p) { return Math.abs(p.v - x) < EPS; }); }, points: pts, raison: "dénominateur nul" },
        ];
      }
      case "rac3Denom":
        return [
          { libelle: "∛(" + affine(c.c, c.d) + ") : racine impaire, aucune condition", pred: function () { return true; }, points: [], raison: "" },
          { libelle: "CE (dénominateur) : ∛(" + affine(c.c, c.d) + ") ≠ 0 ⟺ " + affine(c.c, c.d) + " ≠ 0", pred: function (x) { return !nul(D(x)); }, points: [rD], raison: "dénominateur nul" },
        ];
    }
    return [];
  }

  function formuleDe(fam, c) {
    switch (fam.id) {
      case "racSurAff": return "f(x) = √(" + affine(c.a, c.b) + ") / (" + affine(c.c, c.d) + ")";
      case "racQuotient": return "f(x) = √( (" + affine(c.a, c.b) + ") / (" + affine(c.c, c.d) + ") )";
      case "affSurRac": return "f(x) = (" + affine(c.a, c.b) + ") / √(" + affine(c.c, c.d) + ")";
      case "denom2": return "f(x) = (" + affine(c.a, c.b) + ") / (" + trinome(c.p, c.q) + ")";
      case "rac3Denom": return "f(x) = (" + affine(c.a, c.b) + ") / ∛(" + affine(c.c, c.d) + ")";
    }
    return "";
  }

  function evaluer(fam, c, x) {
    var N = c.a * x + c.b;
    switch (fam.id) {
      case "racSurAff": return Math.sqrt(N) / (c.c * x + c.d);
      case "racQuotient": return Math.sqrt(N / (c.c * x + c.d));
      case "affSurRac": return N / Math.sqrt(c.c * x + c.d);
      case "denom2": return N / (x * x + c.p * x + c.q);
      case "rac3Denom": return N / Math.cbrt(c.c * x + c.d);
    }
    return NaN;
  }

  // ------------------------------------------------------------------
  // SVG
  // ------------------------------------------------------------------
  var NS = "http://www.w3.org/2000/svg";
  function svgEl(tag, attrs) {
    var el = document.createElementNS(NS, tag);
    for (var k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  }
  function xPx(x) { return MARGE_G + (x - X_MIN) / (X_MAX - X_MIN) * LIGNE_L; }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' +
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);color:var(--ink,#241f1a);}' +
    '*{box-sizing:border-box;}' +
    '.select-row{display:flex;justify-content:center;margin-bottom:10px;}' +
    'select{font-family:inherit;font-size:0.9rem;font-weight:600;color:var(--ink,#241f1a);background:var(--surface,#fff);border:1px solid var(--line,#e2d8c8);border-radius:var(--radius,3px);padding:6px 10px;max-width:100%;min-width:0;}' +
    '.formule{text-align:center;font-family:var(--serif,serif);font-size:1.08rem;margin:0 0 4px;overflow-wrap:anywhere;}' +
    '.forme{text-align:center;font-size:0.8rem;color:var(--ink-faint,#9c9083);margin:0 0 10px;}' +
    '.figure{display:flex;justify-content:center;margin-bottom:10px;}' +
    'svg{width:100%;max-width:420px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);display:block;}' +
    '.ligne{stroke:var(--line,#cbbfae);stroke-width:2;}' +
    '.fleche{fill:var(--line,#cbbfae);}' +
    '.bande{stroke:var(--good,#2f7a4f);stroke-width:7;stroke-linecap:butt;}' +
    '.bande.inter{stroke:var(--accent,#a8471f);}' +
    '.borne{stroke:var(--good,#2f7a4f);stroke-width:2;}' +
    '.borne.inter{stroke:var(--accent,#a8471f);}' +
    '.borne.pleine{fill:var(--good,#2f7a4f);}' +
    '.borne.pleine.inter{fill:var(--accent,#a8471f);}' +
    '.borne.vide{fill:var(--surface,#fff);}' +
    '.tick{stroke:var(--ink-soft,#6b6055);stroke-width:1;}' +
    '.tick-label{font-size:9.5px;fill:var(--ink-faint,#9c9083);font-family:var(--mono,monospace);}' +
    '.crit-label{font-size:10.5px;font-weight:700;fill:var(--ink,#241f1a);font-family:var(--mono,monospace);}' +
    '.ligne-label{font-size:10.5px;fill:var(--ink-soft,#6b6055);font-weight:600;}' +
    '.ligne-label.inter{fill:var(--accent-ink,#7a3212);}' +
    '.sonde{stroke:var(--plan,#5b4ea3);stroke-width:1.5;stroke-dasharray:4 3;}' +
    '.sonde-pt{stroke:var(--surface,#fff);stroke-width:1.5;}' +
    '.sonde-pt.ok{fill:var(--good,#2f7a4f);}' +
    '.sonde-pt.ko{fill:var(--bad,#b3261e);}' +
    '.liste{margin:0 0 10px;padding:0;list-style:none;font-size:0.88rem;display:flex;flex-direction:column;gap:3px;}' +
    '.liste li{overflow-wrap:anywhere;}' +
    '.liste .ens{font-family:var(--mono,monospace);font-weight:600;}' +
    '.dom{font-family:var(--mono,monospace);font-weight:700;color:var(--accent-ink,#7a3212);}' +
    '.table-zone{overflow-x:auto;margin:0 0 10px;}' +
    'table.signes{border-collapse:collapse;margin:0 auto;font-size:0.85rem;font-family:var(--mono,monospace);}' +
    'table.signes td,table.signes th{border:1px solid var(--line,#e2d8c8);padding:3px 7px;text-align:center;white-space:nowrap;}' +
    'table.signes th{font-weight:600;color:var(--ink-soft,#6b6055);text-align:left;}' +
    'td.pos{color:var(--good,#2f7a4f);font-weight:700;}td.neg{color:var(--bad,#b3261e);font-weight:700;}td.zero{font-weight:700;}td.interdit{color:var(--bad,#b3261e);font-weight:700;}' +
    '.sonde-texte{text-align:center;font-size:0.95rem;margin:0 0 12px;min-height:1.4em;}' +
    '.sonde-texte .ko{color:var(--bad,#b3261e);font-weight:600;}' +
    '.sonde-texte .ok{color:var(--good,#2f7a4f);font-weight:600;}' +
    '.curseurs{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px 14px;}' +
    '.curseur{display:flex;align-items:center;gap:8px;min-width:0;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3212);min-width:1.6em;}' +
    '.curseur input{flex:1 1 auto;min-width:0;accent-color:var(--accent,#a8471f);}' +
    '.curseur .val{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:2.6em;text-align:right;}' +
    '.sonde-row{margin-top:10px;}' +
    '</style>' +
    '<div class="select-row"><select id="famille" aria-label="Famille de fonctions"></select></div>' +
    '<p class="formule" id="formule"></p>' +
    '<p class="forme" id="forme"></p>' +
    '<div class="figure"><svg id="svg" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" role="img" aria-label="Conditions d’existence sur des droites graduées"></svg></div>' +
    '<ul class="liste" id="liste"></ul>' +
    '<div class="table-zone" id="table-zone"></div>' +
    '<p class="sonde-texte" id="sonde-texte"></p>' +
    '<div class="curseurs" id="curseurs"></div>' +
    '<div class="curseur sonde-row"><label for="sonde">x</label><input type="range" id="sonde" min="' + X_MIN + '" max="' + X_MAX + '" step="0.05" value="0"><span class="val" id="sonde-val"></span></div>';

  class DetecteurDomaineWidget extends HTMLElement {
    constructor() {
      super();
      var sh = this.attachShadow({ mode: "open" });
      sh.appendChild(TEMPLATE.content.cloneNode(true));
      this._sh = sh;
      this._fam = FAMILLES[0];
      this._c = Object.assign({}, this._fam.defaut);
      this._x = 0;
      var sel = sh.getElementById("famille");
      FAMILLES.forEach(function (f, i) {
        var o = document.createElement("option");
        o.value = String(i);
        o.textContent = f.nom;
        sel.appendChild(o);
      });
    }

    connectedCallback() {
      var self = this;
      var sh = this._sh;
      this._onFamille = function () {
        self._fam = FAMILLES[parseInt(sh.getElementById("famille").value, 10)];
        self._c = Object.assign({}, self._fam.defaut);
        self._construireCurseurs();
        self._rendre();
      };
      this._onSonde = function () {
        var v = parseFloat(sh.getElementById("sonde").value);
        // Aimant : la sonde s'accroche aux points critiques (bornes fractionnaires incluses).
        var crit = self._pointsCritiques();
        for (var i = 0; i < crit.length; i++) if (Math.abs(crit[i] - v) < 0.12) { v = crit[i]; break; }
        self._x = v;
        self._rendre();
      };
      sh.getElementById("famille").addEventListener("change", this._onFamille);
      sh.getElementById("sonde").addEventListener("input", this._onSonde);
      this._construireCurseurs();
      this._rendre();
    }

    disconnectedCallback() {
      this._sh.getElementById("famille").removeEventListener("change", this._onFamille);
      this._sh.getElementById("sonde").removeEventListener("input", this._onSonde);
    }

    _pointsCritiques() {
      var res = [];
      conditionsDe(this._fam, this._c).forEach(function (cd) { cd.points.forEach(function (p) { if (p) res.push(p.v); }); });
      return res;
    }

    _construireCurseurs() {
      var self = this;
      var zone = this._sh.getElementById("curseurs");
      zone.innerHTML = "";
      this._fam.curseurs.forEach(function (nom) {
        var b = BORNES[nom];
        var div = document.createElement("div");
        div.className = "curseur";
        var id = "c-" + nom;
        div.innerHTML = '<label for="' + id + '">' + nom + '</label><input type="range" id="' + id + '" min="' + b[0] + '" max="' + b[1] + '" step="1" value="' + self._c[nom] + '"><span class="val"></span>';
        var input = div.querySelector("input");
        var precedent = self._c[nom];
        input.addEventListener("input", function () {
          var v = parseInt(input.value, 10);
          // Valeur nulle repoussée au pas suivant, dans le sens du déplacement.
          if (v === 0 && self._fam.nonNuls.indexOf(nom) >= 0) {
            v = precedent < 0 ? 1 : -1;
            input.value = String(v);
          }
          precedent = v;
          self._c[nom] = v;
          self._rendre();
        });
        zone.appendChild(div);
      });
    }

    _rendre() {
      var sh = this._sh, fam = this._fam, c = this._c, x = this._x;
      sh.getElementById("formule").textContent = formuleDe(fam, c);
      sh.getElementById("forme").textContent = "Forme : " + fam.forme;
      fam.curseurs.forEach(function (nom) {
        var div = sh.getElementById("c-" + nom).parentNode;
        div.querySelector(".val").textContent = moins(c[nom]);
      });
      sh.getElementById("sonde-val").textContent = formatNombreFr(x, 2);

      var conds = conditionsDe(fam, c);
      var ensembles = conds.map(function (cd) { return construireEnsemble(cd.points.filter(Boolean), cd.pred); });
      var tousPoints = [];
      conds.forEach(function (cd) { cd.points.forEach(function (p) { if (p) tousPoints.push(p); }); });
      var predDom = function (v) { return conds.every(function (cd) { return cd.pred(v); }); };
      var dom = construireEnsemble(tousPoints, predDom);

      this._dessiner(conds, ensembles, dom, x);

      var liste = sh.getElementById("liste");
      liste.innerHTML = "";
      conds.forEach(function (cd, i) {
        var li = document.createElement("li");
        li.textContent = cd.libelle + "  ⟹  x ∈ ";
        var s = document.createElement("span");
        s.className = "ens";
        s.textContent = texteEnsemble(ensembles[i]);
        li.appendChild(s);
        liste.appendChild(li);
      });
      var liDom = document.createElement("li");
      var sp = document.createElement("span");
      sp.className = "dom";
      sp.textContent = "dom f = " + texteEnsemble(dom);
      liDom.appendChild(document.createTextNode("Intersection : "));
      liDom.appendChild(sp);
      liste.appendChild(liDom);

      this._tableau(fam, c);

      var t = sh.getElementById("sonde-texte");
      t.innerHTML = "";
      var viole = conds.filter(function (cd) { return !cd.pred(x); })[0];
      var debut = document.createTextNode("x = " + formatNombreFr(x, 2) + " : ");
      t.appendChild(debut);
      var span = document.createElement("span");
      if (viole) {
        span.className = "ko";
        span.textContent = "impossible — " + viole.raison;
      } else {
        var y = evaluer(fam, c, x);
        span.className = "ok";
        var exact = Math.abs(y * 1000 - Math.round(y * 1000)) < 1e-6;
        span.textContent = isFinite(y) ? "f(x) " + (exact ? "= " : "≈ ") + formatNombreFr(y, 3) : "impossible";
      }
      t.appendChild(span);
    }

    _dessinerDroite(svg, y, morceaux, label, inter) {
      svg.appendChild(svgEl("line", { x1: MARGE_G - 6, x2: LARGEUR - MARGE_D + 10, y1: y, y2: y, class: "ligne", "marker-end": "url(#fleche)" }));
      for (var t = X_MIN; t <= X_MAX; t++) {
        var px = xPx(t);
        svg.appendChild(svgEl("line", { x1: px, x2: px, y1: y - 3, y2: y + 3, class: "tick" }));
        if (t % 2 === 0) {
          var lab = svgEl("text", { x: px, y: y + 14, "text-anchor": "middle", class: "tick-label" });
          lab.textContent = moins(t);
          svg.appendChild(lab);
        }
      }
      var cls = inter ? " inter" : "";
      morceaux.forEach(function (m) {
        var a = Math.max(m.a, X_MIN), b = Math.min(m.b, X_MAX);
        if (b < X_MIN || a > X_MAX) return;
        if (b - a > EPS) svg.appendChild(svgEl("line", { x1: xPx(a).toFixed(2), x2: xPx(b).toFixed(2), y1: y, y2: y, class: "bande" + cls }));
      });
      // Bornes (pleines/vides) et étiquettes des points critiques, au-dessus de la droite
      var dejaEtiquete = [];
      morceaux.forEach(function (m) {
        [[m.a, m.inclA, m.labA], [m.b, m.inclB, m.labB]].forEach(function (bo) {
          if (!isFinite(bo[0]) || bo[0] < X_MIN || bo[0] > X_MAX) return;
          svg.appendChild(svgEl("circle", { cx: xPx(bo[0]).toFixed(2), cy: y, r: 5, class: "borne " + (bo[1] ? "pleine" : "vide") + cls }));
          if (dejaEtiquete.some(function (v) { return Math.abs(v - bo[0]) < EPS; })) return;
          dejaEtiquete.push(bo[0]);
          var tx = svgEl("text", { x: xPx(bo[0]).toFixed(2), y: y - 9, "text-anchor": "middle", class: "crit-label" });
          tx.textContent = bo[2];
          svg.appendChild(tx);
        });
      });
      var lbl = svgEl("text", { x: MARGE_G - 6, y: y - 24, class: "ligne-label" + cls });
      lbl.textContent = label;
      svg.appendChild(lbl);
    }

    _dessiner(conds, ensembles, dom, x) {
      var svg = this._sh.getElementById("svg");
      svg.innerHTML = "";
      var defs = svgEl("defs", {});
      var mk = svgEl("marker", { id: "fleche", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" });
      mk.appendChild(svgEl("path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche" }));
      defs.appendChild(mk);
      svg.appendChild(defs);
      var self = this;
      conds.forEach(function (cd, i) {
        var court = cd.libelle.length > 58 ? cd.libelle.slice(0, cd.libelle.indexOf(":")) : cd.libelle;
        self._dessinerDroite(svg, Y_LIGNES[i], ensembles[i], court, false);
      });
      var Y_INTER = yIntersection(conds.length);
      svg.setAttribute("viewBox", "0 0 " + LARGEUR + " " + (Y_INTER + 26));
      this._dessinerDroite(svg, Y_INTER, dom, "Intersection : dom f", true);
      // Sonde : verticale pointillée + un point par droite (vert si la condition est vérifiée)
      var px = xPx(x);
      var yBas = Y_INTER;
      svg.appendChild(svgEl("line", { x1: px.toFixed(2), x2: px.toFixed(2), y1: Y_LIGNES[0] - 14, y2: yBas + 8, class: "sonde" }));
      conds.forEach(function (cd, i) {
        svg.appendChild(svgEl("circle", { cx: px.toFixed(2), cy: Y_LIGNES[i], r: 3.5, class: "sonde-pt " + (cd.pred(x) ? "ok" : "ko") }));
      });
      var dedans = conds.every(function (cd) { return cd.pred(x); });
      svg.appendChild(svgEl("circle", { cx: px.toFixed(2), cy: Y_INTER, r: 3.5, class: "sonde-pt " + (dedans ? "ok" : "ko") }));
    }

    // Tableau de signes de N, D et N/D (famille √(N/D) seulement)
    _tableau(fam, c) {
      var zone = this._sh.getElementById("table-zone");
      zone.innerHTML = "";
      if (fam.id !== "racQuotient") return;
      var rN = racineLineaire(c.a, c.b), rD = racineLineaire(c.c, c.d);
      var pts = [rN, rD].sort(function (u, w) { return u.v - w.v; });
      var confondus = Math.abs(rN.v - rD.v) < EPS;
      if (confondus) pts = [rD];
      // Colonnes : −∞, intervalle, point, intervalle, (point, intervalle), +∞
      var colonnes = [];
      var bornes = [-Infinity].concat(pts.map(function (p) { return p.v; }), [Infinity]);
      for (var i = 0; i < bornes.length - 1; i++) {
        var g = bornes[i], d = bornes[i + 1];
        colonnes.push({ type: "int", x: !isFinite(g) ? d - 1 : !isFinite(d) ? g + 1 : (g + d) / 2 });
        if (isFinite(d)) colonnes.push({ type: "pt", x: d, lab: pts[i].lab });
      }
      function signe(v) { return nul(v) ? "0" : v > 0 ? "+" : "−"; }
      function cellule(txt) {
        var cls = txt === "+" ? "pos" : txt === "−" ? "neg" : txt === "0" ? "zero" : txt === "‖" ? "interdit" : "";
        return '<td class="' + cls + '">' + txt + "</td>";
      }
      var N = function (x) { return c.a * x + c.b; }, D = function (x) { return c.c * x + c.d; };
      var html = '<table class="signes"><tr><th>x</th><td>−∞</td>';
      colonnes.forEach(function (col) { html += col.type === "pt" ? "<td>" + col.lab + "</td>" : "<td></td>"; });
      html += "<td>+∞</td></tr>";
      var lignes = [
        { nom: affine(c.a, c.b), f: function (x) { return signe(N(x)); } },
        { nom: affine(c.c, c.d), f: function (x) { return signe(D(x)); } },
        { nom: "quotient", f: function (x) { return nul(D(x)) ? "‖" : signe(N(x) / D(x)); } },
      ];
      lignes.forEach(function (l) {
        html += "<tr><th>" + l.nom + "</th><td></td>";
        colonnes.forEach(function (col) { html += cellule(l.f(col.x)); });
        html += "<td></td></tr>";
      });
      html += "</table>";
      zone.innerHTML = html;
    }
  }

  if (!customElements.get("detecteur-domaine-widget")) {
    customElements.define("detecteur-domaine-widget", DetecteurDomaineWidget);
  }
})();
