(function () {
  "use strict";

  /* ================================================================
   * <plan-auxiliaire-widget> — atelier (4e, ch. 8, § 8) : point de percée
   * d'une droite d dans un plan α par la méthode du plan auxiliaire.
   * On choisit d (deux points nommés), α (trois sommets), puis un plan π :
   * un plan remarquable du cube, ou le plan qui contient d et un sommet.
   * Un plan qui ne contient pas d est refusé, avec la raison ; un plan
   * parallèle ou confondu avec α aussi. Sinon : la droite b commune à π et
   * α se trace avec ses points construits, puis le point de percée M,
   * intersection de d et b, qui peut tomber hors du cube. Pendant libre de
   * gen102. Calculs exacts, aucune coordonnée affichée.
   * Dépend de window.EspaceCommun (espace-commun.js, importé avant).
   * ================================================================ */

  var EC = window.EspaceCommun;
  var LARG = 340, HAUT = 300;
  var PLANS = EC.QUADS.concat(EC.COINS);

  function optionsPi() {
    var g1 = PLANS.map(function (q) { return '<option value="q:' + q + '">(' + q + ')</option>'; }).join("");
    var g2 = EC.SOMMETS.map(function (c) { return '<option value="s:' + c + '">plan (d, ' + c + ')</option>'; }).join("");
    return '<optgroup label="Plans du cube">' + g1 + '</optgroup><optgroup label="Plan qui contient d et un sommet">' + g2 + '</optgroup>';
  }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' + EC.CSS + '</style>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + LARG + ' ' + HAUT + '" role="img" aria-label="Cube, droite d, plan alpha, plan auxiliaire pi et point de percée"></svg></div>' +
    EC.boutonsRotation() +
    '<div class="selection">' +
    '<div class="ligne"><span class="libelle c1">Droite d : (</span>' + EC.select("a", null, "Premier point de d") + EC.select("b", null, "Second point de d") + '<span class="libelle c1">)</span></div>' +
    '<div class="ligne"><span class="libelle cp">Plan α : (</span>' + EC.select("p1", EC.SOMMETS, "Premier sommet de alpha") + EC.select("p2", EC.SOMMETS, "Deuxième sommet de alpha") + EC.select("p3", EC.SOMMETS, "Troisième sommet de alpha") + '<span class="libelle cp">)</span></div>' +
    '<div class="ligne"><span class="libelle cok">Plan auxiliaire π :</span><select id="pi" aria-label="Plan auxiliaire pi">' + optionsPi() + '</select></div>' +
    '<div class="note">' + EC.NOTE_POINTS + '</div>' +
    '</div>' +
    '<div class="message" id="message" aria-live="polite"></div>' +
    '<div class="carte" id="carte" aria-live="polite"></div>' +
    '<div class="bas"><button class="btn btn-reset" type="button" id="reset">Réinitialiser</button></div>';

  class PlanAuxiliaireWidget extends HTMLElement {
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
      this._d = ["A", "J"];
      this._al = ["E", "F", "G"];
      this._pi = "q:ABFE";
    }

    connectedCallback() {
      if (this._pret) return;
      this._pret = true;
      var self = this, sh = this._sh;
      sh.querySelectorAll("[data-rot]").forEach(function (b) {
        b.addEventListener("click", function () { EC.tourner(self._vue, b.getAttribute("data-rot")); self._rendre(); });
      });
      sh.querySelector("[data-cav]").addEventListener("click", function () { self._vue.cav = true; self._rendre(); });
      ["a", "b"].forEach(function (id, k) { sh.getElementById(id).addEventListener("change", function (e) { self._d[k] = e.target.value; self._rendre(); }); });
      ["p1", "p2", "p3"].forEach(function (id, k) { sh.getElementById(id).addEventListener("change", function (e) { self._al[k] = e.target.value; self._rendre(); }); });
      sh.getElementById("pi").addEventListener("change", function (e) { self._pi = e.target.value; self._rendre(); });
      sh.getElementById("reset").addEventListener("click", function () { self._defauts(); self._majSelects(); self._rendre(); });
      EC.installerRotation(this._svg, this._vue, function () { self._rendre(); });
      this._majSelects();
      this._rendre();
    }

    _majSelects() {
      var sh = this._sh;
      sh.getElementById("a").value = this._d[0]; sh.getElementById("b").value = this._d[1];
      sh.getElementById("p1").value = this._al[0]; sh.getElementById("p2").value = this._al[1]; sh.getElementById("p3").value = this._al[2];
      sh.getElementById("pi").value = this._pi;
    }

    /** Calcul de la construction (exposé pour les tests). */
    _analyse() {
      var d = this._d, al = this._al;
      if (d[0] === d[1]) return { msg: "Choisis deux points différents pour la droite d." };
      if (al[0] === al[1] || al[0] === al[2] || al[1] === al[2]) return { msg: "Choisis trois sommets différents pour le plan α." };
      var L = EC.droite(d[0], d[1]);
      var A = EC.plan(al);
      if (!A) return { msg: "Ces trois sommets sont alignés : ils ne déterminent pas de plan." };
      var res = { L: L, A: A };
      // position de d par rapport à α
      if (EC.contientDroite(A, L)) { res.fin = "incluse"; res.titre = "d est incluse dans α"; res.justif = d[0] + " et " + d[1] + " sont dans le plan " + A.nom + " : il n'y a pas de point de percée à chercher."; return res; }
      // plan auxiliaire
      var Pi, nomPi;
      if (this._pi.indexOf("s:") === 0) {
        var X = this._pi.slice(2);
        Pi = EC.plan([d[0], d[1], X]);
        nomPi = "(" + d[0] + d[1] + X + ")";
        if (!Pi) { res.refus = "Le sommet " + X + " est sur la droite d : une infinité de plans contiennent d et " + X + ". Choisis un sommet hors de d."; return res; }
        Pi.nom = EC.nomPlan([d[0], d[1], X]) || nomPi;
      } else {
        var q = this._pi.slice(2);
        Pi = EC.plan([q[0], q[1], q[2]]);
        Pi.nom = "(" + q + ")";
        var hors = [d[0], d[1]].filter(function (c) { return !EC.contient(Pi, EC.PTS[c]); });
        if (hors.length) { res.Pi = Pi; res.refus = "Refusé : le point " + hors[0] + " n'est pas dans le plan " + Pi.nom + ". Ce plan ne contient pas d, il ne peut pas servir de plan auxiliaire."; return res; }
      }
      res.Pi = Pi;
      var pos = EC.deuxPlans(Pi, A);
      if (pos.type === "confondus") { res.refus = "Refusé : " + Pi.nom + " est le plan α lui-même. Le plan auxiliaire doit couper α."; return res; }
      if (pos.type === "paralleles") { res.refus = "Refusé : " + Pi.nom + " est parallèle à α, il n'a aucune droite commune avec lui. Le plan auxiliaire doit couper α."; return res; }
      res.pos = pos;
      // droite b : points nommés communs, sinon points construits sur le bord du cube
      var communs = EC.pointsDuPlan(Pi).filter(function (c) { return EC.contient(A, EC.PTS[c]); });
      var nomB = communs.length >= 2 ? "(" + communs[0] + communs[1] + ")" : null;
      var seg = EC.segmentDroite(pos.P, pos.u, EC.CUBE);
      var construits = [];
      if (!nomB && seg) seg.forEach(function (Xr, i) {
        var M = EC.versRat(Xr), nm = M && EC.nomPoint(M);
        if (nm && communs.indexOf(nm) >= 0) return;
        construits.push({ X: Xr, nom: nm || (i === 0 ? "P" : "Q"), loc: M ? EC.localiser(M, i === 0 ? "P" : "Q") : null, face: EC.faceDe(Xr), nomme: !!nm });
      });
      res.communs = communs; res.construits = construits; res.nomB = nomB;
      var etapes = [];
      etapes.push("Le plan auxiliaire π = " + Pi.nom + " contient d (" + d[0] + " et " + d[1] + " y sont) et coupe α.");
      if (nomB) etapes.push("Les points " + communs[0] + " et " + communs[1] + " sont dans π et dans α : la droite commune est b = " + nomB + ".");
      else {
        var morceaux = communs.map(function (c) { return c + " est dans π et dans α"; });
        construits.slice(0, 2 - communs.length).forEach(function (c) {
          var face = c.face ? EC.FACES[c.face].nom : null;
          var ou = !c.loc ? c.nom : (face && c.loc.txt.indexOf("intérieur de la face") >= 0 ? c.nom : c.loc.txt);
          morceaux.push((face ? "dans la face " + face + ", les traces de π et de α se coupent en " : "") + ou);
        });
        etapes.push("Deux points communs à π et α : " + morceaux.join(" ; ") + ". Ils donnent la droite commune b.");
      }
      var M = EC.percee(L, A);
      if (!M) { res.fin = "parallele"; etapes.push("d et b sont parallèles : d est parallèle à α, il n'y a pas de point de percée."); res.etapes = etapes; res.titre = "d est parallèle à α"; return res; }
      res.M = M; res.loc = EC.localiser(M, "M");
      etapes.push("Dans π, les droites d et b sont coplanaires et se coupent en " + res.loc.txt + ".");
      res.etapes = etapes;
      res.titre = "Point de percée : " + res.loc.nom;
      return res;
    }

    _rendre() {
      var sh = this._sh, a = this._analyse();
      sh.getElementById("message").textContent = a.msg || "";
      var scene = { polys: [], segs: [], points: [] };
      var Mv = a.M ? EC.ratVal(a.M) : null;
      var loin = Mv && Mv.some(function (c) { return c < -3 || c > 5; });
      var bx = EC.boite(Mv && !loin ? [Mv] : []);
      if (a.A) scene.polys.push({ pts: EC.planBoite(a.A.V, a.A.n, bx), cls: "plan" });
      if (a.Pi) scene.polys.push({ pts: EC.planBoite(a.Pi.V, a.Pi.n, bx), cls: a.refus ? "plan-ko" : "plan-ok" });
      if (a.pos) {
        var sb = EC.segmentDroite(a.pos.P, a.pos.u, bx);
        if (sb) scene.segs.push({ a: sb[0], b: sb[1], cls: "ok" });
        (a.construits || []).forEach(function (c) { scene.points.push({ X: c.X, nom: EC.SOMMETS.indexOf(c.nom) >= 0 ? null : c.nom, cls: "pt-ok", r: 4.5, etiq: "etiq etiq-ok" }); });
      }
      if (a.L) {
        var sd = EC.segmentDroite(a.L.P, a.L.u, bx);
        if (sd) scene.segs.push({ a: sd[0], b: sd[1], cls: "d1x" });
        scene.segs.push({ a: a.L.P, b: EC.add(a.L.P, a.L.u), cls: "d1" });
      }
      var choisis = this._d;
      EC.NOMS.forEach(function (nm) {
        var estSommet = EC.SOMMETS.indexOf(nm) >= 0, choisi = choisis.indexOf(nm) >= 0;
        if (!estSommet && !choisi) return;
        scene.points.push({ X: EC.PTS[nm], nom: nm, cls: choisi ? "pt-choisi" : "pt", r: choisi ? 4.2 : 2.6, etiq: estSommet ? "etiq" : "etiq etiq-n" });
      });
      if (Mv && !loin) scene.points.push({ X: Mv, nom: a.loc && a.loc.nom === "M" ? "M" : null, cls: "pt-inter", r: 5.5, etiq: "etiq etiq-m" });
      EC.dessiner(this._svg, this._vue, scene, LARG, HAUT);
      var carte = sh.getElementById("carte");
      if (a.msg) { carte.hidden = true; carte.innerHTML = ""; return; }
      carte.hidden = false;
      if (a.refus) { carte.innerHTML = '<div class="refus">' + a.refus + '</div>'; return; }
      var html = '<div class="verdict">' + a.titre + '</div>';
      html += a.etapes ? "<ol>" + a.etapes.map(function (e) { return "<li>" + e + "</li>"; }).join("") + "</ol>" : "<div>" + a.justif + "</div>";
      if (a.loc && a.loc.dehors) html += '<div class="note">Le plan α est infini : le point de percée peut tomber hors du cube.' + (loin ? " (Il est trop loin pour être dessiné dans le cadre.)" : "") + '</div>';
      carte.innerHTML = html;
    }
  }

  if (!customElements.get("plan-auxiliaire-widget")) customElements.define("plan-auxiliaire-widget", PlanAuxiliaireWidget);
})();
