(function () {
  "use strict";

  /* ================================================================
   * <relations-droites-widget> — atelier interactif (4e, ch. 7, § 4 et § 5) :
   * deux droites d₁ et d₂ données par leur équation implicite
   * ax + by + c = 0 (coefficients entiers de −6 à 6, a = b = 0 refusé).
   * Pour chacune, un vecteur directeur (−b ; a) ; puis le déterminant et le
   * produit scalaire des deux directeurs, et le verdict : perpendiculaires,
   * parallèles distinctes, confondues (équations proportionnelles) ou
   * sécantes quelconques. Pour des sécantes, le point d'intersection exact
   * (fractions), obtenu pas à pas par substitution (si un coefficient vaut
   * ±1) ou par combinaison, et marqué sur la figure.
   * Mode « Défi » : deux droites tirées, l'élève choisit la relation en un
   * seul essai, puis la correction s'affiche. Sans score.
   * Défaut d₁ : x − 2y + 1 = 0, d₂ : 2x + y − 5 = 0 → perpendiculaires,
   * intersection (9/5 ; 7/5). Repère orthonormé, fenêtre FIXE.
   * Web Component (Shadow DOM).
   * ================================================================ */

  var SVGNS = "http://www.w3.org/2000/svg";
  var X_MIN = -7, X_MAX = 7, Y_MIN = -7, Y_MAX = 7;
  var UNITE = 20, MARGE = 14;
  var LARGEUR = (X_MAX - X_MIN) * UNITE + 2 * MARGE;
  var HAUTEUR = (Y_MAX - Y_MIN) * UNITE + 2 * MARGE;
  var CMIN = -6, CMAX = 6;
  var NOMS_COEF = ["a", "b", "c"];

  var RELATIONS = {
    perp: "Perpendiculaires",
    paral: "Parallèles distinctes",
    conf: "Confondues",
    quelc: "Sécantes, non perpendiculaires"
  };

  function defaut() { return [{ a: 1, b: -2, c: 1 }, { a: 2, b: 1, c: -5 }]; }

  function pgcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = b; b = a % b; a = t; } return a; }
  function frac(n, d) { if (d < 0) { n = -n; d = -d; } var g = pgcd(n, d) || 1; return { n: n / g, d: d / g }; }
  function moins(s) { return String(s).replace(/-/g, "−"); }
  function fracTxt(f) { return f.d === 1 ? moins(f.n) : moins(f.n) + "/" + f.d; }
  function val(f) { return f.n / f.d; }
  function par(n) { return n < 0 ? "(" + moins(n) + ")" : String(n); }
  function vecHtml(nom) { return '<span class="vec">' + nom + '</span>'; }
  function aleat(min, max) { return min + Math.floor(Math.random() * (max - min + 1)); }

  // Somme de termes [coef, variable] : « 2x − y + 3 », « −x », « 0 »
  function termes(liste) {
    var s = "";
    liste.forEach(function (t) {
      var k = t[0], v = t[1];
      if (k === 0) return;
      var abs = Math.abs(k);
      var corps = v ? (abs === 1 ? v : abs + v) : String(abs);
      if (s === "") s = (k < 0 ? "−" : "") + corps;
      else s += (k < 0 ? " − " : " + ") + corps;
    });
    return s === "" ? "0" : s;
  }
  function equationTxt(d) { return termes([[d.a, "x"], [d.b, "y"], [d.c, ""]]) + " = 0"; }
  function vecteurTxt(x, y) { return "(" + moins(x) + " ; " + moins(y) + ")"; }

  function el(tag, attrs, parent) {
    var e = document.createElementNS(SVGNS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }

  // Analyse complète de deux droites
  function analyser(d1, d2) {
    var u1 = [-d1.b, d1.a], u2 = [-d2.b, d2.a];
    var det = u1[0] * u2[1] - u1[1] * u2[0];
    var scal = u1[0] * u2[0] + u1[1] * u2[1];
    var r = { u1: u1, u2: u2, det: det, scal: scal };
    if (det === 0) {
      var prop = d1.a * d2.c - d2.a * d1.c === 0 && d1.b * d2.c - d2.b * d1.c === 0;
      r.type = prop ? "conf" : "paral";
      return r;
    }
    r.type = scal === 0 ? "perp" : "quelc";
    var D = d1.a * d2.b - d2.a * d1.b;
    r.I = { x: frac(d1.b * d2.c - d2.b * d1.c, D), y: frac(d2.a * d1.c - d1.a * d2.c, D) };
    return r;
  }

  // Étapes du calcul de l'intersection (HTML)
  function etapesIntersection(d1, d2, I) {
    var eqs = [d1, d2], noms = ["d₁", "d₂"];
    // substitution si un coefficient de x ou de y vaut ±1
    for (var i = 0; i < 2; i++) {
      var e = eqs[i], f = eqs[1 - i];
      var vars = [["x", "a", "y", "b"], ["y", "b", "x", "a"]];
      for (var j = 0; j < 2; j++) {
        var v = vars[j][0], kv = e[vars[j][1]], w = vars[j][2], kw = e[vars[j][3]];
        if (Math.abs(kv) !== 1) continue;
        // v = p·w + q
        var p = -kw * kv, q = -e.c * kv;
        var expr = termes([[p, w], [q, ""]]);
        var fv = f[vars[j][1]], fw = f[vars[j][3]];
        var morceaux = [];
        if (fv !== 0) {
          var abs = Math.abs(fv);
          var corps = (abs === 1 ? "" : abs) + "(" + expr + ")";
          morceaux.push([fv < 0, corps]);
        }
        if (fw !== 0) morceaux.push([fw < 0, (Math.abs(fw) === 1 ? "" : Math.abs(fw)) + w]);
        if (f.c !== 0) morceaux.push([f.c < 0, String(Math.abs(f.c))]);
        var sub = "";
        morceaux.forEach(function (m, k) {
          if (k === 0) sub = (m[0] ? "−" : "") + m[1];
          else sub += (m[0] ? " − " : " + ") + m[1];
        });
        var cw = fv * p + fw, cst = fv * q + f.c;
        var wVal = frac(-cst, cw);
        var vVal = v === "x" ? I.x : I.y;
        var h = '<ol class="etapes">';
        h += '<li>Dans ' + noms[i] + ', on isole ' + v + ' : ' + v + ' = ' + expr + '</li>';
        if (fv !== 0) h += '<li>On remplace dans ' + noms[1 - i] + ' : ' + sub + ' = 0</li>';
        else h += '<li>' + noms[1 - i] + ' ne contient pas ' + v + ' : on la résout directement.</li>';
        h += '<li>' + termes([[cw, w], [cst, ""]]) + ' = 0, donc ' + w + ' = ' + fracTxt(wVal) + '</li>';
        var remplace = p === 0 ? fracTxt(frac(q, 1))
          : (p === 1 ? "" : p === -1 ? "−" : moins(p) + " · ") + (wVal.d === 1 && wVal.n >= 0 ? fracTxt(wVal) : "(" + fracTxt(wVal) + ")") +
            (q === 0 ? "" : (q < 0 ? " − " : " + ") + Math.abs(q)) + " = " + fracTxt(vVal);
        h += '<li>Puis ' + v + ' = ' + remplace + '</li>';
        h += '</ol>';
        return h;
      }
    }
    // combinaison linéaire
    var D = d1.a * d2.b - d2.a * d1.b;
    var cx = d1.c * d2.b - d2.c * d1.b;
    var cy = d2.c * d1.a - d1.c * d2.a;
    var h2 = '<ol class="etapes">';
    h2 += '<li>Aucun coefficient ne vaut ±1 : on combine. ' + par(d2.b) + ' × d₁ − ' + par(d1.b) + ' × d₂ élimine y : ' + termes([[D, "x"], [cx, ""]]) + ' = 0, donc x = ' + fracTxt(I.x) + '</li>';
    h2 += '<li>' + par(d2.a) + ' × d₁ − ' + par(d1.a) + ' × d₂ élimine x : ' + termes([[-D, "y"], [-cy, ""]]) + ' = 0, donc y = ' + fracTxt(I.y) + '</li>';
    h2 += '</ol>';
    return h2;
  }

  // Tirage d'une paire de droites pour le défi
  function tirerDefi() {
    var types = ["perp", "paral", "conf", "quelc"];
    var type = types[aleat(0, 3)];
    for (var essai = 0; essai < 500; essai++) {
      var petit = type === "paral" || type === "conf";
      var lim = petit ? 3 : 4;
      var d1 = { a: aleat(-lim, lim), b: aleat(-lim, lim), c: aleat(-5, 5) };
      if (d1.a === 0 && d1.b === 0) continue;
      if (pgcd(pgcd(d1.a, d1.b), d1.c) !== 1) continue;
      if (d1.a < 0 || (d1.a === 0 && d1.b < 0)) { d1.a = -d1.a; d1.b = -d1.b; d1.c = -d1.c; }
      var d2;
      if (type === "perp") {
        var s = [1, -1, 2, -2][aleat(0, 3)];
        d2 = { a: d1.b * s, b: -d1.a * s, c: aleat(-6, 6) };
      } else if (type === "paral") {
        var k = [1, -1, 2, -2][aleat(0, 3)];
        d2 = { a: d1.a * k, b: d1.b * k, c: aleat(-6, 6) };
        if (d2.c === d1.c * k) continue;
      } else if (type === "conf") {
        var k2 = [2, -1, 3, -2][aleat(0, 3)];
        d2 = { a: d1.a * k2, b: d1.b * k2, c: d1.c * k2 };
      } else {
        d2 = { a: aleat(-4, 4), b: aleat(-4, 4), c: aleat(-6, 6) };
        if (d2.a === 0 && d2.b === 0) continue;
      }
      if ([d2.a, d2.b, d2.c].some(function (n) { return n < CMIN || n > CMAX; })) continue;
      var r = analyser(d1, d2);
      if (r.type !== type) continue;
      if (r.I && (Math.abs(val(r.I.x)) > 6.5 || Math.abs(val(r.I.y)) > 6.5)) continue;
      return [d1, d2];
    }
    return defaut();
  }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' +
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);color:var(--ink,#182430);}' +
    '*{box-sizing:border-box;}' +
    '.modes{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin:0 0 12px;}' +
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:10px;}' +
    'svg{width:100%;max-width:440px;height:auto;background:var(--surface-2,#f7f9fb);border-radius:var(--radius,3px);border:1px solid var(--line,#ccd8e0);}' +
    '.grille{stroke:var(--line,#ccd8e0);stroke-width:0.6;}' +
    '.axe{stroke:var(--ink-soft,#51626f);stroke-width:1.3;}' +
    '.fleche-axe{fill:var(--ink-soft,#51626f);}' +
    '.graduation{font-size:11px;fill:var(--ink-soft,#51626f);font-family:var(--sans,sans-serif);}' +
    '.d1{stroke:var(--accent,#b65c1f);stroke-width:2.6;}' +
    '.d2{stroke:var(--plan,#5b4ea3);stroke-width:2.6;}' +
    '.d2-conf{stroke-dasharray:8 6;}' +
    '.u1{stroke:var(--accent,#b65c1f);stroke-width:2.2;}' +
    '.u2{stroke:var(--plan,#5b4ea3);stroke-width:2.2;}' +
    '.f1{fill:var(--accent,#b65c1f);}' +
    '.f2{fill:var(--plan,#5b4ea3);}' +
    '.angle-droit{fill:none;stroke:var(--good,#2f7a4f);stroke-width:2;}' +
    '.inter{fill:var(--ink,#182430);}' +
    '.etiq{font-size:13px;font-weight:700;font-family:var(--sans,sans-serif);paint-order:stroke;stroke:var(--surface-2,#f7f9fb);stroke-width:3.5px;stroke-linejoin:round;}' +
    '.e1{fill:var(--accent,#b65c1f);} .e2{fill:var(--plan,#5b4ea3);} .ei{fill:var(--ink,#182430);}' +
    '.droites{display:grid;grid-template-columns:1fr;gap:10px;margin:0 0 12px;}' +
    '.carte{padding:10px 12px;border-radius:var(--radius,3px);background:var(--surface-2,#f7f9fb);border:1px solid var(--line,#ccd8e0);line-height:1.55;font-size:0.95rem;font-variant-numeric:tabular-nums;}' +
    '.carte-titre{font-weight:700;font-size:0.82rem;color:var(--ink-soft,#51626f);margin-bottom:6px;}' +
    '.eq1{color:var(--accent-ink,#7a3212);font-weight:700;} .eq2{color:var(--plan,#5b4ea3);font-weight:700;}' +
    '.coefs{display:grid;grid-template-columns:repeat(auto-fit,minmax(132px,1fr));gap:6px;margin-top:6px;}' +
    '.coef{display:flex;align-items:center;justify-content:space-between;gap:2px;}' +
    '.coef-nom{font-size:0.9rem;min-width:16px;font-style:italic;}' +
    '.coef-val{min-width:22px;text-align:center;font-weight:700;}' +
    '.btn{min-height:44px;min-width:44px;padding:8px 14px;border-radius:var(--radius,3px);border:1px solid var(--line,#ccd8e0);background:var(--surface,#fff);color:var(--ink,#182430);font-weight:600;cursor:pointer;font-family:inherit;font-size:0.95rem;}' +
    '.btn-pm{padding:0;font-size:1.15rem;}' +
    '.btn[aria-pressed="true"]{background:var(--accent-soft,#f6e2d3);border-color:var(--accent,#b65c1f);color:var(--accent-ink,#7a3212);}' +
    '.btn:focus-visible{outline:2px solid var(--accent,#b65c1f);outline-offset:2px;}' +
    '.btn:disabled{cursor:default;opacity:1;}' +
    '.btn-reset{background:var(--accent-soft,#f6e2d3);border-color:var(--accent-soft-line,#e8c4a4);color:var(--accent-ink,#7a3212);}' +
    '.choix{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:8px;margin:8px 0;}' +
    '.choix .btn{text-align:left;}' +
    '.juste{border-color:var(--good,#2f7a4f)!important;background:var(--good-soft,#e3f1e8)!important;color:var(--good,#2f7a4f)!important;}' +
    '.faux{border-color:var(--bad,#b23a3a)!important;background:var(--bad-soft,#f8e3e3)!important;color:var(--bad,#b23a3a)!important;}' +
    '.verdict{font-weight:700;font-size:1.02rem;}' +
    '.v-ok{color:var(--good,#2f7a4f);} .v-ko{color:var(--bad,#b23a3a);}' +
    '.message{color:var(--bad,#b23a3a);font-size:0.9rem;min-height:1.2em;text-align:center;margin:4px 0;}' +
    '.note{font-size:0.86rem;color:var(--ink-soft,#51626f);}' +
    '.etapes{margin:4px 0 0;padding-left:1.3em;}' +
    '.etapes li{margin:2px 0;}' +
    '.bas{display:flex;justify-content:center;margin-top:10px;}' +
    '.vec{display:inline-block;position:relative;padding-top:0.42em;line-height:1.05;}' +
    '.vec::before{content:"";position:absolute;left:0.05em;right:0.3em;top:0.17em;border-top:1.5px solid currentColor;}' +
    '.vec::after{content:"";position:absolute;right:0;top:calc(0.17em - 3.2px);border-left:6px solid currentColor;border-top:3.7px solid transparent;border-bottom:3.7px solid transparent;}' +
    '.zone{max-width:620px;margin-left:auto;margin-right:auto;}' +
    '[hidden]{display:none!important;}' +
    '</style>' +
    '<div class="modes" role="group" aria-label="Mode">' +
    '<button class="btn" type="button" data-mode="explorer" aria-pressed="true">Explorer</button>' +
    '<button class="btn" type="button" data-mode="defi" aria-pressed="false">Défi</button>' +
    '</div>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" role="img" aria-label="Les deux droites dans un repère orthonormé"></svg></div>' +
    '<div class="zone" id="explorer">' +
    '<div class="droites" id="droites"></div>' +
    '<div class="message" id="message" aria-live="polite"></div>' +
    '<div class="carte" id="analyse" aria-live="polite"></div>' +
    '<div class="bas"><button class="btn btn-reset" id="reset" type="button">Exemple du cours</button></div>' +
    '</div>' +
    '<div class="zone" id="defi" hidden>' +
    '<div class="carte" id="defi-enonce"></div>' +
    '<div class="choix" id="defi-choix" role="group" aria-label="Relation entre les deux droites"></div>' +
    '<div class="carte" id="defi-correction" aria-live="polite" hidden></div>' +
    '<div class="bas"><button class="btn btn-reset" id="nouveau" type="button">Nouvelles droites</button></div>' +
    '</div>';

  class RelationsDroitesWidget extends HTMLElement {
    constructor() {
      super();
      var shadow = this.attachShadow({ mode: "open" });
      shadow.appendChild(TEMPLATE.content.cloneNode(true));
      this._svg = shadow.getElementById("svg");
      this._mode = "explorer";
      this._droites = defaut();
      this._defi = null;
      this._message = "";
      this._ecouteurs = [];
    }

    connectedCallback() {
      var self = this, sh = this.shadowRoot;
      function ecoute(c, t, f) { c.addEventListener(t, f); self._ecouteurs.push([c, t, f]); }
      Array.prototype.forEach.call(sh.querySelectorAll("[data-mode]"), function (b) {
        ecoute(b, "click", function () {
          self._mode = b.getAttribute("data-mode");
          if (self._mode === "defi" && !self._defi) self._nouveauDefi();
          self._rendre();
        });
      });
      ecoute(sh.getElementById("reset"), "click", function () { self._droites = defaut(); self._message = ""; self._rendre(); });
      ecoute(sh.getElementById("nouveau"), "click", function () { self._nouveauDefi(); self._rendre(); });
      ecoute(sh.getElementById("droites"), "click", function (e) {
        var b = e.target.closest && e.target.closest("[data-pas]");
        if (!b) return;
        var i = parseInt(b.getAttribute("data-droite"), 10), k = b.getAttribute("data-coef"), pas = parseInt(b.getAttribute("data-pas"), 10);
        self._changer(i, k, pas);
      });
      ecoute(sh.getElementById("defi-choix"), "click", function (e) {
        var b = e.target.closest && e.target.closest("[data-rel]");
        if (!b || self._defi.reponse) return;
        self._defi.reponse = b.getAttribute("data-rel");
        self._rendre();
      });
      this._rendre();
    }

    disconnectedCallback() {
      this._ecouteurs.forEach(function (t) { t[0].removeEventListener(t[1], t[2]); });
      this._ecouteurs = [];
    }

    _nouveauDefi() { this._defi = { droites: tirerDefi(), reponse: null }; }

    _changer(i, k, pas) {
      var d = this._droites[i];
      var nv = d[k] + pas;
      if (nv < CMIN || nv > CMAX) { this._message = "Les coefficients restent entre −6 et 6."; this._rendre(); return; }
      var essai = { a: d.a, b: d.b, c: d.c };
      essai[k] = nv;
      if (essai.a === 0 && essai.b === 0) {
        this._message = "a et b ne peuvent pas être nuls tous les deux : ce ne serait plus une droite.";
        this._rendre();
        return;
      }
      d[k] = nv;
      this._message = "";
      this._rendre();
    }

    _px(x, y) { return [MARGE + (x - X_MIN) * UNITE, MARGE + (Y_MAX - y) * UNITE]; }

    // Segment de la droite ax + by + c = 0 coupé au cadre
    _segment(d) {
      var pts = [];
      function ajoute(x, y) {
        if (x < X_MIN - 1e-9 || x > X_MAX + 1e-9 || y < Y_MIN - 1e-9 || y > Y_MAX + 1e-9) return;
        for (var i = 0; i < pts.length; i++) if (Math.abs(pts[i][0] - x) < 1e-9 && Math.abs(pts[i][1] - y) < 1e-9) return;
        pts.push([x, y]);
      }
      if (d.b !== 0) { ajoute(X_MIN, -(d.a * X_MIN + d.c) / d.b); ajoute(X_MAX, -(d.a * X_MAX + d.c) / d.b); }
      if (d.a !== 0) { ajoute(-(d.b * Y_MIN + d.c) / d.a, Y_MIN); ajoute(-(d.b * Y_MAX + d.c) / d.a, Y_MAX); }
      return pts.length >= 2 ? [pts[0], pts[1]] : null;
    }

    // Point de la droite le plus proche de l'origine
    _pied(d) { var n = d.a * d.a + d.b * d.b; return [-d.a * d.c / n, -d.b * d.c / n]; }

    _dessiner(droites, r, montrerDroites) {
      var svg = this._svg, self = this;
      svg.innerHTML = "";
      var defs = el("defs", {}, svg);
      var mk = el("marker", { id: "fl", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" }, defs);
      el("path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche-axe" }, mk);
      ["1", "2"].forEach(function (n) {
        var m = el("marker", { id: "fu" + n, markerWidth: "9", markerHeight: "9", refX: "7", refY: "4.5", orient: "auto", markerUnits: "userSpaceOnUse" }, defs);
        el("path", { d: "M0,0 L9,4.5 L0,9 Z", class: "f" + n }, m);
      });
      for (var gx = X_MIN; gx <= X_MAX; gx++) { var px = this._px(gx, 0)[0]; el("line", { x1: px, y1: MARGE, x2: px, y2: HAUTEUR - MARGE, class: "grille" }, svg); }
      for (var gy = Y_MIN; gy <= Y_MAX; gy++) { var py = this._px(0, gy)[1]; el("line", { x1: MARGE, y1: py, x2: LARGEUR - MARGE, y2: py, class: "grille" }, svg); }
      var o = this._px(0, 0);
      el("line", { x1: MARGE, y1: o[1], x2: LARGEUR - MARGE, y2: o[1], class: "axe", "marker-end": "url(#fl)" }, svg);
      el("line", { x1: o[0], y1: HAUTEUR - MARGE, x2: o[0], y2: MARGE, class: "axe", "marker-end": "url(#fl)" }, svg);
      var t1 = el("text", { x: this._px(1, 0)[0] - 3, y: o[1] + 14, class: "graduation" }, svg); t1.textContent = "1";
      var t2 = el("text", { x: o[0] - 11, y: this._px(0, 1)[1] + 4, class: "graduation" }, svg); t2.textContent = "1";
      if (!montrerDroites) return;

      droites.forEach(function (d, i) {
        var s = self._segment(d);
        if (!s) return;
        var a = self._px(s[0][0], s[0][1]), b = self._px(s[1][0], s[1][1]);
        var cls = "d" + (i + 1) + (i === 1 && r.type === "conf" ? " d2-conf" : "");
        el("line", { x1: a[0], y1: a[1], x2: b[0], y2: b[1], class: cls }, svg);
      });
      // vecteurs directeurs (direction (−b ; a), longueur d'affichage 2,5)
      var pointes = [null, null];
      droites.forEach(function (d, i) {
        var ref = r.I && Math.abs(val(r.I.x)) <= 6 && Math.abs(val(r.I.y)) <= 6 ? [val(r.I.x), val(r.I.y)] : self._pied(d);
        if (r.type === "conf" && i === 1) return;
        var ux = -d.b, uy = d.a, L = Math.hypot(ux, uy), k = 2.5 / L, dec = 1.3 / L;
        function dedans(x, y) { return x >= X_MIN + 0.3 && x <= X_MAX - 0.3 && y >= Y_MIN + 0.3 && y <= Y_MAX - 0.3; }
        var base = [ref[0] + ux * dec, ref[1] + uy * dec];
        var x2 = base[0] + ux * k, y2 = base[1] + uy * k;
        if (!dedans(x2, y2)) { ux = -ux; uy = -uy; base = [ref[0] + ux * dec, ref[1] + uy * dec]; x2 = base[0] + ux * k; y2 = base[1] + uy * k; }
        var p1 = self._px(base[0], base[1]), p2 = self._px(x2, y2);
        pointes[i] = [x2, y2];
        el("line", { x1: p1[0], y1: p1[1], x2: p2[0], y2: p2[1], class: "u" + (i + 1), "marker-end": "url(#fu" + (i + 1) + ")" }, svg);
        var tx = p2[0] + (ux * k > 0 ? 6 : -6), ty = p2[1] - 6;
        var t = el("text", { x: tx.toFixed(1), y: ty.toFixed(1), class: "etiq e" + (i + 1), "text-anchor": ux * k > 0 ? "start" : "end" }, svg);
        t.textContent = "u" + (i === 0 ? "₁" : "₂");
        // flèche dessinée au-dessus de la lettre
        var lw = 8, ax = ux * k > 0 ? tx : tx - lw - 6;
        el("line", { x1: ax, y1: ty - 13, x2: ax + lw, y2: ty - 13, class: "u" + (i + 1), "stroke-width": "1.4" }, svg);
        el("path", { d: "M" + (ax + lw) + "," + (ty - 15.5) + " L" + (ax + lw + 4) + "," + (ty - 13) + " L" + (ax + lw) + "," + (ty - 10.5) + " Z", class: "f" + (i + 1) }, svg);
      });
      // étiquettes d₁ d₂ près du bord
      droites.forEach(function (d, i) {
        if (r.type === "conf" && i === 1) return;
        var s = self._segment(d);
        if (!s) return;
        var pt = pointes[i] || pointes[0];
        var dist0 = pt ? Math.hypot(s[0][0] - pt[0], s[0][1] - pt[1]) : 0, dist1 = pt ? Math.hypot(s[1][0] - pt[0], s[1][1] - pt[1]) : 1;
        var fin = dist0 > dist1 ? s[0] : s[1];
        var deb = fin === s[0] ? s[1] : s[0];
        var x = fin[0] + (deb[0] - fin[0]) * 0.08, y = fin[1] + (deb[1] - fin[1]) * 0.08;
        var p = self._px(x, y);
        var aGauche = p[0] < LARGEUR / 2;
        var t = el("text", { x: (p[0] + (aGauche ? 8 : -4)).toFixed(1), y: (p[1] - 7).toFixed(1), class: "etiq e" + (i + 1), "text-anchor": aGauche ? "start" : "end" }, svg);
        t.textContent = i === 0 ? "d₁" : (r.type === "conf" ? "d₁ = d₂" : "d₂");
      });
      if (r.type === "conf") {
        var s0 = self._segment(droites[0]);
        if (s0) {
          var fin0 = s0[0][0] > s0[1][0] ? s0[0] : s0[1], deb0 = fin0 === s0[0] ? s0[1] : s0[0];
          var p0 = self._px(fin0[0] + (deb0[0] - fin0[0]) * 0.08, fin0[1] + (deb0[1] - fin0[1]) * 0.08);
          var tt = el("text", { x: (p0[0] - 4).toFixed(1), y: (p0[1] + 18).toFixed(1), class: "etiq e2", "text-anchor": "end" }, svg);
          tt.textContent = "= d₂";
        }
      }
      if (r.I) {
        var ix = val(r.I.x), iy = val(r.I.y);
        if (ix >= X_MIN && ix <= X_MAX && iy >= Y_MIN && iy <= Y_MAX) {
          var pi = this._px(ix, iy);
          if (r.type === "perp") {
            var v1 = [-droites[0].b, droites[0].a], v2 = [-droites[1].b, droites[1].a];
            var n1 = Math.hypot(v1[0], v1[1]), n2 = Math.hypot(v2[0], v2[1]), c = 12;
            var e1 = [v1[0] / n1 * c, -v1[1] / n1 * c], e2 = [v2[0] / n2 * c, -v2[1] / n2 * c];
            el("path", { d: "M" + (pi[0] + e1[0]) + "," + (pi[1] + e1[1]) + " L" + (pi[0] + e1[0] + e2[0]) + "," + (pi[1] + e1[1] + e2[1]) + " L" + (pi[0] + e2[0]) + "," + (pi[1] + e2[1]), class: "angle-droit" }, svg);
          }
          el("circle", { cx: pi[0], cy: pi[1], r: 4.5, class: "inter" }, svg);
          var lx = pi[0] + 9, anc = "start";
          if (pi[0] > LARGEUR - 110) { lx = pi[0] - 9; anc = "end"; }
          var ly = pi[1] + (pi[1] < 40 ? 20 : -9);
          var ti = el("text", { x: lx.toFixed(1), y: ly.toFixed(1), class: "etiq ei", "text-anchor": anc }, svg);
          ti.textContent = "I" + vecteurTxt(fracTxt(r.I.x), fracTxt(r.I.y));
        }
      }
    }

    // Bloc HTML d'analyse : directeurs, critères, verdict, intersection
    _analyseHtml(droites, r) {
      var d1 = droites[0], d2 = droites[1];
      var h = '<div class="carte-titre">Vecteurs directeurs (−b ; a)</div>';
      h += '<div>' + vecHtml("u₁") + ' = ' + vecteurTxt(-d1.b, d1.a) + ' pour d₁, ' + vecHtml("u₂") + ' = ' + vecteurTxt(-d2.b, d2.a) + ' pour d₂</div>';
      h += '<div>Déterminant : ' + par(r.u1[0]) + ' · ' + par(r.u2[1]) + ' − ' + par(r.u1[1]) + ' · ' + par(r.u2[0]) + ' = ' + moins(r.det) + '</div>';
      h += '<div>Produit scalaire : ' + par(r.u1[0]) + ' · ' + par(r.u2[0]) + ' + ' + par(r.u1[1]) + ' · ' + par(r.u2[1]) + ' = ' + moins(r.scal) + '</div>';
      var v = "";
      if (r.type === "conf") v = "Déterminant nul et équations proportionnelles : les droites sont confondues (une infinité de points communs).";
      else if (r.type === "paral") v = "Déterminant nul, mais équations non proportionnelles : parallèles distinctes, aucun point commun.";
      else if (r.type === "perp") v = "Déterminant non nul et produit scalaire nul : sécantes et perpendiculaires.";
      else v = "Déterminant non nul et produit scalaire non nul : sécantes, mais pas perpendiculaires.";
      h += '<div class="verdict v-ok">' + v + '</div>';
      if (r.type === "conf") {
        var k = d1.a !== 0 ? frac(d2.a, d1.a) : frac(d2.b, d1.b);
        h += '<div class="note">d₂ s\'obtient en multipliant tous les coefficients de d₁ par ' + fracTxt(k) + '.</div>';
      }
      if (r.I) {
        h += '<div class="carte-titre" style="margin-top:8px">Point d\'intersection</div>';
        h += etapesIntersection(d1, d2, r.I);
        h += '<div><strong>I' + vecteurTxt(fracTxt(r.I.x), fracTxt(r.I.y)) + '</strong>';
        var ix = val(r.I.x), iy = val(r.I.y);
        if (ix < X_MIN || ix > X_MAX || iy < Y_MIN || iy > Y_MAX) h += ' <span class="note">(hors du cadre de la figure)</span>';
        h += '</div>';
      }
      return h;
    }

    _rendre() {
      var sh = this.shadowRoot, self = this;
      Array.prototype.forEach.call(sh.querySelectorAll("[data-mode]"), function (b) {
        b.setAttribute("aria-pressed", b.getAttribute("data-mode") === self._mode ? "true" : "false");
      });
      sh.getElementById("explorer").hidden = this._mode !== "explorer";
      sh.getElementById("defi").hidden = this._mode !== "defi";

      if (this._mode === "explorer") {
        var dr = this._droites, r = analyser(dr[0], dr[1]);
        var h = "";
        dr.forEach(function (d, i) {
          h += '<div class="carte"><div class="carte-titre">Droite d' + (i === 0 ? "₁" : "₂") + '</div>';
          h += '<div class="' + (i === 0 ? "eq1" : "eq2") + '">d' + (i === 0 ? "₁" : "₂") + ' : ' + equationTxt(d) + '</div>';
          h += '<div class="coefs">';
          NOMS_COEF.forEach(function (k) {
            h += '<div class="coef"><span class="coef-nom">' + k + (i === 0 ? "₁" : "₂") + '</span>' +
              '<button class="btn btn-pm" type="button" data-droite="' + i + '" data-coef="' + k + '" data-pas="-1" aria-label="Diminuer ' + k + '">−</button>' +
              '<span class="coef-val">' + moins(d[k]) + '</span>' +
              '<button class="btn btn-pm" type="button" data-droite="' + i + '" data-coef="' + k + '" data-pas="1" aria-label="Augmenter ' + k + '">+</button></div>';
          });
          h += '</div></div>';
        });
        sh.getElementById("droites").innerHTML = h;
        sh.getElementById("message").textContent = this._message;
        sh.getElementById("analyse").innerHTML = this._analyseHtml(dr, r);
        this._dessiner(dr, r, true);
        return;
      }

      // ----- défi -----
      var D = this._defi, rd = analyser(D.droites[0], D.droites[1]);
      sh.getElementById("defi-enonce").innerHTML =
        '<div class="carte-titre">Quelle est la position relative de ces deux droites ?</div>' +
        '<div class="eq1">d₁ : ' + equationTxt(D.droites[0]) + '</div>' +
        '<div class="eq2">d₂ : ' + equationTxt(D.droites[1]) + '</div>' +
        '<div class="note">Un seul essai. La figure apparaît après ta réponse.</div>';
      var ch = "";
      ["perp", "paral", "conf", "quelc"].forEach(function (k) {
        var cls = "btn";
        if (D.reponse) {
          if (k === rd.type) cls += " juste";
          else if (k === D.reponse) cls += " faux";
        }
        ch += '<button class="' + cls + '" type="button" data-rel="' + k + '"' + (D.reponse ? " disabled" : "") + '>' +
          (D.reponse && k === rd.type ? "✓ " : D.reponse && k === D.reponse ? "✗ " : "") + RELATIONS[k] + '</button>';
      });
      sh.getElementById("defi-choix").innerHTML = ch;
      var corr = sh.getElementById("defi-correction");
      if (D.reponse) {
        var ok = D.reponse === rd.type;
        corr.hidden = false;
        corr.innerHTML = '<div class="verdict ' + (ok ? "v-ok" : "v-ko") + '">' + (ok ? "Bonne réponse : " : "Ce n'est pas ça. La bonne réponse : ") + RELATIONS[rd.type].toLowerCase() + '.</div>' +
          this._analyseHtml(D.droites, rd);
      } else {
        corr.hidden = true;
        corr.innerHTML = "";
      }
      this._dessiner(D.droites, rd, !!D.reponse);
    }
  }

  if (!customElements.get("relations-droites-widget")) {
    customElements.define("relations-droites-widget", RelationsDroitesWidget);
  }
})();
