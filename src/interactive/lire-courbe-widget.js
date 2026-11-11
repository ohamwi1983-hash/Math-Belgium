(function () {
  "use strict";

  /* ================================================================
   * <lire-courbe-widget> — atelier interactif (4e, chapitre 3, section
   * « Lire les caractéristiques sur un graphique ») : une courbe
   * composite FIXE, lue de quatre façons (onglets) :
   *   - Image : droite verticale x = a → f(a), ou « n'existe pas » sur
   *     une valeur exclue du domaine (point creux en 0, asymptote en 3) ;
   *   - Antécédents : droite horizontale y = k → abscisses des points
   *     d'intersection, et leur nombre ;
   *   - Inéquation : f(x) ◇ k (◇ ∈ >, ≥, <, ≤) → ensemble des x
   *     solutions coloré sur l'axe, crochets justes aux bornes ;
   *   - Max / min : fenêtre [c ; d] → maximum et minimum de f sur cette
   *     fenêtre (ou pourquoi il n'y en a pas), qui changent avec elle.
   * Courbe : f(x) = 4 − (x + 2)² sur [−5 ; 0[, puis f(x) = 2 − 1/(x − 3)
   * sur ]0 ; 3[ ∪ ]3 ; 6] — domaine [−5 ; 6] \ {0 ; 3}, zéros −4 et 3,5,
   * point creux en x = 0, asymptotes x = 3 et y = 2.
   * Fenêtre de tracé FIXE. Web Component (Shadow DOM).
   * ================================================================ */

  var X_MIN = -5.8, X_MAX = 6.8, Y_MIN = -6, Y_MAX = 6.6;
  var LARGEUR = 440, HAUTEUR = 380, MARGE_G = 26, MARGE_D = 22, MARGE_H = 18, MARGE_B = 24;
  var PAS = 0.5, D_MIN = -5, D_MAX = 6;
  var NS = "http://www.w3.org/2000/svg";
  var EPS = 1e-9;

  var DEFAUT = { mode: "image", a: 1, k: 1, symbole: ">", c: -5, d: 2 };

  /* ---------- la fonction, en morceaux ---------- */
  function fA(x) { return 4 - (x + 2) * (x + 2); }
  function fB(x) { return 2 - 1 / (x - 3); }

  // l, u : bornes ; lFerme / uFerme : borne incluse dans le domaine ; limL / limU : valeur (ou
  // limite) au bord ; sommet : abscisse d'un extremum intérieur (seul le morceau A en a un).
  var MORCEAUX = [
    { l: -5, lFerme: true, u: 0, uFerme: false, f: fA, limL: -5, limU: 0, sommet: -2 },
    { l: 0, lFerme: false, u: 3, uFerme: false, f: fB, limL: 7 / 3, limU: Infinity, sommet: null },
    { l: 3, lFerme: false, u: 6, uFerme: true, f: fB, limL: -Infinity, limU: 5 / 3, sommet: null },
  ];

  function morceauDe(x) {
    for (var i = 0; i < MORCEAUX.length; i++) {
      var m = MORCEAUX[i];
      var apresL = m.lFerme ? x >= m.l - EPS : x > m.l + EPS;
      var avantU = m.uFerme ? x <= m.u + EPS : x < m.u - EPS;
      if (apresL && avantU) return m;
    }
    return null;
  }

  function f(x) {
    var m = morceauDe(x);
    return m ? m.f(x) : null;
  }

  /* ---------- formatage ---------- */
  function pgcd(a, b) { return b ? pgcd(b, a % b) : Math.abs(a); }

  /** Fraction n/d (d ≤ 200) qui vaut v à 1e-9 près, ou null. */
  function enFraction(v) {
    for (var d = 1; d <= 200; d++) {
      var n = Math.round(v * d);
      if (Math.abs(n / d - v) < 1e-9) { var g = pgcd(n, d) || 1; return { n: n / g, d: d / g }; }
    }
    return null;
  }

  function decimalFr(v, dec) {
    var fac = Math.pow(10, dec);
    var t = (Math.round(v * fac) / fac).toFixed(dec);
    if (dec > 0) t = t.replace(/0+$/, "").replace(/\.$/, "");
    if (t === "-0") t = "0";
    return t.replace(".", ",").replace("-", "−");
  }

  /** Valeur exacte quand elle est rationnelle (décimale courte ou fraction), sinon « ≈ » ; `approx`
   * indique si la valeur affichée est un arrondi. */
  function nombre(v) {
    var fr = enFraction(v);
    if (fr) {
      var d = fr.d;
      while (d % 2 === 0) d /= 2;
      while (d % 5 === 0) d /= 5;
      if (d === 1 && Math.abs(v * 100 - Math.round(v * 100)) < 1e-9) return { texte: decimalFr(v, 2), approx: false };
      var signe = fr.n < 0 ? "−" : "";
      return { texte: signe + Math.abs(fr.n) + "/" + fr.d, approx: false, decimal: decimalFr(v, 2) };
    }
    return { texte: decimalFr(v, 2), approx: true };
  }

  function nombreTexte(v) {
    var nb = nombre(v);
    if (nb.approx) return "≈ " + nb.texte;
    return nb.decimal ? nb.texte + " ≈ " + nb.decimal : nb.texte;
  }

  function svgEl(tag, attrs) {
    var el = document.createElementNS(NS, tag);
    for (var cle in attrs) el.setAttribute(cle, attrs[cle]);
    return el;
  }

  function xPx(x) { return MARGE_G + (x - X_MIN) / (X_MAX - X_MIN) * (LARGEUR - MARGE_G - MARGE_D); }
  function yPx(y) { return HAUTEUR - MARGE_B - (y - Y_MIN) / (Y_MAX - Y_MIN) * (HAUTEUR - MARGE_H - MARGE_B); }
  function xDepuisPx(px) { return X_MIN + (px - MARGE_G) / (LARGEUR - MARGE_G - MARGE_D) * (X_MAX - X_MIN); }
  function yDepuisPx(py) { return Y_MIN + (HAUTEUR - MARGE_B - py) / (HAUTEUR - MARGE_H - MARGE_B) * (Y_MAX - Y_MIN); }

  function arrondirPas(v) { return Math.round(v / PAS) * PAS; }
  function borner(v, mini, maxi) { return Math.min(maxi, Math.max(mini, v)); }

  /** Ancrage horizontal d'une étiquette : jamais coupée par le bord du SVG. */
  function ancrage(px) {
    if (px < 60) return { anchor: "start", x: Math.max(px + 4, 4) };
    if (px > LARGEUR - 60) return { anchor: "end", x: Math.min(px - 4, LARGEUR - 4) };
    return { anchor: "middle", x: px };
  }

  /* ---------- calculs ---------- */

  /** Antécédents de k, triés : abscisses x du domaine telles que f(x) = k. */
  function antecedents(k) {
    var res = [];
    var r = 4 - k;
    if (r >= -EPS) {
      var s = Math.sqrt(Math.max(0, r));
      [-2 - s, -2 + s].forEach(function (x) {
        if (x >= -5 - EPS && x < 0 - EPS && !res.some(function (y) { return Math.abs(y - x) < 1e-9; })) res.push(x);
      });
    }
    if (Math.abs(k - 2) > EPS) {
      var x = 3 + 1 / (2 - k);
      if (morceauDe(x) && Math.abs(x) > EPS) res.push(x);
    }
    return res.sort(function (a, b) { return a - b; });
  }

  function verifie(v, k, symbole) {
    if (symbole === ">") return v > k + EPS;
    if (symbole === "≥") return v >= k - EPS;
    if (symbole === "<") return v < k - EPS;
    return v <= k + EPS;
  }

  /** Ensemble des solutions de f(x) ◇ k, sous forme d'intervalles {a, aIn, b, bIn} (a = b : singleton). */
  function solutions(k, symbole) {
    var large = symbole === "≥" || symbole === "≤";
    var tous = antecedents(k);
    var intervalles = [];
    MORCEAUX.forEach(function (m) {
      var pts = tous.filter(function (x) { return x > m.l + EPS && x < m.u - EPS; });
      var bornes = [m.l].concat(pts, [m.u]);
      var locaux = [];
      for (var i = 0; i < bornes.length - 1; i++) {
        var g = bornes[i], dr = bornes[i + 1];
        if (!verifie(m.f((g + dr) / 2), k, symbole)) continue;
        var gIn = i === 0 ? (m.lFerme && verifie(m.f(g), k, symbole)) : large;
        var dIn = i === bornes.length - 2 ? (m.uFerme && verifie(m.f(dr), k, symbole)) : large;
        var prec = locaux[locaux.length - 1];
        if (prec && Math.abs(prec.b - g) < EPS && prec.bIn && gIn) prec.b = dr, prec.bIn = dIn;
        else locaux.push({ a: g, aIn: gIn, b: dr, bIn: dIn });
      }
      // Points isolés : un antécédent (ou une borne fermée) qui vérifie l'inégalité large sans
      // qu'aucun intervalle voisin ne le contienne (ex. f(x) ≥ 4 : seulement x = −2).
      var candidats = pts.slice();
      if (m.lFerme) candidats.push(m.l);
      if (m.uFerme) candidats.push(m.u);
      candidats.forEach(function (x) {
        if (!verifie(m.f(x), k, symbole)) return;
        var couvert = locaux.some(function (iv) {
          return (x > iv.a + EPS && x < iv.b - EPS) || (Math.abs(x - iv.a) < EPS && iv.aIn) || (Math.abs(x - iv.b) < EPS && iv.bIn);
        });
        if (!couvert) locaux.push({ a: x, aIn: true, b: x, bIn: true });
      });
      locaux.sort(function (p, q) { return p.a - q.a; });
      intervalles = intervalles.concat(locaux);
    });
    return intervalles;
  }

  function borneTexte(v) {
    if (v === Infinity) return "+∞";
    if (v === -Infinity) return "−∞";
    var nb = nombre(v);
    return nb.texte;
  }

  function solutionsTexte(ivs) {
    if (ivs.length === 0) return { texte: "S = ∅", approx: false };
    var approx = false;
    var morceaux = ivs.map(function (iv) {
      if (nombre(iv.a).approx || nombre(iv.b).approx) approx = true;
      if (Math.abs(iv.a - iv.b) < EPS) return "{" + borneTexte(iv.a) + "}";
      return (iv.aIn ? "[" : "]") + borneTexte(iv.a) + " ; " + borneTexte(iv.b) + (iv.bIn ? "]" : "[");
    });
    return { texte: "S " + (approx ? "≈" : "=") + " " + morceaux.join(" ∪ "), approx: approx };
  }

  /** Maximum et minimum de f sur [c ; d] — ou la raison de leur absence. */
  function extremums(c, d) {
    var cands = [];
    MORCEAUX.forEach(function (m) {
      var lo = Math.max(m.l, c), hi = Math.min(m.u, d);
      if (lo > hi + EPS) return;
      var loFerme = Math.abs(lo - m.l) < EPS ? m.lFerme : true;
      var hiFerme = Math.abs(hi - m.u) < EPS ? m.uFerme : true;
      if (Math.abs(lo - hi) < EPS) {
        if (loFerme && hiFerme) cands.push({ x: lo, v: m.f(lo), atteint: true });
        return;
      }
      cands.push(loFerme ? { x: lo, v: m.f(lo), atteint: true } : { x: lo, v: m.limL, atteint: false });
      cands.push(hiFerme ? { x: hi, v: m.f(hi), atteint: true } : { x: hi, v: m.limU, atteint: false });
      if (m.sommet !== null && m.sommet > lo + EPS && m.sommet < hi - EPS) cands.push({ x: m.sommet, v: m.f(m.sommet), atteint: true });
    });
    function cherche(estMax) {
      var meilleur = null, extreme = null;
      cands.forEach(function (cd) {
        var mieux = function (p, q) { return estMax ? p > q + 1e-9 : p < q - 1e-9; };
        if (cd.atteint && (!meilleur || mieux(cd.v, meilleur.v))) meilleur = cd;
        if (!extreme || mieux(cd.v, extreme.v)) extreme = cd;
      });
      if (meilleur && !(extreme && !extreme.atteint && (estMax ? extreme.v > meilleur.v + 1e-9 : extreme.v < meilleur.v - 1e-9))) {
        return { existe: true, v: meilleur.v, x: meilleur.x };
      }
      return { existe: false, limite: extreme };
    }
    return { max: cherche(true), min: cherche(false) };
  }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' +
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);}' +
    '*{box-sizing:border-box;}' +
    '.onglets{display:flex;flex-wrap:wrap;justify-content:center;gap:6px;margin-bottom:10px;}' +
    '.onglet{flex:1 1 auto;white-space:nowrap;padding:8px 6px;border-radius:var(--radius,3px);border:1px solid var(--line,#e2d8c8);background:var(--surface,#fff);color:var(--ink,#241f1a);font-weight:600;font-size:0.85rem;cursor:pointer;font-family:inherit;min-height:38px;}' +
    '.onglet[aria-selected="true"]{background:var(--accent-soft,#f6e2d3);border-color:var(--accent-soft-line,#e8c4a4);color:var(--accent-ink,#7a3212);}' +
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:10px;}' +
    'svg{width:100%;max-width:460px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);user-select:none;-webkit-user-select:none;touch-action:none;}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.5;}' +
    '.fleche{fill:var(--ink-soft,#6b6055);}' +
    '.tick{stroke:var(--ink-soft,#6b6055);stroke-width:1;}' +
    '.grille{stroke:var(--line,#e2d8c8);stroke-width:0.8;}' +
    '.etiquette-tick{font-size:10.5px;fill:var(--ink-soft,#6b6055);font-family:var(--mono,monospace);}' +
    '.asymptote{stroke:var(--ink-faint,#9c9083);stroke-width:1.2;stroke-dasharray:5 4;fill:none;}' +
    '.etiquette-asymptote{font-size:10.5px;fill:var(--ink-faint,#9c9083);font-family:var(--mono,monospace);}' +
    '.courbe{stroke:var(--accent,#a8471f);stroke-width:2.6;fill:none;stroke-linejoin:round;}' +
    '.point-plein{fill:var(--accent,#a8471f);}' +
    '.point-creux{fill:var(--surface-2,#faf6f0);stroke:var(--accent,#a8471f);stroke-width:2;}' +
    '.guide{stroke:var(--plan,#5b4ea3);stroke-width:1.6;stroke-dasharray:5 4;}' +
    '.droite-k{stroke:var(--plan,#5b4ea3);stroke-width:2;}' +
    '.droite-a{stroke:var(--plan,#5b4ea3);stroke-width:2;}' +
    '.point-lu{fill:var(--plan,#5b4ea3);stroke:var(--surface,#fff);stroke-width:1.2;}' +
    '.etiquette-lu{font-size:11.5px;font-weight:700;fill:var(--plan,#5b4ea3);font-family:var(--mono,monospace);}' +
    '.solution{stroke:var(--good,#2e7d4f);stroke-width:6;stroke-linecap:butt;}' +
    '.borne-incluse{fill:var(--good,#2e7d4f);}' +
    '.borne-exclue{fill:var(--surface-2,#faf6f0);stroke:var(--good,#2e7d4f);stroke-width:2;}' +
    '.courbe-ok{stroke:var(--good,#2e7d4f);stroke-width:4.5;fill:none;opacity:0.55;}' +
    '.fenetre{fill:var(--plan,#5b4ea3);opacity:0.10;}' +
    '.bord-fenetre{stroke:var(--plan,#5b4ea3);stroke-width:1.6;}' +
    '.point-max{fill:var(--good,#2e7d4f);stroke:var(--surface,#fff);stroke-width:1.2;}' +
    '.point-min{fill:var(--bad,#b3261e);stroke:var(--surface,#fff);stroke-width:1.2;}' +
    '.etiquette-max{font-size:11.5px;font-weight:700;fill:var(--good,#2e7d4f);font-family:var(--mono,monospace);}' +
    '.etiquette-min{font-size:11.5px;font-weight:700;fill:var(--bad,#b3261e);font-family:var(--mono,monospace);}' +
    '.controles{display:flex;flex-direction:column;gap:10px;}' +
    '.curseur{display:flex;align-items:center;gap:10px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;min-width:22px;color:var(--plan,#5b4ea3);}' +
    '.curseur input[type="range"]{flex:1 1 auto;min-width:0;accent-color:var(--plan,#5b4ea3);height:32px;}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:48px;text-align:right;font-size:0.92rem;}' +
    '.ligne-symbole{display:flex;align-items:center;justify-content:center;gap:8px;font-weight:600;color:var(--ink,#241f1a);}' +
    '.ligne-symbole select{font:inherit;font-size:1rem;padding:6px 8px;border-radius:var(--radius,3px);border:1px solid var(--line,#e2d8c8);background:var(--surface,#fff);color:var(--ink,#241f1a);min-height:38px;}' +
    '.resultat{margin-top:12px;padding:10px 12px;border-radius:var(--radius,3px);background:var(--surface,#fff);border:1px solid var(--line,#e2d8c8);}' +
    '.resultat-principal{display:block;font-variant-numeric:tabular-nums;font-size:1rem;font-weight:700;color:var(--ink,#241f1a);text-align:center;overflow-wrap:anywhere;}' +
    '.resultat-principal.ok{color:var(--good,#2e7d4f);}' +
    '.resultat-principal.non{color:var(--bad,#b3261e);}' +
    '.message{margin:8px 0 0;font-size:0.9rem;line-height:1.45;color:var(--ink-soft,#6b6055);text-align:center;}' +
    '.boutons{display:flex;justify-content:center;margin-top:12px;}' +
    '.btn{padding:8px 14px;border-radius:var(--radius,3px);border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font-weight:600;cursor:pointer;font-size:0.88rem;font-family:inherit;min-height:36px;}' +
    '.btn:hover{background:var(--accent-soft-line,#e8c4a4);}' +
    '[hidden]{display:none !important;}' +
    '</style>' +
    '<div class="onglets" role="tablist" aria-label="Que lire sur la courbe ?">' +
    '<button class="onglet" type="button" role="tab" data-mode="image">Image</button>' +
    '<button class="onglet" type="button" role="tab" data-mode="antecedents">Antécédents</button>' +
    '<button class="onglet" type="button" role="tab" data-mode="inequation">Inéquation</button>' +
    '<button class="onglet" type="button" role="tab" data-mode="fenetre">Max / min</button>' +
    '</div>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" xmlns="http://www.w3.org/2000/svg" aria-label="Courbe d\'une fonction f"></svg></div>' +
    '<div class="controles">' +
    '<div class="curseur" id="bloc-a"><label for="a">a</label><input type="range" id="a" min="' + D_MIN + '" max="' + D_MAX + '" step="' + PAS + '"><span class="curseur-valeur" id="a-valeur"></span></div>' +
    '<div class="ligne-symbole" id="bloc-symbole"><span>f(x)</span><select id="symbole" aria-label="Symbole de l\'inéquation"><option value="&gt;">&gt;</option><option value="≥">≥</option><option value="&lt;">&lt;</option><option value="≤">≤</option></select><span id="symbole-k"></span></div>' +
    '<div class="curseur" id="bloc-k"><label for="k">k</label><input type="range" id="k" min="-5.5" max="6" step="' + PAS + '"><span class="curseur-valeur" id="k-valeur"></span></div>' +
    '<div class="curseur" id="bloc-c"><label for="c">c</label><input type="range" id="c" min="' + D_MIN + '" max="' + (D_MAX - PAS) + '" step="' + PAS + '"><span class="curseur-valeur" id="c-valeur"></span></div>' +
    '<div class="curseur" id="bloc-d"><label for="d">d</label><input type="range" id="d" min="' + (D_MIN + PAS) + '" max="' + D_MAX + '" step="' + PAS + '"><span class="curseur-valeur" id="d-valeur"></span></div>' +
    '</div>' +
    '<div class="resultat" aria-live="polite"><span class="resultat-principal" id="principal"></span><p class="message" id="message"></p></div>' +
    '<div class="boutons"><button class="btn" id="reset" type="button">Réinitialiser</button></div>';

  class LireCourbeWidgetClass extends HTMLElement {
    constructor() {
      super();
      var shadow = this.attachShadow({ mode: "open" });
      shadow.appendChild(TEMPLATE.content.cloneNode(true));
      this._etat = Object.assign({}, DEFAUT);
      this._glisse = null;
      this._svg = shadow.getElementById("svg");
      this._onglets = Array.prototype.slice.call(shadow.querySelectorAll(".onglet"));
      this._inputs = { a: shadow.getElementById("a"), k: shadow.getElementById("k"), c: shadow.getElementById("c"), d: shadow.getElementById("d") };
      this._valeurs = { a: shadow.getElementById("a-valeur"), k: shadow.getElementById("k-valeur"), c: shadow.getElementById("c-valeur"), d: shadow.getElementById("d-valeur") };
      this._blocs = { a: shadow.getElementById("bloc-a"), k: shadow.getElementById("bloc-k"), c: shadow.getElementById("bloc-c"), d: shadow.getElementById("bloc-d"), symbole: shadow.getElementById("bloc-symbole") };
      this._select = shadow.getElementById("symbole");
      this._symboleK = shadow.getElementById("symbole-k");
      this._principal = shadow.getElementById("principal");
      this._message = shadow.getElementById("message");
      this._reset = shadow.getElementById("reset");
    }

    connectedCallback() {
      var self = this;
      this._ecouteurs = [];
      function ecoute(el, type, fn) { el.addEventListener(type, fn); self._ecouteurs.push([el, type, fn]); }
      this._onglets.forEach(function (b) {
        ecoute(b, "click", function () { self._etat.mode = b.getAttribute("data-mode"); self._rendre(); });
      });
      ["a", "k", "c", "d"].forEach(function (nom) {
        ecoute(self._inputs[nom], "input", function () {
          var v = parseFloat(self._inputs[nom].value);
          self._etat[nom] = v;
          if (nom === "c" && self._etat.d <= v) self._etat.d = v + PAS;
          if (nom === "d" && self._etat.c >= v) self._etat.c = v - PAS;
          self._rendre();
        });
      });
      ecoute(this._select, "change", function () { self._etat.symbole = self._select.value; self._rendre(); });
      ecoute(this._reset, "click", function () { self._etat = Object.assign({}, DEFAUT); self._rendre(); });
      ecoute(this._svg, "pointerdown", function (e) {
        var pt = self._local(e);
        if (!pt) return;
        var mode = self._etat.mode;
        if (mode === "image") self._glisse = "a";
        else if (mode === "fenetre") self._glisse = Math.abs(pt.x - self._etat.c) <= Math.abs(pt.x - self._etat.d) ? "c" : "d";
        else self._glisse = "k";
        self._svg.setPointerCapture(e.pointerId);
        e.preventDefault();
        self._deplacer(pt);
      });
      ecoute(this._svg, "pointermove", function (e) {
        if (!self._glisse) return;
        var pt = self._local(e);
        if (pt) self._deplacer(pt);
      });
      var fin = function (e) {
        if (!self._glisse) return;
        self._glisse = null;
        if (self._svg.hasPointerCapture(e.pointerId)) self._svg.releasePointerCapture(e.pointerId);
      };
      ecoute(this._svg, "pointerup", fin);
      ecoute(this._svg, "pointercancel", fin);
      this._rendre();
    }

    disconnectedCallback() {
      (this._ecouteurs || []).forEach(function (t) { t[0].removeEventListener(t[1], t[2]); });
      this._ecouteurs = [];
    }

    _local(e) {
      var ctm = this._svg.getScreenCTM();
      if (!ctm) return null;
      var p = this._svg.createSVGPoint();
      p.x = e.clientX; p.y = e.clientY;
      var l = p.matrixTransform(ctm.inverse());
      return { x: xDepuisPx(l.x), y: yDepuisPx(l.y) };
    }

    _deplacer(pt) {
      var e = this._etat, nom = this._glisse;
      if (nom === "a") e.a = borner(arrondirPas(pt.x), D_MIN, D_MAX);
      else if (nom === "k") e.k = borner(arrondirPas(pt.y), -5.5, 6);
      else if (nom === "c") { e.c = borner(arrondirPas(pt.x), D_MIN, e.d - PAS); }
      else if (nom === "d") { e.d = borner(arrondirPas(pt.x), e.c + PAS, D_MAX); }
      this._rendre();
    }

    _rendre() {
      var e = this._etat;
      var self = this;
      this._onglets.forEach(function (b) { b.setAttribute("aria-selected", String(b.getAttribute("data-mode") === e.mode)); });
      this._blocs.a.hidden = e.mode !== "image";
      this._blocs.k.hidden = e.mode !== "antecedents" && e.mode !== "inequation";
      this._blocs.symbole.hidden = e.mode !== "inequation";
      this._blocs.c.hidden = e.mode !== "fenetre";
      this._blocs.d.hidden = e.mode !== "fenetre";
      ["a", "k", "c", "d"].forEach(function (nom) {
        self._inputs[nom].value = String(e[nom]);
        self._valeurs[nom].textContent = decimalFr(e[nom], 1);
      });
      this._select.value = e.symbole;
      this._symboleK.textContent = decimalFr(e.k, 1);

      var svg = this._svg;
      svg.innerHTML = "";
      this._dessinerFond(svg);
      if (e.mode === "fenetre") this._dessinerFenetre(svg);
      this._dessinerCourbe(svg);
      if (e.mode === "image") this._modeImage(svg);
      else if (e.mode === "antecedents") this._modeAntecedents(svg);
      else if (e.mode === "inequation") this._modeInequation(svg);
      else this._modeFenetre(svg);
    }

    _dessinerFond(svg) {
      var defs = svgEl("defs", {});
      var marqueur = svgEl("marker", { id: "fleche", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" });
      marqueur.appendChild(svgEl("path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche" }));
      defs.appendChild(marqueur);
      var clip = svgEl("clipPath", { id: "zone" });
      clip.appendChild(svgEl("rect", { x: xPx(X_MIN), y: yPx(Y_MAX), width: xPx(X_MAX) - xPx(X_MIN), height: yPx(Y_MIN) - yPx(Y_MAX) }));
      defs.appendChild(clip);
      svg.appendChild(defs);
      var x, y;
      for (x = -5; x <= 6; x++) svg.appendChild(svgEl("line", { x1: xPx(x), x2: xPx(x), y1: yPx(Y_MIN), y2: yPx(Y_MAX), class: "grille" }));
      for (y = -6; y <= 6; y++) svg.appendChild(svgEl("line", { x1: xPx(X_MIN), x2: xPx(X_MAX), y1: yPx(y), y2: yPx(y), class: "grille" }));
      svg.appendChild(svgEl("line", { x1: xPx(X_MIN), x2: xPx(X_MAX) + 6, y1: yPx(0), y2: yPx(0), class: "axe", "marker-end": "url(#fleche)" }));
      svg.appendChild(svgEl("line", { x1: xPx(0), x2: xPx(0), y1: yPx(Y_MIN), y2: yPx(Y_MAX) - 8, class: "axe", "marker-end": "url(#fleche)" }));
      for (x = -5; x <= 6; x++) {
        if (x === 0) continue;
        svg.appendChild(svgEl("line", { x1: xPx(x), x2: xPx(x), y1: yPx(0) - 3, y2: yPx(0) + 3, class: "tick" }));
        if (x % 2 === 0 || x === -5) {
          var t = svgEl("text", { x: xPx(x), y: yPx(0) + 14, "text-anchor": "middle", class: "etiquette-tick" });
          t.textContent = decimalFr(x, 0);
          svg.appendChild(t);
        }
      }
      for (y = -6; y <= 6; y += 2) {
        if (y === 0) continue;
        svg.appendChild(svgEl("line", { x1: xPx(0) - 3, x2: xPx(0) + 3, y1: yPx(y), y2: yPx(y), class: "tick" }));
        var ty = svgEl("text", { x: xPx(0) - 6, y: yPx(y) + 3.5, "text-anchor": "end", class: "etiquette-tick" });
        ty.textContent = decimalFr(y, 0);
        svg.appendChild(ty);
      }
      var lx = svgEl("text", { x: xPx(X_MAX) - 2, y: yPx(0) - 7, "text-anchor": "end", class: "etiquette-tick" });
      lx.textContent = "x";
      svg.appendChild(lx);
      var ly = svgEl("text", { x: xPx(0) + 7, y: yPx(Y_MAX) + 6, class: "etiquette-tick" });
      ly.textContent = "y";
      svg.appendChild(ly);
      // Asymptotes : verticale x = 3 (des deux côtés), horizontale y = 2 (à droite).
      svg.appendChild(svgEl("line", { x1: xPx(3), x2: xPx(3), y1: yPx(Y_MIN), y2: yPx(Y_MAX), class: "asymptote" }));
      svg.appendChild(svgEl("line", { x1: xPx(3), x2: xPx(X_MAX), y1: yPx(2), y2: yPx(2), class: "asymptote" }));
      var ta = svgEl("text", { x: xPx(3) + 4, y: yPx(Y_MIN) - 4, class: "etiquette-asymptote" });
      ta.textContent = "x = 3";
      svg.appendChild(ta);
      var th = svgEl("text", { x: xPx(X_MAX) - 2, y: yPx(2) + 13, "text-anchor": "end", class: "etiquette-asymptote" });
      th.textContent = "y = 2";
      svg.appendChild(th);
    }

    _cheminMorceau(m, x0, x1) {
      var n = 160, d = "";
      for (var i = 0; i <= n; i++) {
        var x = x0 + (x1 - x0) * i / n;
        if (!m.lFerme && Math.abs(x - m.l) < 1e-6) x = m.l + 1e-4;
        if (!m.uFerme && Math.abs(x - m.u) < 1e-6) x = m.u - 1e-4;
        var y = borner(m.f(x), -40, 40);
        d += (i === 0 ? "M" : "L") + xPx(x).toFixed(2) + " " + yPx(y).toFixed(2) + " ";
      }
      return d;
    }

    _dessinerCourbe(svg) {
      var self = this;
      var g = svgEl("g", { "clip-path": "url(#zone)" });
      MORCEAUX.forEach(function (m) {
        // Échantillonnage resserré près de l'asymptote x = 3.
        var parts = m.u === 3 ? [[m.l, 2.6], [2.6, 3]] : m.l === 3 ? [[3, 3.4], [3.4, m.u]] : [[m.l, m.u]];
        var d = parts.map(function (p) { return self._cheminMorceau(m, p[0], p[1]); }).join("");
        g.appendChild(svgEl("path", { d: d, class: "courbe" }));
      });
      svg.appendChild(g);
      svg.appendChild(svgEl("circle", { cx: xPx(-5), cy: yPx(-5), r: 4, class: "point-plein" }));
      svg.appendChild(svgEl("circle", { cx: xPx(6), cy: yPx(5 / 3), r: 4, class: "point-plein" }));
      svg.appendChild(svgEl("circle", { cx: xPx(0), cy: yPx(0), r: 4.5, class: "point-creux" }));
      svg.appendChild(svgEl("circle", { cx: xPx(0), cy: yPx(7 / 3), r: 4.5, class: "point-creux" }));
    }

    _etiquette(svg, px, py, texte, classe, dessus) {
      var a = ancrage(px);
      var y = dessus ? py - 9 : py + 17;
      if (y < 12) y = py + 17;
      if (y > HAUTEUR - 4) y = py - 9;
      var t = svgEl("text", { x: a.x.toFixed(2), y: y.toFixed(2), "text-anchor": a.anchor, class: classe });
      t.textContent = texte;
      svg.appendChild(t);
    }

    _modeImage(svg) {
      var a = this._etat.a;
      var px = xPx(a);
      svg.appendChild(svgEl("line", { x1: px, x2: px, y1: yPx(Y_MIN), y2: yPx(Y_MAX), class: "droite-a" }));
      var v = f(a);
      var aT = decimalFr(a, 1);
      if (v === null) {
        this._principal.className = "resultat-principal non";
        this._principal.textContent = "f(" + aT + ") n'existe pas";
        this._message.textContent = Math.abs(a - 3) < EPS
          ? "x = 3 est une asymptote verticale : la courbe ne passe jamais sur cette droite. 3 n'est pas dans le domaine."
          : "x = 0 est exclu du domaine : les deux points creux montrent que la courbe n'y a aucun point (0 n'a pas d'image).";
        this._etiquette(svg, px, yPx(Y_MAX) + 4, "x = " + aT, "etiquette-lu", false);
        return;
      }
      var py = yPx(v);
      svg.appendChild(svgEl("line", { x1: px, x2: xPx(0), y1: py, y2: py, class: "guide" }));
      svg.appendChild(svgEl("circle", { cx: px, cy: py, r: 5, class: "point-lu" }));
      var vT = nombreTexte(v);
      this._etiquette(svg, px, py, "(" + aT + " ; " + nombre(v).texte + ")", "etiquette-lu", v < 4.5);
      this._principal.className = "resultat-principal";
      this._principal.textContent = "f(" + aT + ") = " + vT;
      this._message.textContent = "L'image de " + aT + " se lit sur l'axe des y : c'est l'ordonnée du point de la courbe qui a pour abscisse " + aT + ".";
    }

    _modeAntecedents(svg) {
      var k = this._etat.k;
      var py = yPx(k);
      svg.appendChild(svgEl("line", { x1: xPx(X_MIN), x2: xPx(X_MAX), y1: py, y2: py, class: "droite-k" }));
      var lk = svgEl("text", { x: xPx(X_MIN) + 3, y: (k > 5.5 ? py + 14 : py - 6).toFixed(2), class: "etiquette-lu" });
      lk.textContent = "y = " + decimalFr(k, 1);
      svg.appendChild(lk);
      var xs = antecedents(k);
      var self = this;
      xs.forEach(function (x, i) {
        var px = xPx(x);
        svg.appendChild(svgEl("line", { x1: px, x2: px, y1: py, y2: yPx(0), class: "guide" }));
        svg.appendChild(svgEl("circle", { cx: px, cy: py, r: 5, class: "point-lu" }));
        self._etiquette(svg, px, yPx(0), nombre(x).texte, "etiquette-lu", k < 0 || i % 2 === 1 && k < 0.6);
      });
      var kT = decimalFr(k, 1);
      this._principal.className = "resultat-principal";
      if (xs.length === 0) {
        this._principal.textContent = "Aucun antécédent de " + kT;
        this._message.textContent = Math.abs(k - 2) < EPS
          ? "La droite y = 2 ne coupe jamais la courbe ici : à droite de x = 3, c'est l'asymptote horizontale, que la courbe approche sans l'atteindre."
          : "La droite y = " + kT + " ne coupe jamais la courbe : aucun x n'a pour image " + kT + ".";
        return;
      }
      this._principal.textContent = xs.length + " antécédent" + (xs.length > 1 ? "s" : "") + " de " + kT + " : " +
        xs.map(function (x) { var nb = nombre(x); return "x " + (nb.approx ? "≈ " : "= ") + nb.texte; }).join(" ; ");
      var suite = Math.abs(k) < EPS ? " Les antécédents de 0 sont les zéros de f." : "";
      if (Math.abs(k - 2) < EPS) suite += " À droite de x = 3, la droite y = 2 est l'asymptote : elle n'y coupe pas la courbe.";
      this._message.textContent = "On lit les abscisses des points où la droite y = " + kT + " coupe la courbe — autant d'antécédents que de points d'intersection." + suite;
    }

    _modeInequation(svg) {
      var e = this._etat, k = e.k;
      var py = yPx(k);
      svg.appendChild(svgEl("line", { x1: xPx(X_MIN), x2: xPx(X_MAX), y1: py, y2: py, class: "droite-k" }));
      var lk = svgEl("text", { x: xPx(X_MIN) + 3, y: (k > 5.5 ? py + 14 : py - 6).toFixed(2), class: "etiquette-lu" });
      lk.textContent = "y = " + decimalFr(k, 1);
      svg.appendChild(lk);
      var ivs = solutions(k, e.symbole);
      var self = this;
      // Morceaux de courbe qui vérifient l'inégalité, surlignés en vert ; puis l'ensemble S sur l'axe.
      var g = svgEl("g", { "clip-path": "url(#zone)" });
      ivs.forEach(function (iv) {
        if (Math.abs(iv.a - iv.b) < EPS) return;
        var m = morceauDe((iv.a + iv.b) / 2);
        if (m) g.appendChild(svgEl("path", { d: self._cheminMorceau(m, iv.a, iv.b), class: "courbe-ok" }));
      });
      svg.appendChild(g);
      var y0 = yPx(0);
      ivs.forEach(function (iv) {
        if (Math.abs(iv.a - iv.b) > EPS) svg.appendChild(svgEl("line", { x1: xPx(iv.a), x2: xPx(iv.b), y1: y0, y2: y0, class: "solution" }));
        [[iv.a, iv.aIn], [iv.b, iv.bIn]].forEach(function (p) {
          svg.appendChild(svgEl("circle", { cx: xPx(p[0]), cy: y0, r: 4.2, class: p[1] ? "borne-incluse" : "borne-exclue" }));
        });
      });
      var st = solutionsTexte(ivs);
      this._principal.className = "resultat-principal ok";
      this._principal.textContent = st.texte;
      var dessus = e.symbole === ">" || e.symbole === "≥";
      this._message.textContent =
        "On garde les abscisses des points de la courbe situés " + (dessus ? "au-dessus" : "en dessous") + " de la droite y = " + decimalFr(k, 1) +
        (e.symbole === "≥" || e.symbole === "≤" ? " ou sur elle (symbole large : les antécédents sont inclus)" : " (symbole strict : les antécédents sont exclus)") +
        ". 0 et 3 ne sont jamais dans S : ils ne sont pas dans le domaine." + (st.approx ? " Les bornes irrationnelles sont arrondies." : "");
    }

    _dessinerFenetre(svg) {
      var e = this._etat;
      svg.appendChild(svgEl("rect", { x: xPx(e.c), y: yPx(Y_MAX), width: xPx(e.d) - xPx(e.c), height: yPx(Y_MIN) - yPx(Y_MAX), class: "fenetre" }));
      [e.c, e.d].forEach(function (x) {
        svg.appendChild(svgEl("line", { x1: xPx(x), x2: xPx(x), y1: yPx(Y_MIN), y2: yPx(Y_MAX), class: "bord-fenetre" }));
      });
    }

    _modeFenetre(svg) {
      var e = this._etat;
      var r = extremums(e.c, e.d);
      var cT = decimalFr(e.c, 1), dT = decimalFr(e.d, 1);
      var bornesTexte = "[" + cT + " ; " + dT + "]";
      var self = this;
      function decrire(res, estMax) {
        var nom = estMax ? "maximum" : "minimum";
        if (res.existe) {
          var px = xPx(res.x), py = yPx(res.v);
          svg.appendChild(svgEl("circle", { cx: px, cy: py, r: 5.5, class: estMax ? "point-max" : "point-min" }));
          self._etiquette(svg, px, py, (estMax ? "max " : "min ") + nombre(res.v).texte, estMax ? "etiquette-max" : "etiquette-min", estMax);
          return nom + " = " + nombre(res.v).texte + " (en x = " + nombre(res.x).texte + ")";
        }
        var lim = res.limite;
        if (!lim) return "pas de " + nom;
        if (!isFinite(lim.v)) return "pas de " + nom + " : la courbe " + (lim.v > 0 ? "monte" : "descend") + " sans fin près de x = 3";
        return "pas de " + nom + " : la courbe s'approche de " + nombre(lim.v).texte + " sans l'atteindre (x = " + nombre(lim.x).texte + " exclu)";
      }
      var tMax = decrire(r.max, true);
      var tMin = decrire(r.min, false);
      this._principal.className = "resultat-principal";
      this._principal.textContent = "Sur " + bornesTexte + " : " + tMax + " ; " + tMin + ".";
      this._message.textContent = "Déplace c et d (ou fais glisser un bord de la fenêtre) : le maximum et le minimum ne sont pas des propriétés de la courbe entière, ils dépendent toujours de l'intervalle choisi.";
    }
  }

  if (!customElements.get("lire-courbe-widget")) {
    customElements.define("lire-courbe-widget", LireCourbeWidgetClass);
  }
})();
