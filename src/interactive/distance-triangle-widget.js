(function () {
  "use strict";

  /* ================================================================
   * <distance-triangle-widget> — atelier interactif (4e, ch. 6, § 11) :
   * trois points A, B, C à coordonnées entières, déplaçables (glisser,
   * ou choisir un point puis utiliser les flèches). Pour le côté choisi,
   * le triangle rectangle de Pythagore (Δx horizontal, Δy vertical) est
   * dessiné. Les trois distances sont données exactes (√20 = 2√5) et
   * approchées, puis la nature du triangle : isocèle (en quel sommet),
   * rectangle (réciproque de Pythagore, en quel sommet), rectangle
   * isocèle, scalène ; points alignés → triangle aplati. Un triangle
   * équilatéral est impossible avec des sommets à coordonnées entières :
   * il n'est jamais annoncé. Défaut A(1 ; 1), B(4 ; 2), C(0 ; 4) →
   * AB = AC = √10, BC = 2√5 → rectangle isocèle en A.
   * Fenêtre FIXE. Web Component (Shadow DOM).
   * ================================================================ */

  var SVGNS = "http://www.w3.org/2000/svg";
  var X_MIN = -2, X_MAX = 9, Y_MIN = -2, Y_MAX = 8;
  var UNITE = 36, MARGE = 14;
  var LARGEUR = (X_MAX - X_MIN) * UNITE + 2 * MARGE;
  var HAUTEUR = (Y_MAX - Y_MIN) * UNITE + 2 * MARGE;
  var BORNE = { xMin: -1, xMax: 8, yMin: -1, yMax: 7 };
  var NOMS = ["A", "B", "C"];
  var COTES = [["A", "B"], ["A", "C"], ["B", "C"]];

  function defaut() { return { A: { x: 1, y: 1 }, B: { x: 4, y: 2 }, C: { x: 0, y: 4 } }; }

  function moins(s) { return String(s).replace(/-/g, "−"); }
  function fmtDec(x, d) {
    var f = Math.pow(10, d), r = Math.round(x * f) / f;
    if (Object.is(r, -0)) r = 0;
    return moins(r.toFixed(d).replace(".", ","));
  }
  // √n simplifiée : { k, m } avec n = k²·m
  function racine(n) {
    var k = 1, m = n;
    for (var i = 2; i * i <= m; i++) { while (m % (i * i) === 0) { m /= i * i; k *= i; } }
    return { k: k, m: m };
  }
  function racineTxt(n) {
    if (n === 0) return "0";
    var r = racine(n);
    if (r.m === 1) return String(r.k);
    return (r.k === 1 ? "" : r.k) + "√" + r.m;
  }
  // « = 5 » si entier, sinon « √20 = 2√5 ≈ 4,47 »
  function distanceTxt(n) {
    var r = racine(n);
    if (n === 0) return "0";
    if (r.m === 1) return "√" + n + " = " + r.k;
    var s = "√" + n;
    if (r.k !== 1) s += " = " + racineTxt(n);
    return s + " ≈ " + fmtDec(Math.sqrt(n), 2);
  }
  function coordTxt(p) { return "(" + moins(p.x) + " ; " + moins(p.y) + ")"; }
  function carreTxt(n) { return n < 0 ? "(" + moins(n) + ")²" : n + "²"; }

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
    '.graduation{font-size:11px;fill:var(--ink-soft,#51626f);font-family:var(--sans,sans-serif);}' +
    '.triangle{fill:var(--accent,#b65c1f);fill-opacity:0.08;stroke:var(--ink,#182430);stroke-width:2;stroke-linejoin:round;}' +
    '.cote-actif{stroke:var(--accent,#b65c1f);stroke-width:4;}' +
    '.jambe{stroke:var(--plan,#5b4ea3);stroke-width:2;stroke-dasharray:6 4;}' +
    '.angle-droit{fill:none;stroke:var(--plan,#5b4ea3);stroke-width:1.4;}' +
    '.angle-droit-tri{fill:none;stroke:var(--good,#2f7a4f);stroke-width:2;}' +
    '.marque{stroke:var(--good,#2f7a4f);stroke-width:2.2;}' +
    '.point{fill:var(--ink,#182430);}' +
    '.poignee{fill:transparent;cursor:grab;touch-action:none;}' +
    '.poignee-active{fill:var(--accent,#b65c1f);fill-opacity:0.14;}' +
    '.etiq{font-size:15px;font-weight:700;font-family:var(--sans,sans-serif);fill:var(--ink,#182430);}' +
    '.etiq-jambe{font-size:13px;font-weight:700;fill:var(--plan,#5b4ea3);font-family:var(--sans,sans-serif);}' +
    '.lecture{display:flex;flex-direction:column;gap:8px;margin:0 0 14px;font-variant-numeric:tabular-nums;}' +
    '.carte{padding:10px 12px;border-radius:var(--radius,3px);background:var(--surface-2,#f7f9fb);border:1px solid var(--line,#ccd8e0);line-height:1.55;font-size:0.95rem;}' +
    '.carte-titre{font-weight:700;font-size:0.82rem;color:var(--ink-soft,#51626f);margin-bottom:4px;}' +
    '.ligne-actif{color:var(--accent-ink,#7a3212);font-weight:700;}' +
    '.nature{font-size:1.02rem;font-weight:700;color:var(--good,#2f7a4f);}' +
    '.nature-plate{color:var(--bad,#b23a3a);}' +
    '.note{font-size:0.85rem;color:var(--ink-soft,#51626f);}' +
    '.controles{display:flex;flex-direction:column;gap:10px;align-items:center;}' +
    '.rangee{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;align-items:center;}' +
    '.libelle{font-size:0.88rem;color:var(--ink-soft,#51626f);font-weight:600;}' +
    '.btn{min-height:44px;min-width:44px;padding:8px 14px;border-radius:var(--radius,3px);border:1px solid var(--line,#ccd8e0);background:var(--surface,#fff);color:var(--ink,#182430);font-weight:600;cursor:pointer;font-family:inherit;font-size:0.95rem;}' +
    '.btn[aria-pressed="true"]{background:var(--accent-soft,#f6e2d3);border-color:var(--accent,#b65c1f);color:var(--accent-ink,#7a3212);}' +
    '.btn:focus-visible{outline:2px solid var(--accent,#b65c1f);outline-offset:2px;}' +
    '.btn-reset{background:var(--accent-soft,#f6e2d3);border-color:var(--accent-soft-line,#e8c4a4);color:var(--accent-ink,#7a3212);}' +
    '</style>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" role="img" aria-label="Triangle ABC sur un quadrillage, avec le triangle rectangle de Pythagore du côté choisi"></svg></div>' +
    '<div class="lecture" id="lecture" aria-live="polite"></div>' +
    '<div class="controles">' +
    '<div class="rangee"><span class="libelle">Côté étudié :</span>' +
    '<button class="btn" type="button" data-cote="0" aria-pressed="false">[AB]</button>' +
    '<button class="btn" type="button" data-cote="1" aria-pressed="false">[AC]</button>' +
    '<button class="btn" type="button" data-cote="2" aria-pressed="true">[BC]</button></div>' +
    '<div class="rangee"><span class="libelle">Point à déplacer :</span>' +
    '<button class="btn" type="button" data-point="A" aria-pressed="true">A</button>' +
    '<button class="btn" type="button" data-point="B" aria-pressed="false">B</button>' +
    '<button class="btn" type="button" data-point="C" aria-pressed="false">C</button></div>' +
    '<div class="rangee">' +
    '<button class="btn" type="button" data-dx="-1" data-dy="0" aria-label="Déplacer vers la gauche">←</button>' +
    '<button class="btn" type="button" data-dx="0" data-dy="1" aria-label="Déplacer vers le haut">↑</button>' +
    '<button class="btn" type="button" data-dx="0" data-dy="-1" aria-label="Déplacer vers le bas">↓</button>' +
    '<button class="btn" type="button" data-dx="1" data-dy="0" aria-label="Déplacer vers la droite">→</button></div>' +
    '<button class="btn btn-reset" id="reset" type="button">Réinitialiser</button>' +
    '</div>';

  class DistanceTriangleWidget extends HTMLElement {
    constructor() {
      super();
      var shadow = this.attachShadow({ mode: "open" });
      shadow.appendChild(TEMPLATE.content.cloneNode(true));
      this._svg = shadow.getElementById("svg");
      this._lecture = shadow.getElementById("lecture");
      this._etat = defaut();
      this._point = "A";
      this._cote = 2;
      this._glisse = null;
      this._ecouteurs = [];
    }

    connectedCallback() {
      var self = this, sh = this.shadowRoot;
      function ecoute(c, t, f) { c.addEventListener(t, f); self._ecouteurs.push([c, t, f]); }
      Array.prototype.forEach.call(sh.querySelectorAll("[data-point]"), function (b) {
        ecoute(b, "click", function () { self._point = b.getAttribute("data-point"); self._rendre(); });
      });
      Array.prototype.forEach.call(sh.querySelectorAll("[data-cote]"), function (b) {
        ecoute(b, "click", function () { self._cote = parseInt(b.getAttribute("data-cote"), 10); self._rendre(); });
      });
      Array.prototype.forEach.call(sh.querySelectorAll("[data-dx]"), function (b) {
        ecoute(b, "click", function () {
          var p = self._etat[self._point];
          self._deplacer(self._point, p.x + parseInt(b.getAttribute("data-dx"), 10), p.y + parseInt(b.getAttribute("data-dy"), 10));
        });
      });
      ecoute(sh.getElementById("reset"), "click", function () { self._etat = defaut(); self._point = "A"; self._cote = 2; self._rendre(); });
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

    _d2(P, Q) { var dx = Q.x - P.x, dy = Q.y - P.y; return dx * dx + dy * dy; }

    _nature() {
      var E = this._etat;
      var AB = this._d2(E.A, E.B), AC = this._d2(E.A, E.C), BC = this._d2(E.B, E.C);
      var res = { AB: AB, AC: AC, BC: BC };
      if (AB === 0 || AC === 0 || BC === 0) { res.type = "confondus"; return res; }
      var croix = (E.B.x - E.A.x) * (E.C.y - E.A.y) - (E.B.y - E.A.y) * (E.C.x - E.A.x);
      if (croix === 0) { res.type = "aplati"; return res; }
      var isoSommet = null;
      if (AB === AC) isoSommet = "A"; else if (AB === BC) isoSommet = "B"; else if (AC === BC) isoSommet = "C";
      var rectSommet = null, justif = "";
      if (BC === AB + AC) { rectSommet = "A"; justif = "BC² = " + BC + " = AB² + AC² = " + AB + " + " + AC; }
      else if (AC === AB + BC) { rectSommet = "B"; justif = "AC² = " + AC + " = AB² + BC² = " + AB + " + " + BC; }
      else if (AB === AC + BC) { rectSommet = "C"; justif = "AB² = " + AB + " = AC² + BC² = " + AC + " + " + BC; }
      res.iso = isoSommet; res.rect = rectSommet; res.justif = justif;
      if (rectSommet && isoSommet) res.type = "rectangle isocèle";
      else if (rectSommet) res.type = "rectangle";
      else if (isoSommet) res.type = "isocèle";
      else res.type = "scalène";
      return res;
    }

    _rendre() {
      var sh = this.shadowRoot, self = this, E = this._etat;
      Array.prototype.forEach.call(sh.querySelectorAll("[data-point]"), function (b) {
        b.setAttribute("aria-pressed", b.getAttribute("data-point") === self._point ? "true" : "false");
      });
      Array.prototype.forEach.call(sh.querySelectorAll("[data-cote]"), function (b) {
        b.setAttribute("aria-pressed", parseInt(b.getAttribute("data-cote"), 10) === self._cote ? "true" : "false");
      });
      var N = this._nature();
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

      var pA = this._px(E.A.x, E.A.y), pB = this._px(E.B.x, E.B.y), pC = this._px(E.C.x, E.C.y);
      el("polygon", { points: [pA, pB, pC].map(function (p) { return p[0] + "," + p[1]; }).join(" "), class: "triangle" }, svg);

      // côté actif + triangle de Pythagore
      var cote = COTES[this._cote], P = E[cote[0]], Q = E[cote[1]];
      var pP = this._px(P.x, P.y), pQ = this._px(Q.x, Q.y);
      el("line", { x1: pP[0], y1: pP[1], x2: pQ[0], y2: pQ[1], class: "cote-actif" }, svg);
      var dx = Q.x - P.x, dy = Q.y - P.y;
      if (dx !== 0 && dy !== 0) {
        var H = { x: Q.x, y: P.y }, pH = this._px(H.x, H.y);
        el("line", { x1: pP[0], y1: pP[1], x2: pH[0], y2: pH[1], class: "jambe" }, svg);
        el("line", { x1: pH[0], y1: pH[1], x2: pQ[0], y2: pQ[1], class: "jambe" }, svg);
        var sx = dx > 0 ? -1 : 1, sy = dy > 0 ? -1 : 1, c = 10;
        el("path", { d: "M" + (pH[0] + sx * c) + "," + pH[1] + " L" + (pH[0] + sx * c) + "," + (pH[1] + sy * c) + " L" + pH[0] + "," + (pH[1] + sy * c), class: "angle-droit" }, svg);
        var lx = el("text", { x: ((pP[0] + pH[0]) / 2).toFixed(1), y: (pH[1] + (dy > 0 ? 18 : -8)).toFixed(1), class: "etiq-jambe", "text-anchor": "middle" }, svg);
        lx.textContent = "|Δx| = " + Math.abs(dx);
        var lyX = pH[0] + (dx > 0 ? 8 : -8);
        var ly = el("text", { x: lyX.toFixed(1), y: ((pH[1] + pQ[1]) / 2 + 4).toFixed(1), class: "etiq-jambe", "text-anchor": dx > 0 ? "start" : "end" }, svg);
        ly.textContent = "|Δy| = " + Math.abs(dy);
      }

      // angle droit du triangle (réciproque de Pythagore) et marques d'isocèle
      if (N.rect) {
        var S = E[N.rect], autres = NOMS.filter(function (n) { return n !== N.rect; });
        var U = E[autres[0]], V = E[autres[1]];
        var pS = this._px(S.x, S.y);
        function unit(Pt) { var a = self._px(Pt.x, Pt.y), ddx = a[0] - pS[0], ddy = a[1] - pS[1], L = Math.hypot(ddx, ddy); return [ddx / L, ddy / L]; }
        var u1 = unit(U), u2 = unit(V), k = 13;
        el("path", { d: "M" + (pS[0] + u1[0] * k) + "," + (pS[1] + u1[1] * k) + " L" + (pS[0] + (u1[0] + u2[0]) * k) + "," + (pS[1] + (u1[1] + u2[1]) * k) + " L" + (pS[0] + u2[0] * k) + "," + (pS[1] + u2[1] * k), class: "angle-droit-tri" }, svg);
      }
      if (N.iso) {
        var Sm = N.iso, aut = NOMS.filter(function (n) { return n !== Sm; });
        aut.forEach(function (n) {
          var a = self._px(E[Sm].x, E[Sm].y), b = self._px(E[n].x, E[n].y);
          var mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, ddx = b[0] - a[0], ddy = b[1] - a[1], L = Math.hypot(ddx, ddy);
          var nx = -ddy / L * 7, ny = ddx / L * 7;
          el("line", { x1: mx - nx, y1: my - ny, x2: mx + nx, y2: my + ny, class: "marque" }, svg);
        });
      }

      // points + étiquettes (à l'opposé du centre de gravité)
      var gxC = (pA[0] + pB[0] + pC[0]) / 3, gyC = (pA[1] + pB[1] + pC[1]) / 3;
      NOMS.forEach(function (n) {
        var p = self._px(E[n].x, E[n].y);
        el("circle", { cx: p[0], cy: p[1], r: 4.5, class: "point" }, svg);
        var ddx = p[0] - gxC, ddy = p[1] - gyC, L = Math.hypot(ddx, ddy) || 1;
        var ex = p[0] + ddx / L * 16, ey = p[1] + ddy / L * 16 + 5;
        ex = Math.max(10, Math.min(LARGEUR - 10, ex)); ey = Math.max(16, Math.min(HAUTEUR - 6, ey));
        var t = el("text", { x: ex.toFixed(1), y: ey.toFixed(1), class: "etiq", "text-anchor": "middle" }, svg);
        t.textContent = n;
      });
      NOMS.forEach(function (n) {
        var p = self._px(E[n].x, E[n].y);
        el("circle", { cx: p[0], cy: p[1], r: 24, class: "poignee" + (self._point === n ? " poignee-active" : ""), "data-poignee": n }, svg);
      });

      // ---------- lecture ----------
      var h = '<div class="carte"><div class="carte-titre">Points</div>A' + coordTxt(E.A) + ' · B' + coordTxt(E.B) + ' · C' + coordTxt(E.C) + '</div>';
      h += '<div class="carte"><div class="carte-titre">Longueurs des côtés</div>';
      COTES.forEach(function (cd, i) {
        var P1 = E[cd[0]], P2 = E[cd[1]], ddx = P2.x - P1.x, ddy = P2.y - P1.y, n2 = ddx * ddx + ddy * ddy;
        h += '<div' + (i === self._cote ? ' class="ligne-actif"' : '') + '>' + cd[0] + cd[1] + ' = √(' + carreTxt(ddx) + ' + ' + carreTxt(ddy) + ') = ' + distanceTxt(n2) + '</div>';
      });
      h += '</div>';
      var nat = '';
      if (N.type === "confondus") nat = '<div class="nature nature-plate">Deux points sont confondus : il n\'y a pas de triangle.</div>';
      else if (N.type === "aplati") nat = '<div class="nature nature-plate">Triangle aplati : A, B et C sont alignés.</div>';
      else {
        var titre = N.type === "rectangle isocèle" ? "Triangle rectangle isocèle en " + N.rect
          : N.type === "rectangle" ? "Triangle rectangle en " + N.rect
          : N.type === "isocèle" ? "Triangle isocèle en " + N.iso
          : "Triangle scalène (trois côtés de longueurs différentes)";
        nat = '<div class="nature">' + titre + '</div>';
        if (N.iso) {
          var cotesIso = N.iso === "A" ? "AB = AC" : N.iso === "B" ? "BA = BC" : "CA = CB";
          nat += '<div>Isocèle : ' + cotesIso + '.</div>';
        }
        if (N.rect) nat += '<div>Réciproque de Pythagore : ' + N.justif + '.</div>';
        else nat += '<div class="note">Le carré du plus grand côté n\'est pas égal à la somme des carrés des deux autres : pas d\'angle droit.</div>';
        if (N.iso) nat += '<div class="note">Un triangle équilatéral est impossible ici : ses trois sommets ne peuvent pas tous avoir des coordonnées entières.</div>';
      }
      h += '<div class="carte"><div class="carte-titre">Nature du triangle</div>' + nat + '</div>';
      this._lecture.innerHTML = h;
    }
  }

  if (!customElements.get("distance-triangle-widget")) {
    customElements.define("distance-triangle-widget", DistanceTriangleWidget);
  }
})();
