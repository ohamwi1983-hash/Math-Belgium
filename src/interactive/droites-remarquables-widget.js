(function () {
  "use strict";

  /* ================================================================
   * <droites-remarquables-widget> — atelier « Droites remarquables »
   * (4e, ch. 7, § 6). A, B et C à coordonnées entières, déplaçables. Trois
   * familles à afficher : médiatrices (vecteur normal = un côté, par son
   * milieu), hauteurs (vecteur normal = le côté opposé, par le sommet),
   * médianes (par le sommet et le milieu du côté opposé). Chaque droite
   * est tracée avec son équation cartésienne à coefficients entiers, et le
   * point de concours O, H ou G est calculé en valeurs exactes (fractions).
   * Défaut : A(0 ; 0), B(6 ; 0), C(2 ; 4) — l'exemple du cours, H(2 ; 2).
   * Fenêtre FIXE. Pendant de gen94. Web Component (Shadow DOM).
   * ================================================================ */

  var G = window.GeoAnaCommun;
  var FEN = { xMin: -3, xMax: 9, yMin: -3, yMax: 8 };
  var R = G.repere(FEN, 40, 14);
  var BORNE = { xMin: -2, xMax: 8, yMin: -2, yMax: 7 };
  var NOMS = ["A", "B", "C"];
  var FAMILLES = {
    mediatrices: { nom: "Médiatrices", trait: "trait-plan pointille", pt: "point-plan", etiq: "etiq-plan", c: "c-plan", concours: "O", role: "centre du cercle circonscrit" },
    hauteurs: { nom: "Hauteurs", trait: "trait-good pointille", pt: "point-good", etiq: "etiq-good", c: "c-good", concours: "H", role: "orthocentre" },
    medianes: { nom: "Médianes", trait: "trait-acc pointille", pt: "point-acc", etiq: "etiq-acc", c: "c-acc", concours: "G", role: "centre de gravité" },
  };

  function defaut() { return { A: { x: 0, y: 0 }, B: { x: 6, y: 0 }, C: { x: 2, y: 4 } }; }
  function c2(P) { return P.x * P.x + P.y * P.y; }

  /** Les trois droites d'une famille, chacune [a, b, c] réduite, avec son libellé. */
  function droites(fam, T) {
    var res = [];
    var tri = [["A", "B", "C"], ["B", "C", "A"], ["C", "A", "B"]];
    tri.forEach(function (t) {
      var S = T[t[0]], P = T[t[1]], Q = T[t[2]];
      var a, b, c, lib;
      if (fam === "mediatrices") {
        a = 2 * (Q.x - P.x); b = 2 * (Q.y - P.y); c = -(c2(Q) - c2(P));
        lib = "médiatrice de [" + t[1] + t[2] + "]";
      } else if (fam === "hauteurs") {
        a = Q.x - P.x; b = Q.y - P.y; c = -(a * S.x + b * S.y);
        lib = "hauteur issue de " + t[0];
      } else {
        var u = P.x + Q.x - 2 * S.x, v = P.y + Q.y - 2 * S.y;
        a = v; b = -u; c = -(v * S.x - u * S.y);
        lib = "médiane issue de " + t[0];
      }
      res.push({ eq: G.reduire(a, b, c), lib: lib });
    });
    return res;
  }

  /** Intersection exacte de deux droites entières : { xn, yn, q } (x = xn / q, y = yn / q). */
  function inter(d1, d2) {
    var a1 = d1[0], b1 = d1[1], c1 = -d1[2], a2 = d2[0], b2 = d2[1], c2_ = -d2[2];
    var q = a1 * b2 - b1 * a2;
    if (q === 0) return null;
    return { xn: c1 * b2 - b1 * c2_, yn: a1 * c2_ - c1 * a2, q: q };
  }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' + G.CSS + '</style>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + R.L + ' ' + R.H + '" role="img" aria-label="Triangle ABC, ses droites remarquables et leur point de concours"></svg></div>' +
    '<div class="lecture" id="lecture" aria-live="polite"></div>' +
    '<div class="controles">' +
    '<div class="rangee"><span class="libelle">Afficher :</span>' +
    '<button class="btn" type="button" data-famille="mediatrices" aria-pressed="false">Médiatrices</button>' +
    '<button class="btn" type="button" data-famille="hauteurs" aria-pressed="true">Hauteurs</button>' +
    '<button class="btn" type="button" data-famille="medianes" aria-pressed="false">Médianes</button></div>' +
    '<div class="rangee"><span class="libelle">Point à déplacer :</span>' +
    '<button class="btn" type="button" data-point="A">A</button><button class="btn" type="button" data-point="B">B</button><button class="btn" type="button" data-point="C">C</button></div>' +
    '<div class="rangee">' +
    '<button class="btn" type="button" data-dx="-1" data-dy="0" aria-label="Déplacer vers la gauche">←</button>' +
    '<button class="btn" type="button" data-dx="0" data-dy="1" aria-label="Déplacer vers le haut">↑</button>' +
    '<button class="btn" type="button" data-dx="0" data-dy="-1" aria-label="Déplacer vers le bas">↓</button>' +
    '<button class="btn" type="button" data-dx="1" data-dy="0" aria-label="Déplacer vers la droite">→</button></div>' +
    '<div class="rangee"><button class="btn btn-reset" type="button" id="reset">Réinitialiser</button></div></div>';

  class DroitesRemarquablesWidget extends HTMLElement {
    constructor() {
      super();
      var sh = this.attachShadow({ mode: "open" });
      sh.appendChild(TEMPLATE.content.cloneNode(true));
      this._svg = sh.getElementById("svg");
      this._lecture = sh.getElementById("lecture");
      this._ecouteurs = [];
      this._T = defaut();
      this._point = "C";
      this._familles = { mediatrices: false, hauteurs: true, medianes: false };
    }

    connectedCallback() {
      var self = this, sh = this.shadowRoot;
      function ecoute(c, t, f) { c.addEventListener(t, f); self._ecouteurs.push([c, t, f]); }
      Array.prototype.forEach.call(sh.querySelectorAll("[data-famille]"), function (b) {
        ecoute(b, "click", function () { var f = b.getAttribute("data-famille"); self._familles[f] = !self._familles[f]; self._rendre(); });
      });
      Array.prototype.forEach.call(sh.querySelectorAll("[data-point]"), function (b) {
        ecoute(b, "click", function () { self._point = b.getAttribute("data-point"); self._rendre(); });
      });
      Array.prototype.forEach.call(sh.querySelectorAll("[data-dx]"), function (b) {
        ecoute(b, "click", function () {
          var p = self._T[self._point];
          self._deplacer(self._point, p.x + parseInt(b.getAttribute("data-dx"), 10), p.y + parseInt(b.getAttribute("data-dy"), 10));
        });
      });
      ecoute(sh.getElementById("reset"), "click", function () {
        self._T = defaut(); self._point = "C"; self._familles = { mediatrices: false, hauteurs: true, medianes: false }; self._rendre();
      });
      G.glisser(this, this._svg, R, function (n) { self._point = n; self._rendre(); }, function (n, x, y) { self._deplacer(n, Math.round(x), Math.round(y)); });
      this._rendre();
    }

    disconnectedCallback() {
      this._ecouteurs.forEach(function (t) { t[0].removeEventListener(t[1], t[2]); });
      this._ecouteurs = [];
    }

    _deplacer(n, x, y) {
      x = G.borner(x, BORNE.xMin, BORNE.xMax); y = G.borner(y, BORNE.yMin, BORNE.yMax);
      var T = this._T, autres = NOMS.filter(function (m) { return m !== n; });
      for (var i = 0; i < autres.length; i++) if (T[autres[i]].x === x && T[autres[i]].y === y) return;
      if (T[n].x === x && T[n].y === y) return;
      T[n] = { x: x, y: y };
      this._rendre();
    }

    _rendre() {
      var sh = this.shadowRoot, svg = this._svg, T = this._T, self = this;
      Array.prototype.forEach.call(sh.querySelectorAll("[data-famille]"), function (b) { b.setAttribute("aria-pressed", self._familles[b.getAttribute("data-famille")] ? "true" : "false"); });
      Array.prototype.forEach.call(sh.querySelectorAll("[data-point]"), function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-point") === self._point ? "true" : "false"); });
      svg.innerHTML = "";
      R.fond(svg, 2);
      var aligne = (T.B.x - T.A.x) * (T.C.y - T.A.y) - (T.B.y - T.A.y) * (T.C.x - T.A.x) === 0;
      var poly = NOMS.map(function (n) { var p = R.px(T[n].x, T[n].y); return p[0] + "," + p[1]; }).join(" ");
      G.el("polygon", { points: poly, class: "trait-ink" }, svg);
      var cartes = [];
      var points = [];
      if (aligne) {
        cartes.push('<div class="carte"><span class="c-bad">A, B et C sont alignés</span> : ce n\'est pas un triangle. Déplace un des trois points.</div>');
      } else {
        Object.keys(FAMILLES).forEach(function (f) {
          if (!self._familles[f]) return;
          var F = FAMILLES[f], ds = droites(f, T);
          ds.forEach(function (d) { R.traceDroite(svg, d.eq[0], d.eq[1], d.eq[2], F.trait); });
          var X = inter(ds[0].eq, ds[1].eq);
          var lignes = ds.map(function (d) { return d.lib + ' : <span class="' + F.c + '">' + G.equationDroite(d.eq[0], d.eq[1], d.eq[2]) + '</span>'; });
          var concours = '';
          if (X) {
            var x = X.xn / X.q, y = X.yn / X.q;
            var verif = ds[2].eq[0] * X.xn + ds[2].eq[1] * X.yn + ds[2].eq[2] * X.q === 0;
            points.push({ x: x, y: y, F: F });
            concours = '<br>Point de concours, ' + F.role + ' : <span class="' + F.c + '">' + F.concours + '(' + G.frac(X.xn, X.q) + '\u00a0;\u00a0' + G.frac(X.yn, X.q) + ')</span>' +
              (verif ? ' — il vérifie aussi l\'équation de la troisième droite.' : '') +
              (R.dansFenetre(x, y) ? '' : ' <span class="note">(hors du cadre)</span>');
          }
          cartes.push('<div class="carte"><div class="carte-titre">' + F.nom + '</div>' + lignes.join('<br>') + concours + '</div>');
        });
        if (cartes.length === 0) cartes.push('<div class="carte">Choisis une famille de droites à afficher : médiatrices, hauteurs ou médianes.</div>');
      }
      points.forEach(function (P) { if (R.dansFenetre(P.x, P.y)) G.point(svg, R, P.x, P.y, P.F.concours, P.F.pt, P.F.etiq, 14, 16); });
      var decal = { A: [-14, -8], B: [14, -8], C: [0, -12] };
      NOMS.forEach(function (n) { G.point(svg, R, T[n].x, T[n].y, n, "point", "etiq", decal[n][0], decal[n][1]); });
      NOMS.forEach(function (n) { G.poignee(svg, R, T[n].x, T[n].y, n, self._point === n); });
      this._lecture.innerHTML = '<div class="carte"><div class="carte-titre">Le triangle</div>A' + G.coord(T.A.x, T.A.y) + ', B' + G.coord(T.B.x, T.B.y) + ', C' + G.coord(T.C.x, T.C.y) + '</div>' + cartes.join('');
    }
  }

  if (!customElements.get("droites-remarquables-widget")) customElements.define("droites-remarquables-widget", DroitesRemarquablesWidget);
})();
