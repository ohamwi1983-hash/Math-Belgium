(function () {
  "use strict";

  /* ================================================================
   * <deux-plans-cube-widget> — atelier (4e, ch. 8, § 5) : deux plans du
   * cube ABCDEFGH, nommés chacun par trois points (sommets, milieux,
   * centres). L'atelier dit s'ils sont confondus (« deux noms pour un même
   * plan »), parallèles ou sécants ; s'ils sont sécants, il trace leur
   * droite commune et les points communs construits dans une même face
   * (rencontre des traces des deux plans dans cette face). Rotation au
   * doigt. Pendant libre de gen101. Calculs exacts, aucune coordonnée
   * affichée, aucun « déterminant ».
   * Dépend de window.EspaceCommun (espace-commun.js, importé avant).
   * ================================================================ */

  var EC = window.EspaceCommun;
  var LARG = 340, HAUT = 300;

  var PRESETS = {
    cours: { p: ["A", "C", "G"], q: ["B", "D", "H"], lib: "(ACGE) et (BDHF)" },
    noms: { p: ["A", "B", "J"], q: ["E", "F", "I"], lib: "(ABJ) et (EFI)" },
    paralleles: { p: ["A", "F", "H"], q: ["B", "D", "G"], lib: "(AFH) et (BDG)" },
    construit: { p: ["A", "C", "F"], q: ["B", "D", "G"], lib: "(ACF) et (BDG)" }
  };

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' + EC.CSS + '</style>' +
    '<div class="modes" role="group" aria-label="Exemples">' +
    '<button class="btn" type="button" data-preset="cours">Sécants</button>' +
    '<button class="btn" type="button" data-preset="construit">Point construit</button>' +
    '<button class="btn" type="button" data-preset="paralleles">Parallèles</button>' +
    '<button class="btn" type="button" data-preset="noms">Deux noms, un plan</button>' +
    '</div>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + LARG + ' ' + HAUT + '" role="img" aria-label="Cube ABCDEFGH et les deux plans choisis"></svg></div>' +
    EC.boutonsRotation() +
    '<div class="selection">' +
    '<div class="ligne"><span class="libelle cp">Plan 1 : (</span>' + EC.select("p1", null, "Premier point du plan 1") + EC.select("p2", null, "Deuxième point du plan 1") + EC.select("p3", null, "Troisième point du plan 1") + '<span class="libelle cp">)</span></div>' +
    '<div class="ligne"><span class="libelle c2">Plan 2 : (</span>' + EC.select("q1", null, "Premier point du plan 2") + EC.select("q2", null, "Deuxième point du plan 2") + EC.select("q3", null, "Troisième point du plan 2") + '<span class="libelle c2">)</span></div>' +
    '<div class="note">' + EC.NOTE_POINTS + '</div>' +
    '</div>' +
    '<div class="message" id="message" aria-live="polite"></div>' +
    '<div class="carte" id="carte" aria-live="polite"></div>' +
    '<div class="bas"><button class="btn btn-reset" type="button" id="reset">Réinitialiser</button></div>';

  function ensemble(noms) { return noms.filter(function (c, i) { return noms.indexOf(c) === i; }); }

  class DeuxPlansCubeWidget extends HTMLElement {
    constructor() {
      super();
      var sh = this.attachShadow({ mode: "open" });
      sh.appendChild(TEMPLATE.content.cloneNode(true));
      this._sh = sh;
      this._svg = sh.getElementById("svg");
      this._defauts();
    }

    _defauts() {
      this._vue = { cav: true, yaw: 30, pitch: 20 };
      this._p = PRESETS.cours.p.slice();
      this._q = PRESETS.cours.q.slice();
    }

    connectedCallback() {
      if (this._pret) return;
      this._pret = true;
      var self = this, sh = this._sh;
      sh.querySelectorAll("[data-preset]").forEach(function (b) {
        b.addEventListener("click", function () {
          var pr = PRESETS[b.getAttribute("data-preset")];
          self._p = pr.p.slice(); self._q = pr.q.slice(); self._vue.cav = true;
          self._majSelects(); self._rendre();
        });
      });
      sh.querySelectorAll("[data-rot]").forEach(function (b) {
        b.addEventListener("click", function () { EC.tourner(self._vue, b.getAttribute("data-rot")); self._rendre(); });
      });
      sh.querySelector("[data-cav]").addEventListener("click", function () { self._vue.cav = true; self._rendre(); });
      ["p1", "p2", "p3", "q1", "q2", "q3"].forEach(function (id, k) {
        sh.getElementById(id).addEventListener("change", function (e) {
          (k < 3 ? self._p : self._q)[k % 3] = e.target.value; self._rendre();
        });
      });
      sh.getElementById("reset").addEventListener("click", function () { self._defauts(); self._majSelects(); self._rendre(); });
      EC.installerRotation(this._svg, this._vue, function () { self._rendre(); });
      this._majSelects();
      this._rendre();
    }

    _majSelects() {
      var sh = this._sh, self = this;
      ["p1", "p2", "p3"].forEach(function (id, k) { sh.getElementById(id).value = self._p[k]; });
      ["q1", "q2", "q3"].forEach(function (id, k) { sh.getElementById(id).value = self._q[k]; });
    }

    /** Calcul de la situation (exposé pour les tests). */
    _analyse() {
      var p = this._p, q = this._q;
      if (ensemble(p).length < 3 || ensemble(q).length < 3) return { msg: "Choisis trois points différents pour chaque plan." };
      var P1 = EC.plan(p), P2 = EC.plan(q);
      if (!P1 || !P2) return { msg: "Trois points alignés ne déterminent aucun plan : choisis trois points non alignés." };
      var pos = EC.deuxPlans(P1, P2);
      var res = { P1: P1, P2: P2, type: pos.type, pos: pos };
      if (pos.type === "confondus") {
        res.titre = "Plans confondus";
        res.justif = "Les trois points " + q.join(", ").replace(/, ([^,]*)$/, " et $1") + " sont tous dans le plan " + P1.nom +
          " : " + P1.nom + " et " + P2.nom + " sont deux noms pour un même plan.";
        return res;
      }
      if (pos.type === "paralleles") {
        res.titre = "Plans parallèles";
        var t = this._temoins(P1, P2);
        res.justif = t
          ? "Aucun point commun. " + t[0].nom + " et " + t[1].nom + ", deux droites sécantes du plan " + P1.nom +
            ", sont parallèles à " + t[2].nom + " et " + t[3].nom + ", deux droites du plan " + P2.nom + " : les plans sont parallèles."
          : "Les deux plans n'ont aucun point commun : ils sont parallèles.";
        return res;
      }
      // sécants : points nommés communs, puis points construits sur le bord du cube
      var communs = EC.pointsDuPlan(P1).filter(function (c) { return EC.contient(P2, EC.PTS[c]); });
      var seg = EC.segmentDroite(pos.P, pos.u, EC.CUBE);
      var construits = [];
      if (seg) {
        seg.forEach(function (X, i) {
          var M = EC.versRat(X);
          var nm = M && EC.nomPoint(M);
          var loc = M ? EC.localiser(M, i === 0 ? "X" : "Y") : null;
          construits.push({ X: X, nom: nm || (i === 0 ? "X" : "Y"), loc: loc, face: EC.faceDe(X), nomme: !!nm });
        });
      }
      res.communs = communs;
      res.construits = construits;
      res.seg = seg;
      res.titre = "Plans sécants";
      var etapes = [];
      if (communs.length >= 2) {
        etapes.push("Deux points nommés appartiennent aux deux plans : " + communs[0] + " et " + communs[1] + ".");
        etapes.push("Leur droite commune est donc (" + communs[0] + communs[1] + ").");
      } else {
        if (communs.length === 1) etapes.push("Le point " + communs[0] + " appartient aux deux plans : c'est un premier point commun.");
        construits.forEach(function (c) {
          if (communs.indexOf(c.nom) >= 0) return;
          if (etapes.length >= 2) return;
          var face = c.face ? EC.FACES[c.face].nom : null;
          var ou = !c.loc ? "un point du bord du cube" : (face && c.loc.txt.indexOf("intérieur de la face") >= 0 ? c.nom : c.loc.txt);
          etapes.push((face ? "Dans la face " + face + ", les traces des deux plans (pointillés) se coupent en " : "Point commun : ") + ou + ".");
        });
        var noms = communs.concat(construits.filter(function (c) { return communs.indexOf(c.nom) < 0; }).map(function (c) { return c.nom; })).slice(0, 2);
        if (noms.length === 2) etapes.push("Deux points communs distincts : la droite commune est (" + noms[0] + noms[1] + ").");
        else etapes.push("La droite commune passe hors du cube : prolonge les traces des plans dans le plan d'une face.");
      }
      res.etapes = etapes;
      return res;
    }

    /** Deux droites sécantes du plan A parallèles à deux droites du plan B (noms de points). */
    _temoins(A, B) {
      var dA = EC.droitesNommees(EC.pointsDuPlan(A)), dB = EC.droitesNommees(EC.pointsDuPlan(B));
      var paires = [];
      dA.forEach(function (L) {
        var M = null;
        dB.forEach(function (K) { if (!M && EC.nul(EC.cross(L.u, K.u))) M = K; });
        if (M) paires.push([L, M]);
      });
      for (var i = 0; i < paires.length; i++) for (var j = i + 1; j < paires.length; j++) {
        if (!EC.nul(EC.cross(paires[i][0].u, paires[j][0].u))) return [paires[i][0], paires[j][0], paires[i][1], paires[j][1]];
      }
      return null;
    }

    _rendre() {
      var sh = this._sh, a = this._analyse();
      sh.getElementById("message").textContent = a.msg || "";
      var scene = { polys: [], segs: [], points: [] };
      var choisis = this._p.concat(this._q);
      if (!a.msg) {
        var bx = EC.boite();
        scene.polys.push({ pts: EC.planBoite(a.P1.V, a.P1.n, bx), cls: "plan" });
        if (a.type !== "confondus") scene.polys.push({ pts: EC.planBoite(a.P2.V, a.P2.n, bx), cls: "plan2" });
        if (a.type === "secants") {
          var grand = EC.segmentDroite(a.pos.P, a.pos.u, bx);
          if (grand) scene.segs.push({ a: grand[0], b: grand[1], cls: "inter" });
          // traces des deux plans dans les faces des points construits
          (a.construits || []).forEach(function (c) {
            if (!c.face) return;
            var f = EC.FACES[c.face], V0 = EC.PTS[f.nom[0]];
            [a.P1, a.P2].forEach(function (pl) {
              var pos = EC.deuxPlans({ V: V0, n: f.n }, pl);
              if (pos.type !== "secants") return;
              var s = EC.segmentDroite(pos.P, pos.u, EC.CUBE);
              if (s) scene.segs.push({ a: s[0], b: s[1], cls: "trace" });
            });
            scene.points.push({ X: c.X, nom: EC.SOMMETS.indexOf(c.nom) >= 0 ? null : c.nom, cls: "pt-inter", r: 5, etiq: "etiq etiq-m" });
          });
        }
      }
      EC.NOMS.forEach(function (nm) {
        var estSommet = EC.SOMMETS.indexOf(nm) >= 0, choisi = choisis.indexOf(nm) >= 0;
        if (!estSommet && !choisi) return;
        scene.points.push({ X: EC.PTS[nm], nom: nm, cls: choisi ? "pt-choisi" : "pt", r: choisi ? 4.2 : 2.6, etiq: estSommet ? "etiq" : "etiq etiq-n" });
      });
      EC.dessiner(this._svg, this._vue, scene, LARG, HAUT);
      var carte = sh.getElementById("carte");
      if (a.msg) { carte.hidden = true; carte.innerHTML = ""; return; }
      carte.hidden = false;
      var html = '<div class="verdict">' + a.titre + '</div>';
      if (a.etapes) html += "<ol>" + a.etapes.map(function (e) { return "<li>" + e + "</li>"; }).join("") + "</ol>";
      else html += "<div>" + a.justif + "</div>";
      if (a.type === "secants" && this._vue.cav) html += '<div class="note">Deux morceaux de plans qui ne se touchent pas sur le dessin peuvent être sécants : fais tourner le cube.</div>';
      carte.innerHTML = html;
    }
  }

  if (!customElements.get("deux-plans-cube-widget")) customElements.define("deux-plans-cube-widget", DeuxPlansCubeWidget);
})();
