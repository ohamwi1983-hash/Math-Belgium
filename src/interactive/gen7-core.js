/* Gen7 core logic — génération, grille signe/variation, parseur algébrique, vérification.
 * Module pur (aucun DOM) pour pouvoir être testé directement sous Node avant intégration UI. */
(function (root) {
  "use strict";

  var Gen7Core = {};

  // ---------------------------------------------------------------------
  // Aléatoire
  // ---------------------------------------------------------------------
  function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
  function randomNonZeroInt(min, max) {
    var v;
    do { v = randomInt(min, max); } while (v === 0);
    return v;
  }

  // ---------------------------------------------------------------------
  // Générateurs par catégorie
  // ---------------------------------------------------------------------
  /** Miroir texte (unicode "−", cohérent avec format.js) des formules RÉELLES de
   * src/generateurs/secondDegre/categories/*.ts — construites ici pendant la génération (à côté
   * de a/b/c/r, déjà en variables locales), jamais recalculées à l'affichage ni dérivées de la
   * saisie de l'élève (même principe que solution.formeFactorisee côté vrai générateur, lu tel
   * quel par ui/etatActuelAnalyseFonction.ts). a>0 toujours ici (les 3 constructeurs tirent
   * randomInt(1,4)), donc pas besoin du cas a<0 du vrai fichier miseEnEvidence.ts. */
  function construireMiseEnEvidence() {
    var a = randomInt(1, 4);
    var r = randomNonZeroInt(-5, 5);
    var b = -a * r;
    var c = 0;
    var prefixe = a === 1 ? "" : String(a);
    var formeFactorisee = prefixe + "x(" + (r >= 0 ? "x − " + r : "x + " + Math.abs(r)) + ")";
    return {
      categorie: "mise_en_evidence",
      enonce: { a: a, b: b, c: c },
      solution: { formeFactorisee: formeFactorisee, racines: [0, r].sort(function (x, y) { return x - y; }), racinesExactes: true }
    };
  }

  function construireBinomeConjugue() {
    var a = randomInt(1, 4);
    var r = randomInt(1, 5);
    var b = 0;
    var c = -a * r * r;
    var prefixe = a === 1 ? "" : String(a);
    var formeFactorisee = prefixe + "(x − " + r + ")(x + " + r + ")";
    return {
      categorie: "binome_conjugue",
      enonce: { a: a, b: b, c: c },
      solution: { formeFactorisee: formeFactorisee, racines: [-r, r], racinesExactes: true }
    };
  }

  function construireProduitRemarquable() {
    var a = randomInt(1, 4);
    var r = randomNonZeroInt(-5, 5);
    var b = -2 * a * r;
    var c = a * r * r;
    var prefixe = a === 1 ? "" : String(a);
    var formeFactorisee = prefixe + "(" + (r >= 0 ? "x − " + r : "x + " + Math.abs(r)) + ")²";
    return {
      categorie: "produit_remarquable",
      enonce: { a: a, b: b, c: c },
      solution: { formeFactorisee: formeFactorisee, racines: [r, r], racinesExactes: true }
    };
  }

  function construireIrreductible() {
    var a = randomNonZeroInt(-4, 4);
    var m = randomInt(-4, 4);
    var b = a * m;
    var seuil = (b * b) / (4 * a);
    var marge = randomInt(1, 4);
    var c = a > 0 ? Math.ceil(seuil) + marge : Math.floor(seuil) - marge;
    return {
      categorie: "irreductible",
      enonce: { a: a, b: b, c: c },
      solution: { racines: [NaN, NaN], racinesExactes: false }
    };
  }

  var CONSTRUCTEURS = [construireMiseEnEvidence, construireBinomeConjugue, construireProduitRemarquable, construireIrreductible];

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }

  function construireGrilleSigneVariation(enonce, racinesPourGrille, xS, yS) {
    var a = enonce.a;
    var r1 = racinesPourGrille[0], r2 = racinesPourGrille[1];
    var lo = Math.min(r1, r2), hi = Math.max(r1, r2);
    var racineDouble = lo === hi;
    var colonnesValeurs = racineDouble ? [lo] : [lo, xS, hi];
    var indexSommet = racineDouble ? 0 : 1;
    var k = colonnesValeurs.length;
    var nbColonnes = 2 * k + 1;
    var signeYS = yS > 0 ? "+" : (yS < 0 ? "-" : "0");
    var signeA = a > 0 ? "+" : "-";
    var ligneSigne = new Array(nbColonnes);
    var ligneVariation = new Array(nbColonnes);
    for (var col = 0; col < nbColonnes; col++) {
      var estZone = (col % 2 === 0);
      var estExtreme = (col === 0 || col === nbColonnes - 1);
      if (estZone) {
        ligneSigne[col] = estExtreme ? signeA : signeYS;
      } else {
        var pointIndex = (col - 1) / 2;
        ligneSigne[col] = (pointIndex === indexSommet) ? signeYS : "0";
      }
    }
    var avant = a > 0 ? "↘" : "↗"; // ↘ / ↗
    var apres = a > 0 ? "↗" : "↘"; // ↗ / ↘
    var symboleSommet = a > 0 ? "⌣" : "⌢"; // ⌣ / ⌢
    var indexColSommet = 2 * indexSommet + 1;
    for (var col2 = 0; col2 < nbColonnes; col2++) {
      if (col2 === indexColSommet) ligneVariation[col2] = symboleSommet;
      else if (col2 < indexColSommet) ligneVariation[col2] = avant;
      else ligneVariation[col2] = apres;
    }
    return { colonnesValeurs: colonnesValeurs, indexSommet: indexSommet, ligneSigne: ligneSigne, ligneVariation: ligneVariation };
  }

  function genererExerciceAnalyseFonction() {
    var construit = CONSTRUCTEURS[randomInt(0, CONSTRUCTEURS.length - 1)]();
    var a = construit.enonce.a, b = construit.enonce.b, c = construit.enonce.c;
    var xS = -b / (2 * a);
    var yS = a * xS * xS + b * xS + c;
    var termesPresents = [];
    if (a !== 0) termesPresents.push("a");
    if (b !== 0) termesPresents.push("b");
    if (c !== 0) termesPresents.push("c");
    var ordreTermes = shuffle(termesPresents);
    var racinesPourGrille = construit.categorie === "irreductible" ? [xS, xS] : construit.solution.racines;
    var grilleSigneVariation = construireGrilleSigneVariation(construit.enonce, racinesPourGrille, xS, yS);
    return {
      categorie: construit.categorie,
      enonce: construit.enonce,
      solution: construit.solution,
      xS: xS,
      yS: yS,
      ordreTermes: ordreTermes,
      grilleSigneVariation: grilleSigneVariation
    };
  }

  Gen7Core.randomInt = randomInt;
  Gen7Core.randomNonZeroInt = randomNonZeroInt;
  Gen7Core.genererExerciceAnalyseFonction = genererExerciceAnalyseFonction;
  Gen7Core.construireGrilleSigneVariation = construireGrilleSigneVariation;
  Gen7Core.CONSTRUCTEURS_DEBUG = { // exposé pour les tests uniquement
    miseEnEvidence: construireMiseEnEvidence,
    binomeConjugue: construireBinomeConjugue,
    produitRemarquable: construireProduitRemarquable,
    irreductible: construireIrreductible
  };

  // ---------------------------------------------------------------------
  // Parsing nombre / fraction (français : virgule décimale, "p/q")
  // ---------------------------------------------------------------------
  function parserNombreOuFraction(texte) {
    if (typeof texte !== "string") return null;
    var t = texte.trim();
    if (t === "") return null;
    var mFrac = t.match(/^([+-]?\d+(?:[.,]\d+)?)\s*\/\s*([+-]?\d+(?:[.,]\d+)?)$/);
    if (mFrac) {
      var num = parseFloat(mFrac[1].replace(",", "."));
      var den = parseFloat(mFrac[2].replace(",", "."));
      if (den === 0 || !isFinite(num) || !isFinite(den)) return null;
      return num / den;
    }
    var mDec = t.match(/^[+-]?\d+(?:[.,]\d+)?$/);
    if (!mDec) return null;
    var v = parseFloat(t.replace(",", "."));
    return isFinite(v) ? v : null;
  }

  function analyserAxeSymetrie(texte) {
    if (typeof texte !== "string") return null;
    var m = texte.trim().match(/^x\s*=\s*(.+)$/i);
    if (!m) return null;
    return parserNombreOuFraction(m[1]);
  }

  Gen7Core.parserNombreOuFraction = parserNombreOuFraction;
  Gen7Core.analyserAxeSymetrie = analyserAxeSymetrie;

  // ---------------------------------------------------------------------
  // Morceau d'intervalle fraction-compatible (écran domaine/image) — port fidèle de
  // src/ui/morceauFraction.ts : 2 crochets et 2 bornes TOUJOURS activement choisis par l'élève,
  // jamais pré-remplis/verrouillés d'après le signe réel de a (seul un côté finit verrouillé, une
  // fois que l'élève a lui-même activé son toggle "-∞"/"+∞" — jamais avant, et jamais l'autre
  // côté). Bug réel corrigé : la version précédente forçait un côté à l'infini et désactivait son
  // champ selon le signe de a, retirant à l'élève la tâche de choisir lui-même quel côté est
  // non borné.
  // ---------------------------------------------------------------------
  function toggleCrochetGauche(actuel) {
    if (actuel === null) return "[";
    return actuel === "[" ? "]" : "[";
  }
  function toggleCrochetDroit(actuel) {
    if (actuel === null) return "]";
    return actuel === "]" ? "[" : "]";
  }
  function crochetGaucheVerrouille(etat) { return etat.borneGaucheMode === "-inf"; }
  function crochetDroitVerrouille(etat) { return etat.borneDroiteMode === "+inf"; }
  function crochetGaucheEffectif(etat) { return crochetGaucheVerrouille(etat) ? "]" : etat.crochetGauche; }
  function crochetDroitEffectif(etat) { return crochetDroitVerrouille(etat) ? "[" : etat.crochetDroit; }
  function borneGaucheValide(etat) { return etat.borneGaucheMode === "-inf" || parserNombreOuFraction(etat.borneGaucheValeur) !== null; }
  function borneDroiteValide(etat) { return etat.borneDroiteMode === "+inf" || parserNombreOuFraction(etat.borneDroiteValeur) !== null; }
  function morceauEstComplet(etat) {
    return borneGaucheValide(etat) && borneDroiteValide(etat) &&
      crochetGaucheEffectif(etat) !== null && crochetDroitEffectif(etat) !== null;
  }
  function construireMorceau(etat) {
    if (!morceauEstComplet(etat)) return null;
    return {
      crochetGauche: crochetGaucheEffectif(etat),
      borneGauche: etat.borneGaucheMode === "-inf" ? "-inf" : parserNombreOuFraction(etat.borneGaucheValeur),
      crochetDroit: crochetDroitEffectif(etat),
      borneDroite: etat.borneDroiteMode === "+inf" ? "+inf" : parserNombreOuFraction(etat.borneDroiteValeur)
    };
  }
  function etatMorceauInitial() {
    return { crochetGauche: null, borneGaucheMode: "nombre", borneGaucheValeur: "", crochetDroit: null, borneDroiteMode: "nombre", borneDroiteValeur: "" };
  }

  Gen7Core.toggleCrochetGauche = toggleCrochetGauche;
  Gen7Core.toggleCrochetDroit = toggleCrochetDroit;
  Gen7Core.crochetGaucheVerrouille = crochetGaucheVerrouille;
  Gen7Core.crochetDroitVerrouille = crochetDroitVerrouille;
  Gen7Core.crochetGaucheEffectif = crochetGaucheEffectif;
  Gen7Core.crochetDroitEffectif = crochetDroitEffectif;
  Gen7Core.morceauEstComplet = morceauEstComplet;
  Gen7Core.construireMorceau = construireMorceau;
  Gen7Core.etatMorceauInitial = etatMorceauInitial;

  // ---------------------------------------------------------------------
  // Parseur algébrique (pour la factorisation en texte libre, écran "Champ1")
  // Grammaire : expr := terme (('+'|'-') terme)*
  //             terme := facteurPuissance (( '*'|'/'|'·'|'×' )? facteurPuissance)*   [multiplication implicite]
  //             facteurPuissance := unaire ('^' facteurPuissance)?  [droite-associatif] puis suffixes ²/³
  //             unaire := ('-'|'+')? primaire
  //             primaire := NOMBRE | 'x' | '(' expr ')'
  // ---------------------------------------------------------------------
  function tokeniser(texteBrut) {
    var texte = texteBrut
      .replace(/\s*=\s*0\s*$/i, "")
      .replace(/×/g, "*")
      .replace(/·/g, "*")
      .trim();
    var tokens = [];
    var i = 0;
    while (i < texte.length) {
      var ch = texte[i];
      if (/\s/.test(ch)) { i++; continue; }
      if (/\d/.test(ch)) {
        var j = i;
        while (j < texte.length && /[\d.,]/.test(texte[j])) j++;
        var brut = texte.slice(i, j).replace(",", ".");
        if ((brut.match(/\./g) || []).length > 1) return null; // nombre malformé
        tokens.push({ type: "NUM", value: parseFloat(brut) });
        i = j;
        continue;
      }
      if (ch === "x" || ch === "X") { tokens.push({ type: "VAR" }); i++; continue; }
      if (ch === "²") { tokens.push({ type: "SUP", value: 2 }); i++; continue; }
      if (ch === "³") { tokens.push({ type: "SUP", value: 3 }); i++; continue; }
      if ("+-*/^()".indexOf(ch) !== -1) { tokens.push({ type: ch }); i++; continue; }
      return null; // caractère non reconnu
    }
    return tokens;
  }

  function creerParseur(tokens) {
    var pos = 0;
    function peek() { return tokens[pos]; }
    function avancer() { return tokens[pos++]; }

    function estDebutPrimaire(tok) {
      return tok && (tok.type === "NUM" || tok.type === "VAR" || tok.type === "(");
    }

    function parserPrimaire() {
      var tok = peek();
      if (!tok) return null;
      if (tok.type === "NUM") { avancer(); return { type: "Num", value: tok.value }; }
      if (tok.type === "VAR") { avancer(); return { type: "Var" }; }
      if (tok.type === "(") {
        avancer();
        var e = parserExpr();
        if (!e) return null;
        if (!peek() || peek().type !== ")") return null;
        avancer();
        return e;
      }
      return null;
    }

    function parserSuffixesPuissance(noeud) {
      while (peek() && peek().type === "SUP") {
        var s = avancer();
        noeud = { type: "Pow", base: noeud, exposant: { type: "Num", value: s.value } };
      }
      return noeud;
    }

    function parserUnaire() {
      if (peek() && peek().type === "-") { avancer(); var e = parserUnaire(); if (!e) return null; return { type: "Neg", expr: e }; }
      if (peek() && peek().type === "+") { avancer(); return parserUnaire(); }
      var p = parserPrimaire();
      if (!p) return null;
      return parserSuffixesPuissance(p);
    }

    function parserPuissance() {
      var base = parserUnaire();
      if (!base) return null;
      if (peek() && peek().type === "^") {
        avancer();
        var exp = parserPuissance();
        if (!exp) return null;
        return { type: "Pow", base: base, exposant: exp };
      }
      return base;
    }

    function parserTerme() {
      var noeud = parserPuissance();
      if (!noeud) return null;
      for (;;) {
        var tok = peek();
        if (tok && (tok.type === "*" || tok.type === "/")) {
          avancer();
          var droite = parserPuissance();
          if (!droite) return null;
          noeud = { type: tok.type === "*" ? "Mul" : "Div", gauche: noeud, droite: droite };
        } else if (estDebutPrimaire(tok)) {
          // multiplication implicite : "2x", "2(x+1)", "x(x-4)", "(x-1)(x+1)"
          var droite2 = parserPuissance();
          if (!droite2) return null;
          noeud = { type: "Mul", gauche: noeud, droite: droite2 };
        } else break;
      }
      return noeud;
    }

    function parserExpr() {
      var noeud = parserTerme();
      if (!noeud) return null;
      for (;;) {
        var tok = peek();
        if (tok && (tok.type === "+" || tok.type === "-")) {
          avancer();
          var droite = parserTerme();
          if (!droite) return null;
          noeud = { type: tok.type === "+" ? "Add" : "Sub", gauche: noeud, droite: droite };
        } else break;
      }
      return noeud;
    }

    return {
      parserComplet: function () {
        var e = parserExpr();
        if (!e || pos !== tokens.length) return null;
        return e;
      }
    };
  }

  function parserExpressionAlgebrique(texte) {
    var tokens = tokeniser(texte);
    if (!tokens || tokens.length === 0) return null;
    var ast = creerParseur(tokens).parserComplet();
    return ast;
  }

  function evaluerAst(noeud, xVal) {
    switch (noeud.type) {
      case "Num": return noeud.value;
      case "Var": return xVal;
      case "Add": return evaluerAst(noeud.gauche, xVal) + evaluerAst(noeud.droite, xVal);
      case "Sub": return evaluerAst(noeud.gauche, xVal) - evaluerAst(noeud.droite, xVal);
      case "Mul": return evaluerAst(noeud.gauche, xVal) * evaluerAst(noeud.droite, xVal);
      case "Div": return evaluerAst(noeud.gauche, xVal) / evaluerAst(noeud.droite, xVal);
      case "Neg": return -evaluerAst(noeud.expr, xVal);
      case "Pow": return Math.pow(evaluerAst(noeud.base, xVal), evaluerAst(noeud.exposant, xVal));
      default: return NaN;
    }
  }

  /** Racine de l'AST structurellement "factorisée" : un produit ou une puissance,
   * jamais une somme/différence nue au sommet (rejette la forme développée). */
  function estFormeFactorisee(ast) {
    return ast.type === "Mul" || ast.type === "Pow" || ast.type === "Div";
  }

  /** Extrait {a,b,c} d'une expression supposée quadratique par échantillonnage
   * (interpolation sur 3 points + vérification de cohérence sur 2 points supplémentaires). */
  function extraireCoefficientsQuadratiques(ast) {
    function f(x) { return evaluerAst(ast, x); }
    var fm1 = f(-1), f0 = f(0), f1 = f(1);
    if (!isFinite(fm1) || !isFinite(f0) || !isFinite(f1)) return null;
    var c = f0;
    var b = (f1 - fm1) / 2;
    var a = (f1 + fm1 - 2 * c) / 2;
    var pred2 = a * 4 + b * 2 + c;
    var predM2 = a * 4 - b * 2 + c;
    var f2 = f(2), fm2 = f(-2);
    if (!isFinite(f2) || !isFinite(fm2)) return null;
    if (Math.abs(f2 - pred2) > 1e-6 || Math.abs(fm2 - predM2) > 1e-6) return null;
    return { a: a, b: b, c: c };
  }

  Gen7Core.parserExpressionAlgebrique = parserExpressionAlgebrique;
  Gen7Core.evaluerAst = evaluerAst;
  Gen7Core.estFormeFactorisee = estFormeFactorisee;
  Gen7Core.extraireCoefficientsQuadratiques = extraireCoefficientsQuadratiques;

  // ---------------------------------------------------------------------
  // Vérification par écran
  // ---------------------------------------------------------------------
  var TOLERANCE = 0.005;

  function diagnostiquerCoefficients(exercice, reponse) {
    if (!isFinite(reponse.a) || !isFinite(reponse.b) || !isFinite(reponse.c)) return "parse_error";
    var e = exercice.enonce;
    return (reponse.a === e.a && reponse.b === e.b && reponse.c === e.c) ? "correct" : "not_equivalent";
  }

  function signeReelA(enonce) { return enonce.a > 0 ? "+" : "-"; }
  function signeReelAB(enonce) {
    var p = enonce.a * enonce.b;
    return p === 0 ? "0" : (p > 0 ? "+" : "-");
  }
  function verifierAllure(exercice, choix) {
    return choix.signeA === signeReelA(exercice.enonce) && choix.signeAB === signeReelAB(exercice.enonce);
  }

  function diagnostiquerAxeSommet(exercice, reponse) {
    var axeValeur = analyserAxeSymetrie(reponse.axeTexte);
    if (axeValeur === null || !isFinite(reponse.xS) || !isFinite(reponse.yS)) return "parse_error";
    var okAxe = Math.abs(axeValeur - exercice.xS) <= TOLERANCE;
    var okXs = Math.abs(reponse.xS - exercice.xS) <= TOLERANCE;
    var okYs = Math.abs(reponse.yS - exercice.yS) <= TOLERANCE;
    return (okAxe && okXs && okYs) ? "correct" : "not_equivalent";
  }

  function diagnostiquerImage(exercice, morceau) {
    var a = exercice.enonce.a;
    var yS = exercice.yS;
    if (a > 0) {
      if (typeof morceau.borneGauche !== "number" || !isFinite(morceau.borneGauche)) return "parse_error";
      var okG = Math.abs(morceau.borneGauche - yS) <= TOLERANCE;
      var okStruct = morceau.crochetGauche === "[" && morceau.crochetDroit === "[" && morceau.borneDroite === "+inf";
      return (okG && okStruct) ? "correct" : "not_equivalent";
    }
    if (typeof morceau.borneDroite !== "number" || !isFinite(morceau.borneDroite)) return "parse_error";
    var okD = Math.abs(morceau.borneDroite - yS) <= TOLERANCE;
    var okStruct2 = morceau.crochetDroit === "]" && morceau.crochetGauche === "]" && morceau.borneGauche === "-inf";
    return (okD && okStruct2) ? "correct" : "not_equivalent";
  }

  function verifierChoixCategorie(exercice, choix) {
    return choix === exercice.categorie;
  }

  function diagnostiquerFactorisation(exercice, texte) {
    var ast = parserExpressionAlgebrique(texte);
    if (!ast) return "parse_error";
    if (!estFormeFactorisee(ast)) return "not_equivalent";
    var coeffs = extraireCoefficientsQuadratiques(ast);
    if (!coeffs) return "not_equivalent";
    var e = exercice.enonce;
    var ok = Math.abs(coeffs.a - e.a) <= 1e-6 && Math.abs(coeffs.b - e.b) <= 1e-6 && Math.abs(coeffs.c - e.c) <= 1e-6;
    return ok ? "correct" : "not_equivalent";
  }

  function verifierRacines(exercice, saisies) {
    var attendu = exercice.solution.racines.slice().sort(function (x, y) { return x - y; });
    var tol = exercice.solution.racinesExactes ? 1e-9 : TOLERANCE;
    var obtenu = saisies.slice().sort(function (x, y) { return x - y; });
    if (obtenu.length !== 2 || !isFinite(obtenu[0]) || !isFinite(obtenu[1])) return false;
    return Math.abs(attendu[0] - obtenu[0]) <= tol && Math.abs(attendu[1] - obtenu[1]) <= tol;
  }

  function verifierTableau(exercice, ligneSigne, ligneVariation) {
    var g = exercice.grilleSigneVariation;
    if (ligneSigne.length !== g.ligneSigne.length || ligneVariation.length !== g.ligneVariation.length) return false;
    for (var i = 0; i < g.ligneSigne.length; i++) if (ligneSigne[i] !== g.ligneSigne[i]) return false;
    for (var j = 0; j < g.ligneVariation.length; j++) if (ligneVariation[j] !== g.ligneVariation[j]) return false;
    return true;
  }

  Gen7Core.diagnostiquerCoefficients = diagnostiquerCoefficients;
  Gen7Core.verifierAllure = verifierAllure;
  Gen7Core.signeReelA = signeReelA;
  Gen7Core.signeReelAB = signeReelAB;
  Gen7Core.diagnostiquerAxeSommet = diagnostiquerAxeSommet;
  Gen7Core.diagnostiquerImage = diagnostiquerImage;
  Gen7Core.verifierChoixCategorie = verifierChoixCategorie;
  Gen7Core.diagnostiquerFactorisation = diagnostiquerFactorisation;
  Gen7Core.verifierRacines = verifierRacines;
  Gen7Core.verifierTableau = verifierTableau;
  Gen7Core.TOLERANCE = TOLERANCE;

  // Exposé globalement pour les autres widgets de src/interactive/ (jamais de module.exports
  // ici — Vite/Rollup détecte ce motif comme du CommonJS et empaquette le fichier dans un
  // wrapper __commonJS paresseux, jamais exécuté par un simple `import './gen7-core.js'`).
  root.Gen7Core = Gen7Core;
})(window);

