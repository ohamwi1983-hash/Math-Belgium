(function () {
  "use strict";

  /* ================================================================
   * <livre-plans-widget> — atelier (4e, ch. 8, § 2) : le livre de plans.
   * Une droite d (la reliure) et un plan qui pivote autour d'elle, comme
   * une page. Mode « Un point » : un point hors de d immobilise un seul
   * plan ; un point sur d n'arrête rien (le plan pivote toujours). Mode
   * « Deux droites » : sécantes ou parallèles, le plan s'immobilise sur
   * leur plan commun ; gauches, il ne contient jamais la seconde droite
   * (il la perce en un seul point) : aucun plan commun. Rotation de la vue
   * au doigt. Aucune coordonnée affichée.
   * Dépend de window.EspaceCommun (espace-commun.js, importé avant).
   * ================================================================ */

  var EC = window.EspaceCommun;
  var LARG = 340, HAUT = 280;
  var DEG = Math.PI / 180;
  var VITESSE = 45; // degrés par seconde

  var P_HORS = [0.4, 0.55, 0.85], P_SUR = [0.55, 0, 0];
  var SCENES = {
    secantes: { P: [-0.3, 0, 0], u: [0.7, 0.5, 0.75] },
    paralleles: { P: [0, 0.8 * Math.cos(40 * DEG), 0.8 * Math.sin(40 * DEG)], u: [1, 0, 0] },
    gauches: { P: [0.4, 0.9, 0], u: [0.3, 0, 1] }
  };
  function angleDe(y, z) { var t = Math.atan2(z, y) / DEG; t = ((t % 180) + 180) % 180; return t; }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' + EC.CSS + '.page-fantome{fill:none;stroke:var(--ink-soft,#51626f);stroke-opacity:0.4;stroke-width:1;stroke-dasharray:3 4;}</style>' +
    '<div class="modes" role="group" aria-label="Mode">' +
    '<button class="btn" type="button" data-mode="point" aria-pressed="true">Un point</button>' +
    '<button class="btn" type="button" data-mode="droites" aria-pressed="false">Deux droites</button>' +
    '</div>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + LARG + ' ' + HAUT + '" role="img" aria-label="Une droite d et un plan qui pivote autour d\'elle"></svg></div>' +
    EC.boutonsRotation(false) +
    '<div class="selection">' +
    '<div class="ligne" id="choix-point" role="group" aria-label="Point ajouté">' +
    '<button class="btn" type="button" data-pt="aucun" aria-pressed="true">Aucun point</button>' +
    '<button class="btn" type="button" data-pt="hors" aria-pressed="false">Point P hors de d</button>' +
    '<button class="btn" type="button" data-pt="sur" aria-pressed="false">Point P sur d</button>' +
    '</div>' +
    '<div class="ligne" id="choix-droites" role="group" aria-label="Seconde droite" hidden>' +
    '<button class="btn" type="button" data-dd="secantes" aria-pressed="true">Sécantes</button>' +
    '<button class="btn" type="button" data-dd="paralleles" aria-pressed="false">Parallèles</button>' +
    '<button class="btn" type="button" data-dd="gauches" aria-pressed="false">Gauches</button>' +
    '</div>' +
    '<div class="ligne"><label class="libelle" for="angle">Faire pivoter le plan</label><input type="range" id="angle" min="0" max="179" step="1" value="20"></div>' +
    '<div class="ligne"><button class="btn" type="button" id="jouer" aria-pressed="true">Pause</button></div>' +
    '</div>' +
    '<div class="carte" id="carte" aria-live="polite"></div>' +
    '<div class="bas"><button class="btn btn-reset" type="button" id="reset">Réinitialiser</button></div>';

  class LivrePlansWidget extends HTMLElement {
    constructor() {
      super();
      var sh = this.attachShadow({ mode: "open" });
      sh.appendChild(TEMPLATE.content.cloneNode(true));
      this._sh = sh;
      this._svg = sh.getElementById("svg");
      this._reduit = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
      this._defauts();
    }

    _defauts() {
      this._mode = "point";
      this._pt = "aucun";
      this._dd = "secantes";
      this._vue = { cav: false, yaw: 32, pitch: 26 };
      this._theta = 20;
      this._joue = !this._reduit;
    }

    connectedCallback() {
      var self = this, sh = this._sh;
      if (!this._pret) {
        this._pret = true;
        sh.querySelectorAll("[data-mode]").forEach(function (b) {
          b.addEventListener("click", function () { self._mode = b.getAttribute("data-mode"); self._relancer(); });
        });
        sh.querySelectorAll("[data-pt]").forEach(function (b) {
          b.addEventListener("click", function () { self._pt = b.getAttribute("data-pt"); self._relancer(); });
        });
        sh.querySelectorAll("[data-dd]").forEach(function (b) {
          b.addEventListener("click", function () { self._dd = b.getAttribute("data-dd"); self._relancer(); });
        });
        sh.querySelectorAll("[data-rot]").forEach(function (b) {
          b.addEventListener("click", function () { EC.tourner(self._vue, b.getAttribute("data-rot")); self._rendre(); });
        });
        sh.getElementById("angle").addEventListener("input", function (e) {
          if (self._cible() !== null) return;
          self._theta = +e.target.value; self._joue = false; self._rendre();
        });
        sh.getElementById("jouer").addEventListener("click", function () { self._joue = !self._joue; self._boucle(); self._rendre(); });
        sh.getElementById("reset").addEventListener("click", function () { self._defauts(); self._relancer(); });
        EC.installerRotation(this._svg, this._vue, function () { self._rendre(); });
      }
      this._relancer();
    }

    disconnectedCallback() { if (this._raf) cancelAnimationFrame(this._raf); this._raf = null; }

    /** Angle où le plan s'immobilise (un seul plan possible), sinon null. */
    _cible() {
      if (this._mode === "point") return this._pt === "hors" ? angleDe(P_HORS[1], P_HORS[2]) : null;
      if (this._dd === "secantes") { var u = SCENES.secantes.u; return angleDe(u[1], u[2]); }
      if (this._dd === "paralleles") { var P = SCENES.paralleles.P; return angleDe(P[1], P[2]); }
      return null;
    }

    _relancer() {
      if (this._cible() !== null && this._reduit) this._theta = this._cible();
      this._boucle();
      this._rendre();
    }

    _boucle() {
      var self = this;
      if (this._raf) cancelAnimationFrame(this._raf);
      this._raf = null;
      var cible = this._cible();
      if (cible === null && !this._joue) return;
      var avant = null;
      var pas = function (t) {
        if (!self.isConnected) { self._raf = null; return; }
        var dt = avant === null ? 0 : Math.min(0.05, (t - avant) / 1000);
        avant = t;
        var c = self._cible();
        if (c !== null) {
          var ecart = ((c - self._theta) % 180 + 180) % 180; // on avance toujours dans le même sens
          var avance = VITESSE * dt;
          if (ecart <= avance || ecart < 0.01) { self._theta = c; self._rendre(); self._raf = null; return; }
          self._theta = (self._theta + avance) % 180;
        } else if (self._joue) {
          self._theta = (self._theta + VITESSE * dt) % 180;
        } else { self._raf = null; return; }
        self._rendre();
        self._raf = requestAnimationFrame(pas);
      };
      this._raf = requestAnimationFrame(pas);
    }

    _rendre() {
      var sh = this._sh, self = this;
      var th = this._theta * DEG, c = Math.cos(th), s = Math.sin(th);
      var cible = this._cible();
      var immobile = cible !== null && Math.abs(this._theta - cible) < 0.01;
      sh.querySelectorAll("[data-mode]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-mode") === self._mode)); });
      sh.querySelectorAll("[data-pt]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-pt") === self._pt)); });
      sh.querySelectorAll("[data-dd]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-dd") === self._dd)); });
      sh.getElementById("choix-point").hidden = this._mode !== "point";
      sh.getElementById("choix-droites").hidden = this._mode !== "droites";
      var curseur = sh.getElementById("angle");
      curseur.value = String(Math.round(this._theta) % 180);
      curseur.disabled = cible !== null;
      var jouer = sh.getElementById("jouer");
      jouer.disabled = cible !== null;
      jouer.textContent = this._joue ? "Pause" : "Faire pivoter";
      jouer.setAttribute("aria-pressed", String(this._joue));

      var R = 1.25, Lx = 1.55;
      var page = [[-Lx, -R * c, -R * s], [Lx, -R * c, -R * s], [Lx, R * c, R * s], [-Lx, R * c, R * s]];
      var scene = { cube: false, centre: [0, 0, 0], rayon: 2.05, centreEtiquettes: [0, -0.6, -0.9], polys: [], segs: [], points: [] };
      if (cible === null) {
        // pages « fantômes » : quelques autres positions du plan autour de la reliure
        [0, 60, 120].forEach(function (g) {
          var cg = Math.cos(g * DEG), sg = Math.sin(g * DEG);
          scene.polys.push({ pts: [[-Lx, -R * cg, -R * sg], [Lx, -R * cg, -R * sg], [Lx, R * cg, R * sg], [-Lx, R * cg, R * sg]], cls: "page-fantome" });
        });
      }
      scene.polys.push({ pts: page, cls: immobile ? "plan-ok" : "plan" });
      scene.segs.push({ a: [-1.85, 0, 0], b: [1.85, 0, 0], cls: "d1" });
      scene.points.push({ X: [1.85, 0, 0], nom: "d", cls: "pt", r: 0.01, etiq: "etiq etiq-d", decalage: 12 });
      var texte = "";
      if (this._mode === "point") {
        if (this._pt === "aucun") texte = "<div class=\"verdict\">Une infinité de plans</div><div>Un plan qui contient d peut encore pivoter autour d'elle, comme les pages d'un livre autour de leur reliure. Ajoute un point.</div>";
        if (this._pt === "hors") {
          scene.points.push({ X: P_HORS, nom: "P", cls: "pt-inter", r: 5, etiq: "etiq etiq-m" });
          texte = immobile
            ? "<div class=\"verdict\">Un seul plan : le plan (d, P)</div><div>P n'est pas sur d : dès que la page atteint P, elle ne peut plus tourner sans le quitter. Une droite et un point hors de cette droite déterminent un plan.</div>"
            : "<div class=\"verdict\">Le plan cherche P…</div><div>La page tourne autour de d jusqu'à contenir P.</div>";
        }
        if (this._pt === "sur") {
          scene.points.push({ X: P_SUR, nom: "P", cls: "pt-inter", r: 5, etiq: "etiq etiq-m", decalage: 16 });
          texte = "<div class=\"verdict\">Toujours une infinité de plans</div><div>P est sur d : chaque position de la page contient P. Une droite et un point de cette droite ne déterminent pas un plan — il faut un point hors de la droite.</div>";
        }
      } else {
        var sc = SCENES[this._dd];
        var a = EC.add(sc.P, EC.mul(-1.6, sc.u)), b = EC.add(sc.P, EC.mul(1.6, sc.u));
        var seg = EC.segmentDroite(sc.P, sc.u, { lo: [-1.9, -1.4, -1.4], hi: [1.9, 1.4, 1.4] });
        if (seg) { a = seg[0]; b = seg[1]; }
        scene.segs.push({ a: a, b: b, cls: "d2" });
        scene.points.push({ X: b, nom: "d₂", cls: "pt", r: 0.01, etiq: "etiq etiq-d2", decalage: 12 });
        if (this._dd === "secantes") {
          scene.points.push({ X: sc.P, cls: "pt-choisi", r: 4.2 });
          texte = immobile
            ? "<div class=\"verdict\">Un seul plan commun</div><div>d et d₂ sont sécantes : un seul plan les contient toutes les deux.</div>"
            : "<div class=\"verdict\">Le plan cherche d₂…</div><div>La page tourne autour de d jusqu'à contenir d₂.</div>";
        } else if (this._dd === "paralleles") {
          texte = immobile
            ? "<div class=\"verdict\">Un seul plan commun</div><div>d et d₂ sont parallèles et distinctes : un seul plan les contient toutes les deux.</div>"
            : "<div class=\"verdict\">Le plan cherche d₂…</div><div>La page tourne autour de d jusqu'à contenir d₂.</div>";
        } else {
          // point où la page perce d₂ : (0,9 ; t) colinéaire à (cos θ ; sin θ)
          if (Math.abs(c) > 0.2) {
            var t = 0.9 * s / c, M = EC.add(sc.P, EC.mul(t, sc.u));
            if (Math.abs(M[2]) < 1.4) scene.points.push({ X: M, nom: "M", cls: "pt-inter", r: 5, etiq: "etiq etiq-m" });
          }
          texte = "<div class=\"verdict\">Aucun plan commun</div><div>d et d₂ sont gauches : à chaque position, la page qui contient d perce d₂ en un seul point M (ou lui est parallèle), sans jamais la contenir. Aucun plan ne contient les deux droites.</div>";
        }
      }
      EC.dessiner(this._svg, this._vue, scene, LARG, HAUT);
      sh.getElementById("carte").innerHTML = texte;
    }
  }

  if (!customElements.get("livre-plans-widget")) customElements.define("livre-plans-widget", LivrePlansWidget);
})();
