(function () {
  "use strict";

  /* ================================================================
   * <parabole-foyer-widget> — atelier interactif (4e, ch. 7, § 9) :
   * la parabole comme lieu des points équidistants d'un foyer F et
   * d'une directrice d. Axe vertical (directrice horizontale y = k) ou
   * horizontal (directrice verticale x = k). F et la directrice se
   * déplacent par pas de 0,5 (boutons ou glisser) ; le sommet S est le
   * milieu de F et de son projeté sur d ; p = 2(y_F − y_S) (ou x) est
   * SIGNÉ. Un point P parcourt la courbe : PF et PH (H projeté sur d)
   * restent égaux. Mode « compas » : cercle (F ; r) et parallèle à d à
   * distance r, dont les deux points communs sont sur la parabole.
   * Défaut : axe vertical, F(0 ; 1), d : y = −1 → S(0 ; 0), p = 2, x² = 4y.
   * Fenêtre FIXE, repère orthonormé. Web Component (Shadow DOM).
   * ================================================================ */

  var SVGNS = "http://www.w3.org/2000/svg";
  var X_MIN = -6, X_MAX = 6, Y_MIN = -5, Y_MAX = 6;
  var UNITE = 26, MARGE = 14;
  var LARGEUR = (X_MAX - X_MIN) * UNITE + 2 * MARGE;
  var HAUTEUR = (Y_MAX - Y_MIN) * UNITE + 2 * MARGE;
  var BORNE_F = { xMin: -4.5, xMax: 4.5, yMin: -4, yMax: 5 };
  var BORNE_K = { min: -4.5, max: 4.5 };

  function defaut(axe) {
    return axe === "h"
      ? { axe: "h", F: { x: 1, y: 0 }, k: -1, s: 50, compas: false, r: 50 }
      : { axe: "v", F: { x: 0, y: 1 }, k: -1, s: 50, compas: false, r: 24 };
  }

  function arrondi(v, n) { var f = Math.pow(10, n); return Math.round(v * f) / f; }
  function estExact(v, n) { return Math.abs(v - arrondi(v, n)) < 1e-9; }
  function nb(v, n) {
    if (n === undefined) n = 2;
    var r = arrondi(v, n);
    if (Math.abs(r) < 1e-12) r = 0;
    return String(r).replace(".", ",").replace("-", "−");
  }
  // « = 2 » ou « ≈ 2,24 »
  function egal(v) { return (estExact(v, 2) ? "= " : "≈ ") + nb(v); }

  // « (x − 2)² », « x² », « (y + 0,5)² »
  function carre(lettre, c) {
    if (Math.abs(c) < 1e-12) return lettre + "²";
    return "(" + lettre + (c > 0 ? " − " : " + ") + nb(Math.abs(c)) + ")²";
  }
  // « 4y », « −8(y − 1) », « (y + 0,5) »
  function membre(coef, lettre, c) {
    var facteur = Math.abs(c) < 1e-12 ? lettre : "(" + lettre + (c > 0 ? " − " : " + ") + nb(Math.abs(c)) + ")";
    if (coef === 1) return facteur;
    if (coef === -1) return "−" + facteur;
    return nb(coef) + facteur;
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
    '[hidden]{display:none !important;}' +
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:10px;}' +
    'svg{width:100%;max-width:500px;height:auto;background:var(--surface-2,#f7f9fb);border-radius:var(--radius,3px);border:1px solid var(--line,#ccd8e0);touch-action:none;}' +
    '.grille{stroke:var(--line,#ccd8e0);stroke-width:0.7;}' +
    '.axe{stroke:var(--ink-soft,#51626f);stroke-width:1.3;}' +
    '.fleche-axe{fill:var(--ink-soft,#51626f);}' +
    '.graduation{font-size:11px;fill:var(--ink-soft,#51626f);paint-order:stroke;stroke:var(--surface-2,#f7f9fb);stroke-width:3.5px;stroke-linejoin:round;}' +
    '.courbe{fill:none;stroke:var(--accent,#b65c1f);stroke-width:2.6;}' +
    '.directrice{stroke:var(--ink,#182430);stroke-width:2;stroke-dasharray:7 5;}' +
    '.axe-sym{stroke:var(--ink-soft,#51626f);stroke-width:1;stroke-dasharray:2 4;}' +
    '.seg-pf{stroke:var(--good,#2f7a4f);stroke-width:2.2;}' +
    '.seg-ph{stroke:var(--plan,#5b4ea3);stroke-width:2.2;}' +
    '.cercle-r{fill:none;stroke:var(--good,#2f7a4f);stroke-width:1.6;}' +
    '.para-r{stroke:var(--plan,#5b4ea3);stroke-width:1.6;stroke-dasharray:5 4;}' +
    '.point{fill:var(--ink,#182430);}' +
    '.point-f{fill:var(--good,#2f7a4f);}' +
    '.point-p{fill:var(--accent,#b65c1f);}' +
    '.point-c{fill:var(--surface,#fff);stroke:var(--accent,#b65c1f);stroke-width:2.4;}' +
    '.angle-droit{fill:none;stroke:var(--plan,#5b4ea3);stroke-width:1.2;}' +
    '.poignee{fill:transparent;cursor:grab;}' +
    '.poignee-ligne{stroke:transparent;stroke-width:26;cursor:grab;}' +
    '.poignee-active{fill:var(--good,#2f7a4f);fill-opacity:0.14;}' +
    '.etiq{font-size:14px;font-weight:700;fill:var(--ink,#182430);paint-order:stroke;stroke:var(--surface-2,#f7f9fb);stroke-width:3.5px;stroke-linejoin:round;}' +
    '.etiq-f{fill:var(--good,#2f7a4f);} .etiq-p{fill:var(--accent,#b65c1f);} .etiq-d{font-style:italic;}' +
    '.lecture{display:flex;flex-direction:column;gap:8px;margin:0 auto 14px;max-width:620px;font-variant-numeric:tabular-nums;}' +
    '.carte{padding:10px 12px;border-radius:var(--radius,3px);background:var(--surface-2,#f7f9fb);border:1px solid var(--line,#ccd8e0);line-height:1.6;font-size:0.95rem;}' +
    '.carte-titre{font-weight:700;font-size:0.82rem;color:var(--ink-soft,#51626f);margin-bottom:4px;}' +
    '.eq{font-size:1.08rem;font-weight:700;color:var(--accent-ink,#7a3212);}' +
    '.c-pf{color:var(--good,#2f7a4f);font-weight:700;} .c-ph{color:var(--plan,#5b4ea3);font-weight:700;}' +
    '.note{font-size:0.85rem;color:var(--ink-soft,#51626f);}' +
    '.alerte{color:var(--bad,#b23a3a);font-weight:600;}' +
    '.controles{display:flex;flex-direction:column;gap:10px;align-items:stretch;max-width:620px;margin:0 auto;}' +
    '.rangee{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;align-items:center;}' +
    '.libelle{font-size:0.88rem;color:var(--ink-soft,#51626f);font-weight:600;}' +
    '.btn{min-height:44px;min-width:44px;padding:8px 12px;border-radius:var(--radius,3px);border:1px solid var(--line,#ccd8e0);background:var(--surface,#fff);color:var(--ink,#182430);font-weight:600;cursor:pointer;font-family:inherit;font-size:0.95rem;}' +
    '.btn[aria-pressed="true"]{background:var(--accent-soft,#f6e2d3);border-color:var(--accent,#b65c1f);color:var(--accent-ink,#7a3212);}' +
    '.btn:disabled{opacity:0.4;cursor:default;}' +
    '.btn:focus-visible,input:focus-visible{outline:2px solid var(--accent,#b65c1f);outline-offset:2px;}' +
    '.btn-reset{background:var(--accent-soft,#f6e2d3);border-color:var(--accent-soft-line,#e8c4a4);color:var(--accent-ink,#7a3212);align-self:center;}' +
    '.curseur{display:flex;flex-direction:column;gap:2px;}' +
    '.curseur label{font-size:0.88rem;font-weight:600;color:var(--ink-soft,#51626f);}' +
    'input[type=range]{width:100%;margin:0;min-height:44px;accent-color:var(--accent,#b65c1f);}' +
    '.case{display:inline-flex;align-items:center;gap:8px;min-height:44px;padding:0 12px;border:1px solid var(--line,#ccd8e0);border-radius:var(--radius,3px);background:var(--surface,#fff);font-weight:600;cursor:pointer;align-self:center;}' +
    '.case input{width:20px;height:20px;accent-color:var(--accent,#b65c1f);}' +
    '</style>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" role="img" aria-label="Parabole, foyer F et directrice d"></svg></div>' +
    '<div class="lecture" id="lecture" aria-live="polite"></div>' +
    '<div class="controles">' +
    '<div class="rangee"><span class="libelle">Axe de la parabole :</span>' +
    '<button class="btn" type="button" data-axe="v">Vertical</button>' +
    '<button class="btn" type="button" data-axe="h">Horizontal</button></div>' +
    '<div class="rangee"><span class="libelle">Déplacer :</span>' +
    '<button class="btn" type="button" data-objet="F">le foyer F</button>' +
    '<button class="btn" type="button" data-objet="d">la directrice</button></div>' +
    '<div class="rangee">' +
    '<button class="btn" type="button" data-dx="-0.5" data-dy="0" aria-label="Vers la gauche">←</button>' +
    '<button class="btn" type="button" data-dx="0" data-dy="0.5" aria-label="Vers le haut">↑</button>' +
    '<button class="btn" type="button" data-dx="0" data-dy="-0.5" aria-label="Vers le bas">↓</button>' +
    '<button class="btn" type="button" data-dx="0.5" data-dy="0" aria-label="Vers la droite">→</button></div>' +
    '<div class="curseur"><label for="s">Point P sur la parabole</label><input type="range" id="s" min="-100" max="100" step="1"></div>' +
    '<label class="case"><input type="checkbox" id="compas"> Construction au compas</label>' +
    '<div class="curseur" id="zone-r" hidden><label for="r" id="label-r">Rayon r</label><input type="range" id="r" min="0" max="100" step="1"></div>' +
    '<button class="btn btn-reset" id="reset" type="button">Réinitialiser</button>' +
    '</div>';

  class ParaboleFoyerWidget extends HTMLElement {
    constructor() {
      super();
      var shadow = this.attachShadow({ mode: "open" });
      shadow.appendChild(TEMPLATE.content.cloneNode(true));
      this._svg = shadow.getElementById("svg");
      this._lecture = shadow.getElementById("lecture");
      this._etat = defaut("v");
      this._objet = "F";
      this._glisse = null;
      this._message = "";
      this._ecouteurs = [];
    }

    connectedCallback() {
      var self = this, sh = this.shadowRoot;
      function ecoute(c, t, f) { c.addEventListener(t, f); self._ecouteurs.push([c, t, f]); }
      Array.prototype.forEach.call(sh.querySelectorAll("[data-axe]"), function (b) {
        ecoute(b, "click", function () {
          var axe = b.getAttribute("data-axe");
          if (axe === self._etat.axe) return;
          var compas = self._etat.compas;
          self._etat = defaut(axe); self._etat.compas = compas; self._message = ""; self._rendre();
        });
      });
      Array.prototype.forEach.call(sh.querySelectorAll("[data-objet]"), function (b) {
        ecoute(b, "click", function () { self._objet = b.getAttribute("data-objet"); self._rendre(); });
      });
      Array.prototype.forEach.call(sh.querySelectorAll("[data-dx]"), function (b) {
        ecoute(b, "click", function () {
          var dx = parseFloat(b.getAttribute("data-dx")), dy = parseFloat(b.getAttribute("data-dy"));
          var E = self._etat;
          if (self._objet === "F") self._deplacerF(E.F.x + dx, E.F.y + dy, dx, dy);
          else self._deplacerK(E.k + (E.axe === "v" ? dy : dx), E.axe === "v" ? dy : dx);
        });
      });
      ecoute(sh.getElementById("s"), "input", function (e) { self._etat.s = parseInt(e.target.value, 10); self._rendre(); });
      ecoute(sh.getElementById("r"), "input", function (e) { self._etat.r = parseInt(e.target.value, 10); self._rendre(); });
      ecoute(sh.getElementById("compas"), "change", function (e) { self._etat.compas = e.target.checked; self._rendre(); });
      ecoute(sh.getElementById("reset"), "click", function () { self._etat = defaut("v"); self._objet = "F"; self._message = ""; self._rendre(); });
      ecoute(this._svg, "pointerdown", function (e) {
        var c = e.target && e.target.getAttribute && e.target.getAttribute("data-poignee");
        if (!c) return;
        e.preventDefault();
        self._glisse = c; self._objet = c;
        try { self._svg.setPointerCapture(e.pointerId); } catch (err) { /* rien */ }
        self._rendre();
      });
      ecoute(this._svg, "pointermove", function (e) {
        if (!self._glisse) return;
        var p = self._versMonde(e.clientX, e.clientY);
        if (!p) return;
        var dx2 = function (v) { return Math.round(v * 2) / 2; };
        if (self._glisse === "F") self._deplacerF(dx2(p.x), dx2(p.y));
        else self._deplacerK(dx2(self._etat.axe === "v" ? p.y : p.x));
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

    // coordonnée du foyer perpendiculaire à la directrice (y si axe vertical)
    _fNormal(F) { return this._etat.axe === "v" ? F.y : F.x; }

    // sautX/sautY : pas d'un bouton flèche — on enjambe alors la directrice au lieu de s'y bloquer
    _deplacerF(x, y, sautX, sautY) {
      var E = this._etat;
      if (sautX !== undefined && Math.abs((E.axe === "v" ? y : x) - E.k) < 1e-9) { x += sautX; y += sautY; }
      x = Math.max(BORNE_F.xMin, Math.min(BORNE_F.xMax, x));
      y = Math.max(BORNE_F.yMin, Math.min(BORNE_F.yMax, y));
      if (x === E.F.x && y === E.F.y) return;
      if (Math.abs((E.axe === "v" ? y : x) - E.k) < 1e-9) {
        this._message = "Le foyer ne peut pas être sur la directrice : il n'y aurait plus de parabole.";
        this._rendre();
        return;
      }
      E.F = { x: x, y: y };
      this._message = "";
      this._rendre();
    }

    _deplacerK(k, saut) {
      var E = this._etat;
      if (saut !== undefined && Math.abs(this._fNormal(E.F) - k) < 1e-9) k += saut;
      k = Math.max(BORNE_K.min, Math.min(BORNE_K.max, k));
      if (k === E.k) return;
      if (Math.abs(this._fNormal(E.F) - k) < 1e-9) {
        this._message = "La directrice ne peut pas passer par le foyer : il n'y aurait plus de parabole.";
        this._rendre();
        return;
      }
      E.k = k;
      this._message = "";
      this._rendre();
    }

    // point du monde exprimé dans le repère (u le long de la directrice, w perpendiculaire)
    _monde(u, w) { return this._etat.axe === "v" ? { x: u, y: w } : { x: w, y: u }; }

    _rendre() {
      var sh = this.shadowRoot, self = this, E = this._etat, F = E.F;
      var vert = E.axe === "v";
      Array.prototype.forEach.call(sh.querySelectorAll("[data-axe]"), function (b) {
        b.setAttribute("aria-pressed", b.getAttribute("data-axe") === E.axe ? "true" : "false");
      });
      Array.prototype.forEach.call(sh.querySelectorAll("[data-objet]"), function (b) {
        b.setAttribute("aria-pressed", b.getAttribute("data-objet") === self._objet ? "true" : "false");
      });
      // flèches inutiles pour la directrice (elle ne glisse que perpendiculairement à elle-même)
      Array.prototype.forEach.call(sh.querySelectorAll("[data-dx]"), function (b) {
        var dx = parseFloat(b.getAttribute("data-dx"));
        var inutile = self._objet === "d" && (vert ? dx !== 0 : dx === 0);
        b.disabled = inutile;
      });

      // u = coordonnée le long de la directrice, w = perpendiculaire
      var uF = vert ? F.x : F.y, wF = vert ? F.y : F.x;
      var k = E.k;
      var wS = (wF + k) / 2, uS = uF;
      var p = wF - k; // = 2(w_F − w_S)
      var S = this._monde(uS, wS);
      var lettreU = vert ? "x" : "y", lettreW = vert ? "y" : "x";

      // P : u = uS + t, w = wS + t²/(2p) ; t limité pour rester dans le cadre
      var place = p > 0 ? (vert ? Y_MAX : X_MAX) - wS - 0.4 : wS - (vert ? Y_MIN : X_MIN) - 0.4;
      var tMax = Math.min(4, Math.sqrt(Math.max(0.01, 2 * Math.abs(p) * place)));
      var t = (E.s / 100) * tMax;
      var P = this._monde(uS + t, wS + (t * t) / (2 * p));
      var H = this._monde(uS + t, k);
      var PF = Math.hypot(P.x - F.x, P.y - F.y);
      var PH = Math.abs((vert ? P.y : P.x) - k);

      // compas
      var rMin = Math.abs(p) / 2;
      var r = rMin + (E.r / 100) * 5;
      var sg = p > 0 ? 1 : -1;
      var wPar = k + sg * r;
      var demi = Math.sqrt(Math.max(0, 2 * Math.abs(p) * r - p * p));
      var C1 = this._monde(uS - demi, wPar), C2 = this._monde(uS + demi, wPar);

      sh.getElementById("s").value = String(E.s);
      sh.getElementById("compas").checked = E.compas;
      sh.getElementById("zone-r").hidden = !E.compas;
      sh.getElementById("r").value = String(E.r);
      sh.getElementById("label-r").textContent = "Rayon r " + egal(r) + " (au moins |p|/2 " + egal(rMin) + ")";

      // ---------- dessin ----------
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

      // axe de symétrie
      var a0 = this._px(this._monde(uS, -20).x, this._monde(uS, -20).y), a1 = this._px(this._monde(uS, 20).x, this._monde(uS, 20).y);
      el("line", { x1: a0[0], y1: a0[1], x2: a1[0], y2: a1[1], class: "axe-sym" }, g);
      // directrice
      var d0 = this._px(this._monde(-20, k).x, this._monde(-20, k).y), d1 = this._px(this._monde(20, k).x, this._monde(20, k).y);
      el("line", { x1: d0[0], y1: d0[1], x2: d1[0], y2: d1[1], class: "directrice" }, g);
      // parabole
      var pts = [];
      for (var i = 0; i <= 240; i++) {
        var u = -12 + (24 * i) / 240;
        var w = wS + ((u - uS) * (u - uS)) / (2 * p);
        if (Math.abs(w) > 40) continue;
        var m = this._monde(u, w), q = this._px(m.x, m.y);
        pts.push(q[0].toFixed(1) + "," + q[1].toFixed(1));
      }
      el("polyline", { points: pts.join(" "), class: "courbe" }, g);

      // compas
      if (E.compas) {
        var cf = this._px(F.x, F.y);
        el("circle", { cx: cf[0], cy: cf[1], r: (r * UNITE).toFixed(1), class: "cercle-r" }, g);
        var l0 = this._px(this._monde(-20, wPar).x, this._monde(-20, wPar).y), l1 = this._px(this._monde(20, wPar).x, this._monde(20, wPar).y);
        el("line", { x1: l0[0], y1: l0[1], x2: l1[0], y2: l1[1], class: "para-r" }, g);
        [C1, C2].forEach(function (c) { var q2 = self._px(c.x, c.y); el("circle", { cx: q2[0], cy: q2[1], r: 5.5, class: "point-c" }, svg); });
      }

      // PF, PH et angle droit en H
      var pp = this._px(P.x, P.y), ph = this._px(H.x, H.y), pf = this._px(F.x, F.y);
      el("line", { x1: pp[0], y1: pp[1], x2: pf[0], y2: pf[1], class: "seg-pf" }, g);
      el("line", { x1: pp[0], y1: pp[1], x2: ph[0], y2: ph[1], class: "seg-ph" }, g);
      if (PH > 0.3) {
        var sx = vert ? (t >= 0 ? -1 : 1) : (P.x > k ? 1 : -1), sy = vert ? (P.y > k ? -1 : 1) : (t >= 0 ? 1 : -1);
        var c = 8;
        var dpx = vert ? sx * c : sx * c, dpy = vert ? sy * c : -sy * c;
        if (vert) el("path", { d: "M" + (ph[0] + dpx) + "," + ph[1] + " L" + (ph[0] + dpx) + "," + (ph[1] + dpy) + " L" + ph[0] + "," + (ph[1] + dpy), class: "angle-droit" }, g);
        else el("path", { d: "M" + ph[0] + "," + (ph[1] + dpy) + " L" + (ph[0] + dpx) + "," + (ph[1] + dpy) + " L" + (ph[0] + dpx) + "," + ph[1], class: "angle-droit" }, g);
      }

      // points et étiquettes
      function point(pt, cls, txt, cTxt, dx, dy) {
        var q2 = self._px(pt.x, pt.y);
        el("circle", { cx: q2[0], cy: q2[1], r: 4.5, class: cls }, svg);
        var lx = Math.max(10, Math.min(LARGEUR - 10, q2[0] + dx)), ly = Math.max(16, Math.min(HAUTEUR - 6, q2[1] + dy));
        var tt = el("text", { x: lx.toFixed(1), y: ly.toFixed(1), class: "etiq " + cTxt, "text-anchor": "middle" }, svg);
        tt.textContent = txt;
      }
      // F et S de part et d'autre, côté ouverture / côté directrice
      var dirOuv = this._monde(0, sg), perp = this._monde(1, 0);
      point(S, "point", "S", "", (-dirOuv.x * 12 + perp.x * 14), (dirOuv.y * 12 - perp.y * 14) + 5);
      point(F, "point-f", "F", "etiq-f", (perp.x * 14), (-perp.y * 14) + 5 - (vert ? 0 : 0));
      point(H, "point", "H", "", (vert ? 0 : -sg * 14) + (vert ? 12 : 0), (vert ? sg * 15 : 0) + 5);
      point(P, "point-p", "P", "etiq-p", (vert ? (t >= 0 ? 13 : -13) : (P.x > k ? 13 : -13) * 0 + 13), (vert ? -8 : (t >= 0 ? -8 : 18)));
      // nom de la directrice
      var nd = vert ? this._px(X_MIN + 0.6, k) : this._px(k, Y_MAX - 0.6);
      var tdd = el("text", { x: (nd[0] + (vert ? 0 : 12)).toFixed(1), y: (nd[1] + (vert ? -6 : 4)).toFixed(1), class: "etiq etiq-d", "text-anchor": vert ? "start" : "start" }, svg);
      tdd.textContent = "d";

      // poignées
      el("line", { x1: d0[0], y1: d0[1], x2: d1[0], y2: d1[1], class: "poignee-ligne", "data-poignee": "d" }, svg);
      el("circle", { cx: pf[0], cy: pf[1], r: 22, class: "poignee" + (this._objet === "F" ? " poignee-active" : ""), "data-poignee": "F" }, svg);

      // ---------- lecture ----------
      var fx = nb(F.x), fy = nb(F.y);
      var h = '';
      if (this._message) h += '<div class="carte alerte">' + this._message + '</div>';
      h += '<div class="carte"><div class="carte-titre">Équation</div>' +
        '<div class="eq">' + carre(lettreU, uS) + ' = ' + membre(2 * p, lettreW, wS) + '</div>' +
        '<div>Foyer F(' + fx + ' ; ' + fy + ') — directrice d : ' + lettreW + ' = ' + nb(k) + '</div>' +
        '<div>Sommet S(' + nb(S.x) + ' ; ' + nb(S.y) + '), milieu de F et de la directrice</div>' +
        '<div>p = 2(' + lettreW + '<sub>F</sub> − ' + lettreW + '<sub>S</sub>) = 2 × (' + nb(wF) + ' − ' + (wS < 0 ? '(' + nb(wS) + ')' : nb(wS)) + ') = <strong>' + nb(p) + '</strong></div>' +
        '<div class="note">' + (p > 0
          ? 'p &gt; 0 : le foyer est ' + (vert ? 'au-dessus' : 'à droite') + ' du sommet, la parabole s\'ouvre ' + (vert ? 'vers le haut' : 'vers la droite') + '.'
          : 'p &lt; 0 : le foyer est ' + (vert ? 'en dessous' : 'à gauche') + ' du sommet, la parabole s\'ouvre ' + (vert ? 'vers le bas' : 'vers la gauche') + '.') + '</div></div>';
      h += '<div class="carte"><div class="carte-titre">Équidistance</div>' +
        '<div>P(' + nb(P.x) + ' ; ' + nb(P.y) + ') : <span class="c-pf">PF ' + egal(PF) + '</span> et <span class="c-ph">PH ' + egal(PH) + '</span></div>' +
        '<div class="note">H est le pied de la perpendiculaire menée de P à la directrice. PF = PH pour tout point P de la courbe : c\'est la définition de la parabole.</div></div>';
      if (E.compas) {
        h += '<div class="carte"><div class="carte-titre">Construction au compas</div>' +
          (demi < 1e-6
            ? '<div>r = |p|/2 : le cercle et la parallèle se touchent en un seul point, le sommet S.</div>'
            : '<div>Le cercle de centre F et de rayon r ' + egal(r) + ' coupe la parallèle à d, tracée à la distance r, en deux points ' +
              '(' + nb(C1.x) + ' ; ' + nb(C1.y) + ') et (' + nb(C2.x) + ' ; ' + nb(C2.y) + ').</div>' +
              '<div class="note">Chacun est à la distance r de F et à la distance r de d : il est donc sur la parabole.</div>') +
          '</div>';
      }
      this._lecture.innerHTML = h;
    }
  }

  if (!customElements.get("parabole-foyer-widget")) {
    customElements.define("parabole-foyer-widget", ParaboleFoyerWidget);
  }
})();
