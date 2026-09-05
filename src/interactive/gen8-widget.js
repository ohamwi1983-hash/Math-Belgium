/* <gen8-widget> — port JS autonome (Web Component, Shadow DOM) de gen8
 * "Transformations graphiques d'une parabole" (4e FWB, plateforme-maths).
 * Dépend de Gen8Core (ce dossier) et de Gen7Core (gen7-widget/core.js, déjà chargé sur la page
 * pour <gen7-widget>) pour le parseur algébrique du champ équation. */
(function () {
  "use strict";
  var C = window.Gen8Core;
  var P = window.Gen7Core;

  var COULEUR_CIBLE = "#d6336c";
  var COULEUR_LIVE = "#1971c2";

  function creerEl(tag, cls, texte) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (texte !== undefined) e.textContent = texte;
    return e;
  }

  function svgEl(tag, attrs) {
    var e = document.createElementNS("http://www.w3.org/2000/svg", tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }

  function formatLabelPoint(x, y) {
    return "(" + C.formatFractionIrreductible(x) + " ; " + C.formatFractionIrreductible(y) + ")";
  }

  var TERMINOLOGIE = [
    { abbr: "TH", texte: "translation horizontale" },
    { abbr: "TV", texte: "translation verticale" },
    { abbr: "SOX", texte: "symétrie orthogonale d'axe Ox" },
    { abbr: "EV", texte: "étirement vertical" },
    { abbr: "CV", texte: "compression verticale" }
  ];

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    "<style>" +
    ":host{display:block;font-family:var(--sans,system-ui,sans-serif);}" +
    "*{box-sizing:border-box;}" +
    ".carte{background:var(--surface,#fff);border:1px solid var(--line,#e2d8c8);border-radius:var(--radius,6px);padding:22px;max-width:600px;margin:0 auto;}" +
    ".entete{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:4px 12px;margin-bottom:14px;font-family:var(--mono,monospace);font-size:11.5px;letter-spacing:.05em;text-transform:uppercase;color:var(--ink-faint,#9c9083);}" +
    ".barre-progres{height:4px;border-radius:2px;background:var(--line-soft,#ede5d7);overflow:hidden;margin-bottom:18px;}" +
    ".barre-progres > div{height:100%;background:var(--accent,#a8471f);transition:width .25s ease;}" +
    ".consigne{margin:0 0 14px;color:var(--ink-soft,#6b6055);font-size:.95rem;}" +
    ".graphe-zone{margin-bottom:6px;}" +
    ".graphe-zone svg{width:100%;height:auto;display:block;background:var(--surface-2,#faf6f0);border-radius:4px;border:1px solid var(--line,#e2d8c8);}" +
    ".grille-ligne{stroke:var(--line,#e2d8c8);stroke-width:1;}" +
    ".grille-axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.4;}" +
    ".grille-etiquette{font-size:9.5px;fill:var(--ink-faint,#9c9083);font-family:var(--sans,sans-serif);}" +
    ".courbe-cible{fill:none;stroke:" + COULEUR_CIBLE + ";stroke-width:3;}" +
    ".courbe-live{fill:none;stroke:" + COULEUR_LIVE + ";stroke-width:3;stroke-dasharray:7 5;}" +
    ".point-sommet{stroke:var(--surface,#fff);stroke-width:1.2;}" +
    ".point-croix{font-size:15px;font-weight:700;text-anchor:middle;dominant-baseline:central;}" +
    ".pas-grille-texte{font-size:.78rem;color:var(--ink-faint,#9c9083);text-align:center;margin:0 0 8px;}" +
    ".legende{display:flex;flex-wrap:wrap;gap:6px 14px;font-size:.78rem;color:var(--ink-soft,#6b6055);margin-bottom:14px;}" +
    ".legende-item{display:flex;align-items:center;gap:5px;}" +
    ".legende-swatch{display:inline-block;width:14px;height:3px;border-radius:2px;}" +
    ".legende-swatch.cible{background:" + COULEUR_CIBLE + ";}" +
    ".legende-swatch.live{background:" + COULEUR_LIVE + ";border-top:2px dashed " + COULEUR_LIVE + ";height:0;}" +
    ".legende-pt{display:inline-block;width:9px;height:9px;border-radius:50%;}" +
    ".legende-pt.cible{background:" + COULEUR_CIBLE + ";}" +
    ".legende-pt.live{background:" + COULEUR_LIVE + ";}" +
    ".btn-terminologie{width:30px;height:30px;border-radius:50%;border:1px solid var(--line,#e2d8c8);background:var(--surface,#fff);color:var(--ink-soft,#6b6055);cursor:pointer;font-weight:700;font-family:inherit;margin-bottom:8px;}" +
    ".btn-terminologie:hover{border-color:var(--accent,#a8471f);color:var(--accent,#a8471f);}" +
    ".terminologie-liste{list-style:none;margin:0 0 16px;padding:10px 14px;background:var(--surface-2,#faf6f0);border:1px solid var(--line,#e2d8c8);border-radius:4px;font-size:.85rem;color:var(--ink,#241f1a);display:flex;flex-direction:column;gap:4px;}" +
    ".terminologie-liste[hidden]{display:none;}" +
    ".curseur-row{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:12px;}" +
    ".curseur-champ{display:flex;flex-direction:column;gap:4px;padding:8px 10px;border-radius:4px;border:1px solid transparent;}" +
    ".curseur-champ.is-erronee{border-color:var(--bad,#b23a3a);background:var(--bad-soft,#f6dede);}" +
    ".curseur-champ span{font-size:.85rem;font-weight:600;color:var(--ink,#241f1a);font-family:var(--mono,monospace);}" +
    ".curseur-champ input[type=range]{width:100%;accent-color:var(--accent,#a8471f);}" +
    ".btn{padding:11px 14px;border-radius:4px;border:1px solid var(--line,#e2d8c8);background:var(--surface,#fff);color:var(--ink,#241f1a);font-size:.92rem;cursor:pointer;font-family:inherit;text-align:center;}" +
    ".btn:hover{border-color:var(--accent,#a8471f);}" +
    ".btn.toggle-active{background:var(--accent,#a8471f);border-color:var(--accent,#a8471f);color:var(--on-accent,#fff);}" +
    ".btn.is-erronee{border-color:var(--bad,#b23a3a);background:var(--bad-soft,#f6dede);}" +
    ".btn-sox{display:block;width:100%;margin-bottom:14px;}" +
    ".template-box{background:var(--surface-2,#faf6f0);border:1px solid var(--line,#e2d8c8);border-radius:4px;padding:12px 16px;text-align:center;font-family:var(--serif,serif);font-style:italic;font-size:1.1rem;margin-bottom:12px;color:var(--ink,#241f1a);}" +
    ".field-inline{display:flex;align-items:center;gap:8px;margin-bottom:12px;}" +
    ".field-inline label{font-family:var(--serif,serif);font-style:italic;color:var(--ink-soft,#6b6055);white-space:nowrap;}" +
    ".field-inline input{flex:1;padding:9px 10px;border:1px solid var(--line,#e2d8c8);border-radius:4px;font-size:1rem;font-family:inherit;background:var(--surface,#fff);color:var(--ink,#241f1a);}" +
    ".field-inline input.is-erronee{border-color:var(--bad,#b23a3a);background:var(--bad-soft,#f6dede);}" +
    ".alert-error{background:var(--bad-soft,#f6dede);border:1px solid var(--bad,#b23a3a);color:var(--bad,#b23a3a);border-radius:4px;padding:9px 12px;font-size:.85rem;margin:0 0 10px;}" +
    ".alert-success{background:var(--good-soft,#dcefe2);border:1px solid var(--good,#2f7a4f);color:var(--good,#2f7a4f);border-radius:4px;padding:9px 12px;font-size:.85rem;margin:0 0 10px;}" +
    ".btn-aide{display:block;width:100%;padding:10px;border-radius:4px;border:1px solid var(--tip,#8a7200);background:var(--tip-soft,#faf3d5);color:var(--tip,#8a7200);font-weight:600;font-size:.88rem;cursor:pointer;font-family:inherit;margin-bottom:10px;}" +
    ".btn-aide:disabled{opacity:.5;cursor:not-allowed;}" +
    ".btn-primary{display:block;width:100%;padding:13px;border-radius:4px;border:1px solid var(--accent,#a8471f);background:var(--accent,#a8471f);color:var(--on-accent,#fff);font-weight:700;font-size:1rem;cursor:pointer;font-family:inherit;}" +
    ".btn-primary:disabled{opacity:.45;cursor:not-allowed;}" +
    ".recap-ligne{display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:4px;font-size:.88rem;margin-bottom:6px;}" +
    ".recap-verte{background:var(--good-soft,#dcefe2);color:var(--good,#2f7a4f);}" +
    ".recap-orange{background:var(--attn-soft,#f7ecd6);color:var(--attn,#96650c);}" +
    ".recap-rouge{background:var(--bad-soft,#f6dede);color:var(--bad,#b23a3a);}" +
    ".recap-ligne .nom{color:var(--ink,#241f1a);font-weight:600;flex:1;}" +
    ".total-recap{text-align:center;font-weight:700;font-size:1rem;margin:14px 0;color:var(--ink,#241f1a);}" +
    ".answer-reveal{background:var(--surface-2,#faf6f0);border:1px dashed var(--accent-soft-line,#e8c4a4);border-radius:4px;padding:10px 14px;font-size:.85rem;color:var(--accent-ink,#7a3212);margin-bottom:10px;font-family:var(--serif,serif);font-style:italic;}" +
    ".resume-final{text-align:center;}" +
    ".resume-final .titre{font-family:var(--serif,serif);font-size:1.3rem;font-weight:600;margin-bottom:4px;color:var(--ink,#241f1a);}" +
    ".resume-final .sous-titre{color:var(--ink-soft,#6b6055);font-size:.88rem;margin-bottom:14px;}" +
    ".score-hero{margin-bottom:16px;}" +
    ".score-hero-value{font-size:2.2rem;font-weight:700;color:var(--accent,#a8471f);font-family:var(--serif,serif);}" +
    ".score-hero-label{color:var(--ink-soft,#6b6055);font-size:.85rem;}" +
    ".resume-final table{border-collapse:collapse;width:100%;font-size:.8rem;margin-bottom:16px;}" +
    ".resume-final th,.resume-final td{border:1px solid var(--line,#e2d8c8);padding:6px 4px;text-align:center;}" +
    ".resume-final th{background:var(--surface-2,#faf6f0);}" +
    ".contenu-conditionnel{margin-top:16px;}" +
    "</style>" +
    '<div class="carte" id="carte"></div>';

  class Gen8WidgetEl extends HTMLElement {
    constructor() {
      super();
      var shadow = this.attachShadow({ mode: "open" });
      shadow.appendChild(TEMPLATE.content.cloneNode(true));
      this._carte = this.shadowRoot.getElementById("carte");
      this._reglages = { nombreExercices: 5, tentativesMax: 3, penaliteActivee: true };
      this._indexExercice = 0;
      this._resultats = [];
    }

    connectedCallback() {
      this._demarrerExercice();
    }

    // -----------------------------------------------------------------
    // Cycle de vie exercice / session
    // -----------------------------------------------------------------
    _demarrerExercice() {
      this._exercice = C.genererExercice();
      this._etapeEquation = C.demarrerEtapeTentatives();
      this._etapeCurseurs = C.demarrerEtapeTentatives();
      this._aideUtilisee = false;
      this._scoreEquationExercice = null;
      this._scoreCurseursExercice = null;
      this._equationAideAppliquee = false;
      this._curseursAideAppliquee = false;
      this._th = 0; this._tv = 0; this._ev = 1; this._cv = 1; this._sox = false;
      this._equation = "";
      this._terminologieOuverte = false;
      this._erreurEquation = null;
      this._erreurCurseurs = null;
      this._rendreExercice();
    }

    _reglagesEtape() {
      return { pointsDeBase: 100, tentativesMax: this._reglages.tentativesMax, penaliteActivee: this._reglages.penaliteActivee };
    }

    _activerAide() {
      if (this._aideUtilisee) return;
      this._aideUtilisee = true;
      this._majGraphe();
      this._majBoutonAide();
    }

    _soumettre() {
      var self = this;
      if (!this._etapeEquation.terminee) {
        // Comme le vrai moteur (verifierEquationTransformation : statut === "correct", sans
        // distinction), un "parse_error" est une tentative incorrecte comme une autre — elle
        // consomme un essai au même titre qu'une valeur fausse. Ne JAMAIS court-circuiter
        // soumettreEtapeTentatives ici : le faire bloquait l'exercice indéfiniment dès qu'une
        // saisie mal formée (mais non vide) était soumise, puisque le compteur de tentatives ne
        // progressait alors plus jamais.
        var statutEq = C.diagnostiquerEquation(this._exercice, this._equation, P);
        this._erreurEquation = statutEq === "parse_error" ? "parse_error" : null;
        this._etapeEquation = C.soumettreEtapeTentatives(this._etapeEquation, this._equation, {
          pointsDeBase: 100, tentativesMax: this._reglages.tentativesMax, penaliteActivee: this._reglages.penaliteActivee,
          verifier: function () { return statutEq === "correct"; }
        });
        if (this._etapeEquation.terminee) {
          this._equationAideAppliquee = this._aideUtilisee;
          this._scoreEquationExercice = this._equationAideAppliquee ? this._etapeEquation.score * 0.5 : this._etapeEquation.score;
        }
      }

      if (!this._etapeCurseurs.terminee) {
        var reponseCurseurs = { th: this._th, tv: this._tv, ev: this._ev, cv: this._cv, sox: this._sox };
        this._etapeCurseurs = C.soumettreEtapeTentatives(this._etapeCurseurs, reponseCurseurs, {
          pointsDeBase: 100, tentativesMax: this._reglages.tentativesMax, penaliteActivee: this._reglages.penaliteActivee,
          verifier: function (r) { return C.verifierCurseurs(self._exercice, r); }
        });
        if (this._etapeCurseurs.terminee) {
          this._curseursAideAppliquee = this._aideUtilisee;
          this._scoreCurseursExercice = this._curseursAideAppliquee ? this._etapeCurseurs.score * 0.5 : this._etapeCurseurs.score;
        }
      }

      if (this._scoreEquationExercice !== null && this._scoreCurseursExercice !== null) {
        this._resultats.push({
          scoreEquation: this._scoreEquationExercice,
          equationRevele: this._etapeEquation.revelee,
          equationAideUtilisee: this._equationAideAppliquee,
          scoreCurseurs: this._scoreCurseursExercice,
          curseursRevele: this._etapeCurseurs.revelee,
          curseursAideUtilisee: this._curseursAideAppliquee
        });
        this._rendreRecap();
        return;
      }

      this._rendreExercice();
    }

    // -----------------------------------------------------------------
    // Écran unique — construit une fois, mis à jour en place (drag fluide des curseurs)
    // -----------------------------------------------------------------
    _rendreExercice() {
      var carte = this._carte;
      carte.innerHTML = "";
      var self = this;

      var entete = creerEl("div", "entete");
      entete.innerHTML = "<span>Exercice " + (this._indexExercice + 1) + " / " + this._reglages.nombreExercices + "</span><span>Transformations graphiques</span>";
      carte.appendChild(entete);
      var barre = creerEl("div", "barre-progres", "");
      barre.innerHTML = '<div style="width:' + Math.round(((this._indexExercice) / this._reglages.nombreExercices) * 100) + '%"></div>';
      carte.appendChild(barre);

      carte.appendChild(creerEl("p", "consigne", "Retrouve, par lecture graphique, les paramètres de la transformation, puis écris l'équation complète."));

      var zoneGraphe = creerEl("div", "graphe-zone");
      this._svg = svgEl("svg", { viewBox: "0 0 300 200", preserveAspectRatio: "xMidYMid meet" });
      zoneGraphe.appendChild(this._svg);
      carte.appendChild(zoneGraphe);
      this._pasTexte = creerEl("p", "pas-grille-texte", "");
      carte.appendChild(this._pasTexte);
      this._legende = creerEl("div", "legende");
      carte.appendChild(this._legende);

      var btnTerm = creerEl("button", "btn-terminologie", "?");
      btnTerm.type = "button";
      btnTerm.setAttribute("aria-label", "Rappel de la terminologie");
      btnTerm.addEventListener("click", function () {
        self._terminologieOuverte = !self._terminologieOuverte;
        listeTerm.hidden = !self._terminologieOuverte;
      });
      carte.appendChild(btnTerm);
      var listeTerm = creerEl("ul", "terminologie-liste contenu-conditionnel");
      listeTerm.hidden = !this._terminologieOuverte;
      TERMINOLOGIE.forEach(function (t) {
        var li = document.createElement("li");
        li.innerHTML = "<strong>" + t.abbr + "</strong> : " + t.texte;
        listeTerm.appendChild(li);
      });
      carte.appendChild(listeTerm);

      // Curseurs TH / TV
      var row1 = creerEl("div", "curseur-row");
      this._champTH = this._construireCurseur(row1, "TH", -5, 5, this._th, function (v) { self._th = v; self._majTout(); });
      this._champTV = this._construireCurseur(row1, "TV", -5, 5, this._tv, function (v) { self._tv = v; self._majTout(); });
      carte.appendChild(row1);
      var row2 = creerEl("div", "curseur-row");
      this._champEV = this._construireCurseur(row2, "EV", 1, 5, this._ev, function (v) { self._ev = v; self._majTout(); });
      this._champCV = this._construireCurseur(row2, "CV", 1, 5, this._cv, function (v) { self._cv = v; self._majTout(); });
      carte.appendChild(row2);

      this._btnSox = creerEl("button", "btn btn-sox", this._sox ? "SOX : Oui" : "SOX : Non");
      this._btnSox.type = "button";
      this._btnSox.addEventListener("click", function () {
        if (self._etapeCurseurs.terminee) return;
        self._sox = !self._sox;
        self._majTout();
      });
      carte.appendChild(this._btnSox);

      this._apercuBox = creerEl("div", "template-box", C.formatApercuEquation(this._equation));
      carte.appendChild(this._apercuBox);

      var ligneEq = creerEl("div", "field-inline");
      var labelEq = creerEl("label", "", "f(x) =");
      ligneEq.appendChild(labelEq);
      this._inputEquation = document.createElement("input");
      this._inputEquation.type = "text";
      this._inputEquation.placeholder = "ex : 2(x-3)^2+1";
      this._inputEquation.value = this._equation;
      this._inputEquation.disabled = this._etapeEquation.terminee;
      this._inputEquation.addEventListener("input", function () {
        self._equation = self._inputEquation.value;
        self._apercuBox.textContent = C.formatApercuEquation(self._equation);
        self._majBoutonValider();
      });
      ligneEq.appendChild(this._inputEquation);
      carte.appendChild(ligneEq);

      this._zoneMessages = creerEl("div", "");
      carte.appendChild(this._zoneMessages);

      this._btnAide = creerEl("button", "btn-aide", this._aideUtilisee ? "Aide utilisée" : "Aide");
      this._btnAide.type = "button";
      this._btnAide.disabled = this._aideUtilisee;
      this._btnAide.addEventListener("click", function () { self._activerAide(); });
      carte.appendChild(this._btnAide);

      this._btnValider = creerEl("button", "btn-primary", "Valider");
      this._btnValider.type = "button";
      this._btnValider.addEventListener("click", function () { self._soumettre(); });
      carte.appendChild(this._btnValider);

      this._majTout();
    }

    _construireCurseur(conteneur, label, min, max, valeur, onChange) {
      var champ = creerEl("label", "curseur-champ");
      var span = creerEl("span", "", label + " : " + valeur);
      champ.appendChild(span);
      var input = document.createElement("input");
      input.type = "range";
      input.min = String(min);
      input.max = String(max);
      input.step = "1";
      input.value = String(valeur);
      input.addEventListener("input", function () {
        span.textContent = label + " : " + input.value;
        onChange(Number(input.value));
      });
      champ.appendChild(input);
      conteneur.appendChild(champ);
      return { conteneur: champ, span: span, input: input };
    }

    /** Recalcule tout ce qui dépend des curseurs/aide : graphe, légende, highlight rouge des
     * curseurs, état des boutons — jamais un rebuild complet du DOM (drag fluide). */
    _majTout() {
      this._majGraphe();
      this._majHighlightCurseurs();
      this._majBoutonValider();
    }

    _cible() {
      return { p: this._exercice.p, q: this._exercice.q, a: C.calculerA(this._exercice) };
    }
    _live() {
      return this._aideUtilisee ? { p: this._th, q: this._tv, a: C.calculerA({ ev: this._ev, cv: this._cv, sox: this._sox }) } : null;
    }

    _majGraphe() {
      var svg = this._svg;
      while (svg.firstChild) svg.removeChild(svg.firstChild);

      var cible = this._cible();
      var live = this._live();
      var courbes = live ? [cible, live] : [cible];
      var vb = C.calculerViewBoxTransformation(courbes);
      var xMin = vb.x[0], xMax = vb.x[1], yMin = vb.y[0], yMax = vb.y[1];
      var W = 300, H = 200;
      function px(x) { return ((x - xMin) / (xMax - xMin)) * W; }
      function py(y) { return H - ((y - yMin) / (yMax - yMin)) * H; }

      var pasX = C.calculerPasGrille(xMax - xMin);
      var pasY = C.calculerPasGrille(yMax - yMin);
      this._pasTexte.textContent = C.formatIndicateurPasGrille(pasX, pasY);

      // Grille — étiquettes ancrées sur l'axe visible s'il l'est, sinon repliées sur le bord du
      // cadre (l'axe correspondant est alors hors-champ) ; celles trop proches d'un bord sont
      // omises pour ne jamais être coupées par le viewBox (simplification par rapport au vrai
      // moteur Mafs, qui étend le viewBox lui-même pour toujours les faire tenir).
      var ancreLabelX = yMin <= 0 && yMax >= 0 ? py(0) - 2 : (yMin > 0 ? H - 4 : 10);
      var ancreLabelY = xMin <= 0 && xMax >= 0 ? px(0) + 2 : (xMin > 0 ? 2 : W - 20);
      var gStart = Math.ceil(xMin / pasX) * pasX;
      for (var gx = gStart; gx <= xMax + 1e-9; gx += pasX) {
        svg.appendChild(svgEl("line", { class: "grille-ligne", x1: px(gx), x2: px(gx), y1: 0, y2: H }));
        if (Math.abs(gx) > 1e-9 && px(gx) > 14 && px(gx) < W - 14) {
          var lx = svgEl("text", { class: "grille-etiquette", x: px(gx) + 2, y: ancreLabelX });
          lx.textContent = C.formatEtiquetteGrille(gx);
          svg.appendChild(lx);
        }
      }
      var gStartY = Math.ceil(yMin / pasY) * pasY;
      for (var gy = gStartY; gy <= yMax + 1e-9; gy += pasY) {
        svg.appendChild(svgEl("line", { class: "grille-ligne", x1: 0, x2: W, y1: py(gy), y2: py(gy) }));
        if (Math.abs(gy) > 1e-9 && py(gy) > 12 && py(gy) < H - 6) {
          var ly = svgEl("text", { class: "grille-etiquette", x: ancreLabelY, y: py(gy) - 2 });
          ly.textContent = C.formatEtiquetteGrille(gy);
          svg.appendChild(ly);
        }
      }
      // Axes
      if (yMin <= 0 && yMax >= 0) svg.appendChild(svgEl("line", { class: "grille-axe", x1: 0, x2: W, y1: py(0), y2: py(0) }));
      if (xMin <= 0 && xMax >= 0) svg.appendChild(svgEl("line", { class: "grille-axe", x1: px(0), x2: px(0), y1: 0, y2: H }));

      function tracerCourbe(params, classe) {
        var demiLargeur = C.demiLargeurCadrage(params.a);
        var x0 = Math.max(xMin, params.p - demiLargeur * 1.4);
        var x1 = Math.min(xMax, params.p + demiLargeur * 1.4);
        var N = 60;
        var d = "";
        for (var i = 0; i <= N; i++) {
          var x = x0 + ((x1 - x0) * i) / N;
          var y = C.evaluerCourbe(params, x);
          var yClamped = Math.max(yMin - (yMax - yMin), Math.min(yMax + (yMax - yMin), y));
          d += (i === 0 ? "M " : "L ") + px(x).toFixed(2) + " " + py(yClamped).toFixed(2) + " ";
        }
        var path = svgEl("path", { class: classe, d: d });
        svg.appendChild(path);
      }

      tracerCourbe(cible, "courbe-cible");
      var sommetCible = svgEl("circle", { class: "point-sommet", cx: px(cible.p), cy: py(cible.q), r: 5, fill: COULEUR_CIBLE });
      svg.appendChild(sommetCible);
      var uCible = C.pointUnitaire(cible);
      var croixCible = svgEl("text", { class: "point-croix", x: px(uCible.x), y: py(uCible.y), fill: COULEUR_CIBLE });
      croixCible.textContent = "×";
      svg.appendChild(croixCible);

      if (live) {
        tracerCourbe(live, "courbe-live");
        var sommetLive = svgEl("circle", { class: "point-sommet", cx: px(live.p), cy: py(live.q), r: 5, fill: COULEUR_LIVE });
        svg.appendChild(sommetLive);
        var uLive = C.pointUnitaire(live);
        var croixLive = svgEl("text", { class: "point-croix", x: px(uLive.x), y: py(uLive.y), fill: COULEUR_LIVE });
        croixLive.textContent = "×";
        svg.appendChild(croixLive);
      }

      // Légende
      this._legende.innerHTML = "";
      function itemLegende(swatchHtml, texte) {
        var span = creerEl("span", "legende-item");
        span.innerHTML = swatchHtml + " " + texte;
        return span;
      }
      this._legende.appendChild(itemLegende('<span class="legende-swatch cible"></span>', "courbe cible"));
      if (live) this._legende.appendChild(itemLegende('<span class="legende-swatch live"></span>', "ta courbe (curseurs)"));
      this._legende.appendChild(itemLegende('<span class="legende-pt cible"></span>', "Point sommet : " + formatLabelPoint(cible.p, cible.q)));
      this._legende.appendChild(itemLegende('<span style="color:' + COULEUR_CIBLE + ';font-weight:700;">×</span>', "Point croix : " + formatLabelPoint(uCible.x, uCible.y)));
      if (live) {
        this._legende.appendChild(itemLegende('<span class="legende-pt live"></span>', "Point sommet (curseurs) : " + formatLabelPoint(live.p, live.q)));
        this._legende.appendChild(itemLegende('<span style="color:' + COULEUR_LIVE + ';font-weight:700;">×</span>', "Point croix (curseurs) : " + formatLabelPoint(uLive.x, uLive.y)));
      }
    }

    _majHighlightCurseurs() {
      var montrer = !this._etapeCurseurs.terminee && this._etapeCurseurs.tentativesUtilisees > 0;
      var evalu = C.evaluerCurseurs(this._exercice, { th: this._th, tv: this._tv, ev: this._ev, cv: this._cv, sox: this._sox });
      function classe(champ, ok) {
        champ.conteneur.classList.toggle("is-erronee", montrer && !ok);
        champ.input.disabled = this._etapeCurseurs.terminee;
      }
      classe.call(this, this._champTH, evalu.th);
      classe.call(this, this._champTV, evalu.tv);
      classe.call(this, this._champEV, evalu.ev);
      classe.call(this, this._champCV, evalu.cv);
      this._btnSox.classList.toggle("is-erronee", montrer && !evalu.sox);
      this._btnSox.textContent = this._sox ? "SOX : Oui" : "SOX : Non";
      this._btnSox.disabled = this._etapeCurseurs.terminee;

      this._zoneMessages.innerHTML = "";
      if (this._erreurEquation === "parse_error") {
        this._zoneMessages.appendChild(creerEl("p", "alert-error", 'Équation non reconnue — vérifie la syntaxe (parenthèses, "*" entre nombre et variable, etc.).'));
      } else if (this._etapeEquation.tentativesUtilisees > 0 && !this._etapeEquation.terminee) {
        this._zoneMessages.appendChild(creerEl("p", "alert-error", "Équation incorrecte — tentative " + this._etapeEquation.tentativesUtilisees + "/" + this._reglages.tentativesMax + ", réessaie."));
      } else if (this._etapeEquation.terminee && this._etapeEquation.reussie) {
        this._zoneMessages.appendChild(creerEl("p", "alert-success", "Équation correcte !"));
      }
      if (montrer) {
        this._zoneMessages.appendChild(creerEl("p", "alert-error", "Curseurs incorrects (en rouge) — tentative " + this._etapeCurseurs.tentativesUtilisees + "/" + this._reglages.tentativesMax + ", réessaie."));
      } else if (this._etapeCurseurs.terminee && this._etapeCurseurs.reussie) {
        this._zoneMessages.appendChild(creerEl("p", "alert-success", "Curseurs corrects !"));
      }
    }

    _majBoutonAide() {
      this._btnAide.disabled = this._aideUtilisee;
      this._btnAide.textContent = this._aideUtilisee ? "Aide utilisée" : "Aide";
    }

    _majBoutonValider() {
      var equationVide = !this._etapeEquation.terminee && this._equation.trim() === "";
      this._btnValider.disabled = equationVide;
      this._inputEquation.disabled = this._etapeEquation.terminee;
      this._inputEquation.classList.toggle("is-erronee", this._erreurEquation === "parse_error");
    }

    // -----------------------------------------------------------------
    // Récapitulatif final d'exercice
    // -----------------------------------------------------------------
    _rendreRecap() {
      var carte = this._carte;
      carte.innerHTML = "";
      var self = this;
      var resultat = this._resultats[this._resultats.length - 1];
      var exercice = this._exercice;

      var uneEtapeRevelee = resultat.equationRevele || resultat.curseursRevele;
      carte.appendChild(creerEl("h2", "", "Transformations graphiques d'une parabole"));
      carte.appendChild(creerEl("p", "consigne", uneEtapeRevelee ? "Au moins une note a dû être révélée après trop d'échecs." : "Résultat de l'exercice"));

      function statut(revele, aideUtilisee) {
        if (revele) return "rouge";
        if (aideUtilisee) return "orange";
        return "verte";
      }
      function libelle(s) {
        if (s === "rouge") return "Réponse révélée";
        if (s === "orange") return "Correct (aide utilisée)";
        return "Correct";
      }
      function ligneRecap(label, s) {
        var div = creerEl("div", "recap-ligne recap-" + s);
        div.innerHTML = "<span class='nom'>" + label + "</span><span>" + libelle(s) + "</span>";
        return div;
      }
      var statutEq = statut(resultat.equationRevele, resultat.equationAideUtilisee);
      var statutCu = statut(resultat.curseursRevele, resultat.curseursAideUtilisee);
      carte.appendChild(ligneRecap("Équation", statutEq));
      carte.appendChild(ligneRecap("Curseurs", statutCu));

      var total = resultat.scoreEquation + resultat.scoreCurseurs;
      carte.appendChild(creerEl("p", "total-recap", "Total : " + Math.round(total) + "/200"));

      if (resultat.scoreEquation === 0) {
        carte.appendChild(creerEl("div", "answer-reveal", "Fonction attendue : " + C.formatEquationTransformationLatex(exercice)));
      }
      if (resultat.scoreCurseurs === 0) {
        carte.appendChild(creerEl("p", "answer-reveal",
          "Curseurs attendus : TH = " + exercice.p + " ; TV = " + exercice.q + " ; EV = " + exercice.ev + " ; CV = " + exercice.cv + " ; SOX = " + (exercice.sox ? "Oui" : "Non")));
      }

      var suite = this._indexExercice + 1 < this._reglages.nombreExercices;
      var btn = creerEl("button", "btn-primary", suite ? "Exercice suivant →" : "Voir le résumé");
      btn.type = "button";
      btn.addEventListener("click", function () {
        self._indexExercice++;
        if (self._indexExercice >= self._reglages.nombreExercices) {
          self._rendreResume();
        } else {
          self._demarrerExercice();
        }
      });
      carte.appendChild(btn);
    }

    // -----------------------------------------------------------------
    // Résumé de session
    // -----------------------------------------------------------------
    _rendreResume() {
      var carte = this._carte;
      carte.innerHTML = "";
      var self = this;
      var resultats = this._resultats;

      function moyenneExercice(r) { return (r.scoreEquation + r.scoreCurseurs) / 2; }
      var moyenne = resultats.reduce(function (s, r) { return s + moyenneExercice(r); }, 0) / resultats.length;

      var zone = creerEl("div", "resume-final");
      zone.appendChild(creerEl("div", "titre", "Session terminée"));
      zone.appendChild(creerEl("div", "sous-titre", resultats.length + " exercices complétés"));
      var hero = creerEl("div", "score-hero");
      hero.appendChild(creerEl("div", "score-hero-value", Math.round(moyenne) + "/100"));
      hero.appendChild(creerEl("div", "score-hero-label", "score moyen"));
      zone.appendChild(hero);

      var table = document.createElement("table");
      table.innerHTML = "<thead><tr><th>#</th><th>Équation</th><th>Curseurs</th></tr></thead>";
      var tbody = document.createElement("tbody");
      resultats.forEach(function (r, i) {
        var tr = document.createElement("tr");
        tr.innerHTML = "<td>" + (i + 1) + "</td><td>" + Math.round(r.scoreEquation) + "</td><td>" + Math.round(r.scoreCurseurs) + "</td>";
        tbody.appendChild(tr);
      });
      table.appendChild(tbody);
      zone.appendChild(table);

      var btn = creerEl("button", "btn-primary", "Recommencer");
      btn.type = "button";
      btn.addEventListener("click", function () {
        self._indexExercice = 0;
        self._resultats = [];
        self._demarrerExercice();
      });
      zone.appendChild(btn);
      carte.appendChild(zone);
    }
  }

  if (!customElements.get("gen8-widget")) customElements.define("gen8-widget", Gen8WidgetEl);
})();

