(function () {
  "use strict";

  /* ================================================================
   * <reflexion-viser-widget> — atelier « Réflexion : où viser ? »
   * (4e, ch. 7, § 6). A, B et la droite d (fixée par deux points D et E)
   * sont déplaçables, au demi-carreau. L'atelier construit le projeté H
   * de A sur d, le symétrique A′ (H milieu de [AA′]), puis le point I où
   * (A′B) coupe d : le trajet A → I → B (vert) vaut A′B. Un autre point J
   * de d (déplaçable le long de d) donne un trajet plus long (rouge).
   * Fenêtre FIXE. Pendant de gen96. Web Component (Shadow DOM).
   * ================================================================ */

  var G = window.GeoAnaCommun;
  var FEN = { xMin: -3, xMax: 9, yMin: -4, yMax: 6 };
  var R = G.repere(FEN, 40, 14);
  var NOMS = ["A", "B", "D", "E", "J"];

  function defaut() { return { A: { x: 1, y: 3 }, B: { x: 6, y: 2 }, D: { x: -2, y: 0 }, E: { x: 8, y: 0 }, s: 0.4 }; }
  function demi(v) { return Math.round(v * 2) / 2; }
  function dist(P, Q) { return Math.hypot(P.x - Q.x, P.y - Q.y); }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' + G.CSS + '</style>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + R.L + ' ' + R.H + '" role="img" aria-label="Rebond sur une droite d : symétrique A′ de A, point visé I, trajet AI + IB égal à A′B, et un autre trajet par J plus long"></svg></div>' +
    '<div class="lecture" id="lecture" aria-live="polite"></div>' +
    '<div class="controles">' +
    '<div class="rangee"><span class="libelle">Point à déplacer :</span>' +
    '<button class="btn" type="button" data-point="A">A</button><button class="btn" type="button" data-point="B">B</button>' +
    '<button class="btn" type="button" data-point="D">D</button><button class="btn" type="button" data-point="E">E</button>' +
    '<button class="btn" type="button" data-point="J">J</button></div>' +
    '<div class="rangee">' +
    '<button class="btn" type="button" data-dx="-0.5" data-dy="0" aria-label="Déplacer vers la gauche">←</button>' +
    '<button class="btn" type="button" data-dx="0" data-dy="0.5" aria-label="Déplacer vers le haut">↑</button>' +
    '<button class="btn" type="button" data-dx="0" data-dy="-0.5" aria-label="Déplacer vers le bas">↓</button>' +
    '<button class="btn" type="button" data-dx="0.5" data-dy="0" aria-label="Déplacer vers la droite">→</button></div>' +
    '<div class="rangee"><button class="btn btn-reset" type="button" id="reset">Réinitialiser</button></div>' +
    '<p class="note">J glisse le long de d (flèches gauche et droite).</p></div>';

  class ReflexionViserWidget extends HTMLElement {
    constructor() {
      super();
      var sh = this.attachShadow({ mode: "open" });
      sh.appendChild(TEMPLATE.content.cloneNode(true));
      this._svg = sh.getElementById("svg");
      this._lecture = sh.getElementById("lecture");
      this._ecouteurs = [];
      this._e = defaut();
      this._point = "A";
    }

    connectedCallback() {
      var self = this, sh = this.shadowRoot;
      function ecoute(c, t, f) { c.addEventListener(t, f); self._ecouteurs.push([c, t, f]); }
      Array.prototype.forEach.call(sh.querySelectorAll("[data-point]"), function (b) {
        ecoute(b, "click", function () { self._point = b.getAttribute("data-point"); self._rendre(); });
      });
      Array.prototype.forEach.call(sh.querySelectorAll("[data-dx]"), function (b) {
        ecoute(b, "click", function () {
          var dx = parseFloat(b.getAttribute("data-dx")), dy = parseFloat(b.getAttribute("data-dy"));
          if (self._point === "J") { self._e.s += (dx || dy) * 0.05; self._e.s = G.borner(self._e.s, 0, 1); self._rendre(); return; }
          var p = self._e[self._point];
          self._deplacer(self._point, p.x + dx, p.y + dy);
        });
      });
      ecoute(sh.getElementById("reset"), "click", function () { self._e = defaut(); self._point = "A"; self._rendre(); });
      G.glisser(this, this._svg, R, function (n) { self._point = n; self._rendre(); }, function (n, x, y) {
        if (n === "J") {
          var D = self._e.D, E = self._e.E, ux = E.x - D.x, uy = E.y - D.y, L2 = ux * ux + uy * uy;
          self._e.s = G.borner(((x - D.x) * ux + (y - D.y) * uy) / L2, 0, 1);
          self._rendre();
          return;
        }
        self._deplacer(n, x, y);
      });
      this._rendre();
    }

    disconnectedCallback() {
      this._ecouteurs.forEach(function (t) { t[0].removeEventListener(t[1], t[2]); });
      this._ecouteurs = [];
    }

    _deplacer(n, x, y) {
      x = G.borner(demi(x), FEN.xMin + 0.5, FEN.xMax - 0.5);
      y = G.borner(demi(y), FEN.yMin + 0.5, FEN.yMax - 0.5);
      var autre = n === "D" ? this._e.E : n === "E" ? this._e.D : null;
      if (autre && autre.x === x && autre.y === y) return;
      this._e[n] = { x: x, y: y };
      this._rendre();
    }

    _rendre() {
      var sh = this.shadowRoot, svg = this._svg, e = this._e, self = this;
      Array.prototype.forEach.call(sh.querySelectorAll("[data-point]"), function (b) {
        b.setAttribute("aria-pressed", b.getAttribute("data-point") === self._point ? "true" : "false");
      });
      svg.innerHTML = "";
      R.fond(svg, 2);
      var D = e.D, E = e.E, A = e.A, B = e.B;
      // d : vecteur directeur u = DE, vecteur normal n = (−u_y ; u_x)
      var ux = E.x - D.x, uy = E.y - D.y, L2 = ux * ux + uy * uy;
      var a = -uy, b = ux, c = -(a * D.x + b * D.y);
      R.traceDroite(svg, a, b, c, "trait-ink");
      // projeté H de A, symétrique A′
      var k = ((A.x - D.x) * ux + (A.y - D.y) * uy) / L2;
      var H = { x: D.x + k * ux, y: D.y + k * uy };
      var A2 = { x: 2 * H.x - A.x, y: 2 * H.y - A.y };
      var cA = a * A.x + b * A.y + c, cB = a * B.x + b * B.y + c;
      var memeCote = cA * cB > 0;
      // I : intersection de (A′B) et de d
      var I = null;
      var vx = B.x - A2.x, vy = B.y - A2.y, den = a * vx + b * vy;
      if (Math.abs(den) > 1e-12) { var s = -(a * A2.x + b * A2.y + c) / den; I = { x: A2.x + s * vx, y: A2.y + s * vy }; }
      var J = { x: D.x + e.s * ux, y: D.y + e.s * uy };

      G.el("line", (function () { var p = R.px(A.x, A.y), q = R.px(A2.x, A2.y); return { x1: p[0], y1: p[1], x2: q[0], y2: q[1], class: "trait-faint pointille" }; })(), svg);
      if (memeCote && I) {
        var pa2 = R.px(A2.x, A2.y), pi = R.px(I.x, I.y);
        G.el("line", { x1: pa2[0], y1: pa2[1], x2: pi[0], y2: pi[1], class: "trait-faint pointille" }, svg);
        G.fleche(svg, R, J, B, "trait-bad pointille", "tete-bad");
        var pj = R.px(J.x, J.y), pA = R.px(A.x, A.y);
        G.el("line", { x1: pA[0], y1: pA[1], x2: pj[0], y2: pj[1], class: "trait-bad pointille" }, svg);
        var pI = R.px(I.x, I.y);
        G.el("line", { x1: pA[0], y1: pA[1], x2: pI[0], y2: pI[1], class: "trait-good" }, svg);
        G.fleche(svg, R, I, B, "trait-good", "tete-good");
        G.point(svg, R, I.x, I.y, "I", "point-good", "etiq-good", 0, -12);
        G.point(svg, R, J.x, J.y, "J", "point-bad", "etiq-bad", 0, -12);
      }
      G.point(svg, R, H.x, H.y, "H", "point", "etiq", -13, -9);
      G.point(svg, R, A2.x, A2.y, "A′", "point-plan", "etiq-plan", 16, 4);
      G.point(svg, R, A.x, A.y, "A", "point", "etiq", -12, -10);
      G.point(svg, R, B.x, B.y, "B", "point", "etiq", 12, -10);
      G.point(svg, R, D.x, D.y, "D", "point", "etiq", 0, -12);
      G.point(svg, R, E.x, E.y, "E", "point", "etiq", 0, -12);
      NOMS.forEach(function (n) { var P = n === "J" ? J : e[n]; if (n === "J" && !(memeCote && I)) return; G.poignee(svg, R, P.x, P.y, n, self._point === n); });

      var h = '<div class="carte"><div class="carte-titre">Le symétrique de A par rapport à d</div>' +
        'd passe par D' + G.coord(D.x, D.y) + ' et E' + G.coord(E.x, E.y) + '. Projeté de A' + G.coord(A.x, A.y) + ' : H' + G.coord(H.x, H.y) + '.<br>' +
        'H est le milieu de [AA′] : <span class="c-plan">A′(2 × ' + G.nb(H.x) + ' − ' + (A.x < 0 ? '(' + G.nb(A.x) + ')' : G.nb(A.x)) + ' ; 2 × ' + G.nb(H.y) + ' − ' + (A.y < 0 ? '(' + G.nb(A.y) + ')' : G.nb(A.y)) + ') = A′' + G.coord(A2.x, A2.y) + '</span>.</div>';
      if (Math.abs(cA) < 1e-9 || Math.abs(cB) < 1e-9) {
        h += '<div class="carte">A ou B est sur d : le rebond a lieu en ce point même.</div>';
      } else if (!memeCote) {
        h += '<div class="carte"><span class="c-bad">A et B sont de part et d\'autre de d</span> : le trajet direct AB touche déjà d, pas besoin de rebond. Ramène B du même côté que A.</div>';
      } else if (I) {
        var aib = dist(A, I) + dist(I, B), ajb = dist(A, J) + dist(J, B), a2b = dist(A2, B);
        h += '<div class="carte"><div class="carte-titre">Où viser ?</div>On vise le point I où (A′B) coupe d : <span class="c-good">I' + G.coord(I.x, I.y) + '</span>.<br>' +
          'AI + IB ≈ ' + G.nb(dist(A, I)) + ' + ' + G.nb(dist(I, B)) + ' ≈ <span class="c-good">' + G.nb(aib) + '</span>, et A′B ≈ ' + G.nb(a2b) + ' : la même longueur, car AI = A′I et A′, I, B sont alignés.</div>' +
          '<div class="carte"><div class="carte-titre">Un autre point de d</div>Par J' + G.coord(J.x, J.y) + ' : AJ + JB ≈ <span class="c-bad">' + G.nb(ajb) + '</span>' +
          (ajb - aib > 0.005 ? ', plus long que par I.' : ' : J est (presque) en I, le trajet est le plus court.') + '</div>';
      }
      this._lecture.innerHTML = h;
    }
  }

  if (!customElements.get("reflexion-viser-widget")) customElements.define("reflexion-viser-widget", ReflexionViserWidget);
})();
