(function () {
  "use strict";

  /* ================================================================
   * <parabole-par-points-widget> — atelier interactif (4e, chapitre 1,
   * § 2) : retrouver l'équation d'une parabole à partir de points.
   *  - « Sommet + point » : f(x) = a(x − x_S)² + y_S, puis le point P
   *    donne a = (y_P − y_S) / (x_P − x_S)², étape par étape.
   *  - « Zéros + point » : f(x) = a(x − x₁)(x − x₂), puis
   *    a = y_P / ((x_P − x₁)(x_P − x₂)).
   *  - « Défi » : une parabole est tracée (sommet et point à coordonnées
   *    entières, lisibles sur le quadrillage) ; l'élève saisit a, UN SEUL
   *    essai, puis la correction s'affiche. Pas de score.
   * Fenêtre FIXE x ∈ [−6 ; 6], y ∈ [−8 ; 8]. Web Component (Shadow DOM).
   * ================================================================ */

  var NS = "http://www.w3.org/2000/svg";
  var LARGEUR = 420, HAUTEUR = 360, MARGE = 14;
  var XMIN = -6, XMAX = 6, YMIN = -8, YMAX = 8;
  var EPS = 1e-9;

  function estEntier(v) { return Math.abs(v - Math.round(v)) < EPS; }
  function nb(v) {
    if (Math.abs(v) < EPS) v = 0;
    var s = estEntier(v) ? String(Math.round(v)) : (Math.round(v * 1000) / 1000).toString();
    return s.replace(".", ",").replace("-", "−");
  }
  function nb2(v) {
    if (Math.abs(v) < 0.005) v = 0;
    return (Math.round(v * 100) / 100).toString().replace(".", ",").replace("-", "−");
  }
  // nombre entre parenthèses s'il est négatif (substitution dans une formule)
  function par(v) { return v < 0 ? "(" + nb(v) + ")" : nb(v); }
  function pgcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = b; b = a % b; a = t; } return a || 1; }

  // --- rationnels { n, d } (d > 0, irréductible) ---
  function R(n, d) { if (d < 0) { n = -n; d = -d; } var g = pgcd(n, d); return { n: n / g, d: d / g }; }
  function Rent(k) { return { n: k, d: 1 }; }
  function Radd(r, s) { return R(r.n * s.d + s.n * r.d, r.d * s.d); }
  function Rmul(r, s) { return R(r.n * s.n, r.d * s.d); }
  function Rval(r) { return r.n / r.d; }
  function decimalFini(r) {
    var d = r.d;
    while (d % 2 === 0) d /= 2;
    while (d % 5 === 0) d /= 5;
    return d === 1 && estEntier(Rval(r) * 1000);
  }
  function fmtAbs(r, enFacteur) {
    var a = { n: Math.abs(r.n), d: r.d };
    if (decimalFini(a)) return nb(Rval(a));
    return enFacteur ? "(" + a.n + "/" + a.d + ")" : a.n + "/" + a.d;
  }
  function fmtR(r) { return (r.n < 0 ? "−" : "") + fmtAbs(r, false); }
  function termeR(r, lettre, premier) {
    if (r.n === 0) return "";
    var unite = Math.abs(r.n) === r.d;
    var corps = (lettre && unite) ? lettre : fmtAbs(r, !!lettre) + lettre;
    if (premier) return (r.n < 0 ? "−" : "") + corps;
    return (r.n < 0 ? " − " : " + ") + corps;
  }
  function polynomeR(a, b, c) {
    var s = termeR(a, "x²", true);
    s += termeR(b, "x", s === "");
    s += termeR(c, "", s === "");
    return s === "" ? "0" : s;
  }
  function coefTeteR(a) {
    if (a.n === a.d) return "";
    if (a.n === -a.d) return "−";
    return (a.n < 0 ? "−" : "") + fmtAbs(a, true);
  }
  function facteur(r) {
    if (Math.abs(r) < EPS) return "x";
    return "(x " + (r > 0 ? "− " : "+ ") + nb(Math.abs(r)) + ")";
  }
  // valeur de a « lisible » : 4/4 = 1, 2/4 = 0,5, 4/9 ≈ 0,44
  function quotient(num, den) {
    var r = R(num, den), neg = (num < 0) !== (den < 0);
    if (Math.abs(den) === 1) return { texte: nb(Rval(r)), r: r };
    var brut = (neg && num !== 0 ? "−" : "") + Math.abs(num) + "/" + Math.abs(den);
    if (decimalFini(r)) return { texte: brut + " = " + nb(Rval(r)), r: r };
    var reduit = r.d !== Math.abs(den) ? " = " + fmtR(r) : "";
    return { texte: brut + reduit + " ≈ " + nb2(Rval(r)), r: r };
  }
  function svgEl(tag, attrs) {
    var el = document.createElementNS(NS, tag);
    for (var k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  }
  function px(x, y) {
    return [MARGE + (x - XMIN) / (XMAX - XMIN) * (LARGEUR - 2 * MARGE),
      MARGE + (YMAX - y) / (YMAX - YMIN) * (HAUTEUR - 2 * MARGE)];
  }
  function alea(min, max) { return min + Math.floor(Math.random() * (max - min + 1)); }

  var CURSEURS = {
    sommet: [["xs", "x<sub>S</sub> (sommet)", -4, 4], ["ys", "y<sub>S</sub> (sommet)", -6, 6], ["xp", "x<sub>P</sub> (point P)", -5, 5], ["yp", "y<sub>P</sub> (point P)", -8, 8]],
    zeros: [["x1", "x₁ (premier zéro)", -5, 5], ["x2", "x₂ (second zéro)", -5, 5], ["xp", "x<sub>P</sub> (point P)", -5, 5], ["yp", "y<sub>P</sub> (point P)", -8, 8]],
  };

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' +
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);color:var(--ink,#241f1a);}' +
    '*{box-sizing:border-box;}' +
    '.barre{display:flex;gap:6px;flex-wrap:wrap;justify-content:center;margin:0 0 10px;}' +
    '.btn{min-height:44px;min-width:52px;padding:6px 12px;border-radius:var(--radius,3px);border:1px solid var(--line,#e2d8c8);background:var(--surface,#fff);color:var(--ink,#241f1a);font:inherit;font-weight:600;cursor:pointer;}' +
    '.btn[aria-pressed="true"]{background:var(--accent-soft,#f6e2d3);border-color:var(--accent,#a8471f);color:var(--accent-ink,#7a3212);}' +
    '.btn:disabled{opacity:0.5;cursor:default;}' +
    '.btn-principal{background:var(--accent,#a8471f);border-color:var(--accent,#a8471f);color:var(--surface,#fff);}' +
    '.zone{display:flex;justify-content:center;margin:0 0 12px;}' +
    'svg{width:100%;max-width:420px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.4;}' +
    '.fleche{fill:var(--ink-soft,#6b6055);}' +
    '.grille{stroke:var(--line,#e2d8c8);stroke-width:0.7;}' +
    '.courbe{stroke:var(--accent,#a8471f);stroke-width:2.6;fill:none;}' +
    '.etiquette{font-size:12px;fill:var(--ink-soft,#6b6055);}' +
    '.pt-cle{fill:var(--plan,#6b4fa0);}' +
    '.pt-p{fill:var(--good,#2f7a4f);}' +
    '.axe-sym{stroke:var(--plan,#6b4fa0);stroke-width:1.3;stroke-dasharray:5 4;}' +
    '.nom-pt{font-size:13px;font-weight:700;paint-order:stroke;stroke:var(--surface-2,#faf6f0);stroke-width:4px;}' +
    '.panneau{border:1px solid var(--line,#e2d8c8);border-radius:var(--radius,3px);background:var(--surface,#fff);padding:10px 12px;margin:0 0 12px;}' +
    '.etapes{margin:0;padding-left:1.4em;line-height:1.55;}' +
    '.etapes li{margin:0 0 4px;overflow-wrap:anywhere;}' +
    '.etapes .m{font-family:var(--serif,serif);font-style:italic;font-weight:600;white-space:nowrap;}' +
    '.resultat{margin:8px 0 0;padding:8px 10px;border-left:4px solid var(--accent,#a8471f);background:var(--surface-2,#faf6f0);font-family:var(--serif,serif);font-style:italic;font-weight:700;font-size:1.05rem;overflow-wrap:anywhere;}' +
    '.alerte{margin:0;padding:8px 10px;border-left:4px solid var(--plan,#6b4fa0);line-height:1.5;}' +
    '.controles{display:grid;grid-template-columns:1fr 1fr;gap:8px 14px;}' +
    '@media (max-width:520px){.controles{grid-template-columns:1fr;}}' +
    '.curseur{display:flex;flex-direction:column;gap:2px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3212);}' +
    '.curseur-row{display:flex;align-items:center;gap:10px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;min-width:0;min-height:44px;accent-color:var(--accent,#a8471f);}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:30px;text-align:right;}' +
    '.consigne{margin:0 0 10px;line-height:1.5;}' +
    '.saisie{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:0 0 10px;}' +
    '.saisie label{font-family:var(--serif,serif);font-style:italic;font-weight:700;font-size:1.1rem;}' +
    '.saisie input{min-height:44px;width:120px;padding:6px 10px;font:inherit;font-size:1.05rem;border:1px solid var(--line,#e2d8c8);border-radius:var(--radius,3px);background:var(--surface,#fff);color:var(--ink,#241f1a);}' +
    '.saisie input:focus{outline:2px solid var(--accent,#a8471f);outline-offset:1px;}' +
    '.retour{margin:0 0 8px;font-weight:700;}' +
    '.retour.ok{color:var(--good,#2f7a4f);}' +
    '.retour.ko{color:var(--bad,#b3261e);}' +
    '.retour.info{color:var(--ink-soft,#6b6055);font-weight:500;}' +
    '[hidden]{display:none !important;}' +
    '</style>' +
    '<div class="barre" role="group" aria-label="Mode">' +
    '<button type="button" class="btn" data-mode="sommet">Sommet + point</button>' +
    '<button type="button" class="btn" data-mode="zeros">Zéros + point</button>' +
    '<button type="button" class="btn" data-mode="defi">Défi</button>' +
    '</div>' +
    '<div class="zone"><svg id="graphe" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" role="img" aria-label="Parabole et points donnés"></svg></div>' +
    '<div id="bloc-calcul">' +
    '<div class="panneau" id="calcul" aria-live="polite"></div>' +
    '<div class="controles" id="controles"></div>' +
    '</div>' +
    '<div id="bloc-defi" hidden>' +
    '<p class="consigne">La parabole tracée a pour sommet <b>S</b> et passe par le point <b>P</b>. Lis leurs coordonnées sur le quadrillage, puis trouve le coefficient <i>a</i>. Un seul essai.</p>' +
    '<div class="saisie"><label for="rep">a =</label><input id="rep" type="text" inputmode="decimal" autocomplete="off" spellcheck="false" aria-describedby="retour"><button type="button" class="btn btn-principal" id="valider">Valider</button></div>' +
    '<p class="retour" id="retour" aria-live="polite"></p>' +
    '<div class="panneau" id="correction" hidden></div>' +
    '<div class="barre"><button type="button" class="btn" id="nouveau">Nouveau défi</button></div>' +
    '</div>';

  class ParaboleParPointsWidget extends HTMLElement {
    constructor() {
      super();
      var sh = this.attachShadow({ mode: "open" });
      sh.appendChild(TEMPLATE.content.cloneNode(true));
      var $ = function (id) { return sh.getElementById(id); };
      this._el = {
        graphe: $("graphe"), blocCalcul: $("bloc-calcul"), calcul: $("calcul"), controles: $("controles"),
        blocDefi: $("bloc-defi"), rep: $("rep"), valider: $("valider"), retour: $("retour"),
        correction: $("correction"), nouveau: $("nouveau"),
      };
      this._modes = Array.prototype.slice.call(sh.querySelectorAll("[data-mode]"));
      this._v = { xs: 2, ys: -1, x1: 1, x2: 3, xp: 0, yp: 3 };
      this._mode = "sommet";
    }

    connectedCallback() {
      var self = this, e = this._el;
      this._ecoutes = [
        [e.valider, "click", function () { self._valider(); }],
        [e.rep, "keydown", function (ev) { if (ev.key === "Enter") self._valider(); }],
        [e.nouveau, "click", function () { self._nouveauDefi(); }],
      ];
      this._modes.forEach(function (b) {
        self._ecoutes.push([b, "click", function () { self._choisirMode(b.getAttribute("data-mode")); }]);
      });
      this._ecoutes.forEach(function (t) { t[0].addEventListener(t[1], t[2]); });
      this._choisirMode(this._mode);
    }

    disconnectedCallback() {
      (this._ecoutes || []).forEach(function (t) { t[0].removeEventListener(t[1], t[2]); });
    }

    _choisirMode(mode) {
      var self = this, e = this._el;
      this._mode = mode;
      this._modes.forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-mode") === mode)); });
      e.blocCalcul.hidden = mode === "defi";
      e.blocDefi.hidden = mode !== "defi";
      if (mode === "defi") { if (!this._defi) this._nouveauDefi(); else this._rendreDefi(); return; }
      // curseurs du mode
      e.controles.innerHTML = "";
      CURSEURS[mode].forEach(function (c) {
        var bloc = document.createElement("div");
        bloc.className = "curseur";
        bloc.innerHTML = '<label for="c-' + c[0] + '">' + c[1] + '</label><div class="curseur-row"><input type="range" id="c-' + c[0] +
          '" min="' + c[2] + '" max="' + c[3] + '" step="1"><span class="curseur-valeur"></span></div>';
        var inp = bloc.querySelector("input"), val = bloc.querySelector(".curseur-valeur");
        inp.value = String(self._v[c[0]]);
        val.textContent = nb(self._v[c[0]]);
        inp.addEventListener("input", function () { self._v[c[0]] = parseInt(inp.value, 10); val.textContent = nb(self._v[c[0]]); self._rendreCalcul(); });
        e.controles.appendChild(bloc);
      });
      this._rendreCalcul();
    }

    // ---------- modes « Sommet + point » et « Zéros + point » ----------
    _rendreCalcul() {
      var v = this._v, e = this._el, L = [], a = null, alerte = null, res = null;
      var m = function (t) { return '<span class="m">' + t + "</span>"; };
      if (this._mode === "sommet") {
        L.push("Forme canonique, sommet S(" + nb(v.xs) + " ; " + nb(v.ys) + ") : " +
          m("f(x) = a" + (v.xs === 0 ? "x²" : facteur(v.xs) + "²") + (v.ys === 0 ? "" : (v.ys > 0 ? " + " : " − ") + nb(Math.abs(v.ys)))));
        var dx = v.xp - v.xs, dy = v.yp - v.ys;
        if (dx === 0) {
          alerte = v.yp === v.ys ? "P est confondu avec le sommet S : il ne donne aucune information sur a. Choisis un point qui n'est pas sur l'axe de symétrie x = " + nb(v.xs) + "."
            : "P est sur l'axe de symétrie x = " + nb(v.xs) + " : seul le sommet de la parabole s'y trouve, ce point est impossible. Choisis un point qui n'est pas sur l'axe.";
        } else {
          L.push("P(" + nb(v.xp) + " ; " + nb(v.yp) + ") est sur la parabole : " + m(nb(v.yp) + " = a(" + nb(v.xp) + " − " + par(v.xs) + ")² + " + par(v.ys)) +
            ", soit " + m(nb(v.yp) + " = " + nb(dx * dx) + "a" + (v.ys === 0 ? "" : (v.ys > 0 ? " + " : " − ") + nb(Math.abs(v.ys)))));
          if (dy === 0) alerte = "On obtient a = 0 : P est à la même hauteur que le sommet, aucune parabole ne passe par ces deux points avec ce sommet. Choisis un autre point.";
          else {
            var q = quotient(dy, dx * dx);
            a = q.r;
            L.push(m("a = (y<sub>P</sub> − y<sub>S</sub>) / (x<sub>P</sub> − x<sub>S</sub>)²") + " = " + m("(" + nb(v.yp) + " − " + par(v.ys) + ") / (" + nb(v.xp) + " − " + par(v.xs) + ")²") + " = " + m(q.texte));
            var b = Rmul(a, Rent(-2 * v.xs)), c = Radd(Rmul(a, Rent(v.xs * v.xs)), Rent(v.ys));
            var can = coefTeteR(a) + (v.xs === 0 ? "x²" : facteur(v.xs) + "²") + (v.ys === 0 ? "" : (v.ys > 0 ? " + " : " − ") + nb(Math.abs(v.ys)));
            res = "f(x) = " + can + (v.xs === 0 ? "" : " = " + polynomeR(a, b, c));
            this._courbe = { a: Rval(a), b: Rval(b), c: Rval(c) };
          }
        }
      } else {
        var g = Math.min(v.x1, v.x2), d = Math.max(v.x1, v.x2), double = g === d;
        var fac = double ? (g === 0 ? "x²" : facteur(g) + "²") : facteur(g) + facteur(d);
        L.push((double ? "Racine double x₀ = " + nb(g) : "Zéros x₁ = " + nb(g) + " et x₂ = " + nb(d)) + " : " + m("f(x) = a" + fac));
        var prod = (v.xp - g) * (v.xp - d);
        if (prod === 0) {
          alerte = v.yp === 0 ? "P est un zéro : f y vaut 0 quel que soit a, ce point ne permet pas de trouver a. Choisis un point différent des zéros."
            : "En x = " + nb(v.xp) + ", f vaut 0 quel que soit a : P ne peut pas être sur la parabole. Choisis un point différent des zéros.";
        } else {
          L.push("P(" + nb(v.xp) + " ; " + nb(v.yp) + ") est sur la parabole : " +
            m(nb(v.yp) + " = a(" + nb(v.xp) + " − " + par(g) + ")(" + nb(v.xp) + " − " + par(d) + ")") + ", soit " + m(nb(v.yp) + " = " + (prod === 1 ? "" : prod === -1 ? "−" : nb(prod)) + "a"));
          if (v.yp === 0) alerte = "On obtient a = 0 : P est sur l'axe x sans être un zéro, aucune parabole ne passe par ces trois points. Choisis un autre point.";
          else {
            var q2 = quotient(v.yp, prod);
            a = q2.r;
            L.push(m("a = y<sub>P</sub> / ((x<sub>P</sub> − x₁)(x<sub>P</sub> − x₂))") + " = " + m(q2.texte));
            var b2 = Rmul(a, Rent(-(g + d))), c2 = Rmul(a, Rent(g * d));
            res = "f(x) = " + coefTeteR(a) + fac + " = " + polynomeR(a, b2, c2);
            this._courbe = { a: Rval(a), b: Rval(b2), c: Rval(c2) };
          }
        }
      }
      if (!a) this._courbe = null;
      e.calcul.innerHTML = '<ol class="etapes">' + L.map(function (t) { return "<li>" + t + "</li>"; }).join("") + "</ol>" +
        (alerte ? '<p class="alerte">' + alerte + "</p>" : "") + (res ? '<p class="resultat">' + res + "</p>" : "");
      this._dessiner();
    }

    // ---------- mode « Défi » ----------
    _nouveauDefi() {
      var A = [-3, -2, -1, -0.5, 0.5, 1, 2, 3], a, xs, ys, dx, yp;
      for (var essai = 0; essai < 200; essai++) {
        a = A[alea(0, A.length - 1)];
        xs = alea(-3, 3);
        ys = a > 0 ? alea(-6, 1) : alea(-1, 6);
        var choix = Math.abs(a) === 0.5 ? [-2, 2] : Math.abs(a) === 1 ? [-2, -1, 1, 2] : [-1, 1];
        dx = choix[alea(0, choix.length - 1)];
        yp = ys + a * dx * dx;
        if (xs + dx >= -5 && xs + dx <= 5 && yp >= -7 && yp <= 7) break;
      }
      this._defi = { a: a, xs: xs, ys: ys, xp: xs + dx, yp: yp, fini: false };
      var e = this._el;
      e.rep.value = ""; e.rep.disabled = false; e.valider.disabled = false;
      e.retour.textContent = ""; e.retour.className = "retour";
      e.correction.hidden = true; e.correction.innerHTML = "";
      this._rendreDefi();
    }

    _rendreDefi() {
      var D = this._defi;
      this._courbe = { a: D.a, b: -2 * D.a * D.xs, c: D.a * D.xs * D.xs + D.ys };
      this._dessiner();
    }

    _valider() {
      var D = this._defi, e = this._el;
      if (!D || D.fini) return;
      var brut = e.rep.value.trim().replace(/\s+/g, "").replace(/−/g, "-").replace(/,/g, ".");
      var val = NaN, f;
      if (/^-?\d+(\.\d+)?$/.test(brut)) val = parseFloat(brut);
      else if ((f = brut.match(/^(-?\d+)\/(\d+)$/)) && parseInt(f[2], 10) !== 0) val = parseInt(f[1], 10) / parseInt(f[2], 10);
      if (!isFinite(val)) {
        e.retour.className = "retour info";
        e.retour.textContent = "Écris un nombre, par exemple 2 ou −0,5 (ton essai n'est pas compté).";
        return;
      }
      D.fini = true;
      e.rep.disabled = true; e.valider.disabled = true;
      var juste = Math.abs(val - D.a) < 1e-9;
      e.retour.className = "retour " + (juste ? "ok" : "ko");
      e.retour.textContent = juste ? "Bonne réponse : a = " + nb(D.a) + "." : "Ce n'est pas " + nb(val) + " : la bonne valeur est a = " + nb(D.a) + ".";
      var dx = D.xp - D.xs, a = R(Math.round(D.a * 2), 2);
      var b = Rmul(a, Rent(-2 * D.xs)), c = Radd(Rmul(a, Rent(D.xs * D.xs)), Rent(D.ys));
      var m = function (t) { return '<span class="m">' + t + "</span>"; };
      var can = coefTeteR(a) + (D.xs === 0 ? "x²" : facteur(D.xs) + "²") + (D.ys === 0 ? "" : (D.ys > 0 ? " + " : " − ") + nb(Math.abs(D.ys)));
      e.correction.innerHTML = '<ol class="etapes">' +
        "<li>On lit S(" + nb(D.xs) + " ; " + nb(D.ys) + ") et P(" + nb(D.xp) + " ; " + nb(D.yp) + ").</li>" +
        "<li>" + m("a = (y<sub>P</sub> − y<sub>S</sub>) / (x<sub>P</sub> − x<sub>S</sub>)²") + " = " + m("(" + nb(D.yp) + " − " + par(D.ys) + ") / (" + nb(D.xp) + " − " + par(D.xs) + ")²") +
        " = " + m(quotient(Math.round(D.yp - D.ys), dx * dx).texte) + "</li>" +
        "<li>Contrôle visuel : en s'écartant d'une unité du sommet, la courbe " + (D.a > 0 ? "monte" : "descend") + " de " + nb(Math.abs(D.a)) + ".</li>" +
        '</ol><p class="resultat">f(x) = ' + can + (D.xs === 0 ? "" : " = " + polynomeR(a, b, c)) + "</p>";
      e.correction.hidden = false;
      this._dessiner();
    }

    // ---------- dessin ----------
    _dessiner() {
      var svg = this._el.graphe, i, q, v = this._v, mode = this._mode;
      svg.innerHTML = "";
      var defs = svgEl("defs", {});
      var mk = svgEl("marker", { id: "fl", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" });
      mk.appendChild(svgEl("path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche" }));
      defs.appendChild(mk);
      var clip = svgEl("clipPath", { id: "cadre" });
      clip.appendChild(svgEl("rect", { x: MARGE, y: MARGE, width: LARGEUR - 2 * MARGE, height: HAUTEUR - 2 * MARGE }));
      defs.appendChild(clip);
      svg.appendChild(defs);
      for (i = XMIN + 1; i < XMAX; i++) { q = px(i, 0)[0]; svg.appendChild(svgEl("line", { x1: q, x2: q, y1: MARGE, y2: HAUTEUR - MARGE, class: "grille" })); }
      for (i = YMIN + 1; i < YMAX; i++) { q = px(0, i)[1]; svg.appendChild(svgEl("line", { x1: MARGE, x2: LARGEUR - MARGE, y1: q, y2: q, class: "grille" })); }
      var o = px(0, 0);
      svg.appendChild(svgEl("line", { x1: MARGE, x2: LARGEUR - 4, y1: o[1], y2: o[1], class: "axe", "marker-end": "url(#fl)" }));
      svg.appendChild(svgEl("line", { x1: o[0], x2: o[0], y1: HAUTEUR - MARGE, y2: 4, class: "axe", "marker-end": "url(#fl)" }));
      function txt(x, y, s, cls, ancre) {
        var t = svgEl("text", { x: x, y: y, class: cls || "etiquette" });
        if (ancre) t.setAttribute("text-anchor", ancre);
        t.textContent = s; svg.appendChild(t);
      }
      txt(LARGEUR - 12, o[1] - 8, "x"); txt(o[0] + 8, 14, "y");
      for (i = XMIN + 2; i < XMAX; i += 2) if (i) { q = px(i, 0); txt(q[0], q[1] + 15, nb(i), "etiquette", "middle"); }
      for (i = YMIN + 2; i < YMAX; i += 2) if (i) { q = px(0, i); txt(q[0] - 6, q[1] + 4, nb(i), "etiquette", "end"); }

      var C = this._courbe;
      if (C) {
        var d = "", dedans = false;
        for (i = 0; i <= 280; i++) {
          var x = XMIN + i / 280 * (XMAX - XMIN), y = C.a * x * x + C.b * x + C.c;
          if (y < YMIN - 1 || y > YMAX + 1) { dedans = false; continue; }
          var p = px(x, y);
          d += (dedans ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1) + " ";
          dedans = true;
        }
        svg.appendChild(svgEl("path", { d: d, class: "courbe", "clip-path": "url(#cadre)" }));
      }
      function point(x, y, cls, nom, bas) {
        if (x < XMIN || x > XMAX || y < YMIN || y > YMAX) return;
        var c = px(x, y);
        svg.appendChild(svgEl("circle", { cx: c[0], cy: c[1], r: 6, class: cls }));
        txt(c[0] + 9, c[1] + (bas ? 18 : -9), nom, "nom-pt " + cls);
      }
      if (mode === "defi") {
        var D = this._defi;
        if (D.fini) {
          var hx = px(D.xs, 0)[0];
          svg.appendChild(svgEl("line", { x1: hx, x2: hx, y1: MARGE, y2: HAUTEUR - MARGE, class: "axe-sym" }));
        }
        point(D.xs, D.ys, "pt-cle", D.fini ? "S(" + nb(D.xs) + " ; " + nb(D.ys) + ")" : "S", D.a > 0);
        point(D.xp, D.yp, "pt-p", D.fini ? "P(" + nb(D.xp) + " ; " + nb(D.yp) + ")" : "P", false);
      } else if (mode === "sommet") {
        var hx2 = px(v.xs, 0)[0];
        svg.appendChild(svgEl("line", { x1: hx2, x2: hx2, y1: MARGE, y2: HAUTEUR - MARGE, class: "axe-sym" }));
        point(v.xs, v.ys, "pt-cle", "S", C ? C.a > 0 : true);
        point(v.xp, v.yp, "pt-p", "P", false);
      } else {
        var g = Math.min(v.x1, v.x2), dd = Math.max(v.x1, v.x2);
        point(g, 0, "pt-cle", g === dd ? "x₀" : "x₁", C ? C.a > 0 : true);
        if (g !== dd) point(dd, 0, "pt-cle", "x₂", C ? C.a > 0 : true);
        point(v.xp, v.yp, "pt-p", "P", false);
      }
    }
  }

  if (!customElements.get("parabole-par-points-widget")) customElements.define("parabole-par-points-widget", ParaboleParPointsWidget);
})();
