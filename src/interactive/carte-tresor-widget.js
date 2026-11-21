(function () {
  "use strict";

  /* ================================================================
   * <carte-tresor-widget> — atelier (4e, ch. 6, § 11) :
   * on empile des pas (N, S, E, O et les quatre diagonales) depuis le
   * départ D(0 ; 0), sur une carte (x vers l'est, y vers le nord). Un pas
   * sur un axe change une composante de 1 ; un pas en diagonale change les
   * deux (une case dans chaque direction, longueur √2). Affichés : le
   * déplacement total DA (somme des pas), la distance PARCOURUE (somme des
   * longueurs : n + m√2) contre la distance à VOL D'OISEAU ‖DA‖, et le
   * chemin du retour AD = −DA (pointillés). Défaut : 3 pas vers l'est puis
   * 4 vers le nord → 7 contre 5 (exemple de l'encadré du § 11).
   * Fenêtre FIXE (−8 à 8) : un pas qui en sortirait est refusé, avec un
   * message. Web Component (Shadow DOM).
   * ================================================================ */

  var SVGNS = "http://www.w3.org/2000/svg";
  var N = 8;
  var UNITE = 26, MARGE = 14;
  var COTE = 2 * (N + 1) * UNITE + 2 * MARGE;
  var MAX_PAS = 24;
  var DIRS = {
    N: { x: 0, y: 1, nom: "nord" }, S: { x: 0, y: -1, nom: "sud" }, E: { x: 1, y: 0, nom: "est" }, O: { x: -1, y: 0, nom: "ouest" },
    NE: { x: 1, y: 1, nom: "nord-est" }, NO: { x: -1, y: 1, nom: "nord-ouest" }, SE: { x: 1, y: -1, nom: "sud-est" }, SO: { x: -1, y: -1, nom: "sud-ouest" },
  };

  function defaut() { return ["E", "E", "E", "N", "N", "N", "N"]; }
  function moins(s) { return String(s).replace(/-/g, "−"); }
  function fmt(x) { var r = Math.round(x * 100) / 100; return moins(r.toFixed(2).replace(".", ",")); }
  function racine(n) {
    var k = 1, m = n;
    for (var i = 2; i * i <= m; i++) { while (m % (i * i) === 0) { m /= i * i; k *= i; } }
    return { k: k, m: m };
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
    'svg{width:100%;max-width:480px;height:auto;background:var(--surface-2,#f7f9fb);border-radius:var(--radius,3px);border:1px solid var(--line,#ccd8e0);}' +
    '.grille{stroke:var(--line,#ccd8e0);stroke-width:0.7;}' +
    '.axe{stroke:var(--ink-soft,#51626f);stroke-width:1.3;}' +
    '.fleche-axe{fill:var(--ink-soft,#51626f);}' +
    '.cardinal{font-size:16px;font-weight:700;fill:var(--ink-soft,#51626f);paint-order:stroke;stroke:var(--surface-2,#f7f9fb);stroke-width:3.5px;stroke-linejoin:round;}' +
    '.pas{stroke:var(--ink,#182430);stroke-width:2.4;stroke-linecap:round;}' +
    '.pas-diag{stroke:var(--plan,#5b4ea3);stroke-width:2.6;stroke-linecap:round;}' +
    '.noeud{fill:var(--ink,#182430);}' +
    '.total{stroke:var(--accent,#b65c1f);stroke-width:3.2;}' +
    '.total-tete{fill:var(--accent,#b65c1f);}' +
    '.retour{stroke:var(--good,#2f7a4f);stroke-width:2.4;stroke-dasharray:7 5;}' +
    '.retour-tete{fill:var(--good,#2f7a4f);}' +
    '.point{fill:var(--ink,#182430);}' +
    '.tresor{fill:var(--accent,#b65c1f);}' +
    '.etiq{font-size:18px;font-weight:700;fill:var(--ink,#182430);paint-order:stroke;stroke:var(--surface-2,#f7f9fb);stroke-width:3.5px;stroke-linejoin:round;}' +
    '.lecture{display:flex;flex-direction:column;gap:8px;margin:0 auto 14px;max-width:620px;font-variant-numeric:tabular-nums;text-align:left;}' +
    '.carte{padding:10px 12px;border-radius:var(--radius,3px);background:var(--surface-2,#f7f9fb);border:1px solid var(--line,#ccd8e0);line-height:1.55;font-size:0.95rem;}' +
    '.carte-titre{font-weight:700;font-size:0.82rem;color:var(--ink-soft,#51626f);margin-bottom:4px;}' +
    '.c-acc{color:var(--accent-ink,#7a3212);font-weight:700;}' +
    '.c-good{color:var(--good,#2f7a4f);font-weight:700;}' +
    '.c-plan{color:var(--plan,#5b4ea3);font-weight:700;}' +
    '.message{color:var(--bad,#b23a3a);font-weight:600;min-height:1.2em;text-align:center;}' +
    '.controles{display:flex;flex-direction:column;gap:10px;align-items:center;max-width:620px;margin:0 auto;}' +
    '.rose{display:grid;grid-template-columns:repeat(3,64px);gap:6px;justify-content:center;}' +
    '.rangee{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;align-items:center;}' +
    '.libelle{font-size:0.88rem;color:var(--ink-soft,#51626f);font-weight:600;}' +
    '.btn{min-height:44px;min-width:44px;padding:8px 10px;border-radius:var(--radius,3px);border:1px solid var(--line,#ccd8e0);background:var(--surface,#fff);color:var(--ink,#182430);font-weight:600;cursor:pointer;font-family:inherit;font-size:0.95rem;}' +
    '.btn-diag{color:var(--plan,#5b4ea3);}' +
    '.btn:focus-visible{outline:2px solid var(--accent,#b65c1f);outline-offset:2px;}' +
    '.btn-reset{background:var(--accent-soft,#f6e2d3);border-color:var(--accent-soft-line,#e8c4a4);color:var(--accent-ink,#7a3212);}' +
    '.centre{display:flex;align-items:center;justify-content:center;font-size:0.8rem;color:var(--ink-soft,#51626f);}' +
    '</style>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + COTE + ' ' + COTE + '" role="img" aria-label="Carte quadrillée : les pas empilés depuis le départ D, le déplacement total et le chemin du retour"></svg></div>' +
    '<div class="lecture" id="lecture" aria-live="polite"></div>' +
    '<div class="controles">' +
    '<span class="libelle">Ajouter un pas :</span>' +
    '<div class="rose">' +
    '<button class="btn btn-diag" type="button" data-dir="NO" aria-label="Un pas vers le nord-ouest">NO</button>' +
    '<button class="btn" type="button" data-dir="N" aria-label="Un pas vers le nord">N</button>' +
    '<button class="btn btn-diag" type="button" data-dir="NE" aria-label="Un pas vers le nord-est">NE</button>' +
    '<button class="btn" type="button" data-dir="O" aria-label="Un pas vers l\'ouest">O</button>' +
    '<span class="centre">1 pas</span>' +
    '<button class="btn" type="button" data-dir="E" aria-label="Un pas vers l\'est">E</button>' +
    '<button class="btn btn-diag" type="button" data-dir="SO" aria-label="Un pas vers le sud-ouest">SO</button>' +
    '<button class="btn" type="button" data-dir="S" aria-label="Un pas vers le sud">S</button>' +
    '<button class="btn btn-diag" type="button" data-dir="SE" aria-label="Un pas vers le sud-est">SE</button>' +
    '</div>' +
    '<div class="message" id="message" aria-live="polite"></div>' +
    '<div class="rangee"><button class="btn" type="button" id="annuler">Annuler le dernier pas</button>' +
    '<button class="btn" type="button" id="effacer">Tout effacer</button>' +
    '<button class="btn btn-reset" id="reset" type="button">Réinitialiser</button></div>' +
    '</div>';

  class CarteTresorWidget extends HTMLElement {
    constructor() {
      super();
      var shadow = this.attachShadow({ mode: "open" });
      shadow.appendChild(TEMPLATE.content.cloneNode(true));
      this._svg = shadow.getElementById("svg");
      this._lecture = shadow.getElementById("lecture");
      this._message = shadow.getElementById("message");
      this._pas = defaut();
      this._ecouteurs = [];
    }

    connectedCallback() {
      var self = this, sh = this.shadowRoot;
      function ecoute(c, t, f) { c.addEventListener(t, f); self._ecouteurs.push([c, t, f]); }
      Array.prototype.forEach.call(sh.querySelectorAll("[data-dir]"), function (b) {
        ecoute(b, "click", function () { self._ajouter(b.getAttribute("data-dir")); });
      });
      ecoute(sh.getElementById("annuler"), "click", function () { self._pas.pop(); self._message.textContent = ""; self._rendre(); });
      ecoute(sh.getElementById("effacer"), "click", function () { self._pas = []; self._message.textContent = ""; self._rendre(); });
      ecoute(sh.getElementById("reset"), "click", function () { self._pas = defaut(); self._message.textContent = ""; self._rendre(); });
      this._rendre();
    }

    disconnectedCallback() {
      this._ecouteurs.forEach(function (t) { t[0].removeEventListener(t[1], t[2]); });
      this._ecouteurs = [];
    }

    _positions() {
      var p = [{ x: 0, y: 0 }];
      this._pas.forEach(function (d) { var q = p[p.length - 1]; p.push({ x: q.x + DIRS[d].x, y: q.y + DIRS[d].y }); });
      return p;
    }

    _ajouter(d) {
      var pos = this._positions(), q = pos[pos.length - 1];
      var x = q.x + DIRS[d].x, y = q.y + DIRS[d].y;
      if (this._pas.length >= MAX_PAS) { this._message.textContent = "Assez de pas pour cette carte : annule ou efface."; return; }
      if (Math.abs(x) > N || Math.abs(y) > N) { this._message.textContent = "Ce pas sortirait de la carte."; return; }
      this._message.textContent = "";
      this._pas.push(d);
      this._rendre();
    }

    _px(x, y) { return [MARGE + (x + N + 1) * UNITE, MARGE + (N + 1 - y) * UNITE]; }

    _fleche(svg, P, Q, classeTrait, classeTete) {
      var a = this._px(P.x, P.y), b = this._px(Q.x, Q.y);
      var dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy);
      if (L < 1) return;
      var ux = dx / L, uy = dy / L, t = 12, w = 5.5;
      el("line", { x1: a[0], y1: a[1], x2: b[0] - ux * t * 0.8, y2: b[1] - uy * t * 0.8, class: classeTrait }, svg);
      el("path", { d: "M" + b[0] + "," + b[1] + " L" + (b[0] - ux * t - uy * w) + "," + (b[1] - uy * t + ux * w) + " L" + (b[0] - ux * t + uy * w) + "," + (b[1] - uy * t - ux * w) + " Z", class: classeTete }, svg);
    }

    _rendre() {
      var self = this;
      var pos = this._positions(), A = pos[pos.length - 1];
      var svg = this._svg;
      svg.innerHTML = "";
      var defs = el("defs", {}, svg);
      var mk = el("marker", { id: "fl", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" }, defs);
      el("path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche-axe" }, mk);
      for (var g = -N - 1; g <= N + 1; g++) {
        var px = this._px(g, 0)[0], py = this._px(0, g)[1];
        el("line", { x1: px, y1: MARGE, x2: px, y2: COTE - MARGE, class: "grille" }, svg);
        el("line", { x1: MARGE, y1: py, x2: COTE - MARGE, y2: py, class: "grille" }, svg);
      }
      var o = this._px(0, 0);
      el("line", { x1: MARGE, y1: o[1], x2: COTE - MARGE, y2: o[1], class: "axe", "marker-end": "url(#fl)" }, svg);
      el("line", { x1: o[0], y1: COTE - MARGE, x2: o[0], y2: MARGE, class: "axe", "marker-end": "url(#fl)" }, svg);
      var tE = el("text", { x: COTE - MARGE - 6, y: o[1] - 8, class: "cardinal", "text-anchor": "end" }, svg); tE.textContent = "E";
      var tNo = el("text", { x: o[0] + 9, y: MARGE + 14, class: "cardinal" }, svg); tNo.textContent = "N";
      // les pas
      this._pas.forEach(function (d, i) {
        var a = self._px(pos[i].x, pos[i].y), b = self._px(pos[i + 1].x, pos[i + 1].y);
        el("line", { x1: a[0], y1: a[1], x2: b[0], y2: b[1], class: DIRS[d].x !== 0 && DIRS[d].y !== 0 ? "pas-diag" : "pas" }, svg);
      });
      pos.slice(1, -1).forEach(function (p) { var q = self._px(p.x, p.y); el("circle", { cx: q[0], cy: q[1], r: 2.6, class: "noeud" }, svg); });
      var D = { x: 0, y: 0 };
      if (A.x !== 0 || A.y !== 0) {
        this._fleche(svg, D, A, "total", "total-tete");
        // retour, décalé d'un demi-carreau pour ne pas recouvrir le total
        var L = Math.hypot(A.x, A.y), nx = -A.y / L * 0.28, ny = A.x / L * 0.28;
        this._fleche(svg, { x: A.x + nx, y: A.y + ny }, { x: nx, y: ny }, "retour", "retour-tete");
      }
      var pD = this._px(0, 0), pA = this._px(A.x, A.y);
      el("circle", { cx: pD[0], cy: pD[1], r: 5, class: "point" }, svg);
      var eD = el("text", { x: pD[0] - 12, y: pD[1] + 18, class: "etiq", "text-anchor": "middle" }, svg); eD.textContent = "D";
      if (A.x !== 0 || A.y !== 0) {
        el("circle", { cx: pA[0], cy: pA[1], r: 5.5, class: "tresor" }, svg);
        var eA = el("text", { x: Math.max(12, Math.min(COTE - 12, pA[0] + 14)), y: Math.max(16, Math.min(COTE - 6, pA[1] - 8)), class: "etiq", "text-anchor": "middle" }, svg); eA.textContent = "A";
      }

      // ---------- lecture ----------
      var nAxe = this._pas.filter(function (d) { return DIRS[d].x === 0 || DIRS[d].y === 0; }).length;
      var nDiag = this._pas.length - nAxe;
      var parcours = nAxe + nDiag * Math.SQRT2;
      var parcoursTxt = nDiag === 0 ? String(nAxe) : (nAxe ? nAxe + " + " : "") + (nDiag === 1 ? "" : nDiag) + "√2 ≈ " + fmt(parcours);
      var n2 = A.x * A.x + A.y * A.y, r = racine(n2);
      var volTxt = n2 === 0 ? "0" : r.m === 1 ? "√" + n2 + " = " + r.k : "√" + n2 + (r.k > 1 ? " = " + r.k + "√" + r.m : "") + " ≈ " + fmt(Math.sqrt(n2));
      var compte = {};
      this._pas.forEach(function (d) { compte[d] = (compte[d] || 0) + 1; });
      var liste = Object.keys(compte).map(function (d) { return compte[d] + " vers " + (d === "O" ? "l'ouest" : d === "E" ? "l'est" : "le " + DIRS[d].nom) + " (" + moins(compte[d] * DIRS[d].x) + " ; " + moins(compte[d] * DIRS[d].y) + ")"; });
      var h = '<div class="carte"><div class="carte-titre">Les pas (' + this._pas.length + ')</div>' + (liste.length ? liste.join(" · ") : "Aucun pas : ajoute-en avec la rose des vents.") +
        (nDiag ? '<br><span class="c-plan">Un pas en diagonale change les deux composantes (une case dans chaque direction) et mesure √2.</span>' : '') + '</div>';
      h += '<div class="carte"><div class="carte-titre">Déplacement total (somme des pas)</div><span class="c-acc">DA(' + moins(A.x) + ' ; ' + moins(A.y) + ')</span></div>';
      h += '<div class="carte"><div class="carte-titre">Parcourue ou à vol d\'oiseau ?</div>Distance parcourue : ' + parcoursTxt + ' cases.<br>' +
        'Distance à vol d\'oiseau : ‖DA‖ = ' + volTxt + ' cases.' + (this._pas.length > 1 && Math.abs(parcours - Math.sqrt(n2)) > 1e-9 ? ' On additionne les vecteurs, pas les longueurs.' : '') + '</div>';
      h += '<div class="carte"><div class="carte-titre">Chemin du retour</div><span class="c-good">AD = −DA = (' + moins(-A.x) + ' ; ' + moins(-A.y) + ')</span></div>';
      this._lecture.innerHTML = h;
    }
  }

  if (!customElements.get("carte-tresor-widget")) {
    customElements.define("carte-tresor-widget", CarteTresorWidget);
  }
})();
