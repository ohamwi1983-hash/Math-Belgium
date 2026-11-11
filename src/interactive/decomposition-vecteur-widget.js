(function () {
  "use strict";

  /* ================================================================
   * <decomposition-vecteur-widget> — atelier interactif (4e, ch. 6, § 7) :
   * deux directions données par deux vecteurs v et w (non colinéaires),
   * et un vecteur u, tous partant de l'origine O et déplaçables (glisser
   * leur extrémité, ou choisir un vecteur puis utiliser les flèches).
   * En direct :
   *  - construction du parallélogramme : les parallèles à v et à w
   *    menées par l'extrémité de u coupent les deux directions en a·v et
   *    b·w ;
   *  - u = a·v + b·w avec a et b exacts (fractions simplifiées) ;
   *  - vérification par les composantes : système 2 × 2 écrit et résolu.
   * v et w colinéaires (ou nuls) → « décomposition impossible ».
   * Défaut v(1 ; 1), w(1 ; −1), u(5 ; 1) → a = 3, b = 2.
   * Coordonnées entières, fenêtre FIXE. Web Component (Shadow DOM).
   * ================================================================ */

  var SVGNS = "http://www.w3.org/2000/svg";
  var X_MIN = -4, X_MAX = 9, Y_MIN = -5, Y_MAX = 6;
  var UNITE = 32, MARGE = 14;
  var LARGEUR = (X_MAX - X_MIN) * UNITE + 2 * MARGE;
  var HAUTEUR = (Y_MAX - Y_MIN) * UNITE + 2 * MARGE;
  var BORNE = { xMin: -3, xMax: 8, yMin: -4, yMax: 5 };

  function defaut() {
    return { v: { x: 1, y: 1 }, w: { x: 1, y: -1 }, u: { x: 5, y: 1 } };
  }

  // ---------- nombres ----------
  function pgcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = b; b = a % b; a = t; } return a || 1; }
  function frac(num, den) {
    if (den < 0) { num = -num; den = -den; }
    var g = pgcd(num, den);
    return { n: num / g, d: den / g };
  }
  function moins(s) { return String(s).replace(/-/g, "−"); }
  function fmtDec(x, d) {
    var f = Math.pow(10, d);
    var r = Math.round(x * f) / f;
    if (Object.is(r, -0)) r = 0;
    var s = r.toFixed(d).replace(".", ",");
    return moins(s);
  }
  function fracTxt(f) {
    if (f.d === 1) return moins(f.n);
    return moins(f.n) + "/" + f.d;
  }
  // « 3 » ou « 5/2 ≈ 2,5 » (≈ seulement si l'écriture décimale est arrondie)
  function fracAvecDec(f) {
    if (f.d === 1) return moins(f.n);
    var v = f.n / f.d;
    var exact = Math.abs(v * 100 - Math.round(v * 100)) < 1e-9;
    var s = fmtDec(v, 2);
    if (exact) s = s.replace(/0$/, "");
    return fracTxt(f) + (exact ? " = " : " ≈ ") + s;
  }
  function coordTxt(p) { return "(" + moins(p.x) + " ; " + moins(p.y) + ")"; }
  // terme « 2a », « −a », « a », vide si 0 ; premier = sans « + » devant
  function terme(c, lettre, premier) {
    if (c === 0) return "";
    var abs = Math.abs(c);
    var corps = (abs === 1 ? "" : String(abs)) + lettre;
    if (premier) return (c < 0 ? "−" : "") + corps;
    return (c < 0 ? " − " : " + ") + corps;
  }
  function equation(ca, cb, rhs) {
    var g = terme(ca, "a", true);
    var dTerme = terme(cb, "b", g === "");
    var gauche = g + dTerme;
    if (gauche === "") gauche = "0";
    return gauche + " = " + moins(rhs);
  }

  function vecHtml(nom) { return '<span class="vec">' + nom + '</span>'; }

  function el(tag, attrs, parent) {
    var e = document.createElementNS(SVGNS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' +
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);color:var(--ink,#182430);}' +
    '*{box-sizing:border-box;}' +
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:10px;}' +
    'svg{width:100%;max-width:520px;height:auto;background:var(--surface-2,#f7f9fb);border-radius:var(--radius,3px);border:1px solid var(--line,#ccd8e0);}' +
    '.grille{stroke:var(--line,#ccd8e0);stroke-width:0.7;}' +
    '.axe{stroke:var(--ink-soft,#51626f);stroke-width:1.3;}' +
    '.fleche-axe{fill:var(--ink-soft,#51626f);}' +
    '.direction{stroke-width:1.2;stroke-dasharray:6 5;fill:none;}' +
    '.dir-v{stroke:var(--good,#2f7a4f);opacity:0.55;}' +
    '.dir-w{stroke:var(--plan,#5b4ea3);opacity:0.55;}' +
    '.parallele{stroke:var(--ink-soft,#51626f);stroke-width:1.2;stroke-dasharray:3 4;}' +
    '.vec-u{stroke:var(--accent,#b65c1f);stroke-width:3;}' +
    '.vec-v{stroke:var(--good,#2f7a4f);stroke-width:2.2;}' +
    '.vec-w{stroke:var(--plan,#5b4ea3);stroke-width:2.2;}' +
    '.vec-av{stroke:var(--good,#2f7a4f);stroke-width:4;opacity:0.35;}' +
    '.vec-bw{stroke:var(--plan,#5b4ea3);stroke-width:4;opacity:0.35;}' +
    '.tete-u{fill:var(--accent,#b65c1f);} .tete-v{fill:var(--good,#2f7a4f);} .tete-w{fill:var(--plan,#5b4ea3);}' +
    '.point-o{fill:var(--ink,#182430);}' +
    '.point-proj{fill:var(--surface,#fff);stroke:var(--ink-soft,#51626f);stroke-width:1.5;}' +
    '.poignee{fill:transparent;cursor:grab;touch-action:none;}' +
    '.poignee-active{fill:var(--accent,#b65c1f);fill-opacity:0.12;}' +
    '.etiq{font-size:14px;font-weight:700;font-family:var(--sans,sans-serif);}' +
    '.etiq-u{fill:var(--accent,#b65c1f);} .etiq-v{fill:var(--good,#2f7a4f);} .etiq-w{fill:var(--plan,#5b4ea3);} .etiq-ink{fill:var(--ink,#182430);}' +
    '.etiq-fleche{stroke-width:1.4;} .ef-u{stroke:var(--accent,#b65c1f);} .ef-v{stroke:var(--good,#2f7a4f);} .ef-w{stroke:var(--plan,#5b4ea3);}' +
    '.vec{display:inline-block;position:relative;padding-top:0.42em;line-height:1.05;font-style:italic;}' +
    '.vec::before{content:"";position:absolute;left:0.05em;right:0.3em;top:0.17em;border-top:1.5px solid currentColor;}' +
    '.vec::after{content:"";position:absolute;right:0;top:calc(0.17em - 3.2px);border-left:6px solid currentColor;border-top:3.7px solid transparent;border-bottom:3.7px solid transparent;}' +
    '.lecture{display:flex;flex-direction:column;gap:8px;margin:0 0 14px;font-variant-numeric:tabular-nums;}' +
    '.carte{padding:10px 12px;border-radius:var(--radius,3px);background:var(--surface-2,#f7f9fb);border:1px solid var(--line,#ccd8e0);line-height:1.55;font-size:0.95rem;}' +
    '.carte-titre{font-weight:700;font-size:0.82rem;color:var(--ink-soft,#51626f);margin-bottom:4px;}' +
    '.resultat{font-size:1.02rem;font-weight:700;}' +
    '.c-u{color:var(--accent,#b65c1f);} .c-v{color:var(--good,#2f7a4f);} .c-w{color:var(--plan,#5b4ea3);}' +
    '.alerte{border-color:var(--bad,#b23a3a);color:var(--bad,#b23a3a);font-weight:600;}' +
    '.ok{color:var(--good,#2f7a4f);font-weight:700;}' +
    '.note{font-size:0.85rem;color:var(--ink-soft,#51626f);}' +
    '.controles{display:flex;flex-direction:column;gap:10px;align-items:center;}' +
    '.rangee{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;align-items:center;}' +
    '.libelle{font-size:0.88rem;color:var(--ink-soft,#51626f);font-weight:600;}' +
    '.btn{min-height:44px;min-width:44px;padding:8px 14px;border-radius:var(--radius,3px);border:1px solid var(--line,#ccd8e0);background:var(--surface,#fff);color:var(--ink,#182430);font-weight:600;cursor:pointer;font-family:inherit;font-size:0.95rem;}' +
    '.btn[aria-pressed="true"]{background:var(--accent-soft,#f6e2d3);border-color:var(--accent,#b65c1f);color:var(--accent-ink,#7a3212);}' +
    '.btn:focus-visible{outline:2px solid var(--accent,#b65c1f);outline-offset:2px;}' +
    '.btn-reset{background:var(--accent-soft,#f6e2d3);border-color:var(--accent-soft-line,#e8c4a4);color:var(--accent-ink,#7a3212);}' +
    '</style>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" role="img" aria-label="Décomposition du vecteur u selon les directions de v et de w"></svg></div>' +
    '<div class="lecture" id="lecture" aria-live="polite"></div>' +
    '<div class="controles">' +
    '<div class="rangee"><span class="libelle">Vecteur à déplacer :</span>' +
    '<button class="btn" type="button" data-cible="u" aria-pressed="true"><span class="vec c-u">u</span></button>' +
    '<button class="btn" type="button" data-cible="v" aria-pressed="false"><span class="vec c-v">v</span></button>' +
    '<button class="btn" type="button" data-cible="w" aria-pressed="false"><span class="vec c-w">w</span></button></div>' +
    '<div class="rangee">' +
    '<button class="btn" type="button" data-dx="-1" data-dy="0" aria-label="Déplacer vers la gauche">←</button>' +
    '<button class="btn" type="button" data-dx="0" data-dy="1" aria-label="Déplacer vers le haut">↑</button>' +
    '<button class="btn" type="button" data-dx="0" data-dy="-1" aria-label="Déplacer vers le bas">↓</button>' +
    '<button class="btn" type="button" data-dx="1" data-dy="0" aria-label="Déplacer vers la droite">→</button></div>' +
    '<button class="btn btn-reset" id="reset" type="button">Réinitialiser</button>' +
    '</div>';

  class DecompositionVecteurWidget extends HTMLElement {
    constructor() {
      super();
      var shadow = this.attachShadow({ mode: "open" });
      shadow.appendChild(TEMPLATE.content.cloneNode(true));
      this._svg = shadow.getElementById("svg");
      this._lecture = shadow.getElementById("lecture");
      this._etat = defaut();
      this._cible = "u";
      this._glisse = null;
      this._ecouteurs = [];
    }

    connectedCallback() {
      var self = this, sh = this.shadowRoot;
      function ecoute(cible, type, fn) { cible.addEventListener(type, fn); self._ecouteurs.push([cible, type, fn]); }
      Array.prototype.forEach.call(sh.querySelectorAll("[data-cible]"), function (b) {
        ecoute(b, "click", function () { self._cible = b.getAttribute("data-cible"); self._rendre(); });
      });
      Array.prototype.forEach.call(sh.querySelectorAll("[data-dx]"), function (b) {
        ecoute(b, "click", function () {
          self._deplacer(self._cible, self._etat[self._cible].x + parseInt(b.getAttribute("data-dx"), 10),
            self._etat[self._cible].y + parseInt(b.getAttribute("data-dy"), 10));
        });
      });
      ecoute(sh.getElementById("reset"), "click", function () { self._etat = defaut(); self._cible = "u"; self._rendre(); });
      ecoute(this._svg, "pointerdown", function (e) {
        var c = e.target && e.target.getAttribute && e.target.getAttribute("data-poignee");
        if (!c) return;
        e.preventDefault();
        self._glisse = c; self._cible = c;
        try { self._svg.setPointerCapture(e.pointerId); } catch (err) { /* rien */ }
        self._rendre();
      });
      ecoute(this._svg, "pointermove", function (e) {
        if (!self._glisse) return;
        var p = self._versMonde(e.clientX, e.clientY);
        if (p) self._deplacer(self._glisse, Math.round(p.x), Math.round(p.y));
      });
      function fin(e) {
        if (!self._glisse) return;
        self._glisse = null;
        try { self._svg.releasePointerCapture(e.pointerId); } catch (err) { /* rien */ }
      }
      ecoute(this._svg, "pointerup", fin);
      ecoute(this._svg, "pointercancel", fin);
      this._rendre();
    }

    disconnectedCallback() {
      this._ecouteurs.forEach(function (t) { t[0].removeEventListener(t[1], t[2]); });
      this._ecouteurs = [];
    }

    _versMonde(cx, cy) {
      var ctm = this._svg.getScreenCTM();
      if (!ctm) return null;
      var pt = this._svg.createSVGPoint();
      pt.x = cx; pt.y = cy;
      var q = pt.matrixTransform(ctm.inverse());
      return { x: X_MIN + (q.x - MARGE) / UNITE, y: Y_MAX - (q.y - MARGE) / UNITE };
    }

    _px(x, y) { return [MARGE + (x - X_MIN) * UNITE, MARGE + (Y_MAX - y) * UNITE]; }

    _deplacer(nom, x, y) {
      x = Math.max(BORNE.xMin, Math.min(BORNE.xMax, x));
      y = Math.max(BORNE.yMin, Math.min(BORNE.yMax, y));
      var p = this._etat[nom];
      if (p.x === x && p.y === y) return;
      p.x = x; p.y = y;
      this._rendre();
    }

    _calcul() {
      var v = this._etat.v, w = this._etat.w, u = this._etat.u;
      var det = v.x * w.y - v.y * w.x;
      if (det === 0) return { possible: false, det: 0 };
      return {
        possible: true, det: det,
        a: frac(u.x * w.y - u.y * w.x, det),
        b: frac(v.x * u.y - v.y * u.x, det)
      };
    }

    // droite passant par O de direction d, coupée au cadre
    _droite(d) {
      var tMin = -Infinity, tMax = Infinity;
      if (d.x !== 0) { var a1 = X_MIN / d.x, a2 = X_MAX / d.x; tMin = Math.max(tMin, Math.min(a1, a2)); tMax = Math.min(tMax, Math.max(a1, a2)); }
      if (d.y !== 0) { var b1 = Y_MIN / d.y, b2 = Y_MAX / d.y; tMin = Math.max(tMin, Math.min(b1, b2)); tMax = Math.min(tMax, Math.max(b1, b2)); }
      return [{ x: d.x * tMin, y: d.y * tMin }, { x: d.x * tMax, y: d.y * tMax }];
    }

    _fleche(svg, p0, p1, classeTrait, classeTete) {
      var a = this._px(p0.x, p0.y), b = this._px(p1.x, p1.y);
      var dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy);
      if (L < 1) return;
      var ux = dx / L, uy = dy / L, t = 11, l = 5;
      var bx = b[0] - ux * t, by = b[1] - uy * t;
      el("line", { x1: a[0].toFixed(1), y1: a[1].toFixed(1), x2: bx.toFixed(1), y2: by.toFixed(1), class: classeTrait }, svg);
      el("path", { d: "M" + b[0].toFixed(1) + "," + b[1].toFixed(1) + " L" + (bx - uy * l).toFixed(1) + "," + (by + ux * l).toFixed(1) + " L" + (bx + uy * l).toFixed(1) + "," + (by - ux * l).toFixed(1) + " Z", class: classeTete }, svg);
    }

    // étiquette de vecteur avec flèche au-dessus
    _etiqVec(svg, x, y, texte, suffixe) {
      var largeur = texte.length * 8.6;
      var t = el("text", { x: x.toFixed(1), y: y.toFixed(1), class: "etiq etiq-" + suffixe, "text-anchor": "middle", "font-style": "italic" }, svg);
      t.textContent = texte;
      var y0 = y - 15, x0 = x - largeur / 2, x1 = x + largeur / 2;
      el("line", { x1: x0.toFixed(1), y1: y0.toFixed(1), x2: (x1 - 3).toFixed(1), y2: y0.toFixed(1), class: "etiq-fleche ef-" + suffixe }, svg);
      el("path", { d: "M" + (x1 + 2).toFixed(1) + "," + y0.toFixed(1) + " l-6,-3.4 l0,6.8 Z", class: "tete-" + suffixe }, svg);
    }

    _etiqOffset(svg, p, d, texte, suffixe) {
      // place l'étiquette près de l'extrémité p, décalée perpendiculairement à d
      var b = this._px(p.x, p.y);
      var L = Math.hypot(d.x, d.y) || 1;
      var nx = -d.y / L, ny = d.x / L; // normale (monde)
      var x = b[0] + nx * 16 + (d.x / L) * 6, y = b[1] - ny * 16 - (d.y / L) * 6 + 5;
      x = Math.max(16, Math.min(LARGEUR - 16, x));
      y = Math.max(24, Math.min(HAUTEUR - 6, y));
      this._etiqVec(svg, x, y, texte, suffixe);
    }

    _rendre() {
      var sh = this.shadowRoot, self = this;
      Array.prototype.forEach.call(sh.querySelectorAll("[data-cible]"), function (b) {
        b.setAttribute("aria-pressed", b.getAttribute("data-cible") === self._cible ? "true" : "false");
      });
      var E = this._etat, v = E.v, w = E.w, u = E.u;
      var R = this._calcul();
      var svg = this._svg;
      svg.innerHTML = "";
      var defs = el("defs", {}, svg);
      var clip = el("clipPath", { id: "cadre" }, defs);
      el("rect", { x: MARGE, y: MARGE, width: LARGEUR - 2 * MARGE, height: HAUTEUR - 2 * MARGE }, clip);
      var mk = el("marker", { id: "fl", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" }, defs);
      el("path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche-axe" }, mk);

      var g = el("g", { "clip-path": "url(#cadre)" }, svg);
      for (var gx = X_MIN; gx <= X_MAX; gx++) { var px = this._px(gx, 0)[0]; el("line", { x1: px, y1: MARGE, x2: px, y2: HAUTEUR - MARGE, class: "grille" }, g); }
      for (var gy = Y_MIN; gy <= Y_MAX; gy++) { var py = this._px(0, gy)[1]; el("line", { x1: MARGE, y1: py, x2: LARGEUR - MARGE, y2: py, class: "grille" }, g); }
      var o = this._px(0, 0);
      el("line", { x1: MARGE, y1: o[1], x2: LARGEUR - MARGE, y2: o[1], class: "axe", "marker-end": "url(#fl)" }, svg);
      el("line", { x1: o[0], y1: HAUTEUR - MARGE, x2: o[0], y2: MARGE, class: "axe", "marker-end": "url(#fl)" }, svg);

      // directions
      if (v.x !== 0 || v.y !== 0) { var dv = this._droite(v), a1 = this._px(dv[0].x, dv[0].y), a2 = this._px(dv[1].x, dv[1].y); el("line", { x1: a1[0], y1: a1[1], x2: a2[0], y2: a2[1], class: "direction dir-v" }, g); }
      if (w.x !== 0 || w.y !== 0) { var dw = this._droite(w), b1 = this._px(dw[0].x, dw[0].y), b2 = this._px(dw[1].x, dw[1].y); el("line", { x1: b1[0], y1: b1[1], x2: b2[0], y2: b2[1], class: "direction dir-w" }, g); }

      var O = { x: 0, y: 0 };
      var horsCadre = false;
      if (R.possible) {
        var av = { x: R.a.n / R.a.d * v.x, y: R.a.n / R.a.d * v.y };
        var bw = { x: R.b.n / R.b.d * w.x, y: R.b.n / R.b.d * w.y };
        [av, bw].forEach(function (p) { if (p.x < X_MIN || p.x > X_MAX || p.y < Y_MIN || p.y > Y_MAX) horsCadre = true; });
        var pu = this._px(u.x, u.y), pav = this._px(av.x, av.y), pbw = this._px(bw.x, bw.y);
        el("line", { x1: pu[0], y1: pu[1], x2: pav[0], y2: pav[1], class: "parallele" }, g);
        el("line", { x1: pu[0], y1: pu[1], x2: pbw[0], y2: pbw[1], class: "parallele" }, g);
        var gp = el("g", { "clip-path": "url(#cadre)" }, svg);
        this._fleche(gp, O, av, "vec-av", "tete-v");
        this._fleche(gp, O, bw, "vec-bw", "tete-w");
        el("circle", { cx: pav[0], cy: pav[1], r: 4, class: "point-proj" }, g);
        el("circle", { cx: pbw[0], cy: pbw[1], r: 4, class: "point-proj" }, g);
      }
      this._fleche(svg, O, v, "vec-v", "tete-v");
      this._fleche(svg, O, w, "vec-w", "tete-w");
      this._fleche(svg, O, u, "vec-u", "tete-u");
      el("circle", { cx: o[0], cy: o[1], r: 3.5, class: "point-o" }, svg);
      var to = el("text", { x: o[0] - 14, y: o[1] + 18, class: "etiq etiq-ink" }, svg); to.textContent = "O";

      this._etiqOffset(svg, u, u, "u", "u");
      this._etiqOffset(svg, v, v, "v", "v");
      this._etiqOffset(svg, w, w, "w", "w");

      ["u", "v", "w"].forEach(function (nom) {
        var p = self._px(E[nom].x, E[nom].y);
        el("circle", { cx: p[0], cy: p[1], r: 24, class: "poignee" + (self._cible === nom ? " poignee-active" : ""), "data-poignee": nom }, svg);
      });

      // ---------- lecture ----------
      var h = '';
      h += '<div class="carte"><div class="carte-titre">Les trois vecteurs</div>' +
        '<span class="c-u">' + vecHtml("u") + coordTxt(u) + '</span> · ' +
        '<span class="c-v">' + vecHtml("v") + coordTxt(v) + '</span> · ' +
        '<span class="c-w">' + vecHtml("w") + coordTxt(w) + '</span></div>';
      if (!R.possible) {
        var raison = (v.x === 0 && v.y === 0) || (w.x === 0 && w.y === 0)
          ? 'Un des deux vecteurs est nul : il n\'a pas de direction.'
          : vecHtml("v") + ' et ' + vecHtml("w") + ' sont colinéaires : ils ont la même direction (déterminant ' +
            moins(v.x) + ' × ' + moins(w.y) + ' − ' + moins(v.y) + ' × ' + moins(w.x) + ' = 0).';
        h += '<div class="carte alerte">Décomposition impossible. ' + raison +
          ' Il faut deux directions différentes pour décomposer ' + vecHtml("u") + '.</div>';
      } else {
        h += '<div class="carte"><div class="carte-titre">Décomposition (méthode du parallélogramme)</div>' +
          '<div class="resultat"><span class="c-u">' + vecHtml("u") + '</span> = ' +
          '<span class="c-v">' + fracTxt(R.a) + '·' + vecHtml("v") + '</span>' +
          (R.b.n < 0 ? ' − ' : ' + ') +
          '<span class="c-w">' + fracTxt({ n: Math.abs(R.b.n), d: R.b.d }) + '·' + vecHtml("w") + '</span></div>' +
          '<div>a = ' + fracAvecDec(R.a) + ' et b = ' + fracAvecDec(R.b) + '</div>' +
          (horsCadre ? '<div class="note">Une partie de la construction sort du cadre : a ou b est grand.</div>' : '') +
          '<div class="note">Par l\'extrémité de ' + vecHtml("u") + ', les parallèles aux deux directions coupent la direction de ' +
          vecHtml("v") + ' en a·' + vecHtml("v") + ' et celle de ' + vecHtml("w") + ' en b·' + vecHtml("w") + '.</div></div>';
        var ax = R.a.n / R.a.d, bx = R.b.n / R.b.d;
        var verifX = ax * v.x + bx * w.x, verifY = ax * v.y + bx * w.y;
        var okV = Math.abs(verifX - u.x) < 1e-9 && Math.abs(verifY - u.y) < 1e-9;
        h += '<div class="carte"><div class="carte-titre">Vérification par les composantes</div>' +
          '<div>a·' + vecHtml("v") + ' + b·' + vecHtml("w") + ' = ' + vecHtml("u") + ' donne le système :</div>' +
          '<div>· sur x : ' + equation(v.x, w.x, u.x) + '</div>' +
          '<div>· sur y : ' + equation(v.y, w.y, u.y) + '</div>' +
          '<div>Solution : a = ' + fracTxt(R.a) + ', b = ' + fracTxt(R.b) + '. ' +
          '<span class="ok">' + (okV ? '✓ ' : '') + fracTxt(R.a) + '·' + coordTxt(v) + ' + ' + (R.b.n < 0 ? '(' + fracTxt(R.b) + ')' : fracTxt(R.b)) + '·' + coordTxt(w) + ' = ' + coordTxt(u) + '</span></div></div>';
      }
      this._lecture.innerHTML = h;
    }
  }

  if (!customElements.get("decomposition-vecteur-widget")) {
    customElements.define("decomposition-vecteur-widget", DecompositionVecteurWidget);
  }
})();
