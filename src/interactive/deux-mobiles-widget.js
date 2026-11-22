(function () {
  "use strict";

  /* ================================================================
   * <deux-mobiles-widget> — atelier « Deux mobiles » (4e, ch. 7, § 5).
   * Deux mobiles en ligne droite, M₁ : x = x₁ + a₁t, y = y₁ + b₁t et
   * M₂ : x = x₂ + a₂t, y = y₂ + b₂t. Curseur du temps t : les mobiles
   * avancent sur leurs trajectoires. La croix K des trajectoires s'affiche
   * avec les instants t₁ et t₂ où chaque mobile y passe : collision si
   * t₁ = t₂, sinon l'écart |t₁ − t₂|. Trois scénarios : croisement sans
   * rencontre (la figure du cours), collision, trajectoires parallèles.
   * Fenêtre FIXE. Pendant de gen97. Web Component (Shadow DOM).
   * ================================================================ */

  var G = window.GeoAnaCommun;
  var FEN = { xMin: -1, xMax: 10, yMin: -2, yMax: 8 };
  var R = G.repere(FEN, 42, 14);
  var T_MAX = 5;

  var SCENARIOS = {
    croisement: { nom: "croisement sans rencontre", m1: [1, 1, 2, 1], m2: [8, 0, -1, 1] },
    collision: { nom: "collision", m1: [1, 1, 2, 1], m2: [9, -1, -2, 2] },
    paralleles: { nom: "trajectoires parallèles", m1: [1, 1, 2, 1], m2: [0, 4, 2, 1] },
  };

  function pos(m, t) { return { x: m[0] + m[2] * t, y: m[1] + m[3] * t }; }
  function terme(v, nom) {
    if (v === 0) return "";
    var abs = Math.abs(v) === 1 ? "" : G.nb(Math.abs(v));
    return (v < 0 ? " − " : " + ") + abs + nom;
  }
  function param(m) {
    function lig(x0, a) {
      if (a === 0) return G.nb(x0);
      var t = (Math.abs(a) === 1 ? "" : G.nb(Math.abs(a))) + "t";
      return x0 === 0 ? (a < 0 ? "−" : "") + t : G.nb(x0) + (a < 0 ? " − " : " + ") + t;
    }
    return "x = " + lig(m[0], m[2]) + ", y = " + lig(m[1], m[3]);
  }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' + G.CSS + '</style>' +
    '<div class="controles" style="margin-bottom:10px"><div class="rangee"><label class="libelle" for="scenario">Scénario :</label>' +
    '<select id="scenario"><option value="croisement">Croisement sans rencontre</option><option value="collision">Collision</option><option value="paralleles">Trajectoires parallèles</option></select></div></div>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + R.L + ' ' + R.H + '" role="img" aria-label="Deux mobiles sur leurs trajectoires rectilignes, leur position à l\'instant t et le point de croisement K"></svg></div>' +
    '<div class="lecture" id="lecture" aria-live="polite"></div>' +
    '<div class="controles"><div class="curseur"><label class="libelle" for="t">Instant t</label>' +
    '<input type="range" id="t" min="0" max="' + T_MAX + '" step="0.1" value="0"><span class="val" id="tval">0</span></div>' +
    '<div class="rangee"><button class="btn" type="button" id="moins" aria-label="Reculer le temps de 0,5">t − 0,5</button>' +
    '<button class="btn" type="button" id="plus" aria-label="Avancer le temps de 0,5">t + 0,5</button>' +
    '<button class="btn btn-reset" type="button" id="reset">Réinitialiser</button></div></div>';

  class DeuxMobilesWidget extends HTMLElement {
    constructor() {
      super();
      var sh = this.attachShadow({ mode: "open" });
      sh.appendChild(TEMPLATE.content.cloneNode(true));
      this._svg = sh.getElementById("svg");
      this._lecture = sh.getElementById("lecture");
      this._ecouteurs = [];
      this._cle = "croisement";
      this._t = 0;
    }

    connectedCallback() {
      var self = this, sh = this.shadowRoot;
      function ecoute(c, t, f) { c.addEventListener(t, f); self._ecouteurs.push([c, t, f]); }
      ecoute(sh.getElementById("scenario"), "change", function (e) { self._cle = e.target.value; self._t = 0; self._rendre(); });
      ecoute(sh.getElementById("t"), "input", function (e) { self._t = parseFloat(e.target.value); self._rendre(); });
      ecoute(sh.getElementById("moins"), "click", function () { self._t = Math.max(0, Math.round((self._t - 0.5) * 10) / 10); self._rendre(); });
      ecoute(sh.getElementById("plus"), "click", function () { self._t = Math.min(T_MAX, Math.round((self._t + 0.5) * 10) / 10); self._rendre(); });
      ecoute(sh.getElementById("reset"), "click", function () { self._cle = "croisement"; sh.getElementById("scenario").value = "croisement"; self._t = 0; self._rendre(); });
      this._rendre();
    }

    disconnectedCallback() {
      this._ecouteurs.forEach(function (t) { t[0].removeEventListener(t[1], t[2]); });
      this._ecouteurs = [];
    }

    /** Croix des trajectoires : x₁ + a₁t₁ = x₂ + a₂t₂ et y₁ + b₁t₁ = y₂ + b₂t₂ (système 2 × 2). */
    _croix(m1, m2) {
      var a = m1[2], b = -m2[2], c = m1[3], d = -m2[3];
      var e = m2[0] - m1[0], f = m2[1] - m1[1];
      var q = a * d - b * c;
      if (Math.abs(q) < 1e-12) return null;
      return { t1: (e * d - b * f) / q, t2: (a * f - e * c) / q };
    }

    _rendre() {
      var sh = this.shadowRoot, svg = this._svg, S = SCENARIOS[this._cle], t = this._t;
      sh.getElementById("t").value = String(t);
      sh.getElementById("tval").textContent = G.nb(t, 1);
      svg.innerHTML = "";
      R.fond(svg, 1);
      var m1 = S.m1, m2 = S.m2;
      // trajectoires : droites b·x − a·y + (a·y₀ − b·x₀) = 0
      R.traceDroite(svg, m1[3], -m1[2], m1[2] * m1[1] - m1[3] * m1[0], "trait-acc");
      R.traceDroite(svg, m2[3], -m2[2], m2[2] * m2[1] - m2[3] * m2[0], "trait-good");
      var K = this._croix(m1, m2);
      if (K) {
        var pk = pos(m1, K.t1);
        if (R.dansFenetre(pk.x, pk.y)) {
          var p = R.px(pk.x, pk.y);
          G.el("path", { d: "M" + (p[0] - 7) + "," + (p[1] - 7) + " L" + (p[0] + 7) + "," + (p[1] + 7) + " M" + (p[0] - 7) + "," + (p[1] + 7) + " L" + (p[0] + 7) + "," + (p[1] - 7), class: "trait-ink" }, svg);
          G.texte(svg, p[0] - 14, p[1] - 10, "K", "etiq");
        }
      }
      // positions de départ (t = 0)
      var d1 = pos(m1, 0), d2 = pos(m2, 0);
      G.point(svg, R, d1.x, d1.y, "", "point-acc");
      G.point(svg, R, d2.x, d2.y, "", "point-good");
      // positions à l'instant t, déplacement depuis le départ
      var P1 = pos(m1, t), P2 = pos(m2, t);
      if (t > 0) {
        G.fleche(svg, R, d1, P1, "trait-acc pointille", "tete-acc");
        G.fleche(svg, R, d2, P2, "trait-good pointille", "tete-good");
      }
      G.point(svg, R, P1.x, P1.y, "M₁", "point-acc", "etiq-acc", -16, -10);
      G.point(svg, R, P2.x, P2.y, "M₂", "point-good", "etiq-good", 16, -10);

      var h = '<div class="carte"><div class="carte-titre">Les deux mobiles (t en secondes)</div>' +
        '<span class="c-acc">M₁ : ' + param(m1) + '</span><br><span class="c-good">M₂ : ' + param(m2) + '</span><br>' +
        'À t = ' + G.nb(t, 1) + ' : M₁' + G.coord(P1.x, P1.y) + ' et M₂' + G.coord(P2.x, P2.y) +
        ', écart M₁M₂ ≈ ' + G.nb(Math.hypot(P1.x - P2.x, P1.y - P2.y)) + '.</div>';
      if (!K) {
        var conf = Math.abs(m1[3] * (m2[0] - m1[0]) - m1[2] * (m2[1] - m1[1])) < 1e-9;
        h += '<div class="carte"><div class="carte-titre">Les trajectoires</div>Vecteurs directeurs (' + G.nb(m1[2]) + ' ; ' + G.nb(m1[3]) + ') et (' + G.nb(m2[2]) + ' ; ' + G.nb(m2[3]) + ') colinéaires : trajectoires ' +
          (conf ? 'confondues.' : '<span class="c-bad">parallèles distinctes, aucun point commun : aucune rencontre possible.</span>') + '</div>';
      } else {
        var pk2 = pos(m1, K.t1);
        var ecart = Math.abs(K.t1 - K.t2);
        h += '<div class="carte"><div class="carte-titre">Le point de croisement K</div>Paramètres différents t₁ et t₂ : ' + G.nb(m1[0]) + terme(m1[2], 't₁') + ' = ' + G.nb(m2[0]) + terme(m2[2], 't₂') + ' et ' + G.nb(m1[1]) + terme(m1[3], 't₁') + ' = ' + G.nb(m2[1]) + terme(m2[3], 't₂') + ' ' +
          'donnent <span class="c-acc">t₁ = ' + G.nb(K.t1) + '</span> et <span class="c-good">t₂ = ' + G.nb(K.t2) + '</span>, donc K' + G.coord(pk2.x, pk2.y) + '.<br>' +
          (ecart < 1e-9 ? '<span class="c-good">t₁ = t₂ : les deux mobiles sont en K au même instant, c\'est une collision.</span>'
            : '<span class="c-bad">t₁ ≠ t₂ : écart |t₁ − t₂| = ' + G.nb(ecart) + '. Les trajectoires se coupent, mais les mobiles ne se rencontrent pas.</span>') +
          (K.t1 < 0 || K.t2 < 0 ? '<br><span class="note">Un instant négatif : ce passage en K a eu lieu avant le départ.</span>' : '') + '</div>';
      }
      this._lecture.innerHTML = h;
    }
  }

  if (!customElements.get("deux-mobiles-widget")) customElements.define("deux-mobiles-widget", DeuxMobilesWidget);
})();
