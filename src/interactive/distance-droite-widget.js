(function () {
  "use strict";

  /* ================================================================
   * <distance-droite-widget> — atelier interactif (4e, ch. 7, § 6) :
   * une droite d (par deux points P et R à coordonnées entières,
   * déplaçables) et un point C déplaçable. La construction est affichée
   * pas à pas : perpendiculaire à d par C (paramétrique), pied H
   * (intersection, exact), vecteur CH, distance ‖CH‖ exacte (racine
   * simplifiée) et approchée. Un point Q glisse sur d : CQ ≥ CH, égalité
   * seulement en Q = H (Pythagore : CQ² = CH² + HQ²).
   * Mode « Deux parallèles » : d′ parallèle à d passant par A′ ; la
   * distance entre d et d′ est celle de A′ à d.
   * Défauts : d : 4x − 3y − 1 = 0 (P(1 ; 1), R(4 ; 5)), C(−7 ; 7) →
   * H(1 ; 1), CH = (8 ; −6), distance 10 ; parallèles : d : y = 2x − 4,
   * d′ : y = 2x + 1 → distance √5.
   * Repère orthonormé, fenêtre FIXE. Web Component (Shadow DOM).
   * ================================================================ */

  var SVGNS = "http://www.w3.org/2000/svg";
  var X_MIN = -9, X_MAX = 7, Y_MIN = -5, Y_MAX = 9;
  var UNITE = 20, MARGE = 14;
  var LARGEUR = (X_MAX - X_MIN) * UNITE + 2 * MARGE;
  var HAUTEUR = (Y_MAX - Y_MIN) * UNITE + 2 * MARGE;
  var BORNE = { xMin: -8, xMax: 6, yMin: -4, yMax: 8 };

  function defautPoint() { return { P: { x: 1, y: 1 }, R: { x: 4, y: 5 }, C: { x: -7, y: 7 }, s: 4 }; }
  function defautParal() { return { P: { x: 0, y: -4 }, R: { x: 2, y: 0 }, C: { x: 0, y: 1 }, s: 3 }; }

  function pgcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = b; b = a % b; a = t; } return a; }
  function frac(n, d) { if (d < 0) { n = -n; d = -d; } var g = pgcd(n, d) || 1; return { n: n / g, d: d / g }; }
  function moins(s) { return String(s).replace(/-/g, "−"); }
  function fracTxt(f) { return f.d === 1 ? moins(f.n) : moins(f.n) + "/" + f.d; }
  function val(f) { return f.n / f.d; }
  function par(n) { return n < 0 ? "(" + moins(n) + ")" : String(n); }
  function fmtDec(x, d) {
    var f = Math.pow(10, d), r = Math.round(x * f) / f;
    if (Object.is(r, -0)) r = 0;
    return moins(r.toFixed(d).replace(".", ","));
  }
  function vecHtml(nom) { return '<span class="vec">' + nom + '</span>'; }
  function coordTxt(x, y) { return "(" + x + " ; " + y + ")"; }
  function carreFrac(f) { return (f.n < 0 || f.d !== 1) ? "(" + fracTxt(f) + ")²" : fracTxt(f) + "²"; }

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
  // k·(expr) dans une somme : liste de [négatif, corps]
  function joindre(morceaux) {
    var s = "";
    morceaux.forEach(function (m, i) {
      if (i === 0) s = (m[0] ? "−" : "") + m[1];
      else s += (m[0] ? " − " : " + ") + m[1];
    });
    return s === "" ? "0" : s;
  }
  // √(n/d) simplifiée : « 10 », « √5 », « 2√5 », « 3√2/5 »
  function racineFrac(n, d) {
    if (n === 0) return { txt: "0", exact: true };
    var N = n * d, k = 1, m = N;
    for (var i = 2; i * i <= m; i++) { while (m % (i * i) === 0) { m /= i * i; k *= i; } }
    var g = pgcd(k, d) || 1; k /= g; var den = d / g;
    var num = m === 1 ? String(k) : (k === 1 ? "" : k) + "√" + m;
    return { txt: den === 1 ? num : num + "/" + den, exact: m === 1 };
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
    '.modes{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin:0 0 12px;}' +
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:10px;}' +
    'svg{width:100%;max-width:520px;height:auto;background:var(--surface-2,#f7f9fb);border-radius:var(--radius,3px);border:1px solid var(--line,#ccd8e0);}' +
    '.grille{stroke:var(--line,#ccd8e0);stroke-width:0.6;}' +
    '.axe{stroke:var(--ink-soft,#51626f);stroke-width:1.3;}' +
    '.fleche-axe{fill:var(--ink-soft,#51626f);}' +
    '.graduation{font-size:11px;fill:var(--ink-soft,#51626f);font-family:var(--sans,sans-serif);}' +
    '.droite{stroke:var(--accent,#b65c1f);stroke-width:2.6;}' +
    '.droite2{stroke:var(--plan,#5b4ea3);stroke-width:2.6;}' +
    '.perp{stroke:var(--good,#2f7a4f);stroke-width:1.6;stroke-dasharray:6 5;}' +
    '.ch{stroke:var(--good,#2f7a4f);stroke-width:3;}' +
    '.fch{fill:var(--good,#2f7a4f);}' +
    '.cq{stroke:var(--bad,#b23a3a);stroke-width:1.8;stroke-dasharray:4 4;}' +
    '.angle-droit{fill:none;stroke:var(--good,#2f7a4f);stroke-width:1.8;}' +
    '.point{fill:var(--ink,#182430);}' +
    '.point-c{fill:var(--good,#2f7a4f);}' +
    '.point-q{fill:var(--bad,#b23a3a);}' +
    '.point-dr{fill:var(--accent,#b65c1f);}' +
    '.poignee{fill:transparent;cursor:grab;touch-action:none;}' +
    '.poignee-active{fill:var(--accent,#b65c1f);fill-opacity:0.14;}' +
    '.etiq{font-size:14px;font-weight:700;font-family:var(--sans,sans-serif);fill:var(--ink,#182430);paint-order:stroke;stroke:var(--surface-2,#f7f9fb);stroke-width:3.5px;stroke-linejoin:round;}' +
    '.etiq-d{fill:var(--accent,#b65c1f);} .etiq-d2{fill:var(--plan,#5b4ea3);} .etiq-c{fill:var(--good,#2f7a4f);} .etiq-q{fill:var(--bad,#b23a3a);}' +
    '.lecture{display:flex;flex-direction:column;gap:8px;margin:0 0 12px;font-variant-numeric:tabular-nums;}' +
    '.carte{padding:10px 12px;border-radius:var(--radius,3px);background:var(--surface-2,#f7f9fb);border:1px solid var(--line,#ccd8e0);line-height:1.55;font-size:0.95rem;}' +
    '.carte-titre{font-weight:700;font-size:0.82rem;color:var(--ink-soft,#51626f);margin-bottom:4px;}' +
    '.etapes{margin:0;padding-left:1.3em;} .etapes li{margin:3px 0;}' +
    '.resultat{font-weight:700;color:var(--good,#2f7a4f);font-size:1.02rem;}' +
    '.comparaison{font-weight:600;}' +
    '.note{font-size:0.86rem;color:var(--ink-soft,#51626f);}' +
    '.message{color:var(--bad,#b23a3a);font-size:0.9rem;min-height:1.2em;text-align:center;}' +
    '.controles{display:flex;flex-direction:column;gap:10px;align-items:center;}' +
    '.rangee{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;align-items:center;}' +
    '.libelle{font-size:0.88rem;color:var(--ink-soft,#51626f);font-weight:600;}' +
    '.curseur{display:flex;align-items:center;gap:8px;width:100%;max-width:420px;}' +
    '.curseur input{flex:1 1 auto;min-width:0;height:44px;accent-color:var(--bad,#b23a3a);}' +
    '.btn{min-height:44px;min-width:44px;padding:8px 14px;border-radius:var(--radius,3px);border:1px solid var(--line,#ccd8e0);background:var(--surface,#fff);color:var(--ink,#182430);font-weight:600;cursor:pointer;font-family:inherit;font-size:0.95rem;}' +
    '.btn[aria-pressed="true"]{background:var(--accent-soft,#f6e2d3);border-color:var(--accent,#b65c1f);color:var(--accent-ink,#7a3212);}' +
    '.btn:focus-visible{outline:2px solid var(--accent,#b65c1f);outline-offset:2px;}' +
    '.btn-reset{background:var(--accent-soft,#f6e2d3);border-color:var(--accent-soft-line,#e8c4a4);color:var(--accent-ink,#7a3212);}' +
    '.vec{display:inline-block;position:relative;padding-top:0.42em;line-height:1.05;}' +
    '.vec::before{content:"";position:absolute;left:0.05em;right:0.3em;top:0.17em;border-top:1.5px solid currentColor;}' +
    '.vec::after{content:"";position:absolute;right:0;top:calc(0.17em - 3.2px);border-left:6px solid currentColor;border-top:3.7px solid transparent;border-bottom:3.7px solid transparent;}' +
    '.lecture,.controles{max-width:620px;margin-left:auto;margin-right:auto;}' +
    '[hidden]{display:none!important;}' +
    '</style>' +
    '<div class="modes" role="group" aria-label="Mode">' +
    '<button class="btn" type="button" data-mode="point" aria-pressed="true">Point – droite</button>' +
    '<button class="btn" type="button" data-mode="paral" aria-pressed="false">Deux parallèles</button>' +
    '</div>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" role="img" aria-label="La droite d, le point, la perpendiculaire et son pied H dans un repère orthonormé"></svg></div>' +
    '<div class="lecture" id="lecture" aria-live="polite"></div>' +
    '<div class="controles">' +
    '<div class="curseur"><label class="libelle" for="q">Q sur d</label><input id="q" type="range" min="-8" max="8" step="0.5" value="4" aria-label="Position du point Q sur la droite d, mesurée depuis H"><span class="libelle" id="q-val"></span></div>' +
    '<div class="rangee"><span class="libelle">Point à déplacer :</span>' +
    '<button class="btn" type="button" data-point="C" aria-pressed="true" id="btn-c">C</button>' +
    '<button class="btn" type="button" data-point="P" aria-pressed="false">P</button>' +
    '<button class="btn" type="button" data-point="R" aria-pressed="false">R</button></div>' +
    '<div class="rangee">' +
    '<button class="btn" type="button" data-dx="-1" data-dy="0" aria-label="Déplacer vers la gauche">←</button>' +
    '<button class="btn" type="button" data-dx="0" data-dy="1" aria-label="Déplacer vers le haut">↑</button>' +
    '<button class="btn" type="button" data-dx="0" data-dy="-1" aria-label="Déplacer vers le bas">↓</button>' +
    '<button class="btn" type="button" data-dx="1" data-dy="0" aria-label="Déplacer vers la droite">→</button></div>' +
    '<div class="message" id="message" aria-live="polite"></div>' +
    '<button class="btn btn-reset" id="reset" type="button">Réinitialiser</button>' +
    '</div>';

  class DistanceDroiteWidget extends HTMLElement {
    constructor() {
      super();
      var shadow = this.attachShadow({ mode: "open" });
      shadow.appendChild(TEMPLATE.content.cloneNode(true));
      this._svg = shadow.getElementById("svg");
      this._lecture = shadow.getElementById("lecture");
      this._mode = "point";
      this._etats = { point: defautPoint(), paral: defautParal() };
      this._point = "C";
      this._glisse = null;
      this._message = "";
      this._ecouteurs = [];
    }

    get _etat() { return this._etats[this._mode]; }

    connectedCallback() {
      var self = this, sh = this.shadowRoot;
      function ecoute(c, t, f) { c.addEventListener(t, f); self._ecouteurs.push([c, t, f]); }
      Array.prototype.forEach.call(sh.querySelectorAll("[data-mode]"), function (b) {
        ecoute(b, "click", function () { self._mode = b.getAttribute("data-mode"); self._message = ""; self._rendre(); });
      });
      Array.prototype.forEach.call(sh.querySelectorAll("[data-point]"), function (b) {
        ecoute(b, "click", function () { self._point = b.getAttribute("data-point"); self._rendre(); });
      });
      Array.prototype.forEach.call(sh.querySelectorAll("[data-dx]"), function (b) {
        ecoute(b, "click", function () {
          var p = self._etat[self._point];
          self._deplacer(self._point, p.x + parseInt(b.getAttribute("data-dx"), 10), p.y + parseInt(b.getAttribute("data-dy"), 10));
        });
      });
      ecoute(sh.getElementById("q"), "input", function (e) { self._etat.s = parseFloat(e.target.value); self._rendre(); });
      ecoute(sh.getElementById("reset"), "click", function () {
        self._etats[self._mode] = self._mode === "point" ? defautPoint() : defautParal();
        self._point = "C"; self._message = ""; self._rendre();
      });
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
      var E = this._etat, p = E[nom];
      if (p.x === x && p.y === y) return;
      var autre = nom === "P" ? E.R : nom === "R" ? E.P : null;
      if (autre && autre.x === x && autre.y === y) {
        this._message = "P et R doivent rester distincts : deux points confondus ne définissent pas une droite.";
        this._rendre();
        return;
      }
      p.x = x; p.y = y;
      this._message = "";
      this._rendre();
    }

    // Droite d sous forme ax + by + c = 0 (réduite), direction primitive u
    _droite() {
      var E = this._etat;
      var dx = E.R.x - E.P.x, dy = E.R.y - E.P.y, g = pgcd(dx, dy) || 1;
      var ux = dx / g, uy = dy / g;
      var a = uy, b = -ux, c = -(a * E.P.x + b * E.P.y);
      if (a < 0 || (a === 0 && b < 0)) { a = -a; b = -b; c = -c; }
      return { a: a, b: b, c: c, ux: ux, uy: uy };
    }

    _segment(px0, py0, ux, uy) {
      var ts = [];
      if (ux !== 0) { ts.push((X_MIN - px0) / ux); ts.push((X_MAX - px0) / ux); }
      if (uy !== 0) { ts.push((Y_MIN - py0) / uy); ts.push((Y_MAX - py0) / uy); }
      var pts = [];
      ts.forEach(function (t) {
        var x = px0 + t * ux, y = py0 + t * uy;
        if (x >= X_MIN - 1e-9 && x <= X_MAX + 1e-9 && y >= Y_MIN - 1e-9 && y <= Y_MAX + 1e-9) pts.push([x, y, t]);
      });
      if (pts.length < 2) return null;
      pts.sort(function (p, q) { return p[2] - q[2]; });
      return [pts[0], pts[pts.length - 1]];
    }

    _calcul() {
      var E = this._etat, d = this._droite();
      var C = E.C;
      // perpendiculaire par C, direction n = (a ; b) (normale de d)
      var n1 = d.a, n2 = d.b;
      var num = d.a * C.x + d.b * C.y + d.c, den = d.a * d.a + d.b * d.b;
      var t = frac(-num, den);
      var H = { x: frac(C.x * t.d + n1 * t.n, t.d), y: frac(C.y * t.d + n2 * t.n, t.d) };
      var CH = { x: frac(H.x.n * 1 - C.x * H.x.d, H.x.d), y: frac(H.y.n - C.y * H.y.d, H.y.d) };
      // distance² = num² / den
      var d2 = frac(num * num, den);
      return { d: d, n1: n1, n2: n2, num: num, den: den, t: t, H: H, CH: CH, d2: d2 };
    }

    _rendre() {
      var sh = this.shadowRoot, self = this, E = this._etat, R = this._calcul(), d = R.d;
      var paral = this._mode === "paral";
      Array.prototype.forEach.call(sh.querySelectorAll("[data-mode]"), function (b) {
        b.setAttribute("aria-pressed", b.getAttribute("data-mode") === self._mode ? "true" : "false");
      });
      Array.prototype.forEach.call(sh.querySelectorAll("[data-point]"), function (b) {
        b.setAttribute("aria-pressed", b.getAttribute("data-point") === self._point ? "true" : "false");
      });
      sh.getElementById("btn-c").textContent = paral ? "A′" : "C";
      sh.getElementById("message").textContent = this._message;
      sh.getElementById("q").value = String(E.s);
      sh.getElementById("q-val").textContent = "HQ = " + fmtDec(Math.abs(E.s), 1);
      var nomC = paral ? "A′" : "C";
      var surD = R.num === 0;

      // ---------- figure ----------
      var svg = this._svg;
      svg.innerHTML = "";
      var defs = el("defs", {}, svg);
      var mk = el("marker", { id: "fl", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" }, defs);
      el("path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche-axe" }, mk);
      var mk2 = el("marker", { id: "fch", markerWidth: "10", markerHeight: "10", refX: "8", refY: "5", orient: "auto", markerUnits: "userSpaceOnUse" }, defs);
      el("path", { d: "M0,0 L10,5 L0,10 Z", class: "fch" }, mk2);
      for (var gx = X_MIN; gx <= X_MAX; gx++) { var px = this._px(gx, 0)[0]; el("line", { x1: px, y1: MARGE, x2: px, y2: HAUTEUR - MARGE, class: "grille" }, svg); }
      for (var gy = Y_MIN; gy <= Y_MAX; gy++) { var py = this._px(0, gy)[1]; el("line", { x1: MARGE, y1: py, x2: LARGEUR - MARGE, y2: py, class: "grille" }, svg); }
      var o = this._px(0, 0);
      el("line", { x1: MARGE, y1: o[1], x2: LARGEUR - MARGE, y2: o[1], class: "axe", "marker-end": "url(#fl)" }, svg);
      el("line", { x1: o[0], y1: HAUTEUR - MARGE, x2: o[0], y2: MARGE, class: "axe", "marker-end": "url(#fl)" }, svg);
      var t1 = el("text", { x: this._px(1, 0)[0] - 3, y: o[1] + 14, class: "graduation" }, svg); t1.textContent = "1";
      var t2 = el("text", { x: o[0] - 11, y: this._px(0, 1)[1] + 4, class: "graduation" }, svg); t2.textContent = "1";

      var segD = this._segment(E.P.x, E.P.y, d.ux, d.uy);
      if (segD) {
        var a1 = this._px(segD[0][0], segD[0][1]), b1 = this._px(segD[1][0], segD[1][1]);
        el("line", { x1: a1[0], y1: a1[1], x2: b1[0], y2: b1[1], class: "droite" }, svg);
        var ed = this._px(segD[1][0] - d.ux * 0.6 / Math.hypot(d.ux, d.uy), segD[1][1] - d.uy * 0.6 / Math.hypot(d.ux, d.uy));
        var td = el("text", { x: (ed[0] + 8).toFixed(1), y: (ed[1] + 4).toFixed(1), class: "etiq etiq-d" }, svg);
        td.textContent = "d";
        if (ed[0] > LARGEUR - 30) { td.setAttribute("x", (ed[0] - 8).toFixed(1)); td.setAttribute("text-anchor", "end"); }
      }
      if (paral && !surD) {
        var segD2 = this._segment(E.C.x, E.C.y, d.ux, d.uy);
        if (segD2) {
          var a2 = this._px(segD2[0][0], segD2[0][1]), b2 = this._px(segD2[1][0], segD2[1][1]);
          el("line", { x1: a2[0], y1: a2[1], x2: b2[0], y2: b2[1], class: "droite2" }, svg);
          var ed2 = this._px(segD2[1][0] - d.ux * 0.6 / Math.hypot(d.ux, d.uy), segD2[1][1] - d.uy * 0.6 / Math.hypot(d.ux, d.uy));
          var td2 = el("text", { x: (ed2[0] + 8).toFixed(1), y: (ed2[1] + 4).toFixed(1), class: "etiq etiq-d2" }, svg);
          td2.textContent = "d′";
          if (ed2[0] > LARGEUR - 30) { td2.setAttribute("x", (ed2[0] - 8).toFixed(1)); td2.setAttribute("text-anchor", "end"); }
        }
      }
      var Hx = val(R.H.x), Hy = val(R.H.y);
      var pH = this._px(Hx, Hy), pC = this._px(E.C.x, E.C.y);
      var L = Math.hypot(d.ux, d.uy), ex = d.ux / L, ey = d.uy / L;
      if (!surD) {
        var segP = this._segment(E.C.x, E.C.y, R.n1, R.n2);
        if (segP) {
          var c1 = this._px(segP[0][0], segP[0][1]), c2 = this._px(segP[1][0], segP[1][1]);
          el("line", { x1: c1[0], y1: c1[1], x2: c2[0], y2: c2[1], class: "perp" }, svg);
        }
        // angle droit en H
        var nL = Math.hypot(R.n1, R.n2), nx = R.n1 / nL, ny = R.n2 / nL;
        var side = (E.C.x - Hx) * nx + (E.C.y - Hy) * ny > 0 ? 1 : -1;
        var k = 12, ux1 = ex * k, uy1 = -ey * k, vx1 = nx * side * k, vy1 = -ny * side * k;
        el("path", { d: "M" + (pH[0] + ux1) + "," + (pH[1] + uy1) + " L" + (pH[0] + ux1 + vx1) + "," + (pH[1] + uy1 + vy1) + " L" + (pH[0] + vx1) + "," + (pH[1] + vy1), class: "angle-droit" }, svg);
        // vecteur CH
        var dxp = pH[0] - pC[0], dyp = pH[1] - pC[1], lp = Math.hypot(dxp, dyp), raccourci = Math.min(6, lp / 3);
        el("line", { x1: pC[0], y1: pC[1], x2: pH[0] - dxp / lp * raccourci, y2: pH[1] - dyp / lp * raccourci, class: "ch", "marker-end": "url(#fch)" }, svg);
      }
      // point Q
      var Qx = Hx + ex * E.s, Qy = Hy + ey * E.s, pQ = this._px(Qx, Qy);
      var qDedans = Qx >= X_MIN && Qx <= X_MAX && Qy >= Y_MIN && Qy <= Y_MAX;
      if (qDedans && E.s !== 0) el("line", { x1: pC[0], y1: pC[1], x2: pQ[0], y2: pQ[1], class: "cq" }, svg);
      // points
      [["P", E.P, "point-dr"], ["R", E.R, "point-dr"]].forEach(function (t) {
        var p = self._px(t[1].x, t[1].y);
        el("circle", { cx: p[0], cy: p[1], r: 4.5, class: t[2] }, svg);
        var lb = el("text", { x: (p[0] + 8).toFixed(1), y: (p[1] + 5).toFixed(1), class: "etiq etiq-d", "text-anchor": "start" }, svg);
        lb.textContent = t[0];
      });
      el("circle", { cx: pH[0], cy: pH[1], r: 4.5, class: "point" }, svg);
      var hLab = el("text", { x: (pH[0] + (ex >= 0 ? -10 : 10)).toFixed(1), y: (pH[1] - 9).toFixed(1), class: "etiq", "text-anchor": ex >= 0 ? "end" : "start" }, svg);
      hLab.textContent = "H";
      if (qDedans) {
        el("circle", { cx: pQ[0], cy: pQ[1], r: 4.5, class: "point-q" }, svg);
        var qLab = el("text", { x: (pQ[0] + 8).toFixed(1), y: (pQ[1] + 18).toFixed(1), class: "etiq etiq-q" }, svg);
        qLab.textContent = "Q";
      }
      el("circle", { cx: pC[0], cy: pC[1], r: 5, class: "point-c" }, svg);
      var cLab = el("text", { x: (pC[0] + (pC[0] < 40 ? 9 : -9)).toFixed(1), y: (pC[1] - 9).toFixed(1), class: "etiq etiq-c", "text-anchor": pC[0] < 40 ? "start" : "end" }, svg);
      cLab.textContent = nomC;
      ["P", "R", "C"].forEach(function (n) {
        var p = self._px(E[n].x, E[n].y);
        el("circle", { cx: p[0], cy: p[1], r: 22, class: "poignee" + (self._point === n ? " poignee-active" : ""), "data-poignee": n }, svg);
      });

      // ---------- lecture ----------
      var C = E.C, h = "";
      var eqD = termes([[d.a, "x"], [d.b, "y"], [d.c, ""]]) + " = 0";
      h += '<div class="carte"><div class="carte-titre">Données</div>';
      h += '<div>d passe par P' + coordTxt(moins(E.P.x), moins(E.P.y)) + ' et R' + coordTxt(moins(E.R.x), moins(E.R.y)) + ' : vecteur directeur ' + coordTxt(moins(d.ux), moins(d.uy)) + ', équation d : ' + eqD + '</div>';
      if (paral) {
        var cP = -(d.a * C.x + d.b * C.y);
        h += '<div>d′ est parallèle à d et passe par A′' + coordTxt(moins(C.x), moins(C.y)) + ' : d′ : ' + termes([[d.a, "x"], [d.b, "y"], [cP, ""]]) + ' = 0</div>';
        h += '<div class="note">La distance entre d et d′ est la distance de n\'importe quel point de d′ — ici A′ — à la droite d.</div>';
      } else {
        h += '<div>Point C' + coordTxt(moins(C.x), moins(C.y)) + '</div>';
      }
      h += '</div>';

      if (surD) {
        h += '<div class="carte"><div class="resultat">' + (paral ? "A′ est sur d : d et d′ sont confondues, la distance vaut 0." : "C est sur la droite d : la distance vaut 0.") + '</div></div>';
      } else {
        var xt = termes([[C.x, ""], [R.n1, "t"]]), yt = termes([[C.y, ""], [R.n2, "t"]]);
        var morceaux = [];
        if (d.a !== 0) morceaux.push([d.a < 0, (Math.abs(d.a) === 1 ? "" : Math.abs(d.a)) + "(" + xt + ")"]);
        if (d.b !== 0) morceaux.push([d.b < 0, (Math.abs(d.b) === 1 ? "" : Math.abs(d.b)) + "(" + yt + ")"]);
        if (d.c !== 0) morceaux.push([d.c < 0, String(Math.abs(d.c))]);
        h += '<div class="carte"><div class="carte-titre">Construction, pas à pas</div><ol class="etapes">';
        h += '<li>Perpendiculaire à d par ' + nomC + ' : vecteur directeur ' + coordTxt(moins(R.n1), moins(R.n2)) +
          ' (produit scalaire avec ' + coordTxt(moins(d.ux), moins(d.uy)) + ' : ' + par(R.n1) + ' · ' + par(d.ux) + ' + ' + par(R.n2) + ' · ' + par(d.uy) + ' = 0), donc x = ' + xt + ' et y = ' + yt + '</li>';
        h += '<li>Intersection avec d : ' + joindre(morceaux) + ' = 0, soit ' + termes([[R.den, "t"], [R.num, ""]]) + ' = 0, donc t = ' + fracTxt(R.t) +
          ' : pied H' + coordTxt(fracTxt(R.H.x), fracTxt(R.H.y)) + '</li>';
        h += '<li>' + vecHtml(nomC + "H") + ' = ' + coordTxt(fracTxt(R.CH.x), fracTxt(R.CH.y)) + '</li>';
        var rac = racineFrac(R.d2.n, R.d2.d);
        var d2txt = fracTxt(R.d2);
        var distTxt = "√(" + carreFrac(R.CH.x) + " + " + carreFrac(R.CH.y) + ") = √" + (R.d2.d === 1 ? d2txt : "(" + d2txt + ")");
        if (rac.exact || rac.txt !== "√" + d2txt) distTxt += " = " + rac.txt;
        if (!rac.exact) distTxt += " ≈ " + fmtDec(Math.sqrt(val(R.d2)), 2);
        h += '<li>Distance : ‖' + vecHtml(nomC + "H") + '‖ = ' + distTxt + '</li>';
        h += '</ol>';
        h += '<div class="resultat">' + (paral ? "Distance entre d et d′ : " : "Distance de C à d : ") + rac.txt + (rac.exact ? "" : " ≈ " + fmtDec(Math.sqrt(val(R.d2)), 2)) + '</div>';
        h += '</div>';
      }
      // comparaison avec CQ
      var ch2 = val(R.d2), cq = Math.sqrt(ch2 + E.s * E.s);
      h += '<div class="carte"><div class="carte-titre">Le point Q sur d</div>';
      if (E.s === 0) h += '<div class="comparaison">Q = H : ' + nomC + 'Q = ' + nomC + 'H, c\'est la plus courte distance.</div>';
      else {
        var racCH = racineFrac(R.d2.n, R.d2.d);
        h += '<div class="comparaison">' + nomC + 'Q ≈ ' + fmtDec(cq, 2) + ' > ' + nomC + 'H ' + (racCH.exact ? "= " + racCH.txt : "≈ " + fmtDec(Math.sqrt(ch2), 2)) + '</div>';
        h += '<div class="note">Le triangle ' + nomC + 'HQ est rectangle en H : ' + nomC + 'Q² = ' + nomC + 'H² + HQ². Un chemin « en diagonale » vers d est toujours plus long que la perpendiculaire.</div>';
        if (!qDedans) h += '<div class="note">(Q est sorti du cadre de la figure.)</div>';
      }
      h += '</div>';
      this._lecture.innerHTML = h;
    }
  }

  if (!customElements.get("distance-droite-widget")) {
    customElements.define("distance-droite-widget", DistanceDroiteWidget);
  }
})();
