/* Gen8 core logic — "Transformations graphiques d'une parabole" (4e FWB, plateforme-maths).
 * Module pur (aucun DOM) pour pouvoir être testé sous Node avant intégration UI.
 * Réutilise, une fois chargé dans le navigateur, window.Gen7Core.parserExpressionAlgebrique /
 * extraireCoefficientsQuadratiques (gen7-widget/core.js) pour la vérification du champ équation —
 * pas de duplication du parseur algébrique. Sous Node (tests), un mini-shim équivalent est utilisé
 * à la place (voir bas de fichier). */
(function (root) {
  "use strict";

  var Gen8Core = {};

  // ---------------------------------------------------------------------
  // Aléatoire / génération (Couche A — src/generateurs/transformationsGraphiques/index.ts)
  // ---------------------------------------------------------------------
  function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

  function genererExercice() {
    var p = randomInt(-5, 5);
    var q = randomInt(-5, 5);
    var ev = randomInt(1, 5);
    var cv = randomInt(1, 5);
    var sox = Math.random() < 0.5;
    return { p: p, q: q, ev: ev, cv: cv, sox: sox };
  }

  // ---------------------------------------------------------------------
  // Vérification (Couche B — src/moteur/verificationTransformationsGraphiques.ts)
  // ---------------------------------------------------------------------
  function calculerA(params) {
    var magnitude = params.ev / params.cv;
    return params.sox ? -magnitude : magnitude;
  }

  /** a(x-p)²+q développé en {a,b,c} équivalent : ax² - 2ap·x + (ap²+q). */
  function enonceEquivalent(exercice) {
    var a = calculerA(exercice);
    var p = exercice.p, q = exercice.q;
    return { a: a, b: -2 * a * p, c: a * p * p + q };
  }

  var TOLERANCE_EQUATION = 1e-6;

  /**
   * Équivalence algébrique flexible ("sous n'importe quelle forme", jamais une exigence de
   * structure factorisée — contrairement à gen7) : on parse, on échantillonne les coefficients
   * {a,b,c} du polynôme obtenu (quelle que soit sa forme d'écriture), on compare à l'énoncé
   * équivalent développé. Un échec de PARSING (syntaxe invalide) → "parse_error" ; une expression
   * qui parse mais n'est pas un polynôme de degré 2 cohérent → "not_equivalent" (jamais
   * "parse_error" — même distinction que `diagnostiquerFormeFactorisee`, moteur/expressionAlgebrique.ts).
   */
  function diagnostiquerEquation(exercice, texte, parseur) {
    var P = parseur || root.Gen7Core;
    var ast = P.parserExpressionAlgebrique(texte);
    if (!ast) return "parse_error";
    var coeffs = P.extraireCoefficientsQuadratiques(ast);
    if (!coeffs) return "not_equivalent";
    var e = enonceEquivalent(exercice);
    var ok = Math.abs(coeffs.a - e.a) <= TOLERANCE_EQUATION &&
      Math.abs(coeffs.b - e.b) <= TOLERANCE_EQUATION &&
      Math.abs(coeffs.c - e.c) <= TOLERANCE_EQUATION;
    return ok ? "correct" : "not_equivalent";
  }

  function verifierEquation(exercice, texte, parseur) {
    return diagnostiquerEquation(exercice, texte, parseur) === "correct";
  }

  var TOLERANCE_RAPPORT = 1e-9;

  /** EV/CV ne sont jamais comparés individuellement à une valeur canonique — seul le RAPPORT
   * ev/cv compte (il représente |a|) : ev=4,cv=2 est équivalent à ev=2,cv=1. */
  function evaluerCurseurs(exercice, reponse) {
    var rapportCorrect = Math.abs(reponse.ev / reponse.cv - exercice.ev / exercice.cv) < TOLERANCE_RAPPORT;
    return {
      th: reponse.th === exercice.p,
      tv: reponse.tv === exercice.q,
      ev: rapportCorrect,
      cv: rapportCorrect,
      sox: reponse.sox === exercice.sox
    };
  }

  function verifierCurseurs(exercice, reponse) {
    var e = evaluerCurseurs(exercice, reponse);
    return e.th && e.tv && e.ev && e.cv && e.sox;
  }

  // ---------------------------------------------------------------------
  // Notation par tentatives (src/moteur/etapeTentatives.ts) — brique générique partagée.
  // ---------------------------------------------------------------------
  function demarrerEtapeTentatives() {
    return { tentativesUtilisees: 0, terminee: false, reussie: false, revelee: false, score: null };
  }

  /** verifier: (reponse)=>boolean. Formule : réussite après k échecs -> pointsDeBase -
   * k*(pointsDeBase/tentativesMax) (plein si penaliteActivee=false). Échec après tentativesMax
   * tentatives -> score 0 + révélation, pénalité ou non. */
  function soumettreEtapeTentatives(etat, reponse, config) {
    if (etat.terminee) throw new Error("soumettreEtapeTentatives : étape déjà terminée");
    if (config.verifier(reponse)) {
      var penalitePourTentative = config.pointsDeBase / config.tentativesMax;
      var score = config.penaliteActivee
        ? Math.max(0, config.pointsDeBase - etat.tentativesUtilisees * penalitePourTentative)
        : config.pointsDeBase;
      return { tentativesUtilisees: etat.tentativesUtilisees, terminee: true, reussie: true, revelee: false, score: score };
    }
    var tentativesUtilisees = etat.tentativesUtilisees + 1;
    if (tentativesUtilisees >= config.tentativesMax) {
      return { tentativesUtilisees: tentativesUtilisees, terminee: true, reussie: false, revelee: true, score: 0 };
    }
    return { tentativesUtilisees: tentativesUtilisees, terminee: false, reussie: false, revelee: false, score: null };
  }

  // ---------------------------------------------------------------------
  // Fraction irréductible (src/ui/formatFraction.ts)
  // ---------------------------------------------------------------------
  function pgcd(a, b) { return b === 0 ? a : pgcd(b, a % b); }

  function formatFractionIrreductible(valeur, denominateurMax) {
    denominateurMax = denominateurMax || 100;
    if (Number.isInteger(valeur)) return String(valeur);
    for (var q = 2; q <= denominateurMax; q++) {
      var p = valeur * q;
      if (Math.abs(p - Math.round(p)) < 1e-9) {
        var numerateur = Math.round(p);
        var diviseur = pgcd(Math.abs(numerateur), q);
        var n = numerateur / diviseur;
        var d = q / diviseur;
        return d === 1 ? String(n) : (n + "/" + d);
      }
    }
    return String(valeur);
  }

  // ---------------------------------------------------------------------
  // Géométrie du graphe (src/ui/mafsTransformation.ts) — cadrage adaptatif + grille "jolie".
  // ---------------------------------------------------------------------
  function evaluerCourbe(params, x) {
    return params.a * (x - params.p) * (x - params.p) + params.q;
  }

  /** Second point marqué (croix) : argument de x² vaut exactement 1, x=p+1. */
  function pointUnitaire(params) {
    var x = params.p + 1;
    return { x: x, y: evaluerCourbe(params, x) };
  }

  var DEMI_LARGEUR_COURBE = 4;
  var EXPOSANT_CADRAGE = 0.6;

  function demiLargeurCadrage(a) {
    return DEMI_LARGEUR_COURBE / Math.pow(Math.abs(a), EXPOSANT_CADRAGE);
  }

  var RATIO_GRAPHE = 3 / 2;
  var ECHANTILLONS = 40;

  function etendreBornes(bornes, courbe) {
    var demiLargeur = demiLargeurCadrage(courbe.a);
    var xMin = Math.min(bornes.xMin, courbe.p - demiLargeur);
    var xMax = Math.max(bornes.xMax, courbe.p + demiLargeur);
    var yMin = bornes.yMin, yMax = bornes.yMax;
    for (var i = 0; i <= ECHANTILLONS; i++) {
      var x = courbe.p - demiLargeur + (2 * demiLargeur * i) / ECHANTILLONS;
      var y = evaluerCourbe(courbe, x);
      yMin = Math.min(yMin, y);
      yMax = Math.max(yMax, y);
    }
    return { xMin: xMin, xMax: xMax, yMin: yMin, yMax: yMax };
  }

  /** Élargit x OU y (jamais les deux, jamais un rétrécissement) pour atteindre exactement `ratio`,
   * en gardant le même centre. */
  function ajusterAuRatio(x, y, ratio) {
    var largeurZone = x[1] - x[0];
    var hauteurZone = y[1] - y[0];
    var ratioZone = largeurZone / hauteurZone;
    if (ratioZone > ratio) {
      var centreY = (y[0] + y[1]) / 2;
      var demiHauteur = largeurZone / ratio / 2;
      return { x: x, y: [centreY - demiHauteur, centreY + demiHauteur] };
    }
    var centreX = (x[0] + x[1]) / 2;
    var demiLargeur = (hauteurZone * ratio) / 2;
    return { x: [centreX - demiLargeur, centreX + demiLargeur], y: y };
  }

  /** ViewBox couvrant 1 ou 2 courbes ({p,q,a} chacune), avec padding proportionnel (12%, plancher
   * 1 unité) puis mise au ratio 3/2. */
  function calculerViewBoxTransformation(courbes) {
    var bornes = { xMin: Infinity, xMax: -Infinity, yMin: Infinity, yMax: -Infinity };
    for (var i = 0; i < courbes.length; i++) bornes = etendreBornes(bornes, courbes[i]);
    var paddingY = Math.max(1, (bornes.yMax - bornes.yMin) * 0.12);
    var paddingX = Math.max(1, (bornes.xMax - bornes.xMin) * 0.12);
    return ajusterAuRatio(
      [bornes.xMin - paddingX, bornes.xMax + paddingX],
      [bornes.yMin - paddingY, bornes.yMax + paddingY],
      RATIO_GRAPHE
    );
  }

  var MANTISSES_GRILLE = [1, 2, 5];
  var MANTISSES_GRILLE_DECADE_UNITAIRE = [1, 2, 2.5, 10 / 3, 5];
  var EXPOSANT_DECADE_UNITAIRE = -1;
  var CIBLE_NOMBRE_LIGNES = 10;

  function arrondirPasGrille(valeur) { return Number(valeur.toPrecision(10)); }

  /** Pas de grille "joli" (mantisse en {1,2,5}×10^n, extension {1,2,2.5,10/3,5} dans la décade
   * unitaire pour couvrir 1/2, 1/3, 1/4, 1/5 d'unité) — src/ui/mafsTransformation.ts::calculerPasGrille. */
  function calculerPasGrille(largeur, cibleNombreLignes) {
    cibleNombreLignes = cibleNombreLignes || CIBLE_NOMBRE_LIGNES;
    var brut = largeur / cibleNombreLignes;
    var exposant = Math.floor(Math.log10(brut) + 1e-9);
    var base = Math.pow(10, exposant);
    var mantisses = exposant === EXPOSANT_DECADE_UNITAIRE ? MANTISSES_GRILLE_DECADE_UNITAIRE : MANTISSES_GRILLE;
    for (var i = 0; i < mantisses.length; i++) {
      var candidat = mantisses[i] * base;
      if (candidat >= brut * (1 - 1e-9)) return arrondirPasGrille(candidat);
    }
    return arrondirPasGrille(10 * base);
  }

  function formatEtiquetteGrille(valeur) { return String(Number(valeur.toPrecision(10))); }

  var VALEUR_TIERS = 1 / 3;
  function formatUnites(pas) {
    if (pas === 1) return "1 unité";
    if (Math.abs(pas - VALEUR_TIERS) < 1e-6) return "1/3 unité";
    return formatEtiquetteGrille(pas) + " unités";
  }

  function formatIndicateurPasGrille(pasX, pasY) {
    return "Horizontal : 1 carré = " + formatUnites(pasX) + " — Vertical : 1 carré = " + formatUnites(pasY);
  }

  // ---------------------------------------------------------------------
  // Formatage (src/ui/formatTransformationsGraphiques.ts) — texte/unicode, pas de KaTeX (cohérent
  // avec le reste des widgets de cet artefact).
  // ---------------------------------------------------------------------
  function formatApercuEquation(equation) {
    var contenu = equation.trim() === "" ? "…" : equation;
    return "f(x) = " + contenu;
  }

  function formatCorpsCarre(p) {
    if (p === 0) return "x²";
    var interieur = p > 0 ? ("x − " + p) : ("x + " + (-p));
    return "(" + interieur + ")²";
  }

  /** Reformulation exacte de l'équation attendue (révélation après échec) — jamais un décimal
   * arrondi pour la branche CV (1/cv peut être périodique). */
  function formatEquationTransformationLatex(exercice) {
    var p = exercice.p, q = exercice.q, ev = exercice.ev, cv = exercice.cv, sox = exercice.sox;
    var corpsCarre = formatCorpsCarre(p);
    var signe = sox ? "−" : "";
    var corps;
    if (cv > 1) {
      var numerateur = ev > 1 ? (ev + corpsCarre) : corpsCarre;
      corps = signe + numerateur + "/" + cv;
    } else if (ev > 1) {
      corps = signe + ev + corpsCarre;
    } else {
      corps = signe + corpsCarre;
    }
    var termeQ = q === 0 ? "" : (" " + (q > 0 ? "+" : "−") + " " + Math.abs(q));
    return "f(x) = " + corps + termeQ;
  }

  Gen8Core.randomInt = randomInt;
  Gen8Core.genererExercice = genererExercice;
  Gen8Core.calculerA = calculerA;
  Gen8Core.enonceEquivalent = enonceEquivalent;
  Gen8Core.diagnostiquerEquation = diagnostiquerEquation;
  Gen8Core.verifierEquation = verifierEquation;
  Gen8Core.evaluerCurseurs = evaluerCurseurs;
  Gen8Core.verifierCurseurs = verifierCurseurs;
  Gen8Core.demarrerEtapeTentatives = demarrerEtapeTentatives;
  Gen8Core.soumettreEtapeTentatives = soumettreEtapeTentatives;
  Gen8Core.formatFractionIrreductible = formatFractionIrreductible;
  Gen8Core.evaluerCourbe = evaluerCourbe;
  Gen8Core.pointUnitaire = pointUnitaire;
  Gen8Core.demiLargeurCadrage = demiLargeurCadrage;
  Gen8Core.RATIO_GRAPHE = RATIO_GRAPHE;
  Gen8Core.calculerViewBoxTransformation = calculerViewBoxTransformation;
  Gen8Core.ajusterAuRatio = ajusterAuRatio;
  Gen8Core.calculerPasGrille = calculerPasGrille;
  Gen8Core.formatEtiquetteGrille = formatEtiquetteGrille;
  Gen8Core.formatIndicateurPasGrille = formatIndicateurPasGrille;
  Gen8Core.formatApercuEquation = formatApercuEquation;
  Gen8Core.formatEquationTransformationLatex = formatEquationTransformationLatex;

  root.Gen8Core = Gen8Core;
})(window);

