(function () {
  "use strict";

  /* ================================================================
   * <lieu-trace-widget> — atelier « Le lieu se dessine » (4e, ch. 7, § 7).
   * Une règle au choix (MA = MB ; à distance 2 de d ; équidistant de deux
   * parallèles ; équidistant de F et de d ; à distance 3 de C). L'élève
   * déplace M (glisser, ou flèches au pas de 0,5) : chaque position laisse
   * une trace verte si la règle est vérifiée (écart ≤ 0,15), rouge sinon.
   * « Révéler le lieu » trace la médiatrice, les deux parallèles, la
   * parallèle médiane, la parabole ou le cercle, avec son équation.
   * Fenêtre FIXE. Pendant libre de gen131. Web Component (Shadow DOM).
   * ================================================================ */

  var G = window.GeoAnaCommun;
  var FEN = { xMin: -5, xMax: 7, yMin: -4, yMax: 7 };
  var R = G.repere(FEN, 38, 14);
  var TOL = 0.15;
  var MAX_TRACES = 700;

  function dist(P, Q) { return Math.hypot(P.x - Q.x, P.y - Q.y); }

  var REGLES = {
    mediatrice: {
      titre: "M est à égale distance de A(1 ; 2) et de B(5 ; 4)",
      depart: { x: -2, y: 5 },
      ecart: function (M) { return dist(M, { x: 1, y: 2 }) - dist(M, { x: 5, y: 4 }); },
      mesures: function (M) {
        var a = dist(M, { x: 1, y: 2 }), b = dist(M, { x: 5, y: 4 });
        return "MA ≈ " + G.nb(a) + " et MB ≈ " + G.nb(b);
      },
      fixes: function (svg) {
        G.point(svg, R, 1, 2, "A", "point", "etiq", -12, -10);
        G.point(svg, R, 5, 4, "B", "point", "etiq", 12, -10);
      },
      lieu: function (svg) { R.traceDroite(svg, 2, 1, -9, "trait-acc"); },
      equation: "la médiatrice de [AB] : 2x + y − 9 = 0 (MA² = MB², les carrés s'éliminent)",
    },
    distanceDroite: {
      titre: "M est à la distance 2 de la droite d : 3x − 4y + 4 = 0",
      depart: { x: 4, y: -1 },
      ecart: function (M) { return Math.abs(3 * M.x - 4 * M.y + 4) / 5 - 2; },
      mesures: function (M) { return "distance de M à d ≈ " + G.nb(Math.abs(3 * M.x - 4 * M.y + 4) / 5); },
      fixes: function (svg) {
        R.traceDroite(svg, 3, -4, 4, "trait-ink");
        G.texte(svg, R.px(-4.3, -1.6)[0], R.px(-4.3, -1.6)[1], "d", "etiq");
      },
      lieu: function (svg) { R.traceDroite(svg, 3, -4, -6, "trait-acc"); R.traceDroite(svg, 3, -4, 14, "trait-acc"); },
      equation: "la réunion de deux parallèles à d, une de chaque côté : 3x − 4y − 6 = 0 et 3x − 4y + 14 = 0",
    },
    paralleles: {
      titre: "M est à égale distance des parallèles d₁ : y = x + 3 et d₂ : y = x − 1",
      depart: { x: 4, y: -2 },
      ecart: function (M) { return (Math.abs(M.x - M.y + 3) - Math.abs(M.x - M.y - 1)) / Math.SQRT2; },
      mesures: function (M) {
        return "distance à d₁ ≈ " + G.nb(Math.abs(M.x - M.y + 3) / Math.SQRT2) + " et à d₂ ≈ " + G.nb(Math.abs(M.x - M.y - 1) / Math.SQRT2);
      },
      fixes: function (svg) {
        R.traceDroite(svg, 1, -1, 3, "trait-ink");
        R.traceDroite(svg, 1, -1, -1, "trait-ink");
        G.texte(svg, R.px(-4.2, -0.6)[0], R.px(-4.2, -0.6)[1], "d₁", "etiq");
        G.texte(svg, R.px(5.6, 3.9)[0], R.px(5.6, 3.9)[1], "d₂", "etiq");
      },
      lieu: function (svg) { R.traceDroite(svg, 1, -1, 1, "trait-acc"); },
      equation: "la parallèle médiane, à mi-chemin : y = x + 1",
    },
    parabole: {
      titre: "M est à égale distance du point F(0 ; 1) et de la droite d : y = −1",
      depart: { x: 3, y: 5 },
      ecart: function (M) { return dist(M, { x: 0, y: 1 }) - Math.abs(M.y + 1); },
      mesures: function (M) { return "MF ≈ " + G.nb(dist(M, { x: 0, y: 1 })) + " et distance de M à d ≈ " + G.nb(Math.abs(M.y + 1)); },
      fixes: function (svg) {
        R.traceDroite(svg, 0, 1, 1, "trait-ink");
        G.point(svg, R, 0, 1, "F", "point", "etiq", 12, -8);
        G.texte(svg, R.px(-4.4, -1.5)[0], R.px(-4.4, -1.5)[1], "d", "etiq");
      },
      lieu: function (svg) {
        var pts = [];
        for (var x = -5; x <= 5.3; x += 0.1) { var y = x * x / 4; if (y <= FEN.yMax) { var p = R.px(x, y); pts.push(p[0].toFixed(1) + "," + p[1].toFixed(1)); } }
        G.el("polyline", { points: pts.join(" "), class: "trait-acc" }, svg);
      },
      equation: "la parabole de foyer F et de directrice d : x² = 4y (p = 2)",
    },
    cercle: {
      titre: "M est à la distance 3 du point C(1 ; 1)",
      depart: { x: -3, y: 5 },
      ecart: function (M) { return dist(M, { x: 1, y: 1 }) - 3; },
      mesures: function (M) { return "MC ≈ " + G.nb(dist(M, { x: 1, y: 1 })); },
      fixes: function (svg) { G.point(svg, R, 1, 1, "C", "point", "etiq", 12, -8); },
      lieu: function (svg) {
        var c = R.px(1, 1);
        G.el("circle", { cx: c[0], cy: c[1], r: 3 * R.unite, class: "trait-acc" }, svg);
      },
      equation: "le cercle de centre C et de rayon 3 : (x − 1)² + (y − 1)² = 9",
    },
  };

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' + G.CSS +
    '.trace-ok{fill:var(--good,#2f7a4f);}' +
    '.trace-ko{fill:var(--bad,#b23a3a);fill-opacity:0.35;}' +
    '</style>' +
    '<div class="controles" style="margin-bottom:10px"><div class="rangee"><label class="libelle" for="regle">Règle :</label>' +
    '<select id="regle">' +
    '<option value="mediatrice">MA = MB</option>' +
    '<option value="distanceDroite">à distance 2 d\'une droite</option>' +
    '<option value="paralleles">équidistant de deux parallèles</option>' +
    '<option value="parabole">équidistant de F et de d</option>' +
    '<option value="cercle">à distance 3 de C</option>' +
    '</select></div></div>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + R.L + ' ' + R.H + '" role="img" aria-label="Point M que l\'on déplace : ses positions laissent une trace verte quand la règle est vérifiée, rouge sinon"></svg></div>' +
    '<div class="lecture" id="lecture" aria-live="polite"></div>' +
    '<div class="controles">' +
    '<div class="rangee">' +
    '<button class="btn" type="button" data-dx="-0.5" data-dy="0" aria-label="Déplacer M vers la gauche">←</button>' +
    '<button class="btn" type="button" data-dx="0" data-dy="0.5" aria-label="Déplacer M vers le haut">↑</button>' +
    '<button class="btn" type="button" data-dx="0" data-dy="-0.5" aria-label="Déplacer M vers le bas">↓</button>' +
    '<button class="btn" type="button" data-dx="0.5" data-dy="0" aria-label="Déplacer M vers la droite">→</button></div>' +
    '<div class="rangee"><button class="btn" type="button" id="reveler" aria-pressed="false">Révéler le lieu</button>' +
    '<button class="btn" type="button" id="effacer">Effacer les traces</button>' +
    '<button class="btn btn-reset" type="button" id="reset">Réinitialiser</button></div>' +
    '</div>';

  class LieuTraceWidget extends HTMLElement {
    constructor() {
      super();
      var sh = this.attachShadow({ mode: "open" });
      sh.appendChild(TEMPLATE.content.cloneNode(true));
      this._svg = sh.getElementById("svg");
      this._lecture = sh.getElementById("lecture");
      this._ecouteurs = [];
      this._initialiser("mediatrice");
    }

    _initialiser(cle) {
      this._cle = cle;
      this._M = { x: REGLES[cle].depart.x, y: REGLES[cle].depart.y };
      this._traces = [];
      this._revele = false;
      this._noter();
    }

    connectedCallback() {
      var self = this, sh = this.shadowRoot;
      function ecoute(c, t, f) { c.addEventListener(t, f); self._ecouteurs.push([c, t, f]); }
      ecoute(sh.getElementById("regle"), "change", function (e) { self._initialiser(e.target.value); self._rendre(); });
      Array.prototype.forEach.call(sh.querySelectorAll("[data-dx]"), function (b) {
        ecoute(b, "click", function () {
          self._deplacer(self._M.x + parseFloat(b.getAttribute("data-dx")), self._M.y + parseFloat(b.getAttribute("data-dy")));
        });
      });
      ecoute(sh.getElementById("reveler"), "click", function () { self._revele = !self._revele; self._rendre(); });
      ecoute(sh.getElementById("effacer"), "click", function () { self._traces = []; self._noter(); self._rendre(); });
      ecoute(sh.getElementById("reset"), "click", function () { sh.getElementById("regle").value = "mediatrice"; self._initialiser("mediatrice"); self._rendre(); });
      G.glisser(this, this._svg, R, function () {}, function (n, x, y) { self._deplacer(x, y); });
      this._rendre();
    }

    disconnectedCallback() {
      this._ecouteurs.forEach(function (t) { t[0].removeEventListener(t[1], t[2]); });
      this._ecouteurs = [];
    }

    _deplacer(x, y) {
      this._M = { x: G.borner(x, FEN.xMin, FEN.xMax), y: G.borner(y, FEN.yMin, FEN.yMax) };
      this._noter();
      this._rendre();
    }

    _noter() {
      var ok = Math.abs(REGLES[this._cle].ecart(this._M)) <= TOL;
      this._traces.push({ x: this._M.x, y: this._M.y, ok: ok });
      if (this._traces.length > MAX_TRACES) this._traces.shift();
    }

    _rendre() {
      var regle = REGLES[this._cle], svg = this._svg, M = this._M;
      this.shadowRoot.getElementById("reveler").setAttribute("aria-pressed", this._revele ? "true" : "false");
      svg.innerHTML = "";
      R.fond(svg, 1);
      regle.fixes(svg);
      if (this._revele) regle.lieu(svg);
      this._traces.forEach(function (t) {
        var p = R.px(t.x, t.y);
        G.el("circle", { cx: p[0].toFixed(1), cy: p[1].toFixed(1), r: t.ok ? 3.4 : 2.2, class: t.ok ? "trace-ok" : "trace-ko" }, svg);
      });
      var ok = Math.abs(regle.ecart(M)) <= TOL;
      G.point(svg, R, M.x, M.y, "M", ok ? "point-good" : "point-bad", ok ? "etiq-good" : "etiq-bad", 12, -10);
      G.poignee(svg, R, M.x, M.y, "M", true);

      var nOk = this._traces.filter(function (t) { return t.ok; }).length;
      var h = '<div class="carte"><div class="carte-titre">La règle</div>' + regle.titre + '</div>' +
        '<div class="carte"><div class="carte-titre">M' + G.coord(M.x, M.y) + '</div>' + regle.mesures(M) + ' : ' +
        (ok ? '<span class="c-good">la règle est vérifiée, M est sur le lieu.</span>' : '<span class="c-bad">la règle n\'est pas vérifiée.</span>') +
        '<br><span class="note">' + nOk + ' trace' + (nOk > 1 ? 's' : '') + ' verte' + (nOk > 1 ? 's' : '') + ' sur ' + this._traces.length + ' positions. Glisse M lentement : les traces vertes dessinent le lieu.</span></div>';
      if (this._revele) h += '<div class="carte"><div class="carte-titre">Le lieu</div><span class="c-acc">' + regle.equation + '</span></div>';
      this._lecture.innerHTML = h;
    }
  }

  if (!customElements.get("lieu-trace-widget")) customElements.define("lieu-trace-widget", LieuTraceWidget);
})();
