/* <gen7-widget> — port JS autonome (Web Component, Shadow DOM) de gen7
 * "Analyse d'une fonction du second degré" (4e FWB, plateforme-maths).
 * Dépend de Gen7Core / Gen7Format / Gen7Sketch (chargés avant ce script). */
(function () {
  "use strict";
  var C = window.Gen7Core, F = window.Gen7Format, S = window.Gen7Sketch;

  var ORDRE_BASE = ["coefficients", "allure", "axeSommet", "domaineImage", "racinesReconnaissance", "racinesChamp1", "racinesChamp2", "tableauSignes"];
  var LABELS_ETAPE = {
    coefficients: "Coefficients", allure: "Allure", axeSommet: "Axe et sommet",
    domaineImage: "Domaine et image", racinesReconnaissance: "Méthode de résolution",
    racinesChamp1: "Factorisation", racinesChamp2: "Racines", tableauSignes: "Tableau de signe et de variation"
  };
  var LABELS_CATEGORIE = {
    mise_en_evidence: "Mise en évidence", binome_conjugue: "Binôme conjugué",
    produit_remarquable: "Produit remarquable", irreductible: "Non factorisable"
  };

  function phaseSuivante(phaseActuelle, exercice) {
    var idx = ORDRE_BASE.indexOf(phaseActuelle);
    var next = ORDRE_BASE[idx + 1];
    if ((next === "racinesChamp1" || next === "racinesChamp2") && exercice.categorie === "irreductible") return "tableauSignes";
    return next || null;
  }

  function creerEtatEtape() { return { tentativesUtilisees: 0, terminee: false, reussie: false, revele: false, score: null, aideUtilisee: false }; }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    "<style>" +
    ":host{display:block;font-family:var(--sans,system-ui,sans-serif);}" +
    "*{box-sizing:border-box;}" +
    ".carte{background:var(--surface,#fff);border:1px solid var(--line,#e2d8c8);border-radius:var(--radius,6px);padding:22px;max-width:600px;margin:0 auto;}" +
    ".entete{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:4px 12px;margin-bottom:14px;font-family:var(--mono,monospace);font-size:11.5px;letter-spacing:.05em;text-transform:uppercase;color:var(--ink-faint,#9c9083);}" +
    ".barre-progres{height:4px;border-radius:2px;background:var(--line-soft,#ede5d7);overflow:hidden;margin-bottom:18px;}" +
    ".barre-progres > div{height:100%;background:var(--accent,#a8471f);transition:width .25s ease;}" +
    ".recap{display:flex;flex-direction:column;gap:6px;margin-bottom:16px;}" +
    ".recap-ligne{display:flex;align-items:center;gap:8px;padding:7px 10px;border-radius:4px;font-size:.85rem;}" +
    ".recap-verte{background:var(--good-soft,#dcefe2);color:var(--good,#2f7a4f);}" +
    ".recap-orange{background:var(--attn-soft,#f7ecd6);color:var(--attn,#96650c);}" +
    ".recap-rouge{background:var(--bad-soft,#f6dede);color:var(--bad,#b23a3a);}" +
    ".recap-ligne .nom{color:var(--ink,#241f1a);font-weight:600;flex:1;}" +
    ".equation-box{background:var(--surface-2,#faf6f0);border:1px solid var(--line,#e2d8c8);border-radius:4px;padding:14px 16px;text-align:center;font-family:var(--serif,serif);font-style:italic;font-size:1.15rem;margin-bottom:14px;color:var(--ink,#241f1a);}" +
    ".etat-actuel{background:var(--accent-soft,#f6e2d3);border:1px solid var(--accent-soft-line,#e8c4a4);border-radius:4px;padding:10px 14px;margin-bottom:14px;font-size:.9rem;color:var(--accent-ink,#7a3212);text-align:center;font-family:var(--serif,serif);font-style:italic;}" +
    ".consigne{margin:0 0 14px;color:var(--ink-soft,#6b6055);font-size:.95rem;}" +
    ".champ-ligne{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:12px;}" +
    ".champ{flex:1 1 100px;}" +
    ".champ label{display:block;font-size:.82rem;color:var(--ink-soft,#6b6055);margin-bottom:4px;font-style:italic;font-family:var(--serif,serif);}" +
    ".champ input[type=text]{width:100%;padding:9px 10px;border:1px solid var(--line,#e2d8c8);border-radius:4px;font-size:1rem;font-family:inherit;background:var(--surface,#fff);color:var(--ink,#241f1a);}" +
    ".champ input[type=text].is-erronee{border-color:var(--bad,#b23a3a);background:var(--bad-soft,#f6dede);}" +
    ".options-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px;}" +
    ".btn{padding:11px 14px;border-radius:4px;border:1px solid var(--line,#e2d8c8);background:var(--surface,#fff);color:var(--ink,#241f1a);font-size:.92rem;cursor:pointer;font-family:inherit;text-align:center;}" +
    ".btn:hover{border-color:var(--accent,#a8471f);}" +
    ".btn.toggle-active{background:var(--accent,#a8471f);border-color:var(--accent,#a8471f);color:var(--on-accent,#fff);}" +
    ".btn-primary{display:block;width:100%;padding:13px;border-radius:4px;border:1px solid var(--accent,#a8471f);background:var(--accent,#a8471f);color:var(--on-accent,#fff);font-weight:700;font-size:1rem;cursor:pointer;font-family:inherit;margin-top:6px;}" +
    ".btn-primary:disabled{opacity:.45;cursor:not-allowed;}" +
    ".btn-aide{display:block;width:100%;padding:10px;border-radius:4px;border:1px solid var(--tip,#8a7200);background:var(--tip-soft,#faf3d5);color:var(--tip,#8a7200);font-weight:600;font-size:.88rem;cursor:pointer;font-family:inherit;margin-bottom:10px;}" +
    ".btn-aide:disabled{opacity:.5;cursor:not-allowed;}" +
    ".alert-erreur{background:var(--bad-soft,#f6dede);border:1px solid var(--bad,#b23a3a);color:var(--bad,#b23a3a);border-radius:4px;padding:10px 12px;font-size:.88rem;margin-top:10px;}" +
    ".alert-succes{background:var(--good-soft,#dcefe2);border:1px solid var(--good,#2f7a4f);color:var(--good,#2f7a4f);border-radius:4px;padding:10px 12px;font-size:.88rem;margin-top:10px;}" +
    ".sketch-zone{display:flex;justify-content:center;margin-bottom:14px;}" +
    ".sketch-zone svg{width:100%;max-width:260px;height:auto;background:var(--surface-2,#faf6f0);border-radius:4px;}" +
    ".sk-axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.3;}" +
    ".sk-etiquette{font-size:9px;fill:var(--ink-soft,#6b6055);font-family:var(--sans,sans-serif);}" +
    ".sk-courbe{stroke:var(--accent,#a8471f);stroke-width:2.2;fill:none;}" +
    ".sk-courbe.sk-neutre{stroke:var(--ink-faint,#9c9083);stroke-dasharray:4 3;}" +
    ".sk-point-c{fill:var(--good,#2f7a4f);}" +
    ".sk-point-s{fill:var(--accent,#a8471f);}" +
    ".sk-point-racine{fill:var(--tip,#8a7200);}" +
    ".sk-surlignage{stroke:var(--good,#2f7a4f);stroke-width:3.5;}" +
    ".liste-morceaux{display:flex;flex-direction:column;gap:8px;margin-bottom:12px;}" +
    ".morceau-ligne{display:flex;align-items:center;gap:8px;}" +
    ".morceau-ligne input{flex:1;padding:9px 10px;border:1px solid var(--line,#e2d8c8);border-radius:4px;font-family:inherit;background:var(--surface,#fff);color:var(--ink,#241f1a);}" +
    ".morceau-retirer{background:none;border:none;color:var(--bad,#b23a3a);font-size:1.2rem;cursor:pointer;line-height:1;padding:4px 8px;}" +
    ".btn-ajouter{background:none;border:1px dashed var(--line,#e2d8c8);border-radius:4px;padding:8px;color:var(--ink-soft,#6b6055);cursor:pointer;font-size:.85rem;font-family:inherit;}" +
    ".intervalle-ligne{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:10px;}" +
    ".intervalle-ligne input[type=text]{width:80px;padding:8px;border:1px solid var(--line,#e2d8c8);border-radius:4px;font-family:inherit;background:var(--surface,#fff);color:var(--ink,#241f1a);}" +
    ".apercu-box{border:1px dashed var(--accent-soft-line,#e8c4a4);border-radius:4px;padding:8px 12px;text-align:center;font-family:var(--serif,serif);font-style:italic;margin-bottom:14px;color:var(--accent-ink,#7a3212);}" +
    "table.grille-signes{border-collapse:collapse;width:100%;font-size:.82rem;margin-bottom:14px;}" +
    "table.grille-signes th,table.grille-signes td{border:1px solid var(--line,#e2d8c8);padding:4px;text-align:center;}" +
    "table.grille-signes th{background:var(--surface-2,#faf6f0);font-family:var(--mono,monospace);font-weight:600;color:var(--ink-soft,#6b6055);}" +
    ".toggle-signe{min-width:38px;min-height:38px;border:1px solid var(--line,#e2d8c8);background:var(--surface,#fff);border-radius:4px;cursor:pointer;font-size:1rem;color:var(--ink,#241f1a);font-family:inherit;}" +
    ".toggle-signe.is-erronee{border-color:var(--bad,#b23a3a);background:var(--bad-soft,#f6dede);}" +
    ".grille-scroll{overflow-x:auto;}" +
    ".resume-final{text-align:center;}" +
    ".resume-final .titre{font-family:var(--serif,serif);font-size:1.3rem;font-weight:600;margin-bottom:12px;color:var(--ink,#241f1a);}" +
    ".resume-final table{border-collapse:collapse;width:100%;font-size:.8rem;margin-bottom:16px;}" +
    ".resume-final th,.resume-final td{border:1px solid var(--line,#e2d8c8);padding:6px 4px;text-align:center;}" +
    ".resume-final th{background:var(--surface-2,#faf6f0);}" +
    ".math-b{color:#1864ab;font-weight:700;}" +
    ".math-c{color:#2b8a3e;font-weight:700;}" +
    ".math-a{color:#c2255c;font-weight:700;}" +
    "</style>" +
    '<div class="carte" id="carte"></div>';

  function GenererId() { return "g7-" + Math.random().toString(36).slice(2, 9); }

  function creerEl(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }

  class Gen7WidgetEl extends HTMLElement {
    constructor() {
      super();
      var shadow = this.attachShadow({ mode: "open" });
      shadow.appendChild(TEMPLATE.content.cloneNode(true));
      this._carte = shadow.getElementById("carte");
      this._reglages = { nombreExercices: 5, tentativesMax: 3, penaliteActivee: true };
      this._session = { indexExercice: 0, resultats: [] };
    }

    connectedCallback() {
      this._demarrerExercice();
    }

    _demarrerExercice(categorieForcee) {
      var ex;
      if (categorieForcee) {
        do { ex = C.genererExerciceAnalyseFonction(); } while (ex.categorie !== categorieForcee);
      } else {
        ex = C.genererExerciceAnalyseFonction();
      }
      this._exercice = ex;
      this._etapes = {};
      ORDRE_BASE.forEach(function (p) { this._etapes[p] = creerEtatEtape(); }.bind(this));
      this._phase = ORDRE_BASE[0];
      this._brouillon = {};
      this._erreur = null;
      this._render();
    }

    _avancerPhase() {
      var suivante = phaseSuivante(this._phase, this._exercice);
      this._brouillon = {};
      this._erreur = null;
      if (suivante) { this._phase = suivante; this._render(); return; }
      this._cloreExercice();
    }

    _cloreExercice() {
      var scores = {};
      ORDRE_BASE.forEach(function (p) { scores[p] = this._etapes[p].score; }.bind(this));
      this._session.resultats.push({ categorie: this._exercice.categorie, scores: scores });
      this._session.indexExercice++;
      if (this._session.indexExercice >= this._reglages.nombreExercices) {
        this._phase = "finSession";
        this._render();
      } else {
        this._phase = "recapExercice";
        this._render();
      }
    }

    _soumettre(estCorrect) {
      var etape = this._etapes[this._phase];
      if (etape.terminee) return;
      if (estCorrect) {
        var base = 100;
        if (this._reglages.penaliteActivee) base = Math.max(0, 100 - etape.tentativesUtilisees * (100 / this._reglages.tentativesMax));
        if (etape.aideUtilisee) base *= 0.5;
        etape.score = Math.round(base * 10) / 10;
        etape.terminee = true; etape.reussie = true;
        this._erreur = null;
        this._render();
      } else {
        etape.tentativesUtilisees++;
        if (etape.tentativesUtilisees >= this._reglages.tentativesMax) {
          etape.terminee = true; etape.reussie = false; etape.revele = true; etape.score = 0;
          this._erreur = null;
          this._render();
        } else {
          this._erreur = { type: "echec", restant: this._reglages.tentativesMax - etape.tentativesUtilisees };
          this._render();
        }
      }
    }

    _soumettreParseError() {
      this._erreur = { type: "parse_error" };
      var etape = this._etapes[this._phase];
      etape.tentativesUtilisees++;
      if (etape.tentativesUtilisees >= this._reglages.tentativesMax) {
        etape.terminee = true; etape.reussie = false; etape.revele = true; etape.score = 0;
      }
      this._render();
    }

    _activerAide() {
      this._etapes[this._phase].aideUtilisee = true;
      this._brouillon.aideAffichee = true;
      this._render();
    }

    // -----------------------------------------------------------------
    // Rendu
    // -----------------------------------------------------------------
    _render() {
      var carte = this._carte;
      carte.innerHTML = "";
      if (this._phase === "finSession") { this._rendreResumeSession(carte); return; }
      if (this._phase === "recapExercice") { this._rendreRecapExercice(carte); return; }

      var entete = creerEl("div", "entete");
      entete.innerHTML = "<span>Exercice " + (this._session.indexExercice + 1) + " / " + this._reglages.nombreExercices + "</span><span>" + LABELS_ETAPE[this._phase] + "</span>";
      carte.appendChild(entete);

      var idxPhase = ORDRE_BASE.indexOf(this._phase);
      var barre = creerEl("div", "barre-progres", '<div style="width:' + Math.round(((idxPhase + 1) / ORDRE_BASE.length) * 100) + '%"></div>');
      carte.appendChild(barre);

      if (idxPhase > 0) carte.appendChild(this._construireRecapPartiel());

      var methode = this["_rendrePhase_" + this._phase];
      if (methode) methode.call(this, carte);
    }

    _construireRecapPartiel() {
      var recap = creerEl("div", "recap");
      var self = this;
      ORDRE_BASE.forEach(function (p) {
        var e = self._etapes[p];
        if (!e.terminee) return;
        var statut = e.revele ? "rouge" : (e.aideUtilisee ? "orange" : "verte");
        var icone = statut === "rouge" ? "✗" : "✓";
        var ligne = creerEl("div", "recap-ligne recap-" + statut);
        ligne.innerHTML = "<span>" + icone + "</span><span class='nom'>" + LABELS_ETAPE[p] + "</span><span>" + (e.score === null ? "—" : e.score + " pts") + "</span>";
        recap.appendChild(ligne);
      });
      return recap;
    }

    _construireEquationBox(mode) {
      var box = creerEl("div", "equation-box");
      if (mode === "canonique") box.textContent = F.formatEquationCanonique(this._exercice.enonce);
      else box.textContent = F.formatFonctionOrdre(this._exercice.enonce, this._exercice.ordreTermes);
      return box;
    }

    _construireErreur() {
      if (!this._erreur) return null;
      var div = creerEl("div", "alert-erreur");
      if (this._erreur.type === "parse_error") {
        div.textContent = 'Expression non reconnue — vérifie la syntaxe (parenthèses, "*" entre nombre et variable, etc.).';
      } else {
        div.textContent = "Incorrect — il te reste " + this._erreur.restant + " tentative" + (this._erreur.restant > 1 ? "s" : "") + ".";
      }
      return div;
    }

    _boutonValider(carte, label, callback, desactive) {
      var btn = creerEl("button", "btn-primary", label || "Valider");
      btn.disabled = !!desactive;
      btn.addEventListener("click", callback);
      carte.appendChild(btn);
      var err = this._construireErreur();
      if (err) carte.appendChild(err);
    }

    _boutonContinuer(carte) {
      var etape = this._etapes[this._phase];
      var msg = creerEl("div", etape.revele ? "alert-erreur" : "alert-succes");
      msg.textContent = etape.revele ? "Réponse révélée — regarde le rappel ci-dessus au prochain écran." : "Correct !";
      carte.appendChild(msg);
      var btn = creerEl("button", "btn-primary", "Continuer →");
      var self = this;
      btn.addEventListener("click", function () { self._avancerPhase(); });
      carte.appendChild(btn);
    }

    _boutonAide(carte, onClick) {
      var etape = this._etapes[this._phase];
      var btn = creerEl("button", "btn-aide", etape.aideUtilisee ? "Aide utilisée" : "Aide (−50% sur cette étape)");
      btn.disabled = etape.aideUtilisee;
      btn.addEventListener("click", onClick);
      carte.appendChild(btn);
    }

    // ---------------- Écran 1 : coefficients ----------------
    _rendrePhase_coefficients(carte) {
      carte.appendChild(this._construireEquationBox("ordre"));
      var etape = this._etapes.coefficients;
      if (etape.terminee) {
        if (etape.revele) {
          var tpl = creerEl("div", "etat-actuel");
          tpl.innerHTML = F.formatCanoniqueColoreHtml(this._exercice.enonce);
          carte.appendChild(tpl);
        }
        this._boutonContinuer(carte);
        return;
      }
      carte.appendChild(creerEl("p", "consigne", "Identifie les coefficients a, b et c."));
      if (this._brouillon.aideAffichee) {
        var aideBox = creerEl("div", "etat-actuel");
        aideBox.innerHTML = F.formatCanoniqueColoreHtml(this._exercice.enonce);
        carte.appendChild(aideBox);
      }
      var ligne = creerEl("div", "champ-ligne");
      var self = this;
      ["a", "b", "c"].forEach(function (nom) {
        var champ = creerEl("div", "champ");
        var idInput = GenererId();
        champ.innerHTML = '<label for="' + idInput + '">' + nom + " =</label>";
        var input = creerEl("input", ""); input.type = "text"; input.id = idInput;
        input.value = self._brouillon[nom] !== undefined ? self._brouillon[nom] : "";
        input.addEventListener("input", function () {
          input.value = input.value.replace(/[^0-9\-.,]/g, "");
          self._brouillon[nom] = input.value;
          valider.disabled = !(self._brouillon.a && self._brouillon.b !== undefined && self._brouillon.c !== undefined && self._brouillon.a !== "" && self._brouillon.b !== "" && self._brouillon.c !== "");
        });
        champ.appendChild(input);
        ligne.appendChild(champ);
      });
      carte.appendChild(ligne);
      this._boutonAide(carte, function () { self._activerAide(); });
      var valider = creerEl("button", "btn-primary", "Valider");
      valider.disabled = true;
      valider.addEventListener("click", function () {
        var rep = {
          a: C.parserNombreOuFraction(self._brouillon.a || ""),
          b: C.parserNombreOuFraction(self._brouillon.b || ""),
          c: C.parserNombreOuFraction(self._brouillon.c || "")
        };
        rep.a = rep.a === null ? NaN : rep.a; rep.b = rep.b === null ? NaN : rep.b; rep.c = rep.c === null ? NaN : rep.c;
        var statut = C.diagnostiquerCoefficients(self._exercice, rep);
        if (statut === "correct") self._soumettre(true);
        else if (statut === "parse_error") self._soumettreParseError();
        else self._soumettre(false);
      });
      carte.appendChild(valider);
      var err = this._construireErreur();
      if (err) carte.appendChild(err);
    }

    // ---------------- Écran 2 : allure ----------------
    _rendrePhase_allure(carte) {
      carte.appendChild(this._construireEquationBox("ordre"));
      var etape = this._etapes.allure;
      var self = this;
      if (!this._brouillon.choix) this._brouillon.choix = { signeA: null, signeAB: null };
      if (etape.terminee) { this._boutonContinuer(carte); return; }
      carte.appendChild(creerEl("p", "consigne", "Quel est le signe de a ? Puis quel est le signe de a·b ?"));
      var zoneSketch = creerEl("div", "sketch-zone");
      var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("viewBox", "0 0 220 170");
      zoneSketch.appendChild(svg);
      carte.appendChild(zoneSketch);
      window.Gen7Sketch.construireSketchAllure(svg, this._brouillon.choix, this._exercice.enonce.c);

      var grille1 = creerEl("div", "options-grid");
      [["+", "a > 0"], ["-", "a < 0"]].forEach(function (pair) {
        var b = creerEl("button", "btn" + (self._brouillon.choix.signeA === pair[0] ? " toggle-active" : ""), pair[1]);
        b.addEventListener("click", function () { self._brouillon.choix.signeA = pair[0]; self._render(); });
        grille1.appendChild(b);
      });
      carte.appendChild(grille1);

      var grille2 = creerEl("div", "options-grid");
      grille2.style.gridTemplateColumns = "1fr 1fr 1fr";
      [["+", "a·b > 0"], ["-", "a·b < 0"], ["0", "a·b = 0"]].forEach(function (pair) {
        var b = creerEl("button", "btn" + (self._brouillon.choix.signeAB === pair[0] ? " toggle-active" : ""), pair[1]);
        b.addEventListener("click", function () { self._brouillon.choix.signeAB = pair[0]; self._render(); });
        grille2.appendChild(b);
      });
      carte.appendChild(grille2);

      var pret = this._brouillon.choix.signeA && this._brouillon.choix.signeAB;
      this._boutonValider(carte, "Valider", function () {
        var ok = C.verifierAllure(self._exercice, self._brouillon.choix);
        self._soumettre(ok);
      }, !pret);
    }

    // ---------------- Écran 3 : axe et sommet ----------------
    _rendrePhase_axeSommet(carte) {
      carte.appendChild(this._construireEquationBox("ordre"));
      var etape = this._etapes.axeSommet;
      var self = this;
      if (etape.terminee) { this._boutonContinuer(carte); return; }
      carte.appendChild(creerEl("p", "consigne", "Donne l'axe de symétrie et les coordonnées du sommet."));
      if (this._brouillon.aideAffichee) {
        var zoneSketch = creerEl("div", "sketch-zone");
        var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("viewBox", "0 0 220 170");
        zoneSketch.appendChild(svg);
        carte.appendChild(zoneSketch);
        window.Gen7Sketch.construireSketchPartage(svg, {
          a: this._exercice.enonce.a, c: this._exercice.enonce.c, yS: this._exercice.yS, xS: this._exercice.xS,
          colonnesValeurs: this._exercice.grilleSigneVariation.colonnesValeurs, indexSommet: this._exercice.grilleSigneVariation.indexSommet
        }, {});
      }
      var champAxe = creerEl("div", "champ");
      var idAxe = GenererId();
      champAxe.innerHTML = '<label for="' + idAxe + '">Axe de symétrie</label>';
      var inputAxe = creerEl("input", ""); inputAxe.type = "text"; inputAxe.id = idAxe;
      inputAxe.placeholder = "x = ... (fraction p/q acceptée)";
      inputAxe.value = this._brouillon.axeTexte || "";
      inputAxe.addEventListener("input", function () { self._brouillon.axeTexte = inputAxe.value; majBouton(); });
      champAxe.appendChild(inputAxe);
      carte.appendChild(champAxe);

      var ligne = creerEl("div", "champ-ligne");
      ["xS", "yS"].forEach(function (nom) {
        var champ = creerEl("div", "champ");
        var idInput = GenererId();
        champ.innerHTML = '<label for="' + idInput + '">' + (nom === "xS" ? "xₛ =" : "yₛ =") + "</label>";
        var input = creerEl("input", ""); input.type = "text"; input.id = idInput;
        input.value = self._brouillon[nom] || "";
        input.addEventListener("input", function () { self._brouillon[nom] = input.value; majBouton(); });
        champ.appendChild(input);
        ligne.appendChild(champ);
      });
      carte.appendChild(ligne);

      this._boutonAide(carte, function () { self._activerAide(); });
      var valider = creerEl("button", "btn-primary", "Valider");
      function majBouton() { valider.disabled = !(self._brouillon.axeTexte && self._brouillon.xS && self._brouillon.yS); }
      valider.disabled = true; majBouton();
      valider.addEventListener("click", function () {
        var xS = C.parserNombreOuFraction(self._brouillon.xS || "");
        var yS = C.parserNombreOuFraction(self._brouillon.yS || "");
        var rep = { axeTexte: self._brouillon.axeTexte || "", xS: xS === null ? NaN : xS, yS: yS === null ? NaN : yS };
        var statut = C.diagnostiquerAxeSommet(self._exercice, rep);
        if (statut === "correct") self._soumettre(true);
        else if (statut === "parse_error") self._soumettreParseError();
        else self._soumettre(false);
      });
      carte.appendChild(valider);
      var err = this._construireErreur();
      if (err) carte.appendChild(err);
    }

    // ---------------- Écran 4 : domaine et image ----------------
    _rendrePhase_domaineImage(carte) {
      carte.appendChild(this._construireEquationBox("ordre"));
      var etape = this._etapes.domaineImage;
      var self = this;
      carte.appendChild(creerEl("p", "consigne", "dom f = ℝ. Quel est l'ensemble-image (im f) de cette fonction ?"));
      if (etape.terminee) { this._boutonContinuer(carte); return; }
      if (!this._brouillon.morceau) this._brouillon.morceau = C.etatMorceauInitial();
      var m = this._brouillon.morceau;
      var a = this._exercice.enonce.a;

      if (this._brouillon.aideAffichee) {
        var zoneSketch = creerEl("div", "sketch-zone");
        var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("viewBox", "0 0 220 170");
        zoneSketch.appendChild(svg);
        carte.appendChild(zoneSketch);
        window.Gen7Sketch.construireSketchPartage(svg, {
          a: a, c: this._exercice.enonce.c, yS: this._exercice.yS, xS: this._exercice.xS,
          colonnesValeurs: this._exercice.grilleSigneVariation.colonnesValeurs, indexSommet: this._exercice.grilleSigneVariation.indexSommet
        }, { surlignageImage: true });
      }

      // Port fidèle de MorceauFractionInput.tsx (jamais un côté pré-rempli/verrouillé d'après le
      // signe réel de a — l'élève choisit ACTIVEMENT les 2 crochets ET quel côté est infini,
      // exactement comme dans le vrai générateur) : [crochet g] [borne g] [−∞] ; [+∞] [borne d]
      // [crochet d]. Un crochet se verrouille en "]"/"[" UNIQUEMENT une fois que l'élève a
      // lui-même activé le toggle "-∞"/"+∞" de CE côté — jamais l'autre, jamais d'après a.
      var ligne = creerEl("div", "intervalle-ligne");

      var bG = creerEl("button", "btn", C.crochetGaucheEffectif(m) || "?");
      ligne.appendChild(bG);

      var inputG = creerEl("input", ""); inputG.type = "text";
      inputG.placeholder = "borne gauche";
      ligne.appendChild(inputG);

      var btnMoinsInf = creerEl("button", "btn", "−∞");
      ligne.appendChild(btnMoinsInf);

      ligne.appendChild(creerEl("span", "", " ; "));

      var btnPlusInf = creerEl("button", "btn", "+∞");
      ligne.appendChild(btnPlusInf);

      var inputD = creerEl("input", ""); inputD.type = "text";
      inputD.placeholder = "borne droite";
      ligne.appendChild(inputD);

      var bD = creerEl("button", "btn", C.crochetDroitEffectif(m) || "?");
      ligne.appendChild(bD);
      carte.appendChild(ligne);

      var apercu = creerEl("div", "apercu-box");
      carte.appendChild(apercu);

      this._boutonAide(carte, function () { self._activerAide(); });
      var valider = creerEl("button", "btn-primary", "Valider");

      function maj() {
        bG.textContent = C.crochetGaucheEffectif(m) || "?";
        bG.disabled = C.crochetGaucheVerrouille(m);
        bD.textContent = C.crochetDroitEffectif(m) || "?";
        bD.disabled = C.crochetDroitVerrouille(m);
        inputG.disabled = m.borneGaucheMode === "-inf";
        inputG.value = m.borneGaucheMode === "-inf" ? "" : m.borneGaucheValeur;
        inputD.disabled = m.borneDroiteMode === "+inf";
        inputD.value = m.borneDroiteMode === "+inf" ? "" : m.borneDroiteValeur;
        btnMoinsInf.className = "btn" + (m.borneGaucheMode === "-inf" ? " toggle-active" : "");
        btnPlusInf.className = "btn" + (m.borneDroiteMode === "+inf" ? " toggle-active" : "");
        apercu.textContent = F.formatApercuIntervalle({
          crochetGauche: C.crochetGaucheEffectif(m) || "?",
          borneGauche: m.borneGaucheMode === "-inf" ? "-inf" : C.parserNombreOuFraction(m.borneGaucheValeur),
          crochetDroit: C.crochetDroitEffectif(m) || "?",
          borneDroite: m.borneDroiteMode === "+inf" ? "+inf" : C.parserNombreOuFraction(m.borneDroiteValeur)
        });
        valider.disabled = !C.morceauEstComplet(m);
      }

      bG.addEventListener("click", function () { m.crochetGauche = C.toggleCrochetGauche(m.crochetGauche); maj(); });
      bD.addEventListener("click", function () { m.crochetDroit = C.toggleCrochetDroit(m.crochetDroit); maj(); });
      btnMoinsInf.addEventListener("click", function () {
        m.borneGaucheMode = m.borneGaucheMode === "-inf" ? "nombre" : "-inf";
        m.borneGaucheValeur = "";
        maj();
      });
      btnPlusInf.addEventListener("click", function () {
        m.borneDroiteMode = m.borneDroiteMode === "+inf" ? "nombre" : "+inf";
        m.borneDroiteValeur = "";
        maj();
      });
      inputG.addEventListener("input", function () { m.borneGaucheValeur = inputG.value; maj(); });
      inputD.addEventListener("input", function () { m.borneDroiteValeur = inputD.value; maj(); });

      maj();

      valider.addEventListener("click", function () {
        var reponse = C.construireMorceau(m);
        var statut = C.diagnostiquerImage(self._exercice, reponse);
        if (statut === "correct") self._soumettre(true);
        else if (statut === "parse_error") self._soumettreParseError();
        else self._soumettre(false);
      });
      carte.appendChild(valider);
      var err = this._construireErreur();
      if (err) carte.appendChild(err);
    }

    // ---------------- Écran 5a : reconnaissance ----------------
    _rendrePhase_racinesReconnaissance(carte) {
      carte.appendChild(this._construireEquationBox("canonique"));
      var etape = this._etapes.racinesReconnaissance;
      var self = this;
      if (etape.terminee) { this._boutonContinuer(carte); return; }
      carte.appendChild(creerEl("p", "consigne", "Quelle est la méthode la plus rapide pour trouver les racines de f ?"));
      var grille = creerEl("div", "options-grid");
      ["mise_en_evidence", "binome_conjugue", "produit_remarquable", "irreductible"].forEach(function (cle) {
        var b = creerEl("button", "btn" + (self._brouillon.choix === cle ? " toggle-active" : ""), LABELS_CATEGORIE[cle]);
        b.addEventListener("click", function () { self._brouillon.choix = cle; self._render(); });
        grille.appendChild(b);
      });
      carte.appendChild(grille);
      this._boutonValider(carte, "Valider", function () {
        self._soumettre(C.verifierChoixCategorie(self._exercice, self._brouillon.choix));
      }, !this._brouillon.choix);
    }

    // ---------------- Écran 5b : factorisation ----------------
    _rendrePhase_racinesChamp1(carte) {
      carte.appendChild(this._construireEquationBox("canonique"));
      var etape = this._etapes.racinesChamp1;
      var self = this;
      if (etape.terminee) { this._boutonContinuer(carte); return; }
      carte.appendChild(creerEl("p", "consigne", "Factorise l'équation."));
      var champ = creerEl("div", "champ");
      var idInput = GenererId();
      champ.innerHTML = '<label for="' + idInput + '">Forme factorisée</label>';
      var input = creerEl("input", ""); input.type = "text"; input.id = idInput;
      input.placeholder = "ex : 2(x+1)(x-3)";
      input.value = this._brouillon.texte || "";
      input.addEventListener("input", function () { self._brouillon.texte = input.value; valider.disabled = !input.value.trim(); });
      champ.appendChild(input);
      carte.appendChild(champ);
      var valider = creerEl("button", "btn-primary", "Valider");
      valider.disabled = true;
      valider.addEventListener("click", function () {
        var statut = C.diagnostiquerFactorisation(self._exercice, self._brouillon.texte || "");
        if (statut === "correct") self._soumettre(true);
        else if (statut === "parse_error") self._soumettreParseError();
        else self._soumettre(false);
      });
      carte.appendChild(valider);
      var err = this._construireErreur();
      if (err) carte.appendChild(err);
    }

    // ---------------- Écran 5c : racines ----------------
    _rendrePhase_racinesChamp2(carte) {
      carte.appendChild(this._construireEquationBox("canonique"));
      var etape = this._etapes.racinesChamp2;
      var self = this;
      // formeFactorisee vient toujours de la génération (bug réel corrigé : cette valeur n'était
      // calculée nulle part avant, d'où un texte générique "factorisation confirmée" affiché
      // systématiquement) — jamais recalculée ici, jamais dérivée de la saisie de l'élève, même
      // convention que ui/etatActuelAnalyseFonction.ts (vrai générateur) : "irreductible" est la
      // seule catégorie sans forme factorisée, mais elle saute cet écran entièrement (ORDRE_BASE).
      var etat = creerEl("div", "etat-actuel", this._exercice.solution.formeFactorisee + " = 0");
      carte.appendChild(etat);
      if (etape.terminee) { this._boutonContinuer(carte); return; }
      if (this._brouillon.presence === undefined) this._brouillon.presence = null;
      if (!this._brouillon.racines) this._brouillon.racines = [""];
      carte.appendChild(creerEl("p", "consigne", "Quelles sont les racines ?"));
      var grille = creerEl("div", "options-grid");
      [["non", "Pas de racine"], ["oui", "Au moins une racine"]].forEach(function (pair) {
        var b = creerEl("button", "btn" + (self._brouillon.presence === pair[0] ? " toggle-active" : ""), pair[1]);
        b.addEventListener("click", function () { self._brouillon.presence = pair[0]; self._render(); });
        grille.appendChild(b);
      });
      carte.appendChild(grille);
      var pret = false;
      if (this._brouillon.presence === "non") pret = true;
      if (this._brouillon.presence === "oui") {
        var liste = creerEl("div", "liste-morceaux");
        this._brouillon.racines.forEach(function (v, i) {
          var l = creerEl("div", "morceau-ligne");
          var inp = creerEl("input", ""); inp.type = "text"; inp.placeholder = "racine " + (i + 1); inp.value = v;
          inp.addEventListener("input", function () { self._brouillon.racines[i] = inp.value; majPret(); });
          l.appendChild(inp);
          if (self._brouillon.racines.length > 1) {
            var rm = creerEl("button", "morceau-retirer", "×");
            rm.addEventListener("click", function () { self._brouillon.racines.splice(i, 1); self._render(); });
            l.appendChild(rm);
          }
          liste.appendChild(l);
        });
        carte.appendChild(liste);
        if (this._brouillon.racines.length < 2) {
          var ajouter = creerEl("button", "btn-ajouter", "+ Ajouter une racine");
          ajouter.addEventListener("click", function () { self._brouillon.racines.push(""); self._render(); });
          carte.appendChild(ajouter);
        }
        pret = this._brouillon.racines.every(function (v) { return v.trim() !== ""; });
      }
      function majPret() { valider.disabled = !calculerPret(); }
      function calculerPret() {
        if (self._brouillon.presence === "non") return true;
        if (self._brouillon.presence === "oui") return self._brouillon.racines.every(function (v) { return v.trim() !== ""; });
        return false;
      }
      var valider = creerEl("button", "btn-primary", "Valider");
      valider.disabled = !pret;
      valider.addEventListener("click", function () {
        var saisies;
        if (self._brouillon.presence === "non") saisies = [];
        else {
          var vals = self._brouillon.racines.map(function (v) { return C.parserNombreOuFraction(v); });
          if (vals.some(function (v) { return v === null; })) { self._soumettreParseError(); return; }
          saisies = vals.length === 1 ? [vals[0], vals[0]] : vals;
        }
        if (self._brouillon.presence === "non") {
          self._soumettre(false); // "pas de racine" n'est jamais la bonne réponse pour les catégories qui atteignent cet écran
          return;
        }
        self._soumettre(C.verifierRacines(self._exercice, saisies));
      });
      carte.appendChild(valider);
      var err = this._construireErreur();
      if (err) carte.appendChild(err);
    }

    // ---------------- Écran 6 : tableau ----------------
    _rendrePhase_tableauSignes(carte) {
      carte.appendChild(this._construireEquationBox("ordre"));
      var etape = this._etapes.tableauSignes;
      var self = this;
      var g = this._exercice.grilleSigneVariation;
      var n = g.ligneSigne.length;
      if (!this._brouillon.signe) this._brouillon.signe = new Array(n).fill(null);
      if (!this._brouillon.variation) this._brouillon.variation = new Array(n).fill(null);

      carte.appendChild(creerEl("p", "consigne", "Complète le tableau de signe et de variation."));
      if (this._brouillon.aideAffichee && !etape.terminee) {
        var zoneSketch = creerEl("div", "sketch-zone");
        var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("viewBox", "0 0 220 170");
        zoneSketch.appendChild(svg);
        carte.appendChild(zoneSketch);
        window.Gen7Sketch.construireSketchPartage(svg, {
          a: this._exercice.enonce.a, c: this._exercice.enonce.c, yS: this._exercice.yS, xS: this._exercice.xS,
          colonnesValeurs: g.colonnesValeurs, indexSommet: g.indexSommet
        }, { surlignageImage: true, marquesRacines: this._exercice.categorie !== "irreductible" });
      }

      var scroll = creerEl("div", "grille-scroll");
      var table = creerEl("table", "grille-signes");
      var enteteRow = creerEl("tr");
      enteteRow.appendChild(creerEl("th", "", "x"));
      enteteRow.appendChild(creerEl("td", "", "−∞"));
      for (var col = 0; col < n; col++) {
        if (col % 2 === 0) enteteRow.appendChild(creerEl("td", ""));
        else {
          var pointIndex = (col - 1) / 2;
          var estSommet = pointIndex === g.indexSommet;
          enteteRow.appendChild(creerEl("td", "", estSommet ? "x<sub>S</sub>" : (F.formatNombreFr(g.colonnesValeurs[pointIndex]))));
        }
      }
      enteteRow.appendChild(creerEl("td", "", "+∞"));
      table.appendChild(enteteRow);

      function ligneToggle(labelLigne, tableau, cycle, classePrefixe) {
        var tr = creerEl("tr");
        tr.appendChild(creerEl("th", "", labelLigne));
        tr.appendChild(creerEl("td", ""));
        for (var i = 0; i < n; i++) {
          (function (i) {
            var td = creerEl("td", "");
            var mauvaise = etape.terminee === false && self._brouillon.aTenteUneFois && tableau[i] !== null &&
              ((labelLigne.indexOf("Signe") === 0 && tableau[i] !== g.ligneSigne[i]) || (labelLigne.indexOf("Variation") === 0 && tableau[i] !== g.ligneVariation[i]));
            var btn = creerEl("button", "toggle-signe" + (mauvaise ? " is-erronee" : ""), tableau[i] === null ? "?" : tableau[i]);
            btn.disabled = etape.terminee;
            btn.addEventListener("click", function () {
              tableau[i] = cycle(tableau[i]);
              self._render();
            });
            td.appendChild(btn);
            tr.appendChild(td);
          })(i);
        }
        tr.appendChild(creerEl("td", ""));
        return tr;
      }
      function cycleSigne(v) { return v === null ? "+" : (v === "+" ? "-" : (v === "-" ? "0" : "+")); }
      function cycleVariation(v) {
        var ordre = [null, "⌢", "⌣", "↗", "↘"];
        var idx = ordre.indexOf(v);
        return ordre[(idx + 1) % ordre.length] || "⌢";
      }
      table.appendChild(ligneToggle("Signe de f(x)", this._brouillon.signe, cycleSigne));
      table.appendChild(ligneToggle("Variation", this._brouillon.variation, cycleVariation));
      scroll.appendChild(table);
      carte.appendChild(scroll);

      if (etape.terminee) { this._boutonContinuer(carte); return; }

      this._boutonAide(carte, function () { self._activerAide(); });
      var complet = this._brouillon.signe.every(function (v) { return v !== null; }) && this._brouillon.variation.every(function (v) { return v !== null; });
      var valider = creerEl("button", "btn-primary", "Valider");
      valider.disabled = !complet;
      valider.addEventListener("click", function () {
        self._brouillon.aTenteUneFois = true;
        var ok = C.verifierTableau(self._exercice, self._brouillon.signe, self._brouillon.variation);
        self._soumettre(ok);
      });
      carte.appendChild(valider);
      var err = this._construireErreur();
      if (err) carte.appendChild(err);
    }

    // ---------------- Récap fin d'exercice / fin de session ----------------
    _rendreRecapExercice(carte) {
      var self = this;
      carte.appendChild(creerEl("div", "resume-final", '<p class="titre">Exercice terminé</p>'));
      carte.appendChild(this._construireRecapPartielComplet());
      var total = ORDRE_BASE.reduce(function (s, p) { return s + (self._etapes[p].score || 0); }, 0);
      var nbActives = ORDRE_BASE.filter(function (p) { return self._etapes[p].score !== null; }).length;
      var moyenne = nbActives ? Math.round((total / nbActives) * 10) / 10 : 0;
      carte.appendChild(creerEl("p", "consigne", "Score moyen de l'exercice : " + moyenne + " / 100"));
      var btn = creerEl("button", "btn-primary", "Exercice suivant →");
      btn.addEventListener("click", function () { self._demarrerExercice(); });
      carte.appendChild(btn);
    }

    _construireRecapPartielComplet() {
      var recap = creerEl("div", "recap");
      var self = this;
      ORDRE_BASE.forEach(function (p) {
        var e = self._etapes[p];
        var statut = e.score === null ? null : (e.revele ? "rouge" : (e.aideUtilisee ? "orange" : "verte"));
        if (statut === null) return;
        var icone = statut === "rouge" ? "✗" : "✓";
        var ligne = creerEl("div", "recap-ligne recap-" + statut);
        ligne.innerHTML = "<span>" + icone + "</span><span class='nom'>" + LABELS_ETAPE[p] + "</span><span>" + e.score + " pts</span>";
        recap.appendChild(ligne);
      });
      return recap;
    }

    _rendreResumeSession(carte) {
      var self = this;
      carte.innerHTML = "";
      carte.appendChild(creerEl("div", "resume-final", '<p class="titre">Session terminée — ' + this._reglages.nombreExercices + " exercices</p>"));
      var table = creerEl("table");
      var head = creerEl("tr");
      ["#", "Catégorie", "Coeff.", "Allure", "Axe/S", "Dom/Im", "Racines", "Signe/Var."].forEach(function (h) { head.appendChild(creerEl("th", "", h)); });
      table.appendChild(head);
      this._session.resultats.forEach(function (r, i) {
        var tr = creerEl("tr");
        tr.appendChild(creerEl("td", "", String(i + 1)));
        tr.appendChild(creerEl("td", "", LABELS_CATEGORIE[r.categorie]));
        [r.scores.coefficients, r.scores.allure, r.scores.axeSommet, r.scores.domaineImage, r.scores.racinesChamp2, r.scores.tableauSignes].forEach(function (s) {
          tr.appendChild(creerEl("td", "", s === null || s === undefined ? "—" : String(s)));
        });
        table.appendChild(tr);
      });
      carte.appendChild(table);
      var moyennes = this._session.resultats.map(function (r) {
        var vals = Object.keys(r.scores).map(function (k) { return r.scores[k]; }).filter(function (v) { return v !== null; });
        return vals.reduce(function (a, b) { return a + b; }, 0) / (vals.length || 1);
      });
      var moyenneGlobale = Math.round((moyennes.reduce(function (a, b) { return a + b; }, 0) / (moyennes.length || 1)) * 10) / 10;
      carte.appendChild(creerEl("p", "consigne", "Moyenne de la session : " + moyenneGlobale + " / 100"));
      var btn = creerEl("button", "btn-primary", "Recommencer une session");
      btn.addEventListener("click", function () {
        self._session = { indexExercice: 0, resultats: [] };
        self._demarrerExercice();
      });
      carte.appendChild(btn);
    }
  }

  if (!customElements.get("gen7-widget")) customElements.define("gen7-widget", Gen7WidgetEl);
})();

