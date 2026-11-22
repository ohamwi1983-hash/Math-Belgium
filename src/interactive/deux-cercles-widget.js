(function () {
  "use strict";

  /* ================================================================
   * <deux-cercles-widget> — atelier « Deux cercles » (4e, ch. 7, § 10).
   * Deux cercles réglables (centres à coordonnées entières déplaçables,
   * rayons au demi près). L'atelier écrit les deux équations développées,
   * les soustrait : les carrés disparaissent, il reste une droite, tracée,
   * perpendiculaire à la droite des centres. Les 0, 1 ou 2 points communs
   * sont ceux de cette droite et du premier cercle. Centres confondus :
   * aucune droite (cercles confondus ou sans point commun).
   * Défaut : x² + y² = 25 et (x − 8)² + y² = 25 → x = 4, (4 ; 3) et (4 ; −3).
   * Fenêtre FIXE. Pendant de gen98. Web Component (Shadow DOM).
   * ================================================================ */

  var G = window.GeoAnaCommun;
  var FEN = { xMin: -7, xMax: 14, yMin: -8, yMax: 8 };
  var R = G.repere(FEN, 26, 14);
  var BORNE = { xMin: -5, xMax: 12, yMin: -6, yMax: 6 };

  function defaut() { return { C1: { x: 0, y: 0 }, C2: { x: 8, y: 0 }, r1: 5, r2: 5 }; }

  /** « x² + y² − 4x + 6y − 12 = 0 » (coefficients décimaux possibles). */
  function equationDev(a, b, r) {
    var s = "x² + y²";
    function t(coef, lettre) {
      if (Math.abs(coef) < 1e-9) return "";
      var abs = Math.abs(coef);
      return (coef < 0 ? " − " : " + ") + (lettre && Math.abs(abs - 1) < 1e-9 ? "" : G.nb(abs)) + lettre;
    }
    return s + t(-2 * a, "x") + t(-2 * b, "y") + t(a * a + b * b - r * r, "") + " = 0";
  }
  function equationCentre(a, b, r) {
    function f(v, l) { return Math.abs(v) < 1e-9 ? l + "²" : "(" + l + (v > 0 ? " − " : " + ") + G.nb(Math.abs(v)) + ")²"; }
    return f(a, "x") + " + " + f(b, "y") + " = " + G.nb(r * r);
  }
  function valeur(v) {
    var exact = Math.abs(v * 100 - Math.round(v * 100)) < 1e-6;
    return { txt: G.nb(v), exact: exact };
  }
  function coordPt(P) {
    var x = valeur(P.x), y = valeur(P.y);
    return (x.exact && y.exact ? "" : "≈ ") + "(" + x.txt + "\u00a0;\u00a0" + y.txt + ")";
  }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' + G.CSS + '</style>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + R.L + ' ' + R.H + '" role="img" aria-label="Deux cercles, la droite obtenue en soustrayant leurs équations et leurs points communs"></svg></div>' +
    '<div class="lecture" id="lecture" aria-live="polite"></div>' +
    '<div class="controles">' +
    '<div class="curseur"><label class="libelle" for="r1">Rayon r₁</label><input type="range" id="r1" min="0.5" max="8" step="0.5" value="5"><span class="val" id="v1">5</span></div>' +
    '<div class="curseur"><label class="libelle" for="r2">Rayon r₂</label><input type="range" id="r2" min="0.5" max="8" step="0.5" value="5"><span class="val" id="v2">5</span></div>' +
    '<div class="rangee"><span class="libelle">Centre à déplacer :</span>' +
    '<button class="btn" type="button" data-point="C1">C₁</button><button class="btn" type="button" data-point="C2">C₂</button></div>' +
    '<div class="rangee">' +
    '<button class="btn" type="button" data-dx="-1" data-dy="0" aria-label="Déplacer vers la gauche">←</button>' +
    '<button class="btn" type="button" data-dx="0" data-dy="1" aria-label="Déplacer vers le haut">↑</button>' +
    '<button class="btn" type="button" data-dx="0" data-dy="-1" aria-label="Déplacer vers le bas">↓</button>' +
    '<button class="btn" type="button" data-dx="1" data-dy="0" aria-label="Déplacer vers la droite">→</button></div>' +
    '<div class="rangee"><button class="btn btn-reset" type="button" id="reset">Réinitialiser</button></div></div>';

  class DeuxCerclesWidget extends HTMLElement {
    constructor() {
      super();
      var sh = this.attachShadow({ mode: "open" });
      sh.appendChild(TEMPLATE.content.cloneNode(true));
      this._svg = sh.getElementById("svg");
      this._lecture = sh.getElementById("lecture");
      this._ecouteurs = [];
      this._e = defaut();
      this._point = "C2";
    }

    connectedCallback() {
      var self = this, sh = this.shadowRoot;
      function ecoute(c, t, f) { c.addEventListener(t, f); self._ecouteurs.push([c, t, f]); }
      ecoute(sh.getElementById("r1"), "input", function (e) { self._e.r1 = parseFloat(e.target.value); self._rendre(); });
      ecoute(sh.getElementById("r2"), "input", function (e) { self._e.r2 = parseFloat(e.target.value); self._rendre(); });
      Array.prototype.forEach.call(sh.querySelectorAll("[data-point]"), function (b) {
        ecoute(b, "click", function () { self._point = b.getAttribute("data-point"); self._rendre(); });
      });
      Array.prototype.forEach.call(sh.querySelectorAll("[data-dx]"), function (b) {
        ecoute(b, "click", function () {
          var p = self._e[self._point];
          self._deplacer(self._point, p.x + parseInt(b.getAttribute("data-dx"), 10), p.y + parseInt(b.getAttribute("data-dy"), 10));
        });
      });
      ecoute(sh.getElementById("reset"), "click", function () { self._e = defaut(); self._point = "C2"; self._rendre(); });
      G.glisser(this, this._svg, R, function (n) { self._point = n; self._rendre(); }, function (n, x, y) { self._deplacer(n, Math.round(x), Math.round(y)); });
      this._rendre();
    }

    disconnectedCallback() {
      this._ecouteurs.forEach(function (t) { t[0].removeEventListener(t[1], t[2]); });
      this._ecouteurs = [];
    }

    _deplacer(n, x, y) {
      x = G.borner(x, BORNE.xMin, BORNE.xMax); y = G.borner(y, BORNE.yMin, BORNE.yMax);
      if (this._e[n].x === x && this._e[n].y === y) return;
      this._e[n] = { x: x, y: y };
      this._rendre();
    }

    _rendre() {
      var sh = this.shadowRoot, svg = this._svg, e = this._e, self = this;
      sh.getElementById("r1").value = String(e.r1); sh.getElementById("v1").textContent = G.nb(e.r1);
      sh.getElementById("r2").value = String(e.r2); sh.getElementById("v2").textContent = G.nb(e.r2);
      Array.prototype.forEach.call(sh.querySelectorAll("[data-point]"), function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-point") === self._point ? "true" : "false"); });
      svg.innerHTML = "";
      R.fond(svg, 2);
      var C1 = e.C1, C2 = e.C2, r1 = e.r1, r2 = e.r2;
      var p1 = R.px(C1.x, C1.y), p2 = R.px(C2.x, C2.y);
      G.el("circle", { cx: p1[0], cy: p1[1], r: r1 * R.unite, class: "trait-acc" }, svg);
      G.el("circle", { cx: p2[0], cy: p2[1], r: r2 * R.unite, class: "trait-good" }, svg);

      // soustraction : (éq. 1) − (éq. 2) = 2(a₂ − a₁)x + 2(b₂ − b₁)y + k₁ − k₂ = 0
      var a = 2 * (C2.x - C1.x), b = 2 * (C2.y - C1.y);
      var k1 = C1.x * C1.x + C1.y * C1.y - r1 * r1, k2 = C2.x * C2.x + C2.y * C2.y - r2 * r2;
      var c = k1 - k2;
      var h = '<div class="carte"><div class="carte-titre">Les deux cercles</div>' +
        '<span class="c-acc">Γ₁ : ' + equationCentre(C1.x, C1.y, r1) + '</span>, soit ' + equationDev(C1.x, C1.y, r1) + '<br>' +
        '<span class="c-good">Γ₂ : ' + equationCentre(C2.x, C2.y, r2) + '</span>, soit ' + equationDev(C2.x, C2.y, r2) + '</div>';
      var points = [];
      if (a === 0 && b === 0) {
        h += '<div class="carte"><div class="carte-titre">Centres confondus</div>La soustraction ne laisse que ' + G.nb(c) + ' = 0 : aucune droite. ' +
          (Math.abs(r1 - r2) < 1e-9 ? '<span class="c-good">Les deux cercles sont confondus.</span>' : '<span class="c-bad">Rayons différents : aucun point commun.</span>') + '</div>';
      } else {
        var eqTxt;
        var entiers = Math.abs(c - Math.round(c)) < 1e-9;
        if (entiers) { var red = G.reduire(a, b, Math.round(c)); eqTxt = G.equationDroite(red[0], red[1], red[2]); }
        else eqTxt = G.equationDroite(a, b, 0).replace(" = 0", "") + (c < 0 ? " − " : " + ") + G.nb(Math.abs(c)) + " = 0";
        R.traceDroite(svg, a, b, c, "trait-ink pointille");
        G.el("line", { x1: p1[0], y1: p1[1], x2: p2[0], y2: p2[1], class: "trait-faint" }, svg);
        // points communs = droite ∩ Γ₁
        var n2 = a * a + b * b, s = a * C1.x + b * C1.y + c;
        var dd = Math.abs(s) / Math.sqrt(n2);
        var H = { x: C1.x - s / n2 * a, y: C1.y - s / n2 * b };
        var nb;
        if (dd > r1 + 1e-9) nb = 0;
        else if (Math.abs(dd - r1) < 1e-9) { nb = 1; points.push(H); }
        else {
          nb = 2;
          var l = Math.sqrt(r1 * r1 - dd * dd) / Math.sqrt(n2);
          points.push({ x: H.x - b * l, y: H.y + a * l }, { x: H.x + b * l, y: H.y - a * l });
        }
        h += '<div class="carte"><div class="carte-titre">Soustraire les deux équations</div>Les termes x² + y² disparaissent : il reste <span class="c-plan">' + eqTxt + '</span>' + (b === 0 && entiers ? ', soit x = ' + G.nb(-c / a) : a === 0 && entiers ? ', soit y = ' + G.nb(-c / b) : '') + ', une droite (pointillés) perpendiculaire à la droite des centres (C₁C₂).</div>' +
          '<div class="carte"><div class="carte-titre">Les points communs</div>Ce sont les points de cette droite qui sont sur Γ₁ (on substitue) : ' +
          (nb === 0 ? '<span class="c-bad">aucun point commun.</span>' : nb === 1 ? '<span class="c-good">un seul point, ' + coordPt(points[0]) + ' : les cercles sont tangents.</span>'
            : '<span class="c-good">deux points, ' + coordPt(points[0]) + ' et ' + coordPt(points[1]) + '.</span>') + '</div>';
      }
      G.point(svg, R, C1.x, C1.y, "C₁", "point-acc", "etiq-acc", -12, -10);
      G.point(svg, R, C2.x, C2.y, "C₂", "point-good", "etiq-good", 12, -10);
      points.forEach(function (P) { if (R.dansFenetre(P.x, P.y)) G.point(svg, R, P.x, P.y, "", "point"); });
      G.poignee(svg, R, C1.x, C1.y, "C1", self._point === "C1");
      G.poignee(svg, R, C2.x, C2.y, "C2", self._point === "C2");
      this._lecture.innerHTML = h;
    }
  }

  if (!customElements.get("deux-cercles-widget")) customElements.define("deux-cercles-widget", DeuxCerclesWidget);
})();
