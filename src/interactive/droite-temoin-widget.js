(function () {
  "use strict";

  /* ================================================================
   * <droite-temoin-widget> — atelier (4e, ch. 8, § 7) : la droite témoin.
   * Mode « Droite et plan » : on choisit une droite d et un plan α ; les
   * droites du cube (par deux points nommés) parallèles à d s'allument :
   * en vert celles qui sont DANS α (vraies témoins), en rouge pointillé
   * celles qui sont hors de α (« fausses témoins » : elles ne prouvent
   * rien). Mode « Deux plans » : les droites de α parallèles au plan β ; il
   * faut deux témoins SÉCANTES pour conclure que α ∥ β. Pendant libre de
   * gen103. Calculs exacts, aucune coordonnée affichée.
   * Dépend de window.EspaceCommun (espace-commun.js, importé avant).
   * ================================================================ */

  var EC = window.EspaceCommun;
  var LARG = 340, HAUT = 300;
  var DROITES = null;
  function droitesCube() { if (!DROITES) DROITES = EC.droitesNommees(EC.NOMS); return DROITES; }
  function liste(noms) { return noms.length === 1 ? noms[0] : noms.slice(0, -1).join(", ") + " et " + noms[noms.length - 1]; }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' + EC.CSS + '</style>' +
    '<div class="modes" role="group" aria-label="Mode">' +
    '<button class="btn" type="button" data-mode="droite" aria-pressed="true">Droite et plan</button>' +
    '<button class="btn" type="button" data-mode="plans" aria-pressed="false">Deux plans</button>' +
    '</div>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + LARG + ' ' + HAUT + '" role="img" aria-label="Cube, droite ou plans choisis et droites témoins"></svg></div>' +
    EC.boutonsRotation() +
    '<div class="selection">' +
    '<div class="ligne" id="ligne-d"><span class="libelle c1">Droite d : (</span>' + EC.select("a", null, "Premier point de d") + EC.select("b", null, "Second point de d") + '<span class="libelle c1">)</span></div>' +
    '<div class="ligne"><span class="libelle cp">Plan α : (</span>' + EC.select("p1", null, "Premier point de alpha") + EC.select("p2", null, "Deuxième point de alpha") + EC.select("p3", null, "Troisième point de alpha") + '<span class="libelle cp">)</span></div>' +
    '<div class="ligne" id="ligne-b" hidden><span class="libelle c2">Plan β : (</span>' + EC.select("q1", null, "Premier point de beta") + EC.select("q2", null, "Deuxième point de beta") + EC.select("q3", null, "Troisième point de beta") + '<span class="libelle c2">)</span></div>' +
    '<div class="note"><span class="cok">Vert</span> : témoin dans le plan. <span class="cko">Rouge pointillé</span> : parallèle, mais hors du plan.</div>' +
    '<div class="note">' + EC.NOTE_POINTS + '</div>' +
    '</div>' +
    '<div class="message" id="message" aria-live="polite"></div>' +
    '<div class="carte" id="carte" aria-live="polite"></div>' +
    '<div class="bas"><button class="btn btn-reset" type="button" id="reset">Réinitialiser</button></div>';

  class DroiteTemoinWidget extends HTMLElement {
    constructor() {
      super();
      var sh = this.attachShadow({ mode: "open" });
      sh.appendChild(TEMPLATE.content.cloneNode(true));
      this._sh = sh;
      this._svg = sh.getElementById("svg");
      this._defauts();
    }

    _defauts() {
      this._mode = "droite";
      this._vue = { cav: true, yaw: 30, pitch: 20 };
      this._d = ["I", "J"];
      this._al = ["A", "B", "C"];
      this._be = ["E", "F", "G"];
    }

    connectedCallback() {
      if (this._pret) return;
      this._pret = true;
      var self = this, sh = this._sh;
      sh.querySelectorAll("[data-mode]").forEach(function (b) {
        b.addEventListener("click", function () {
          self._mode = b.getAttribute("data-mode");
          if (self._mode === "plans") { self._al = ["A", "F", "H"]; self._be = ["B", "D", "G"]; }
          else { self._d = ["I", "J"]; self._al = ["A", "B", "C"]; }
          self._majSelects(); self._rendre();
        });
      });
      sh.querySelectorAll("[data-rot]").forEach(function (b) {
        b.addEventListener("click", function () { EC.tourner(self._vue, b.getAttribute("data-rot")); self._rendre(); });
      });
      sh.querySelector("[data-cav]").addEventListener("click", function () { self._vue.cav = true; self._rendre(); });
      ["a", "b"].forEach(function (id, k) { sh.getElementById(id).addEventListener("change", function (e) { self._d[k] = e.target.value; self._rendre(); }); });
      ["p1", "p2", "p3"].forEach(function (id, k) { sh.getElementById(id).addEventListener("change", function (e) { self._al[k] = e.target.value; self._rendre(); }); });
      ["q1", "q2", "q3"].forEach(function (id, k) { sh.getElementById(id).addEventListener("change", function (e) { self._be[k] = e.target.value; self._rendre(); }); });
      sh.getElementById("reset").addEventListener("click", function () { var m = self._mode; self._defauts(); if (m === "plans") { self._mode = m; self._al = ["A", "F", "H"]; self._be = ["B", "D", "G"]; } self._majSelects(); self._rendre(); });
      EC.installerRotation(this._svg, this._vue, function () { self._rendre(); });
      this._majSelects();
      this._rendre();
    }

    _majSelects() {
      var sh = this._sh, self = this;
      sh.getElementById("a").value = this._d[0]; sh.getElementById("b").value = this._d[1];
      ["p1", "p2", "p3"].forEach(function (id, k) { sh.getElementById(id).value = self._al[k]; });
      ["q1", "q2", "q3"].forEach(function (id, k) { sh.getElementById(id).value = self._be[k]; });
      sh.querySelectorAll("[data-mode]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-mode") === self._mode)); });
      sh.getElementById("ligne-d").hidden = this._mode !== "droite";
      sh.getElementById("ligne-b").hidden = this._mode !== "plans";
    }

    /** Calcul des témoins (exposé pour les tests). */
    _analyse() {
      var al = this._al;
      if (al[0] === al[1] || al[0] === al[2] || al[1] === al[2]) return { msg: "Choisis trois points différents pour le plan α." };
      var A = EC.plan(al);
      if (!A) return { msg: "Ces trois points sont alignés : ils ne déterminent pas de plan." };
      if (this._mode === "droite") {
        var d = this._d;
        if (d[0] === d[1]) return { msg: "Choisis deux points différents pour la droite d." };
        var L = EC.droite(d[0], d[1]);
        var temoins = [], fausses = [];
        droitesCube().forEach(function (K) {
          if (!EC.nul(EC.cross(K.u, L.u)) || EC.memeDroite(K, L)) return;
          (EC.contientDroite(A, K) ? temoins : fausses).push(K);
        });
        var res = { A: A, L: L, temoins: temoins, fausses: fausses };
        if (EC.contientDroite(A, L)) { res.titre = "d est incluse dans α"; res.justif = d[0] + " et " + d[1] + " sont tous les deux dans le plan " + A.nom + "."; }
        else if (temoins.length) {
          res.titre = "d est parallèle à α";
          res.justif = "d = " + L.nom + " est parallèle à " + temoins[0].nom + ", une droite du plan " + A.nom + ", et " + (EC.contient(A, L.P) ? d[1] : d[0]) +
            " n'est pas dans ce plan : la droite est parallèle au plan. Témoins dans le plan : " + liste(temoins.map(function (K) { return K.nom; })) + ".";
        } else if (EC.percee(L, A)) {
          res.titre = "Aucune témoin dans α";
          res.justif = "Aucune droite du plan " + A.nom + " n'est parallèle à " + L.nom + " : la droite n'est pas parallèle au plan, elle le perce.";
        } else {
          res.titre = "d est parallèle à α, sans témoin tracée";
          res.justif = L.nom + " ne perce pas le plan " + A.nom + ", mais aucune droite qui joint deux points nommés de ce plan ne lui est parallèle : pour le démontrer, il faudrait construire une droite témoin dans le plan.";
        }
        if (fausses.length) res.note = "Fausses témoins (parallèles à d, hors de α) : " + liste(fausses.map(function (K) { return K.nom; })) + ". Elles ne prouvent rien : une parallèle à d qui n'est pas dans le plan ne dit pas si d le perce.";
        return res;
      }
      var be = this._be;
      if (be[0] === be[1] || be[0] === be[2] || be[1] === be[2]) return { msg: "Choisis trois points différents pour le plan β." };
      var B = EC.plan(be);
      if (!B) return { msg: "Ces trois points sont alignés : ils ne déterminent pas de plan β." };
      var pos = EC.deuxPlans(A, B);
      var r = { A: A, B: B, type: pos.type, temoins: [], fausses: [] };
      if (pos.type === "confondus") { r.titre = "Plans confondus"; r.justif = A.nom + " et " + B.nom + " sont deux noms pour un même plan."; return r; }
      var dansB = droitesCube().filter(function (K) { return EC.contientDroite(B, K); });
      droitesCube().forEach(function (K) {
        if (!EC.contientDroite(A, K)) return;
        var par = dansB.filter(function (M) { return EC.nul(EC.cross(M.u, K.u)); });
        if (par.length) r.temoins.push({ K: K, M: par[0] });
      });
      var paire = null;
      for (var i = 0; i < r.temoins.length && !paire; i++) for (var j = i + 1; j < r.temoins.length && !paire; j++) {
        if (!EC.nul(EC.cross(r.temoins[i].K.u, r.temoins[j].K.u))) paire = [r.temoins[i], r.temoins[j]];
      }
      r.paire = paire;
      if (paire) {
        r.titre = "Plans parallèles";
        r.justif = paire[0].K.nom + " et " + paire[1].K.nom + " sont deux droites sécantes du plan " + A.nom + " ; elles sont parallèles à " +
          paire[0].M.nom + " et " + paire[1].M.nom + ", deux droites du plan " + B.nom + " : les plans sont parallèles.";
      } else if (pos.type === "paralleles") {
        r.titre = "Plans parallèles";
        r.justif = "Les plans n'ont aucun point commun, mais les droites tracées par les points nommés de α ne donnent pas deux témoins sécantes : il faudrait en construire.";
      } else if (r.temoins.length) {
        r.titre = "Une seule direction de témoins";
        r.justif = "Les témoins de α (" + liste(r.temoins.map(function (t) { return t.K.nom; })) + ") ont toutes la même direction : il en faut deux sécantes. " +
          "Ici, les plans sont sécants, et leur droite commune a cette direction.";
      } else {
        r.titre = "Aucune témoin";
        r.justif = "Aucune droite du cube tracée dans α n'est parallèle à une droite de β : les plans sont sécants.";
      }
      return r;
    }

    _rendre() {
      var sh = this._sh, a = this._analyse();
      sh.getElementById("message").textContent = a.msg || "";
      var scene = { polys: [], segs: [], points: [] };
      var bx = EC.boite();
      var choisis = this._mode === "droite" ? this._d.concat(this._al) : this._al.concat(this._be);
      if (a.A) scene.polys.push({ pts: EC.planBoite(a.A.V, a.A.n, bx), cls: "plan" });
      if (a.B && a.type !== "confondus") scene.polys.push({ pts: EC.planBoite(a.B.V, a.B.n, bx), cls: "plan2" });
      var seg = function (K, cls) { scene.segs.push({ a: K.P, b: EC.add(K.P, K.u), cls: cls }); };
      var segLong = function (K, cls) { var s = EC.segmentDroite(K.P, K.u, EC.CUBE); if (s) scene.segs.push({ a: s[0], b: s[1], cls: cls }); };
      (a.fausses || []).forEach(function (K) { segLong(K, "ko"); });
      if (this._mode === "droite") (a.temoins || []).forEach(function (K) { segLong(K, "ok"); });
      else if (a.temoins) {
        var vus = a.paire ? [a.paire[0], a.paire[1]] : a.temoins.slice(0, 3);
        vus.forEach(function (t) { segLong(t.K, "ok"); segLong(t.M, "okx"); });
      }
      if (a.L) { var sd = EC.segmentDroite(a.L.P, a.L.u, bx); if (sd) scene.segs.push({ a: sd[0], b: sd[1], cls: "d1x" }); seg(a.L, "d1"); }
      EC.NOMS.forEach(function (nm) {
        var estSommet = EC.SOMMETS.indexOf(nm) >= 0, choisi = choisis.indexOf(nm) >= 0;
        if (!estSommet && !choisi) return;
        scene.points.push({ X: EC.PTS[nm], nom: nm, cls: choisi ? "pt-choisi" : "pt", r: choisi ? 4.2 : 2.6, etiq: estSommet ? "etiq" : "etiq etiq-n" });
      });
      EC.dessiner(this._svg, this._vue, scene, LARG, HAUT);
      var carte = sh.getElementById("carte");
      if (a.msg) { carte.hidden = true; carte.innerHTML = ""; return; }
      carte.hidden = false;
      carte.innerHTML = '<div class="verdict">' + a.titre + '</div><div>' + a.justif + '</div>' + (a.note ? '<div class="note">' + a.note + '</div>' : "");
    }
  }

  if (!customElements.get("droite-temoin-widget")) customElements.define("droite-temoin-widget", DroiteTemoinWidget);
})();
