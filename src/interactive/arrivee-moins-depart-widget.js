(function () {
  "use strict";

  /* ================================================================
   * <arrivee-moins-depart-widget> — atelier (4e, ch. 6, § 8) :
   * A et B à coordonnées entières, déplaçables (glisser, ou choisir un
   * point puis les flèches). Les composantes de AB se lisent en carreaux
   * (Δx en violet, Δy en vert) et se calculent « arrivée moins départ » :
   * x_B − x_A, y_B − y_A. Bouton « Piège : A − B » : le vecteur obtenu en
   * calculant A − B est dessiné en rouge — c'est BA, l'opposé. Un troisième
   * point P (déplaçable) porte le MÊME vecteur AB tracé ailleurs : mêmes
   * composantes. Défaut : A(2 ; −1), B(5 ; 3) → AB(3 ; 4) (exemple du § 8).
   * Fenêtre FIXE. Web Component (Shadow DOM).
   * ================================================================ */

  var SVGNS = "http://www.w3.org/2000/svg";
  var X_MIN = -3, X_MAX = 9, Y_MIN = -3, Y_MAX = 8;
  var UNITE = 36, MARGE = 14;
  var LARGEUR = (X_MAX - X_MIN) * UNITE + 2 * MARGE;
  var HAUTEUR = (Y_MAX - Y_MIN) * UNITE + 2 * MARGE;
  var BORNE = { xMin: -2, xMax: 8, yMin: -2, yMax: 7 };
  var NOMS = ["A", "B", "P"];

  function defaut() { return { A: { x: 2, y: -1 }, B: { x: 5, y: 3 }, P: { x: -1, y: 2 } }; }
  function moins(s) { return String(s).replace(/-/g, "−"); }
  function par(n) { return n < 0 ? "(" + moins(n) + ")" : String(n); }
  function coord(p) { return "(" + moins(p.x) + " ; " + moins(p.y) + ")"; }

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
    '.vec{stroke:var(--accent,#b65c1f);stroke-width:3;}' +
    '.vec-tete{fill:var(--accent,#b65c1f);}' +
    '.vec-p{stroke:var(--accent,#b65c1f);stroke-width:3;stroke-dasharray:8 5;}' +
    '.piege{stroke:var(--bad,#b23a3a);stroke-width:3;}' +
    '.piege-tete{fill:var(--bad,#b23a3a);}' +
    '.dx{stroke:var(--plan,#5b4ea3);stroke-width:2.2;stroke-dasharray:6 4;}' +
    '.dy{stroke:var(--good,#2f7a4f);stroke-width:2.2;stroke-dasharray:6 4;}' +
    '.etiq-dx{font-size:16px;font-weight:700;fill:var(--plan,#5b4ea3);paint-order:stroke;stroke:var(--surface-2,#f7f9fb);stroke-width:3.5px;stroke-linejoin:round;}' +
    '.etiq-dy{font-size:16px;font-weight:700;fill:var(--good,#2f7a4f);paint-order:stroke;stroke:var(--surface-2,#f7f9fb);stroke-width:3.5px;stroke-linejoin:round;}' +
    '.etiq-piege{font-size:16px;font-weight:700;fill:var(--bad,#b23a3a);paint-order:stroke;stroke:var(--surface-2,#f7f9fb);stroke-width:3.5px;stroke-linejoin:round;}' +
    '.point{fill:var(--ink,#182430);}' +
    '.poignee{fill:transparent;cursor:grab;touch-action:none;}' +
    '.poignee-active{fill:var(--accent,#b65c1f);fill-opacity:0.14;}' +
    '.etiq{font-size:18px;font-weight:700;fill:var(--ink,#182430);paint-order:stroke;stroke:var(--surface-2,#f7f9fb);stroke-width:3.5px;stroke-linejoin:round;}' +
    '.lecture{display:flex;flex-direction:column;gap:8px;margin:0 auto 14px;max-width:620px;font-variant-numeric:tabular-nums;text-align:left;}' +
    '.carte{padding:10px 12px;border-radius:var(--radius,3px);background:var(--surface-2,#f7f9fb);border:1px solid var(--line,#ccd8e0);line-height:1.55;font-size:0.95rem;}' +
    '.carte-titre{font-weight:700;font-size:0.82rem;color:var(--ink-soft,#51626f);margin-bottom:4px;}' +
    '.c-dx{color:var(--plan,#5b4ea3);font-weight:700;}' +
    '.c-dy{color:var(--good,#2f7a4f);font-weight:700;}' +
    '.c-acc{color:var(--accent-ink,#7a3212);font-weight:700;}' +
    '.c-bad{color:var(--bad,#b23a3a);font-weight:700;}' +
    '.note{font-size:0.85rem;color:var(--ink-soft,#51626f);}' +
    '.controles{display:flex;flex-direction:column;gap:10px;align-items:center;max-width:620px;margin:0 auto;}' +
    '.rangee{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;align-items:center;}' +
    '.libelle{font-size:0.88rem;color:var(--ink-soft,#51626f);font-weight:600;}' +
    '.btn{min-height:44px;min-width:44px;padding:8px 14px;border-radius:var(--radius,3px);border:1px solid var(--line,#ccd8e0);background:var(--surface,#fff);color:var(--ink,#182430);font-weight:600;cursor:pointer;font-family:inherit;font-size:0.95rem;}' +
    '.btn[aria-pressed="true"]{background:var(--accent-soft,#f6e2d3);border-color:var(--accent,#b65c1f);color:var(--accent-ink,#7a3212);}' +
    '.btn:focus-visible{outline:2px solid var(--accent,#b65c1f);outline-offset:2px;}' +
    '.btn-reset{background:var(--accent-soft,#f6e2d3);border-color:var(--accent-soft-line,#e8c4a4);color:var(--accent-ink,#7a3212);}' +
    '</style>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" role="img" aria-label="Vecteur AB sur un quadrillage, ses composantes en carreaux et le même vecteur tracé à partir de P"></svg></div>' +
    '<div class="lecture" id="lecture" aria-live="polite"></div>' +
    '<div class="controles">' +
    '<div class="rangee"><span class="libelle">Point à déplacer :</span>' +
    '<button class="btn" type="button" data-point="A" aria-pressed="false">A</button>' +
    '<button class="btn" type="button" data-point="B" aria-pressed="true">B</button>' +
    '<button class="btn" type="button" data-point="P" aria-pressed="false">P</button></div>' +
    '<div class="rangee">' +
    '<button class="btn" type="button" data-dx="-1" data-dy="0" aria-label="Déplacer vers la gauche">←</button>' +
    '<button class="btn" type="button" data-dx="0" data-dy="1" aria-label="Déplacer vers le haut">↑</button>' +
    '<button class="btn" type="button" data-dx="0" data-dy="-1" aria-label="Déplacer vers le bas">↓</button>' +
    '<button class="btn" type="button" data-dx="1" data-dy="0" aria-label="Déplacer vers la droite">→</button></div>' +
    '<div class="rangee"><button class="btn" type="button" id="piege" aria-pressed="false">Piège : calculer A − B</button>' +
    '<button class="btn btn-reset" id="reset" type="button">Réinitialiser</button></div>' +
    '</div>';

  class ArriveeMoinsDepartWidget extends HTMLElement {
    constructor() {
      super();
      var shadow = this.attachShadow({ mode: "open" });
      shadow.appendChild(TEMPLATE.content.cloneNode(true));
      this._svg = shadow.getElementById("svg");
      this._lecture = shadow.getElementById("lecture");
      this._etat = defaut();
      this._point = "B";
      this._piege = false;
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
      ecoute(sh.getElementById("piege"), "click", function () { self._piege = !self._piege; self._rendre(); });
      ecoute(sh.getElementById("reset"), "click", function () { self._etat = defaut(); self._point = "B"; self._piege = false; self._rendre(); });
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

    _fleche(svg, P, Q, classeTrait, classeTete) {
      var a = this._px(P.x, P.y), b = this._px(Q.x, Q.y);
      var dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy);
      if (L < 1) return;
      var ux = dx / L, uy = dy / L, t = 13, w = 6;
      el("line", { x1: a[0], y1: a[1], x2: b[0] - ux * t * 0.8, y2: b[1] - uy * t * 0.8, class: classeTrait }, svg);
      el("path", { d: "M" + b[0] + "," + b[1] + " L" + (b[0] - ux * t - uy * w) + "," + (b[1] - uy * t + ux * w) + " L" + (b[0] - ux * t + uy * w) + "," + (b[1] - uy * t - ux * w) + " Z", class: classeTete }, svg);
    }

    _rendre() {
      var sh = this.shadowRoot, self = this, E = this._etat;
      Array.prototype.forEach.call(sh.querySelectorAll("[data-point]"), function (b) {
        b.setAttribute("aria-pressed", b.getAttribute("data-point") === self._point ? "true" : "false");
      });
      sh.getElementById("piege").setAttribute("aria-pressed", this._piege ? "true" : "false");
      var dx = E.B.x - E.A.x, dy = E.B.y - E.A.y;
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
      var tx = el("text", { x: LARGEUR - MARGE - 4, y: o[1] - 8, class: "graduation", "text-anchor": "end" }, svg); tx.textContent = "x";
      var ty = el("text", { x: o[0] + 8, y: MARGE + 12, class: "graduation" }, svg); ty.textContent = "y";

      // composantes en carreaux : Δx (horizontal depuis A), puis Δy (vertical jusqu'à B)
      var H = { x: E.B.x, y: E.A.y };
      var pA = this._px(E.A.x, E.A.y), pH = this._px(H.x, H.y), pB = this._px(E.B.x, E.B.y);
      if (dx !== 0) {
        el("line", { x1: pA[0], y1: pA[1], x2: pH[0], y2: pH[1], class: "dx" }, svg);
        var ex = el("text", { x: ((pA[0] + pH[0]) / 2).toFixed(1), y: (pA[1] + (dy > 0 ? 18 : -8)).toFixed(1), class: "etiq-dx", "text-anchor": "middle" }, svg);
        ex.textContent = (dx > 0 ? "+" : "") + moins(dx);
      }
      if (dy !== 0) {
        el("line", { x1: pH[0], y1: pH[1], x2: pB[0], y2: pB[1], class: "dy" }, svg);
        var ey = el("text", { x: (pH[0] + (dx >= 0 ? 8 : -8)).toFixed(1), y: ((pH[1] + pB[1]) / 2 + 4).toFixed(1), class: "etiq-dy", "text-anchor": dx >= 0 ? "start" : "end" }, svg);
        ey.textContent = (dy > 0 ? "+" : "") + moins(dy);
      }
      // le même vecteur, tracé à partir de P
      var Q = { x: E.P.x + dx, y: E.P.y + dy };
      this._fleche(svg, E.P, Q, "vec-p", "vec-tete");
      // le vecteur AB
      this._fleche(svg, E.A, E.B, "vec", "vec-tete");
      // le piège : A − B donne BA
      if (this._piege) {
        this._fleche(svg, E.B, E.A, "piege", "piege-tete");
        var m = this._px((E.A.x + E.B.x) / 2, (E.A.y + E.B.y) / 2);
        var L = Math.hypot(pB[0] - pA[0], pB[1] - pA[1]) || 1;
        var nx = -(pB[1] - pA[1]) / L, ny = (pB[0] - pA[0]) / L;
        var ep = el("text", { x: (m[0] + nx * 20).toFixed(1), y: (m[1] + ny * 20 + 4).toFixed(1), class: "etiq-piege", "text-anchor": "middle" }, svg);
        ep.textContent = "BA";
      }
      // points et étiquettes
      var etiquettes = { A: [-14, 18], B: [12, -10], P: [-14, 18] };
      NOMS.forEach(function (n) {
        var p = self._px(E[n].x, E[n].y);
        el("circle", { cx: p[0], cy: p[1], r: 4.5, class: "point" }, svg);
        var d = etiquettes[n];
        var t = el("text", { x: Math.max(10, Math.min(LARGEUR - 10, p[0] + d[0])).toFixed(1), y: Math.max(16, Math.min(HAUTEUR - 6, p[1] + d[1])).toFixed(1), class: "etiq", "text-anchor": "middle" }, svg);
        t.textContent = n;
      });
      NOMS.forEach(function (n) {
        var p = self._px(E[n].x, E[n].y);
        el("circle", { cx: p[0], cy: p[1], r: 22, class: "poignee" + (self._point === n ? " poignee-active" : ""), "data-poignee": n }, svg);
      });

      // ---------- lecture ----------
      var h = '<div class="carte"><div class="carte-titre">Arrivée moins départ</div>A' + coord(E.A) + ' (départ) · B' + coord(E.B) + ' (arrivée)<br>' +
        '<span class="c-dx">x<sub>B</sub> − x<sub>A</sub> = ' + moins(E.B.x) + ' − ' + par(E.A.x) + ' = ' + moins(dx) + '</span><br>' +
        '<span class="c-dy">y<sub>B</sub> − y<sub>A</sub> = ' + moins(E.B.y) + ' − ' + par(E.A.y) + ' = ' + moins(dy) + '</span><br>' +
        '<span class="c-acc">AB(' + moins(dx) + ' ; ' + moins(dy) + ')</span> : ' + Math.abs(dx) + ' carreau' + (Math.abs(dx) > 1 ? 'x' : '') + (dx >= 0 ? ' vers la droite' : ' vers la gauche') + ', ' +
        Math.abs(dy) + ' carreau' + (Math.abs(dy) > 1 ? 'x' : '') + (dy >= 0 ? ' vers le haut.' : ' vers le bas.') + '</div>';
      if (dx === 0 && dy === 0) h += '<div class="carte">A et B sont confondus : AB est le vecteur nul, de composantes (0 ; 0).</div>';
      h += '<div class="carte"><div class="carte-titre">Le même vecteur, ailleurs</div>À partir de P' + coord(E.P) + ', on arrive en (' + moins(Q.x) + ' ; ' + moins(Q.y) + ') : mêmes composantes (' + moins(dx) + ' ; ' + moins(dy) + '). Un vecteur ne dépend pas de l\'endroit où on le dessine.</div>';
      if (this._piege) {
        h += '<div class="carte"><div class="carte-titre">Le piège</div><span class="c-bad">A − B = (' + moins(E.A.x) + ' − ' + par(E.B.x) + ' ; ' + moins(E.A.y) + ' − ' + par(E.B.y) + ') = (' + moins(-dx) + ' ; ' + moins(-dy) + ')</span> : ce sont les composantes de BA, le vecteur opposé (en rouge). Pour AB, on part de A : arrivée moins départ.</div>';
      }
      this._lecture.innerHTML = h;
    }
  }

  if (!customElements.get("arrivee-moins-depart-widget")) {
    customElements.define("arrivee-moins-depart-widget", ArriveeMoinsDepartWidget);
  }
})();
