(function () {
  "use strict";

  /* ================================================================
   * <longueur-direction-sens-widget> — atelier (4e, ch. 6, § 16) :
   * u = AB fixe (A(0 ; 5), B(3 ; 6) : u(3 ; 1)) ; v = CD déplaçable
   * (C et D à coordonnées entières). Les trois propriétés s'allument en
   * direct : même longueur (carrés des normes comparés), même direction
   * (critère de colinéarité nul), même sens (seulement si même direction :
   * k > 0). La ligne correspondante du tableau du § 16 est surlignée :
   * égaux, opposés, colinéaires de même sens, colinéaires de sens opposé,
   * même norme seulement, ou rien en commun. Raccourcis : v = u, −u, 2u,
   * −2u, même norme (1 ; 3). Fenêtre FIXE. Web Component (Shadow DOM).
   * ================================================================ */

  var SVGNS = "http://www.w3.org/2000/svg";
  var X_MIN = -1, X_MAX = 10, Y_MIN = -1, Y_MAX = 9;
  var UNITE = 36, MARGE = 14;
  var LARGEUR = (X_MAX - X_MIN) * UNITE + 2 * MARGE;
  var HAUTEUR = (Y_MAX - Y_MIN) * UNITE + 2 * MARGE;
  var BORNE = { xMin: 0, xMax: 9, yMin: 0, yMax: 8 };
  var A = { x: 0, y: 5 }, B = { x: 3, y: 6 };
  var U = { x: 3, y: 1 };
  var LIGNES = [
    ["egaux", "Vecteurs égaux", "identique", "identique", "identique"],
    ["opposes", "Vecteurs opposés", "identique", "identique", "opposé"],
    ["colMeme", "Colinéaires, même sens (k > 0)", "quelconque", "identique", "identique"],
    ["colOppose", "Colinéaires, sens opposé (k < 0)", "quelconque", "identique", "opposé"],
    ["memeNorme", "Même norme seulement", "identique", "différente", "sans objet"],
    ["rien", "Rien en commun", "différente", "différente", "sans objet"],
  ];

  function defaut() { return { C: { x: 7, y: 3 }, D: { x: 4, y: 2 } }; }
  function moins(s) { return String(s).replace(/-/g, "−"); }
  function racine(n) {
    var k = 1, m = n;
    for (var i = 2; i * i <= m; i++) { while (m % (i * i) === 0) { m /= i * i; k *= i; } }
    if (m === 1) return String(k);
    return (k === 1 ? "" : k) + "√" + m;
  }
  function pgcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = a % b; a = b; b = t; } return a; }
  function fraction(p, q) {
    if (q < 0) { p = -p; q = -q; }
    var g = pgcd(p, q) || 1; p /= g; q /= g;
    return q === 1 ? moins(p) : moins(p) + "/" + q;
  }

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
    '.graduation{font-size:11px;fill:var(--ink-soft,#51626f);paint-order:stroke;stroke:var(--surface-2,#f7f9fb);stroke-width:3.5px;stroke-linejoin:round;}' +
    '.u{stroke:var(--accent,#b65c1f);stroke-width:3;}' +
    '.u-tete{fill:var(--accent,#b65c1f);}' +
    '.v{stroke:var(--plan,#5b4ea3);stroke-width:3;}' +
    '.v-tete{fill:var(--plan,#5b4ea3);}' +
    '.support{stroke:var(--accent,#b65c1f);stroke-width:1.2;stroke-dasharray:4 5;opacity:0.7;}' +
    '.point{fill:var(--ink,#182430);}' +
    '.poignee{fill:transparent;cursor:grab;touch-action:none;}' +
    '.poignee-active{fill:var(--plan,#5b4ea3);fill-opacity:0.14;}' +
    '.etiq{font-size:17px;font-weight:700;fill:var(--ink,#182430);paint-order:stroke;stroke:var(--surface-2,#f7f9fb);stroke-width:3.5px;stroke-linejoin:round;}' +
    '.etiq-u{font-size:18px;font-weight:700;fill:var(--accent,#b65c1f);paint-order:stroke;stroke:var(--surface-2,#f7f9fb);stroke-width:3.5px;stroke-linejoin:round;}' +
    '.etiq-v{font-size:18px;font-weight:700;fill:var(--plan,#5b4ea3);paint-order:stroke;stroke:var(--surface-2,#f7f9fb);stroke-width:3.5px;stroke-linejoin:round;}' +
    '.lecture{display:flex;flex-direction:column;gap:8px;margin:0 auto 14px;max-width:620px;font-variant-numeric:tabular-nums;text-align:left;}' +
    '.carte{padding:10px 12px;border-radius:var(--radius,3px);background:var(--surface-2,#f7f9fb);border:1px solid var(--line,#ccd8e0);line-height:1.55;font-size:0.95rem;}' +
    '.carte-titre{font-weight:700;font-size:0.82rem;color:var(--ink-soft,#51626f);margin-bottom:4px;}' +
    '.voyants{display:flex;flex-wrap:wrap;gap:6px;}' +
    '.voyant{padding:4px 10px;border-radius:999px;border:1px solid var(--line,#ccd8e0);font-weight:700;font-size:0.88rem;}' +
    '.oui{background:var(--good-soft,#dcefe3);border-color:var(--good,#2f7a4f);color:var(--good,#2f7a4f);}' +
    '.non{background:var(--surface,#fff);color:var(--ink-soft,#51626f);}' +
    '.objet{background:var(--surface,#fff);color:var(--ink-soft,#51626f);font-style:italic;}' +
    '.lignes{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:4px;}' +
    '.lignes li{padding:5px 8px;border:1px solid var(--line,#ccd8e0);border-radius:var(--radius,3px);background:var(--surface,#fff);font-size:0.9rem;}' +
    '.lignes li.actif{background:var(--accent-soft,#f6e2d3);border-color:var(--accent,#b65c1f);color:var(--accent-ink,#7a3212);font-weight:700;}' +
    '.lignes .nom{font-weight:700;}' +
    '.controles{display:flex;flex-direction:column;gap:10px;align-items:center;max-width:620px;margin:0 auto;}' +
    '.rangee{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;align-items:center;}' +
    '.libelle{font-size:0.88rem;color:var(--ink-soft,#51626f);font-weight:600;}' +
    '.btn{min-height:44px;min-width:44px;padding:8px 12px;border-radius:var(--radius,3px);border:1px solid var(--line,#ccd8e0);background:var(--surface,#fff);color:var(--ink,#182430);font-weight:600;cursor:pointer;font-family:inherit;font-size:0.95rem;}' +
    '.btn[aria-pressed="true"]{background:var(--accent-soft,#f6e2d3);border-color:var(--accent,#b65c1f);color:var(--accent-ink,#7a3212);}' +
    '.btn:focus-visible{outline:2px solid var(--accent,#b65c1f);outline-offset:2px;}' +
    '.btn-reset{background:var(--accent-soft,#f6e2d3);border-color:var(--accent-soft-line,#e8c4a4);color:var(--accent-ink,#7a3212);}' +
    '</style>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" role="img" aria-label="Vecteur u fixe et vecteur v déplaçable sur un quadrillage"></svg></div>' +
    '<div class="lecture" id="lecture" aria-live="polite"></div>' +
    '<div class="controles">' +
    '<div class="rangee"><span class="libelle">Point à déplacer :</span>' +
    '<button class="btn" type="button" data-point="C" aria-pressed="false">C (origine de v)</button>' +
    '<button class="btn" type="button" data-point="D" aria-pressed="true">D (extrémité de v)</button></div>' +
    '<div class="rangee">' +
    '<button class="btn" type="button" data-dx="-1" data-dy="0" aria-label="Déplacer vers la gauche">←</button>' +
    '<button class="btn" type="button" data-dx="0" data-dy="1" aria-label="Déplacer vers le haut">↑</button>' +
    '<button class="btn" type="button" data-dx="0" data-dy="-1" aria-label="Déplacer vers le bas">↓</button>' +
    '<button class="btn" type="button" data-dx="1" data-dy="0" aria-label="Déplacer vers la droite">→</button></div>' +
    '<div class="rangee"><span class="libelle">Essayer v = </span>' +
    '<button class="btn" type="button" data-k="1">u</button>' +
    '<button class="btn" type="button" data-k="-1">−u</button>' +
    '<button class="btn" type="button" data-k="2">2u</button>' +
    '<button class="btn" type="button" data-k="-2">−2u</button>' +
    '<button class="btn" type="button" data-k="norme">même norme</button></div>' +
    '<button class="btn btn-reset" id="reset" type="button">Réinitialiser</button>' +
    '</div>';

  class LongueurDirectionSensWidget extends HTMLElement {
    constructor() {
      super();
      var shadow = this.attachShadow({ mode: "open" });
      shadow.appendChild(TEMPLATE.content.cloneNode(true));
      this._svg = shadow.getElementById("svg");
      this._lecture = shadow.getElementById("lecture");
      this._etat = defaut();
      this._point = "D";
      this._glisse = null;
      this._ecouteurs = [];
    }

    connectedCallback() {
      var self = this, sh = this.shadowRoot;
      function ecoute(c, t, f) { c.addEventListener(t, f); self._ecouteurs.push([c, t, f]); }
      Array.prototype.forEach.call(sh.querySelectorAll("[data-point]"), function (b) {
        ecoute(b, "click", function () { self._point = b.getAttribute("data-point"); self._rendre(); });
      });
      Array.prototype.forEach.call(sh.querySelectorAll("[data-dx]"), function (b) {
        ecoute(b, "click", function () {
          var p = self._etat[self._point];
          self._deplacer(self._point, p.x + parseInt(b.getAttribute("data-dx"), 10), p.y + parseInt(b.getAttribute("data-dy"), 10));
        });
      });
      Array.prototype.forEach.call(sh.querySelectorAll("[data-k]"), function (b) {
        ecoute(b, "click", function () { self._raccourci(b.getAttribute("data-k")); });
      });
      ecoute(sh.getElementById("reset"), "click", function () { self._etat = defaut(); self._point = "D"; self._rendre(); });
      ecoute(this._svg, "pointerdown", function (e) {
        var c = e.target && e.target.getAttribute && e.target.getAttribute("data-poignee");
        if (!c) return;
        e.preventDefault();
        self._glisse = c; self._point = c;
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

    /* v = k·u (ou v(1 ; 3), même norme que u, direction différente) : C est placé pour que D reste dans la fenêtre. */
    _raccourci(k) {
      var v = k === "norme" ? { x: 1, y: 3 } : { x: U.x * Number(k), y: U.y * Number(k) };
      var cx = v.x >= 0 ? 2 : 8, cy = v.y >= 0 ? 1 : 3;
      this._etat = { C: { x: cx, y: cy }, D: { x: cx + v.x, y: cy + v.y } };
      this._rendre();
    }

    _fleche(svg, P, Q, classeTrait, classeTete) {
      var a = this._px(P.x, P.y), b = this._px(Q.x, Q.y);
      var dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy);
      if (L < 1) return;
      var ux = dx / L, uy = dy / L, t = 13, w = 6;
      el("line", { x1: a[0], y1: a[1], x2: b[0] - ux * t * 0.8, y2: b[1] - uy * t * 0.8, class: classeTrait }, svg);
      el("path", { d: "M" + b[0] + "," + b[1] + " L" + (b[0] - ux * t - uy * w) + "," + (b[1] - uy * t + ux * w) + " L" + (b[0] - ux * t + uy * w) + "," + (b[1] - uy * t - ux * w) + " Z", class: classeTete }, svg);
    }

    _relation(v) {
      var n2u = U.x * U.x + U.y * U.y, n2v = v.x * v.x + v.y * v.y;
      var critere = U.x * v.y - U.y * v.x;
      var memeLongueur = n2u === n2v;
      var memeDirection = n2v > 0 && critere === 0;
      var k = null, memeSens = null;
      if (memeDirection) {
        k = U.x !== 0 ? [v.x, U.x] : [v.y, U.y];
        memeSens = k[0] / k[1] > 0;
      }
      var cle;
      if (n2v === 0) cle = null;
      else if (memeDirection && memeSens && memeLongueur) cle = "egaux";
      else if (memeDirection && !memeSens && memeLongueur) cle = "opposes";
      else if (memeDirection && memeSens) cle = "colMeme";
      else if (memeDirection) cle = "colOppose";
      else if (memeLongueur) cle = "memeNorme";
      else cle = "rien";
      return { n2u: n2u, n2v: n2v, critere: critere, memeLongueur: memeLongueur, memeDirection: memeDirection, memeSens: memeSens, k: k, cle: cle };
    }

    _rendre() {
      var sh = this.shadowRoot, self = this, E = this._etat;
      Array.prototype.forEach.call(sh.querySelectorAll("[data-point]"), function (b) {
        b.setAttribute("aria-pressed", b.getAttribute("data-point") === self._point ? "true" : "false");
      });
      var v = { x: E.D.x - E.C.x, y: E.D.y - E.C.y };
      var R = this._relation(v);
      var svg = this._svg;
      svg.innerHTML = "";
      var defs = el("defs", {}, svg);
      var mk = el("marker", { id: "fl", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" }, defs);
      el("path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche-axe" }, mk);
      for (var gx = X_MIN; gx <= X_MAX; gx++) { var px = this._px(gx, 0)[0]; el("line", { x1: px, y1: MARGE, x2: px, y2: HAUTEUR - MARGE, class: "grille" }, svg); }
      for (var gy = Y_MIN; gy <= Y_MAX; gy++) { var py = this._px(0, gy)[1]; el("line", { x1: MARGE, y1: py, x2: LARGEUR - MARGE, y2: py, class: "grille" }, svg); }
      var o = this._px(0, 0);
      el("line", { x1: MARGE, y1: o[1], x2: LARGEUR - MARGE, y2: o[1], class: "axe", "marker-end": "url(#fl)" }, svg);
      el("line", { x1: o[0], y1: HAUTEUR - MARGE, x2: o[0], y2: MARGE, class: "axe", "marker-end": "url(#fl)" }, svg);
      var t1 = el("text", { x: this._px(1, 0)[0] - 3, y: o[1] + 15, class: "graduation" }, svg); t1.textContent = "1";
      var t2 = el("text", { x: o[0] - 12, y: this._px(0, 1)[1] + 4, class: "graduation" }, svg); t2.textContent = "1";
      // droite parallèle à u passant par C : même direction ⟺ v est porté par elle
      // coupée au cadre (paramètres t pour lesquels C + t·u reste dans la fenêtre)
      var tx1 = (X_MIN - E.C.x) / U.x, tx2 = (X_MAX - E.C.x) / U.x, ty1 = (Y_MIN - E.C.y) / U.y, ty2 = (Y_MAX - E.C.y) / U.y;
      var tMin = Math.max(Math.min(tx1, tx2), Math.min(ty1, ty2)), tMax = Math.min(Math.max(tx1, tx2), Math.max(ty1, ty2));
      var a = this._px(E.C.x + tMin * U.x, E.C.y + tMin * U.y), b = this._px(E.C.x + tMax * U.x, E.C.y + tMax * U.y);
      el("line", { x1: a[0], y1: a[1], x2: b[0], y2: b[1], class: "support" }, svg);
      this._fleche(svg, A, B, "u", "u-tete");
      this._fleche(svg, E.C, E.D, "v", "v-tete");
      var pu = this._px((A.x + B.x) / 2, (A.y + B.y) / 2);
      var eu = el("text", { x: pu[0] - 4, y: pu[1] - 12, class: "etiq-u", "text-anchor": "middle" }, svg); eu.textContent = "u";
      var pm = this._px((E.C.x + E.D.x) / 2, (E.C.y + E.D.y) / 2);
      var L = Math.hypot(v.x, v.y) || 1;
      var ev = el("text", { x: (pm[0] - v.y / L * 16).toFixed(1), y: (pm[1] - v.x / L * 16 + 5).toFixed(1), class: "etiq-v", "text-anchor": "middle" }, svg); ev.textContent = "v";
      [["A", A, [-12, 5]], ["B", B, [10, -8]], ["C", E.C, [-12, 18]], ["D", E.D, [12, -8]]].forEach(function (t) {
        var p = self._px(t[1].x, t[1].y);
        el("circle", { cx: p[0], cy: p[1], r: 4.5, class: "point" }, svg);
        var e = el("text", { x: Math.max(10, Math.min(LARGEUR - 10, p[0] + t[2][0])).toFixed(1), y: Math.max(16, Math.min(HAUTEUR - 6, p[1] + t[2][1])).toFixed(1), class: "etiq", "text-anchor": "middle" }, svg);
        e.textContent = t[0];
      });
      ["C", "D"].forEach(function (n) {
        var p = self._px(E[n].x, E[n].y);
        el("circle", { cx: p[0], cy: p[1], r: 22, class: "poignee" + (self._point === n ? " poignee-active" : ""), "data-poignee": n }, svg);
      });

      // ---------- lecture ----------
      function voyant(nom, etat) {
        var cls = etat === null ? "objet" : etat ? "oui" : "non";
        var txt = etat === null ? "sans objet" : etat ? "oui" : "non";
        return '<span class="voyant ' + cls + '">' + nom + ' : ' + txt + '</span>';
      }
      var h = '<div class="carte"><div class="carte-titre">Les deux vecteurs</div>u(3 ; 1), ‖u‖ = √10<br>v = CD(' + moins(v.x) + ' ; ' + moins(v.y) + '), ‖v‖ = √' + R.n2v + (R.n2v ? (racine(R.n2v) !== "√" + R.n2v ? ' = ' + racine(R.n2v) : '') : '') + '</div>';
      if (R.n2v === 0) {
        h += '<div class="carte">C et D sont confondus : v est le vecteur nul, sans direction ni sens.</div>';
      } else {
        h += '<div class="carte"><div class="carte-titre">Trois propriétés indépendantes</div><div class="voyants">' +
          voyant("même longueur", R.memeLongueur) + voyant("même direction", R.memeDirection) + voyant("même sens", R.memeDirection ? R.memeSens : null) + '</div>' +
          '<div style="margin-top:6px">Longueur : ‖u‖² = 10, ‖v‖² = ' + R.n2v + '. Direction : critère de colinéarité 3 × ' + (v.y < 0 ? '(' + moins(v.y) + ')' : v.y) + ' − 1 × ' + (v.x < 0 ? '(' + moins(v.x) + ')' : v.x) + ' = ' + moins(R.critere) + (R.critere === 0 ? ' : colinéaires' : ' : pas colinéaires') + '.' +
          (R.memeDirection ? ' Sens : v = ' + fraction(R.k[0], R.k[1]) + '·u, coefficient ' + (R.memeSens ? 'positif.' : 'négatif.') : '') + '</div></div>';
      }
      h += '<div class="carte"><div class="carte-titre">Le tableau du cours</div><ul class="lignes">';
      LIGNES.forEach(function (l) {
        h += '<li' + (l[0] === R.cle ? ' class="actif"' : '') + '><span class="nom">' + l[1] + '</span> — longueur ' + l[2] + ', direction ' + l[3] + ', sens ' + l[4] + '</li>';
      });
      h += '</ul></div>';
      this._lecture.innerHTML = h;
    }
  }

  if (!customElements.get("longueur-direction-sens-widget")) {
    customElements.define("longueur-direction-sens-widget", LongueurDirectionSensWidget);
  }
})();
