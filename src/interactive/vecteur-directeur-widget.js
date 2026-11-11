(function () {
  "use strict";

  /* ================================================================
   * <vecteur-directeur-widget> — atelier interactif (4e, ch. 6, § 15) :
   * une droite d passant par deux points A et B à coordonnées entières,
   * déplaçables (glisser, ou choisir un point puis utiliser les flèches).
   * Plusieurs vecteurs directeurs sont dessinés : AB (sur la droite),
   * BA et 2·AB (représentants parallèles, à côté de d), et le vecteur
   * (1 ; m) issu du point (0 ; p). Pente m = Δy / Δx exacte, équation
   * y = mx + p ; cas horizontal (vecteur (k ; 0), m = 0) et vertical
   * (vecteur (0 ; k), pas de pente, équation x = k).
   * Défaut A(0 ; −1), B(2 ; 3) → m = 2, y = 2x − 1, vecteur (1 ; 2).
   * Fenêtre FIXE. Web Component (Shadow DOM).
   * ================================================================ */

  var SVGNS = "http://www.w3.org/2000/svg";
  var X_MIN = -6, X_MAX = 6, Y_MIN = -5, Y_MAX = 6;
  var UNITE = 32, MARGE = 14;
  var LARGEUR = (X_MAX - X_MIN) * UNITE + 2 * MARGE;
  var HAUTEUR = (Y_MAX - Y_MIN) * UNITE + 2 * MARGE;
  var BORNE = { xMin: -5, xMax: 5, yMin: -4, yMax: 5 };

  function defaut() { return { A: { x: 0, y: -1 }, B: { x: 2, y: 3 } }; }

  function pgcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = b; b = a % b; a = t; } return a || 1; }
  function frac(n, d) { if (d < 0) { n = -n; d = -d; } var g = pgcd(n, d); return { n: n / g, d: d / g }; }
  function moins(s) { return String(s).replace(/-/g, "−"); }
  function fracTxt(f) { return f.d === 1 ? moins(f.n) : moins(f.n) + "/" + f.d; }
  function coordTxt(x, y) { return "(" + x + " ; " + y + ")"; }
  function vecHtml(nom) { return '<span class="vec">' + nom + '</span>'; }

  // « y = 2x − 1 », « y = −x », « y = (3/2)x + 1/2 », « y = 3 »
  function equationTxt(m, p) {
    var s = "y = ";
    var aX = "";
    if (m.n !== 0) {
      if (m.d === 1) aX = (m.n === 1 ? "" : m.n === -1 ? "−" : moins(m.n)) + "x";
      else aX = "(" + fracTxt(m) + ")x";
    }
    if (aX === "") return s + fracTxt(p);
    if (p.n === 0) return s + aX;
    return s + aX + (p.n < 0 ? " − " : " + ") + fracTxt({ n: Math.abs(p.n), d: p.d });
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
    '.graduation{font-size:11px;fill:var(--ink-soft,#51626f);font-family:var(--sans,sans-serif);paint-order:stroke;stroke:var(--surface-2,#f7f9fb);stroke-width:3.5px;stroke-linejoin:round;}' +
    '.droite{stroke:var(--ink,#182430);stroke-width:1.6;}' +
    '.v-ab{stroke:var(--accent,#b65c1f);stroke-width:3;} .t-ab{fill:var(--accent,#b65c1f);}' +
    '.v-ba{stroke:var(--plan,#5b4ea3);stroke-width:2.2;} .t-ba{fill:var(--plan,#5b4ea3);}' +
    '.v-2ab{stroke:var(--sky,#2f6fb0);stroke-width:2.2;} .t-2ab{fill:var(--sky,#2f6fb0);}' +
    '.v-m{stroke:var(--good,#2f7a4f);stroke-width:2.6;} .t-m{fill:var(--good,#2f7a4f);}' +
    '.composante{stroke:var(--good,#2f7a4f);stroke-width:1.3;stroke-dasharray:3 3;}' +
    '.point{fill:var(--ink,#182430);}' +
    '.point-p{fill:var(--surface,#fff);stroke:var(--good,#2f7a4f);stroke-width:2;}' +
    '.poignee{fill:transparent;cursor:grab;touch-action:none;}' +
    '.poignee-active{fill:var(--accent,#b65c1f);fill-opacity:0.14;}' +
    '.etiq{font-size:15px;font-weight:700;font-family:var(--sans,sans-serif);fill:var(--ink,#182430);paint-order:stroke;stroke:var(--surface-2,#f7f9fb);stroke-width:3.5px;stroke-linejoin:round;}' +
    '.etiq-d{font-size:15px;font-weight:700;font-style:italic;fill:var(--ink,#182430);font-family:var(--serif,serif);paint-order:stroke;stroke:var(--surface-2,#f7f9fb);stroke-width:3.5px;stroke-linejoin:round;}' +
    '.vec{display:inline-block;position:relative;padding-top:0.42em;line-height:1.05;}' +
    '.vec::before{content:"";position:absolute;left:0.05em;right:0.3em;top:0.17em;border-top:1.5px solid currentColor;}' +
    '.vec::after{content:"";position:absolute;right:0;top:calc(0.17em - 3.2px);border-left:6px solid currentColor;border-top:3.7px solid transparent;border-bottom:3.7px solid transparent;}' +
    '.lecture{display:flex;flex-direction:column;gap:8px;margin:0 0 14px;font-variant-numeric:tabular-nums;}' +
    '.carte{padding:10px 12px;border-radius:var(--radius,3px);background:var(--surface-2,#f7f9fb);border:1px solid var(--line,#ccd8e0);line-height:1.6;font-size:0.95rem;}' +
    '.carte-titre{font-weight:700;font-size:0.82rem;color:var(--ink-soft,#51626f);margin-bottom:4px;}' +
    '.c-ab{color:var(--accent,#b65c1f);font-weight:700;} .c-ba{color:var(--plan,#5b4ea3);font-weight:700;} .c-2ab{color:var(--sky,#2f6fb0);font-weight:700;} .c-m{color:var(--good,#2f7a4f);font-weight:700;}' +
    '.eq{font-size:1.05rem;font-weight:700;}' +
    '.note{font-size:0.85rem;color:var(--ink-soft,#51626f);}' +
    '.alerte{color:var(--bad,#b23a3a);font-weight:600;}' +
    '.controles{display:flex;flex-direction:column;gap:10px;align-items:center;}' +
    '.rangee{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;align-items:center;}' +
    '.libelle{font-size:0.88rem;color:var(--ink-soft,#51626f);font-weight:600;}' +
    '.btn{min-height:44px;min-width:44px;padding:8px 14px;border-radius:var(--radius,3px);border:1px solid var(--line,#ccd8e0);background:var(--surface,#fff);color:var(--ink,#182430);font-weight:600;cursor:pointer;font-family:inherit;font-size:0.95rem;}' +
    '.btn[aria-pressed="true"]{background:var(--accent-soft,#f6e2d3);border-color:var(--accent,#b65c1f);color:var(--accent-ink,#7a3212);}' +
    '.btn:focus-visible{outline:2px solid var(--accent,#b65c1f);outline-offset:2px;}' +
    '.btn-reset{background:var(--accent-soft,#f6e2d3);border-color:var(--accent-soft-line,#e8c4a4);color:var(--accent-ink,#7a3212);}' +
    '.lecture,.controles,.enonce,.consigne,.options,.correction{max-width:620px;margin-left:auto;margin-right:auto;}' +
    '</style>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" role="img" aria-label="Droite d passant par A et B, avec plusieurs de ses vecteurs directeurs"></svg></div>' +
    '<div class="lecture" id="lecture" aria-live="polite"></div>' +
    '<div class="controles">' +
    '<div class="rangee"><span class="libelle">Point à déplacer :</span>' +
    '<button class="btn" type="button" data-point="A" aria-pressed="true">A</button>' +
    '<button class="btn" type="button" data-point="B" aria-pressed="false">B</button></div>' +
    '<div class="rangee">' +
    '<button class="btn" type="button" data-dx="-1" data-dy="0" aria-label="Déplacer vers la gauche">←</button>' +
    '<button class="btn" type="button" data-dx="0" data-dy="1" aria-label="Déplacer vers le haut">↑</button>' +
    '<button class="btn" type="button" data-dx="0" data-dy="-1" aria-label="Déplacer vers le bas">↓</button>' +
    '<button class="btn" type="button" data-dx="1" data-dy="0" aria-label="Déplacer vers la droite">→</button></div>' +
    '<div class="rangee"><button class="btn" type="button" id="horiz">Rendre d horizontale</button>' +
    '<button class="btn" type="button" id="vert">Rendre d verticale</button></div>' +
    '<button class="btn btn-reset" id="reset" type="button">Réinitialiser</button>' +
    '</div>';

  class VecteurDirecteurWidget extends HTMLElement {
    constructor() {
      super();
      var shadow = this.attachShadow({ mode: "open" });
      shadow.appendChild(TEMPLATE.content.cloneNode(true));
      this._svg = shadow.getElementById("svg");
      this._lecture = shadow.getElementById("lecture");
      this._etat = defaut();
      this._point = "A";
      this._glisse = null;
      this._message = "";
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
      ecoute(sh.getElementById("horiz"), "click", function () {
        var A = self._etat.A, B = self._etat.B;
        var nx = B.x === A.x ? (A.x < BORNE.xMax - 2 ? A.x + 3 : A.x - 3) : B.x;
        self._etat.B = { x: nx, y: A.y }; self._message = ""; self._rendre();
      });
      ecoute(sh.getElementById("vert"), "click", function () {
        var A = self._etat.A, B = self._etat.B;
        var ny = B.y === A.y ? (A.y < BORNE.yMax - 2 ? A.y + 3 : A.y - 3) : B.y;
        self._etat.B = { x: A.x, y: ny }; self._message = ""; self._rendre();
      });
      ecoute(sh.getElementById("reset"), "click", function () { self._etat = defaut(); self._point = "A"; self._message = ""; self._rendre(); });
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
      var autre = this._etat[nom === "A" ? "B" : "A"];
      if (autre.x === x && autre.y === y) {
        this._message = "A et B doivent rester distincts : deux points confondus ne définissent pas une droite.";
        this._rendre();
        return;
      }
      var p = this._etat[nom];
      if (p.x === x && p.y === y) return;
      p.x = x; p.y = y;
      this._message = "";
      this._rendre();
    }

    _fleche(svg, p0, p1, cTrait, cTete) {
      var a = this._px(p0.x, p0.y), b = this._px(p1.x, p1.y);
      var dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy);
      if (L < 1) return;
      var ux = dx / L, uy = dy / L, t = 11, l = 5;
      var bx = b[0] - ux * t, by = b[1] - uy * t;
      el("line", { x1: a[0].toFixed(1), y1: a[1].toFixed(1), x2: bx.toFixed(1), y2: by.toFixed(1), class: cTrait }, svg);
      el("path", { d: "M" + b[0].toFixed(1) + "," + b[1].toFixed(1) + " L" + (bx - uy * l).toFixed(1) + "," + (by + ux * l).toFixed(1) + " L" + (bx + uy * l).toFixed(1) + "," + (by - ux * l).toFixed(1) + " Z", class: cTete }, svg);
    }

    _rendre() {
      var sh = this.shadowRoot, self = this, E = this._etat, A = E.A, B = E.B;
      Array.prototype.forEach.call(sh.querySelectorAll("[data-point]"), function (b) {
        b.setAttribute("aria-pressed", b.getAttribute("data-point") === self._point ? "true" : "false");
      });
      var dx = B.x - A.x, dy = B.y - A.y;
      var verticale = dx === 0, horizontale = dy === 0;
      var m = verticale ? null : frac(dy, dx);
      var p = verticale ? null : frac(A.y * dx - dy * A.x, dx); // p = yA − m·xA

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
      var t1 = el("text", { x: this._px(1, 0)[0] - 3, y: o[1] + 15, class: "graduation" }, svg); t1.textContent = "1";
      var t2 = el("text", { x: o[0] - 12, y: this._px(0, 1)[1] + 4, class: "graduation" }, svg); t2.textContent = "1";

      // droite d (longue, coupée au cadre)
      var L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
      // segment de d coupé au cadre : A + t·(ux ; uy), t ∈ [tMin ; tMax]
      var tMin = -Infinity, tMax = Infinity;
      if (ux !== 0) { var a1 = (X_MIN - A.x) / ux, a2 = (X_MAX - A.x) / ux; tMin = Math.max(tMin, Math.min(a1, a2)); tMax = Math.min(tMax, Math.max(a1, a2)); }
      if (uy !== 0) { var b1 = (Y_MIN - A.y) / uy, b2 = (Y_MAX - A.y) / uy; tMin = Math.max(tMin, Math.min(b1, b2)); tMax = Math.min(tMax, Math.max(b1, b2)); }
      var d0 = { x: A.x + ux * tMin, y: A.y + uy * tMin }, d1 = { x: A.x + ux * tMax, y: A.y + uy * tMax };
      var q0 = this._px(d0.x, d0.y), q1 = this._px(d1.x, d1.y);
      el("line", { x1: q0[0], y1: q0[1], x2: q1[0], y2: q1[1], class: "droite" }, g);

      // représentants parallèles décalés (monde) : normale unitaire
      var nx = -uy, ny = ux, dec = 0.75;
      var gv = el("g", { "clip-path": "url(#cadre)" }, svg);
      // BA, décalé d'un côté, à partir de B décalé
      this._fleche(gv, { x: B.x + nx * dec, y: B.y + ny * dec }, { x: A.x + nx * dec, y: A.y + ny * dec }, "v-ba", "t-ba");
      // 2·AB, décalé de l'autre côté, à partir de A décalé
      this._fleche(gv, { x: A.x - nx * dec, y: A.y - ny * dec }, { x: A.x + 2 * dx - nx * dec, y: A.y + 2 * dy - ny * dec }, "v-2ab", "t-2ab");
      // AB sur la droite
      this._fleche(gv, A, B, "v-ab", "t-ab");

      // vecteur (1 ; m) ou (0 ; 1)
      var depart = null, arrivee = null;
      if (!verticale) {
        var pv = p.n / p.d, mv = m.n / m.d;
        var dansCadre = pv >= Y_MIN + 0.5 && pv <= Y_MAX - 0.5 && pv + mv >= Y_MIN && pv + mv <= Y_MAX;
        depart = dansCadre ? { x: 0, y: pv } : { x: A.x, y: A.y };
        arrivee = { x: depart.x + 1, y: depart.y + mv };
        var pd = this._px(depart.x, depart.y), pc = this._px(arrivee.x, depart.y), pa = this._px(arrivee.x, arrivee.y);
        if (!horizontale) {
          el("line", { x1: pd[0], y1: pd[1], x2: pc[0], y2: pc[1], class: "composante" }, gv);
          el("line", { x1: pc[0], y1: pc[1], x2: pa[0], y2: pa[1], class: "composante" }, gv);
        }
        this._fleche(gv, depart, arrivee, "v-m", "t-m");
        if (dansCadre) el("circle", { cx: pd[0], cy: pd[1], r: 4.5, class: "point-p" }, svg);
      } else {
        depart = { x: A.x, y: 0 }; arrivee = { x: A.x, y: 1 };
        this._fleche(gv, { x: A.x + 0.0, y: 0 }, { x: A.x, y: 1 }, "v-m", "t-m");
      }

      // points A, B
      [["A", A], ["B", B]].forEach(function (c) {
        var pp = self._px(c[1].x, c[1].y);
        el("circle", { cx: pp[0], cy: pp[1], r: 4.5, class: "point" }, svg);
        var sens = c[0] === "A" ? -1 : 1;
        // étiquette côté +n (celui de BA), en arrière de A / en avant de B : zones libres
        // (BA ne dépasse pas A vers l'arrière ni B vers l'avant) ; axe y inversé en pixels
        var lx = pp[0] + ux * sens * 20 + nx * 14, ly = pp[1] - uy * sens * 20 - ny * 14 + 5;
        lx = Math.max(10, Math.min(LARGEUR - 10, lx)); ly = Math.max(16, Math.min(HAUTEUR - 6, ly));
        var t = el("text", { x: lx.toFixed(1), y: ly.toFixed(1), class: "etiq", "text-anchor": "middle" }, svg);
        t.textContent = c[0];
      });
      // nom de la droite près du bord
      // côté +n, près de l'extrémité « avant » de d : zone libre (BA s'arrête en B)
      var bordD = this._px(A.x + ux * (tMax - 0.9) + nx * 0.55, A.y + uy * (tMax - 0.9) + ny * 0.55);
      var td = el("text", { x: Math.max(14, Math.min(LARGEUR - 14, bordD[0])).toFixed(1), y: Math.max(18, Math.min(HAUTEUR - 8, bordD[1] + 5)).toFixed(1), class: "etiq-d", "text-anchor": "middle" }, svg);
      td.textContent = "d";
      [["A", A], ["B", B]].forEach(function (c) {
        var pp = self._px(c[1].x, c[1].y);
        el("circle", { cx: pp[0], cy: pp[1], r: 24, class: "poignee" + (self._point === c[0] ? " poignee-active" : ""), "data-poignee": c[0] }, svg);
      });

      // ---------- lecture ----------
      var h = '';
      if (this._message) h += '<div class="carte alerte">' + this._message + '</div>';
      h += '<div class="carte"><div class="carte-titre">Quatre vecteurs directeurs de d (tous colinéaires)</div>' +
        '<div><span class="c-ab">' + vecHtml("AB") + coordTxt(moins(dx), moins(dy)) + '</span> · ' +
        '<span class="c-ba">' + vecHtml("BA") + coordTxt(moins(-dx), moins(-dy)) + '</span> · ' +
        '<span class="c-2ab">2·' + vecHtml("AB") + coordTxt(moins(2 * dx), moins(2 * dy)) + '</span></div>';
      if (verticale) {
        h += '<div><span class="c-m">' + coordTxt("0", "1") + '</span> : droite verticale, ses vecteurs directeurs sont les ' + coordTxt("0", "k") + ' avec k ≠ 0.</div></div>';
        h += '<div class="carte"><div class="carte-titre">Pente et équation</div>' +
          '<div>Δx = 0 : on ne peut pas diviser par 0, la droite verticale <strong>n\'a pas de pente</strong>.</div>' +
          '<div class="eq">Équation : x = ' + moins(A.x) + '</div>' +
          '<div class="note">Pas d\'équation de la forme y = mx + p pour une droite verticale.</div></div>';
      } else {
        h += '<div><span class="c-m">' + coordTxt("1", fracTxt(m)) + '</span> : le vecteur (1 ; m), issu de ' +
          (depart.x === 0 ? 'l\'ordonnée à l\'origine (0 ; ' + fracTxt(p) + ')' : 'A') + '.' +
          (m.d !== 1 ? ' Sans fraction : ' + coordTxt(String(m.d), moins(m.n)) + ', obtenu en multipliant par ' + m.d + '.' : '') + '</div>';
        if (horizontale) h += '<div class="note">Droite horizontale : ses vecteurs directeurs sont les ' + coordTxt("k", "0") + ' avec k ≠ 0.</div>';
        h += '</div>';
        h += '<div class="carte"><div class="carte-titre">Pente et équation</div>' +
          '<div>m = Δy / Δx = ' + moins(dy) + ' / ' + moins(dx) + ' = ' + fracTxt(m) + '</div>' +
          '<div>p = y<sub>A</sub> − m·x<sub>A</sub> = ' + fracTxt(p) + '</div>' +
          '<div class="eq">Équation : ' + equationTxt(m, p) + '</div>' +
          '<div class="note">Quand x augmente de 1, y change de m : c\'est exactement le vecteur (1 ; m).</div></div>';
      }
      this._lecture.innerHTML = h;
    }
  }

  if (!customElements.get("vecteur-directeur-widget")) {
    customElements.define("vecteur-directeur-widget", VecteurDirecteurWidget);
  }
})();
