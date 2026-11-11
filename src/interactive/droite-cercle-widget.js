(function () {
  "use strict";

  /* ================================================================
   * <droite-cercle-widget> — atelier interactif (4e, ch. 7, § 10) :
   * intersection d'une droite et d'un cercle. Cercle de centre C(a ; b)
   * (entiers) et de rayon r = √(r²) (r² entier), droite y = mx + p
   * (m, p par pas de 0,5) ou verticale x = k. La substitution donne une
   * équation du second degré (coefficients entiers après simplification),
   * son discriminant Δ, puis 0, 1 (tangente) ou 2 points, exacts quand
   * Δ est un carré parfait, approchés sinon.
   * Défaut : (x − 1)² + y² = 5 et y = x → x² − x − 2 = 0, Δ = 9,
   * points (2 ; 2) et (−1 ; −1).
   * Fenêtre FIXE, repère orthonormé. Web Component (Shadow DOM).
   * ================================================================ */

  var SVGNS = "http://www.w3.org/2000/svg";
  var X_MIN = -7, X_MAX = 7, Y_MIN = -7, Y_MAX = 7;
  var UNITE = 21, MARGE = 14;
  var LARGEUR = (X_MAX - X_MIN) * UNITE + 2 * MARGE;
  var HAUTEUR = (Y_MAX - Y_MIN) * UNITE + 2 * MARGE;
  var BORNE_C = 4;

  // m = M/2, p = P/2, k = K/2
  function defaut() { return { a: 1, b: 0, r2: 5, verticale: false, M: 2, P: 0, K: 2 }; }

  function arrondi(v, n) { var f = Math.pow(10, n); return Math.round(v * f) / f; }
  function nb(v, n) {
    if (n === undefined) n = 2;
    var r = arrondi(v, n);
    if (Math.abs(r) < 1e-12) r = 0;
    return String(r).replace(".", ",").replace("-", "−");
  }
  function pgcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = b; b = a % b; a = t; } return a; }
  function frac(n, d) { if (d < 0) { n = -n; d = -d; } var g = pgcd(n, d) || 1; return { n: n / g, d: d / g }; }
  function fracTxt(f) { var s = String(Math.abs(f.n)) + (f.d === 1 ? "" : "/" + f.d); return (f.n < 0 ? "−" : "") + s; }
  function simplifieRacine(n) {
    var k = 1, m = n;
    for (var d = 2; d * d <= m; d++) { while (m % (d * d) === 0) { m /= d * d; k *= d; } }
    return [k, m];
  }
  function terme(coef, lettre, premier) {
    if (Math.abs(coef) < 1e-12) return "";
    var signe = coef < 0 ? (premier ? "−" : " − ") : (premier ? "" : " + ");
    var abs = Math.abs(coef);
    var corps = lettre ? (abs === 1 ? lettre : nb(abs) + lettre) : nb(abs);
    return signe + corps;
  }
  function carre(lettre, c) {
    if (Math.abs(c) < 1e-12) return lettre + "²";
    return "(" + lettre + (c > 0 ? " − " : " + ") + nb(Math.abs(c)) + ")²";
  }
  // « 2x² − 2x − 4 = 0 »
  function trinome(A, B, C, v) {
    var s = terme(A, v + "²", true) + terme(B, v) + terme(C, "");
    return s + " = 0";
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
    'svg{width:100%;max-width:460px;height:auto;background:var(--surface-2,#f7f9fb);border-radius:var(--radius,3px);border:1px solid var(--line,#ccd8e0);}' +
    '.grille{stroke:var(--line,#ccd8e0);stroke-width:0.6;}' +
    '.axe{stroke:var(--ink-soft,#51626f);stroke-width:1.3;}' +
    '.fleche-axe{fill:var(--ink-soft,#51626f);}' +
    '.graduation{font-size:11px;fill:var(--ink-soft,#51626f);paint-order:stroke;stroke:var(--surface-2,#f7f9fb);stroke-width:3.5px;stroke-linejoin:round;}' +
    '.cercle{fill:var(--accent,#b65c1f);fill-opacity:0.06;stroke:var(--accent,#b65c1f);stroke-width:2.6;}' +
    '.droite{stroke:var(--good,#2f7a4f);stroke-width:2.4;}' +
    '.droite-tg{stroke:var(--plan,#5b4ea3);stroke-width:2.4;}' +
    '.droite-ext{stroke:var(--bad,#b23a3a);stroke-width:2.4;}' +
    '.point{fill:var(--ink,#182430);}' +
    '.point-i{fill:var(--surface,#fff);stroke:var(--ink,#182430);stroke-width:2.6;}' +
    '.etiq{font-size:13px;font-weight:700;fill:var(--ink,#182430);paint-order:stroke;stroke:var(--surface-2,#f7f9fb);stroke-width:3.5px;stroke-linejoin:round;}' +
    '.lecture{display:flex;flex-direction:column;gap:8px;margin:0 auto 14px;max-width:620px;font-variant-numeric:tabular-nums;}' +
    '.carte{padding:10px 12px;border-radius:var(--radius,3px);background:var(--surface-2,#f7f9fb);border:1px solid var(--line,#ccd8e0);line-height:1.6;font-size:0.95rem;overflow-wrap:anywhere;}' +
    '.carte-titre{font-weight:700;font-size:0.82rem;color:var(--ink-soft,#51626f);margin-bottom:4px;}' +
    '.eq{font-size:1.05rem;font-weight:700;color:var(--accent-ink,#7a3212);}' +
    '.etape{display:block;}' +
    '.verdict{font-weight:700;}' +
    '.v0{color:var(--bad,#b23a3a);} .v1{color:var(--plan,#5b4ea3);} .v2{color:var(--good,#2f7a4f);}' +
    '.note{font-size:0.85rem;color:var(--ink-soft,#51626f);}' +
    '.controles{display:flex;flex-direction:column;gap:10px;align-items:stretch;max-width:620px;margin:0 auto;}' +
    '.zone{display:flex;flex-direction:column;gap:10px;align-items:stretch;}' +
    '.rangee{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;align-items:center;}' +
    '.libelle{font-size:0.88rem;color:var(--ink-soft,#51626f);font-weight:600;}' +
    '.btn{min-height:44px;min-width:44px;padding:8px 12px;border-radius:var(--radius,3px);border:1px solid var(--line,#ccd8e0);background:var(--surface,#fff);color:var(--ink,#182430);font-weight:600;cursor:pointer;font-family:inherit;font-size:0.95rem;}' +
    '.btn[aria-pressed="true"]{background:var(--accent-soft,#f6e2d3);border-color:var(--accent,#b65c1f);color:var(--accent-ink,#7a3212);}' +
    '.btn:focus-visible,input:focus-visible{outline:2px solid var(--accent,#b65c1f);outline-offset:2px;}' +
    '.btn-reset{background:var(--accent-soft,#f6e2d3);border-color:var(--accent-soft-line,#e8c4a4);color:var(--accent-ink,#7a3212);align-self:center;}' +
    '.curseur{display:flex;flex-direction:column;gap:2px;}' +
    '.curseur label{font-size:0.88rem;font-weight:600;color:var(--ink-soft,#51626f);}' +
    'input[type=range]{width:100%;margin:0;min-height:44px;accent-color:var(--accent,#b65c1f);}' +
    '</style>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" role="img" aria-label="Une droite et un cercle dans un repère"></svg></div>' +
    '<div class="lecture" id="lecture" aria-live="polite"></div>' +
    '<div class="controles">' +
    '<div class="rangee"><span class="libelle">Centre C :</span>' +
    '<button class="btn" type="button" data-dx="-1" data-dy="0" aria-label="Centre vers la gauche">←</button>' +
    '<button class="btn" type="button" data-dx="0" data-dy="1" aria-label="Centre vers le haut">↑</button>' +
    '<button class="btn" type="button" data-dx="0" data-dy="-1" aria-label="Centre vers le bas">↓</button>' +
    '<button class="btn" type="button" data-dx="1" data-dy="0" aria-label="Centre vers la droite">→</button></div>' +
    '<div class="curseur"><label for="r2" id="label-r2">r²</label><input type="range" id="r2" min="1" max="25" step="1"></div>' +
    '<div class="rangee"><span class="libelle">Droite :</span>' +
    '<button class="btn" type="button" data-type="oblique">y = mx + p</button>' +
    '<button class="btn" type="button" data-type="verticale">verticale x = k</button></div>' +
    '<div id="zone-mp" class="zone">' +
    '<div class="curseur"><label for="M" id="label-M">m</label><input type="range" id="M" min="-6" max="6" step="1"></div>' +
    '<div class="curseur"><label for="P" id="label-P">p</label><input type="range" id="P" min="-12" max="12" step="1"></div>' +
    '</div>' +
    '<div id="zone-k" class="curseur" hidden><label for="K" id="label-K">k</label><input type="range" id="K" min="-12" max="12" step="1"></div>' +
    '<button class="btn btn-reset" id="reset" type="button">Réinitialiser</button>' +
    '</div>';

  class DroiteCercleWidget extends HTMLElement {
    constructor() {
      super();
      var shadow = this.attachShadow({ mode: "open" });
      shadow.appendChild(TEMPLATE.content.cloneNode(true));
      this._svg = shadow.getElementById("svg");
      this._lecture = shadow.getElementById("lecture");
      this._etat = defaut();
      this._ecouteurs = [];
    }

    connectedCallback() {
      var self = this, sh = this.shadowRoot;
      function ecoute(c, t, f) { c.addEventListener(t, f); self._ecouteurs.push([c, t, f]); }
      Array.prototype.forEach.call(sh.querySelectorAll("[data-dx]"), function (b) {
        ecoute(b, "click", function () {
          var E = self._etat;
          E.a = Math.max(-BORNE_C, Math.min(BORNE_C, E.a + parseInt(b.getAttribute("data-dx"), 10)));
          E.b = Math.max(-BORNE_C, Math.min(BORNE_C, E.b + parseInt(b.getAttribute("data-dy"), 10)));
          self._rendre();
        });
      });
      Array.prototype.forEach.call(sh.querySelectorAll("[data-type]"), function (b) {
        ecoute(b, "click", function () { self._etat.verticale = b.getAttribute("data-type") === "verticale"; self._rendre(); });
      });
      ["r2", "M", "P", "K"].forEach(function (id) {
        ecoute(sh.getElementById(id), "input", function (e) { self._etat[id] = parseInt(e.target.value, 10); self._rendre(); });
      });
      ecoute(sh.getElementById("reset"), "click", function () { self._etat = defaut(); self._rendre(); });
      this._rendre();
    }

    disconnectedCallback() {
      this._ecouteurs.forEach(function (t) { t[0].removeEventListener(t[1], t[2]); });
      this._ecouteurs = [];
    }

    _px(x, y) { return [MARGE + (x - X_MIN) * UNITE, MARGE + (Y_MAX - y) * UNITE]; }

    _rendre() {
      var sh = this.shadowRoot, E = this._etat;
      var a = E.a, b = E.b, r2 = E.r2, m = E.M / 2, p = E.P / 2, k = E.K / 2;
      Array.prototype.forEach.call(sh.querySelectorAll("[data-type]"), function (bt) {
        bt.setAttribute("aria-pressed", (bt.getAttribute("data-type") === "verticale") === E.verticale ? "true" : "false");
      });
      sh.getElementById("zone-mp").hidden = E.verticale;
      sh.getElementById("zone-k").hidden = !E.verticale;
      ["r2", "M", "P", "K"].forEach(function (id) { sh.getElementById(id).value = String(E[id]); });
      var km = simplifieRacine(r2);
      var rTxt = km[1] === 1 ? String(km[0]) : (km[0] === 1 ? "" : km[0]) + "√" + km[1];
      sh.getElementById("label-r2").textContent = "Rayon : r² = " + r2 + ", r = " + rTxt + (km[1] === 1 ? "" : " ≈ " + nb(Math.sqrt(r2)));
      sh.getElementById("label-M").textContent = "Pente m = " + nb(m);
      sh.getElementById("label-P").textContent = "Ordonnée à l'origine p = " + nb(p);
      sh.getElementById("label-K").textContent = "k = " + nb(k);

      // équation du second degré en v (x, ou y pour une verticale), coefficients ×4 entiers
      var A4, B4, C4, v;
      if (!E.verticale) {
        var Q = E.P - 2 * b; // 2(p − b)
        A4 = 4 + E.M * E.M; B4 = -8 * a + 2 * E.M * Q; C4 = 4 * a * a + Q * Q - 4 * r2; v = "x";
      } else {
        var R = E.K - 2 * a; // 2(k − a)
        A4 = 4; B4 = -8 * b; C4 = 4 * b * b + R * R - 4 * r2; v = "y";
      }
      var g = pgcd(pgcd(A4, B4), C4) || 1;
      var A = A4 / g, B = B4 / g, C = C4 / g;
      var delta = B * B - 4 * A * C;

      // solutions
      var sols = []; // { v: valeur, exact: fraction|null }
      if (delta >= 0) {
        var s = Math.round(Math.sqrt(delta));
        var carreParfait = s * s === delta;
        var signes = delta === 0 ? [1] : [1, -1];
        signes.forEach(function (sg) {
          if (carreParfait) { var f = frac(-B + sg * s, 2 * A); sols.push({ v: f.n / f.d, exact: f }); }
          else sols.push({ v: (-B + sg * Math.sqrt(delta)) / (2 * A), exact: null });
        });
      }
      var points = sols.map(function (so) {
        if (E.verticale) {
          return { x: k, y: so.v, xt: nb(k), yt: so.exact ? fracTxt(so.exact) : "≈ " + nb(so.v), approx: !so.exact };
        }
        var y = m * so.v + p, yt;
        if (so.exact) { var fy = frac(E.M * so.exact.n + E.P * so.exact.d, 2 * so.exact.d); yt = fracTxt(fy); }
        else yt = "≈ " + nb(y);
        return { x: so.v, y: y, xt: so.exact ? fracTxt(so.exact) : "≈ " + nb(so.v), yt: yt, approx: !so.exact };
      });

      // ---------- dessin ----------
      var svg = this._svg;
      svg.innerHTML = "";
      var defs = el("defs", {}, svg);
      var clip = el("clipPath", { id: "cadre" }, defs);
      el("rect", { x: MARGE, y: MARGE, width: LARGEUR - 2 * MARGE, height: HAUTEUR - 2 * MARGE }, clip);
      var mk = el("marker", { id: "fl", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" }, defs);
      el("path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche-axe" }, mk);
      var gr = el("g", { "clip-path": "url(#cadre)" }, svg);
      for (var gx = X_MIN; gx <= X_MAX; gx++) { var px = this._px(gx, 0)[0]; el("line", { x1: px, y1: MARGE, x2: px, y2: HAUTEUR - MARGE, class: "grille" }, gr); }
      for (var gy = Y_MIN; gy <= Y_MAX; gy++) { var py = this._px(0, gy)[1]; el("line", { x1: MARGE, y1: py, x2: LARGEUR - MARGE, y2: py, class: "grille" }, gr); }
      var o = this._px(0, 0);
      el("line", { x1: MARGE, y1: o[1], x2: LARGEUR - MARGE, y2: o[1], class: "axe", "marker-end": "url(#fl)" }, svg);
      el("line", { x1: o[0], y1: HAUTEUR - MARGE, x2: o[0], y2: MARGE, class: "axe", "marker-end": "url(#fl)" }, svg);
      var t1 = el("text", { x: this._px(1, 0)[0] - 3, y: o[1] + 15, class: "graduation" }, svg); t1.textContent = "1";
      var t2 = el("text", { x: o[0] - 12, y: this._px(0, 1)[1] + 4, class: "graduation" }, svg); t2.textContent = "1";

      var pc = this._px(a, b);
      el("circle", { cx: pc[0], cy: pc[1], r: (Math.sqrt(r2) * UNITE).toFixed(1), class: "cercle" }, gr);
      el("circle", { cx: pc[0], cy: pc[1], r: 4, class: "point" }, svg);
      var ec = el("text", { x: (pc[0] - 11).toFixed(1), y: (pc[1] + 17).toFixed(1), class: "etiq", "text-anchor": "middle" }, svg);
      ec.textContent = "C";
      var cls = delta < 0 ? "droite-ext" : delta === 0 ? "droite-tg" : "droite";
      var q0, q1;
      if (E.verticale) { q0 = this._px(k, Y_MIN - 1); q1 = this._px(k, Y_MAX + 1); }
      else { q0 = this._px(X_MIN - 1, m * (X_MIN - 1) + p); q1 = this._px(X_MAX + 1, m * (X_MAX + 1) + p); }
      el("line", { x1: q0[0].toFixed(1), y1: q0[1].toFixed(1), x2: q1[0].toFixed(1), y2: q1[1].toFixed(1), class: cls }, gr);
      var self = this;
      points.forEach(function (pt) {
        if (pt.x < X_MIN || pt.x > X_MAX || pt.y < Y_MIN || pt.y > Y_MAX) return;
        var q = self._px(pt.x, pt.y);
        el("circle", { cx: q[0].toFixed(1), cy: q[1].toFixed(1), r: 5.5, class: "point-i" }, svg);
      });

      // ---------- lecture ----------
      var cercleTxt = carre("x", a) + " + " + carre("y", b) + " = " + r2;
      var droiteTxt = E.verticale ? "x = " + nb(k) : "y = " + (terme(m, "x", true) + terme(p, "", m === 0) || "0");
      var h = '<div class="carte"><div class="carte-titre">Les deux équations</div>' +
        '<div>Cercle : ' + cercleTxt + '</div><div>Droite : ' + droiteTxt + '</div></div>';
      var etape1;
      if (!E.verticale) {
        var interieur = terme(m, "x", true) + terme(p - b, "", m === 0);
        if (interieur === "") interieur = "0";
        var carreY = interieur === "x" ? "x²" : "(" + interieur + ")²";
        etape1 = 'On remplace y par ' + (terme(m, "x", true) + terme(p, "", m === 0) || "0") + ' : ' + carre("x", a) + ' + ' + carreY + ' = ' + r2;
      } else {
        etape1 = 'On remplace x par ' + nb(k) + ' : ' + (k - a === 0 ? '0' : '(' + nb(k - a) + ')²') + ' + ' + carre("y", b) + ' = ' + r2;
      }
      h += '<div class="carte"><div class="carte-titre">Substitution</div>' +
        '<span class="etape">' + etape1 + '</span>' +
        '<span class="etape">On développe et on simplifie :</span>' +
        '<div class="eq">' + trinome(A, B, C, v) + '</div>' +
        '<span class="etape">Δ = ' + (B < 0 ? '(' + nb(B) + ')' : nb(B)) + '² − 4 × ' + (A < 0 ? '(' + nb(A) + ')' : nb(A)) + ' × ' + (C < 0 ? '(' + nb(C) + ')' : nb(C)) + ' = <strong>' + nb(delta) + '</strong></span></div>';
      var verdict;
      if (delta < 0) verdict = '<div class="verdict v0">Δ &lt; 0 : aucune solution. La droite ne coupe pas le cercle.</div>';
      else if (delta === 0) verdict = '<div class="verdict v1">Δ = 0 : une solution double. La droite est tangente au cercle.</div>';
      else verdict = '<div class="verdict v2">Δ &gt; 0 : deux solutions. La droite coupe le cercle en deux points.</div>';
      h += '<div class="carte"><div class="carte-titre">Nombre de points communs</div>' + verdict;
      if (sols.length) {
        if (delta > 0 && !sols[0].exact) {
          var kr = simplifieRacine(delta);
          var gg = pgcd(pgcd(B, kr[0]), 2 * A) || 1;
          var num = (B === 0 ? '' : nb(-B / gg) + ' ± ') + (kr[0] / gg === 1 ? '' : kr[0] / gg) + '√' + kr[1];
          if (B === 0) num = '±' + num;
          var den = 2 * A / gg;
          h += '<div>' + v + ' = ' + (den === 1 ? num : '(' + num + ') / ' + nb(den)) + '</div>';
        }
        var autre = E.verticale ? 'x = ' + nb(k) : 'y = mx + p';
        h += '<div class="note">On calcule ' + (E.verticale ? 'y, puis x = ' + nb(k) : 'x, puis ' + autre) + ' pour chaque solution :</div>';
        points.forEach(function (pt) {
          h += '<div><strong>(' + pt.xt + ' ; ' + pt.yt + ')</strong></div>';
        });
        if (points.some(function (pt) { return pt.x < X_MIN || pt.x > X_MAX || pt.y < Y_MIN || pt.y > Y_MAX; })) {
          h += '<div class="note">Un point sort du cadre du graphique.</div>';
        }
      }
      h += '</div>';
      this._lecture.innerHTML = h;
    }
  }

  if (!customElements.get("droite-cercle-widget")) {
    customElements.define("droite-cercle-widget", DroiteCercleWidget);
  }
})();
