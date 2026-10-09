import type { AffixeSimple, ExerciceComplexesA, ExerciceComplexesAvances, ExerciceComplexesB, ExerciceComplexesBIntersection, ExerciceComplexesBSimple, ExerciceComplexesC, ExerciceComplexesD, ExerciceComplexesDCoef, ExerciceComplexesDModules, ExerciceComplexesDRatio, ExerciceComplexesDReelles, ExerciceComplexesE, NatureLieu } from "../core6e/complexesAvances.types";
import type { StatutVerification } from "../moteur/statutVerification";
import { diagnostiquerEnsembleValeurs, diagnostiquerValeur, evaluerExpressionExponentielle, separerEquationTexte } from "./equivalenceExponentielle";
import { TOLERANCE_COMPLEXE, diagnostiquerComplexe } from "./verificationComplexes";
import type { Complexe } from "./verificationComplexes";
import { evaluerValeurComplexeAvecVariable } from "./expressionComplexeAvecVariable";
import type { PhaseComplexesAvances } from "./typesComplexesAvances";

/**
 * Couche B (6e) — vérification propre à `6gen42` (dispatch par famille/écran). N'importe JAMAIS rien
 * de `src/generateurs6e/` (règle non négociable, CLAUDE.md) — voir
 * `generateurs6e/complexesAvances/session.integration.test.ts` pour le seul fichier autorisé Couche
 * A + Couche B ensemble. Réutilise TELLE QUELLE la fondation chapitre 7 : `diagnostiquerComplexe`
 * (`verificationComplexes.ts`, `6gen34`) pour tout champ "affixe a+bi RATIONNEL", `diagnostiquerValeur`/
 * `diagnostiquerEnsembleValeurs` (`equivalenceExponentielle.ts`) pour tout champ réel (module, rayon,
 * angle, `sqrt` accepté nativement).
 *
 * ============================================================================
 * **Famille A — 100% QCM** (voir en-tête `generateurs6e/complexesAvances/familleA.ts`)
 * ============================================================================
 * Même patron que `diagnostiquerAEcran1` (6gen40) : `valeurs[0]==="correct"` sinon
 * `"not_equivalent"` — jamais de `parse_error` possible (bouton, pas de texte libre).
 *
 * ============================================================================
 * **Famille B — équation en x,y (échantillonnage 2 variables) + lieu structuré**
 * ============================================================================
 * Écran "équation" : généralisation À 2 VARIABLES LIBRES de `diagnostiquerEquationDifference`
 * (`equivalenceExponentielle.ts`), même principe que la généralisation à `(x,i)` de
 * `verificationFormuleMoivre.ts` — voir `diagnostiquerEquationDifference2Var` ci-dessous. Écran "lieu
 * structuré" : mirroir `diagnostiquerBEcran2` (`verificationTransformationsPlan.ts`, 6gen40) —
 * `valeurs[0]`=nature choisie, `valeurs[1..]`=paramètres (forme dépendant de la nature CHOISIE, pas
 * de la nature correcte — permet de distinguer un vrai `parse_error` d'un simple mauvais choix de
 * nature), dernier élément = pôle exclu SI `exercice.poleExclu!==null` (toujours demandé dans ce cas,
 * indépendamment de la nature choisie — question de compréhension du piège autonome de la nature
 * choisie).
 *
 * ============================================================================
 * **Famille C — échantillonnage à 1 variable RÉELLE `φ`, z ET son conjugué liés ENSEMBLE**
 * ============================================================================
 * `z=cos φ+i sin φ`, `zb=cos φ-i sin φ` (le nom ASCII `zb` pour z̄, voir en-tête
 * `expressionComplexeAvecVariable.ts`) — le point reste SUR le cercle unité (`zz̄=1` automatiquement
 * vérifié) pour tout `φ`, exactement le contexte de l'énoncé ("étant donné `zz̄=1`"). Écran 3 : QCM
 * combiné statut+réciproque, mirroir `diagnostiquerBEcran2`.
 *
 * ============================================================================
 * **Famille D — 4 sous-types, verrouillés par leur propre contrat de champs** (voir en-tête
 * `generateurs6e/complexesAvances/familleD.ts` pour la dérivation algébrique de chaque sous-type)
 * ============================================================================
 *
 * ============================================================================
 * **Famille E — réutilisation directe de la fondation chapitre 7**
 * ============================================================================
 * Écran 1 : `diagnostiquerComplexe` (rapport toujours RATIONNEL, division de 2 entiers de Gauss).
 * Écran 2 : `diagnostiquerValeur` contre `Math.atan2` calculé ICI localement (JAMAIS
 * `calculerArgument` de `generateurs6e/formeTrigonometrique/familleA.ts` — importer ce module
 * violerait la règle "`moteur6e/` n'importe jamais `generateurs6e/`" ; un simple `Math.atan2` suffit
 * ici, la cible n'a besoin que d'être une VALEUR numérique, jamais d'un LaTeX exact — voir
 * `ui6e/formatComplexesAvances.ts`, qui LUI a le droit de réutiliser `calculerArgument` pour
 * l'affichage du récapitulatif, couche `ui6e/` libre d'importer `generateurs6e/`). Écran 3 : QCM
 * statut, id comparison directe.
 */

const TOLERANCE = 0.01;

function combinerStatuts(...statuts: StatutVerification[]): StatutVerification {
  if (statuts.some((s) => s === "parse_error")) return "parse_error";
  if (statuts.some((s) => s === "not_equivalent")) return "not_equivalent";
  return "correct";
}

function diagnostiquerQcm(valeurs: string[]): StatutVerification {
  return valeurs[0] === "correct" ? "correct" : "not_equivalent";
}

/** Généralisation à 2 variables réelles libres de `diagnostiquerEquationDifference` — mirroir
 * `diagnostiquerEquivalenceFonctionXI` (`verificationFormuleMoivre.ts`), adapté à une ÉQUATION
 * ("A op B", `separerEquationTexte`) plutôt qu'une expression pure. */
function diagnostiquerEquationDifference2Var(texte: string, nomVar1: string, nomVar2: string, referenceDifference: (v1: number, v2: number) => number, points1: number[], points2: number[], tolerance: number = TOLERANCE): StatutVerification {
  const separe = separerEquationTexte(texte);
  if (separe === null) return "parse_error";
  let comparables = 0;
  for (const v1 of points1) {
    for (const v2 of points2) {
      const attendu = referenceDifference(v1, v2);
      if (!Number.isFinite(attendu)) continue;
      let gauche: number;
      let droite: number;
      try {
        gauche = evaluerExpressionExponentielle(separe.gauche, { [nomVar1]: v1, [nomVar2]: v2 });
        droite = evaluerExpressionExponentielle(separe.droite, { [nomVar1]: v1, [nomVar2]: v2 });
      } catch {
        return "parse_error";
      }
      const diff = gauche - droite;
      if (!Number.isFinite(diff)) return "not_equivalent";
      comparables++;
      if (Math.abs(diff - attendu) > tolerance) return "not_equivalent";
    }
  }
  const minimumRequis = Math.min(3, points1.length * points2.length);
  if (comparables < minimumRequis) return "parse_error";
  return "correct";
}

/** Ensemble de N affixes (a+bi RATIONNELS), ORDRE INDIFFÉRENT, COMPTE EXACT requis — mirroir
 * `diagnostiquerImagesRotation` (`verificationTransformationsPlan.ts`, 6gen40), répliqué ICI (jamais
 * importé — chaque générateur garde sa propre copie, CLAUDE.md). */
function diagnostiquerEnsembleComplexes(textes: string[], cibles: Complexe[], tolerance: number = TOLERANCE_COMPLEXE): StatutVerification {
  if (textes.length !== cibles.length) return "not_equivalent";
  const valeurs: Complexe[] = [];
  for (const t of textes) {
    const v = evaluerValeurComplexeAvecVariable(t, {});
    if (v === null) return "parse_error";
    valeurs.push(v);
  }
  const restantes = [...cibles];
  for (const v of valeurs) {
    const index = restantes.findIndex((c) => Math.abs(c.re - v.re) <= tolerance && Math.abs(c.im - v.im) <= tolerance);
    if (index === -1) return "not_equivalent";
    restantes.splice(index, 1);
  }
  return "correct";
}

// ============================================================================
// Famille A.
// ============================================================================

export function diagnostiquerAEcran1(exercice: ExerciceComplexesA, valeurs: string[]): StatutVerification {
  void exercice;
  return diagnostiquerQcm(valeurs);
}
export function diagnostiquerAEcran2(exercice: ExerciceComplexesA, valeurs: string[]): StatutVerification {
  void exercice;
  return diagnostiquerQcm(valeurs);
}
export function diagnostiquerAEcran3(exercice: ExerciceComplexesA, valeurs: string[]): StatutVerification {
  void exercice;
  return diagnostiquerQcm(valeurs);
}

// ============================================================================
// Famille B — sous-types simples.
// ============================================================================

const POINTS_X = [-2.3, -0.6, 0.9, 1.7];
const POINTS_Y = [1.4, -1.9, 0.5, 2.1];

function referenceEquationB(exercice: ExerciceComplexesBSimple): (x: number, y: number) => number {
  const { p1, p2 } = exercice;
  switch (exercice.sousType) {
    case "droite":
      return (x, y) => -(x - p1.a) * (y - p2.b) + (y - p1.b) * (x - p2.a);
    case "thales":
      return (x, y) => (x - p1.a) * (x - p2.a) + (y - p1.b) * (y - p2.b);
    case "apollonius": {
      const k = exercice.k as number;
      return (x, y) => (x - p1.a) ** 2 + (y - p1.b) ** 2 - k * k * ((x - p2.a) ** 2 + (y - p2.b) ** 2);
    }
    case "demiDroites": {
      const c = exercice.c as number;
      return (x, y) => 2 * x - c * Math.sqrt(x * x + y * y);
    }
    case "cercleO": {
      const k = exercice.k as number;
      return (x, y) => x * x + y * y - k;
    }
  }
}

export function diagnostiquerBEcran1(exercice: ExerciceComplexesBSimple, valeurs: string[]): StatutVerification {
  return diagnostiquerEquationDifference2Var(valeurs[0] ?? "", "x", "y", referenceEquationB(exercice), POINTS_X, POINTS_Y);
}

/** Vérifie que les paramètres soumis sont au moins PARSABLES dans la forme attendue par la nature
 * CHOISIE (pas forcément la nature correcte) — permet de distinguer un `parse_error` (mauvaise
 * syntaxe) d'un simple mauvais choix de nature (`not_equivalent`), avant toute comparaison de
 * valeur. */
function parametresParsablesPourNature(nature: NatureLieu, params: string[]): boolean {
  if (nature === "droite") {
    return evaluerValeurComplexeAvecVariable(params[0] ?? "", {}) !== null && evaluerValeurComplexeAvecVariable(params[1] ?? "", {}) !== null;
  }
  if (nature === "cercle") {
    const centreOk = evaluerValeurComplexeAvecVariable(params[0] ?? "", {}) !== null;
    const rayonOk = diagnostiquerValeur(params[1] ?? "", 0) !== "parse_error";
    return centreOk && rayonOk;
  }
  // demiDroite — N angles (add-as-needed).
  return params.every((p) => diagnostiquerValeur(p, 0) !== "parse_error");
}

export function diagnostiquerBEcran2(exercice: ExerciceComplexesBSimple, valeurs: string[]): StatutVerification {
  const nature = valeurs[0] as NatureLieu;
  const poleAttendu = exercice.poleExclu;
  const params = poleAttendu !== null ? valeurs.slice(1, -1) : valeurs.slice(1);
  const poleTexte = poleAttendu !== null ? (valeurs[valeurs.length - 1] ?? "") : null;

  const statutParseParams: StatutVerification = parametresParsablesPourNature(nature, params) ? "correct" : "parse_error";
  const statutPole = poleAttendu !== null ? diagnostiquerComplexe(poleTexte ?? "", { re: poleAttendu.a, im: poleAttendu.b }) : "correct";

  if (statutParseParams === "parse_error" || statutPole === "parse_error") return "parse_error";
  if (nature !== exercice.resultat.nature) return "not_equivalent";

  // Nature correcte confirmée — comparaison des VALEURS aux vraies cibles.
  if (exercice.resultat.nature === "droite") {
    const cibles: Complexe[] = [{ re: exercice.resultat.point1.a, im: exercice.resultat.point1.b }, { re: exercice.resultat.point2.a, im: exercice.resultat.point2.b }];
    const statutPoints = diagnostiquerEnsembleComplexes(params, cibles);
    return combinerStatuts(statutPoints, statutPole);
  }
  if (exercice.resultat.nature === "cercle") {
    const statutCentre = diagnostiquerComplexe(params[0] ?? "", { re: exercice.resultat.centre.a, im: exercice.resultat.centre.b });
    const statutRayon = diagnostiquerValeur(params[1] ?? "", exercice.resultat.rayon);
    return combinerStatuts(statutCentre, statutRayon, statutPole);
  }
  // demiDroite.
  const cibles = exercice.resultat.angles.map((a) => a.numerique);
  const statutAngles = diagnostiquerEnsembleValeurs(params, cibles);
  return combinerStatuts(statutAngles, statutPole);
}

// ============================================================================
// Famille B — sous-type "intersection".
// ============================================================================

function referenceEquationDroiteQ(exercice: ExerciceComplexesBIntersection): (x: number, y: number) => number {
  const { q1, q2 } = exercice;
  return (x, y) => -(x - q1.a) * (y - q2.b) + (y - q1.b) * (x - q2.a);
}
function referenceEquationCercleO(exercice: ExerciceComplexesBIntersection): (x: number, y: number) => number {
  const k = exercice.kCercleO;
  return (x, y) => x * x + y * y - k;
}

export function diagnostiquerBInterEcran1(exercice: ExerciceComplexesBIntersection, valeurs: string[]): StatutVerification {
  const statutDroite = diagnostiquerEquationDifference2Var(valeurs[0] ?? "", "x", "y", referenceEquationDroiteQ(exercice), POINTS_X, POINTS_Y);
  const statutCercle = diagnostiquerEquationDifference2Var(valeurs[1] ?? "", "x", "y", referenceEquationCercleO(exercice), POINTS_X, POINTS_Y);
  return combinerStatuts(statutDroite, statutCercle);
}

export function diagnostiquerBInterEcran2(exercice: ExerciceComplexesBIntersection, valeurs: string[]): StatutVerification {
  const cibles: Complexe[] = [{ re: exercice.q1.a, im: exercice.q1.b }, { re: exercice.q2.a, im: exercice.q2.b }];
  const statutPoints = diagnostiquerEnsembleComplexes(valeurs.slice(0, 2), cibles);
  const statutCentre = diagnostiquerComplexe(valeurs[2] ?? "", { re: 0, im: 0 });
  const statutRayon = diagnostiquerValeur(valeurs[3] ?? "", Math.sqrt(exercice.kCercleO));
  return combinerStatuts(statutPoints, statutCentre, statutRayon);
}

export function diagnostiquerBInterEcran3(exercice: ExerciceComplexesBIntersection, valeurs: string[]): StatutVerification {
  const cibles: Complexe[] = [{ re: exercice.q1.a, im: exercice.q1.b }, { re: exercice.q2.a, im: exercice.q2.b }];
  return diagnostiquerEnsembleComplexes(valeurs, cibles);
}

export function diagnostiquerEcranB(exercice: ExerciceComplexesB, phase: PhaseComplexesAvances, valeurs: string[]): StatutVerification {
  if (exercice.sousType === "intersection") {
    if (phase === "bInterEcran1") return diagnostiquerBInterEcran1(exercice, valeurs);
    if (phase === "bInterEcran2") return diagnostiquerBInterEcran2(exercice, valeurs);
    return diagnostiquerBInterEcran3(exercice, valeurs);
  }
  if (phase === "bEcran1") return diagnostiquerBEcran1(exercice, valeurs);
  return diagnostiquerBEcran2(exercice, valeurs);
}

// ============================================================================
// Famille C.
// ============================================================================

const PHIS_C = [0.4, 1.1, 1.9, 2.6, -0.7, -1.6, -2.4, 3.0, -3.05, 0.05];

/** `1 - p̄z - pz̄ + |p|²` — développement CORRECT de |z-p|² ET de |1-p̄z|² (les deux expressions sont
 * ALGÉBRIQUEMENT IDENTIQUES, voir en-tête `generateurs6e/complexesAvances/familleC.ts` — la même
 * fonction de référence sert donc aux écrans 1 ET 2). */
function referenceModuleCarreBlaschke(exercice: ExerciceComplexesC, phi: number): number {
  const { a, b } = exercice;
  return 1 - 2 * (a * Math.cos(phi) + b * Math.sin(phi)) + (a * a + b * b);
}

function diagnostiquerEquivalenceComplexePhi(texte: string, reference: (phi: number) => number, phis: number[], tolerance: number = TOLERANCE): StatutVerification {
  let comparables = 0;
  for (const phi of phis) {
    const attendu = reference(phi);
    if (!Number.isFinite(attendu)) continue;
    const z: Complexe = { re: Math.cos(phi), im: Math.sin(phi) };
    const zb: Complexe = { re: Math.cos(phi), im: -Math.sin(phi) };
    const soumis = evaluerValeurComplexeAvecVariable(texte, { z, zb });
    if (soumis === null) return "parse_error";
    if (!Number.isFinite(soumis.re) || !Number.isFinite(soumis.im)) return "not_equivalent";
    comparables++;
    if (Math.abs(soumis.re - attendu) > tolerance || Math.abs(soumis.im) > tolerance) return "not_equivalent";
  }
  const minimumRequis = Math.min(3, phis.length);
  if (comparables < minimumRequis) return "parse_error";
  return "correct";
}

export function diagnostiquerCEcran1(exercice: ExerciceComplexesC, valeurs: string[]): StatutVerification {
  return diagnostiquerEquivalenceComplexePhi(valeurs[0] ?? "", (phi) => referenceModuleCarreBlaschke(exercice, phi), PHIS_C);
}
export function diagnostiquerCEcran2(exercice: ExerciceComplexesC, valeurs: string[]): StatutVerification {
  return diagnostiquerEquivalenceComplexePhi(valeurs[0] ?? "", (phi) => referenceModuleCarreBlaschke(exercice, phi), PHIS_C);
}
export function diagnostiquerCEcran3(exercice: ExerciceComplexesC, valeurs: string[]): StatutVerification {
  void exercice;
  return combinerStatuts(diagnostiquerQcm([valeurs[0] ?? ""]), diagnostiquerQcm([valeurs[1] ?? ""]));
}

// ============================================================================
// Famille D — "ratio racine n-ième".
// ============================================================================

function racineExacteEnComplexe(re: number, im: number): Complexe {
  return { re, im };
}

export function diagnostiquerDRatioEcran1(exercice: ExerciceComplexesDRatio, valeurs: string[]): StatutVerification {
  const { n, m } = exercice;
  const cibles: Complexe[] = [];
  for (let k = 0; k < n; k++) {
    const angle = (2 * Math.PI * k) / n;
    cibles.push(racineExacteEnComplexe(m * Math.cos(angle), m * Math.sin(angle)));
  }
  return diagnostiquerEnsembleComplexes(valeurs, cibles, 1e-6);
}
export function diagnostiquerDRatioEcran2(exercice: ExerciceComplexesDRatio, valeurs: string[]): StatutVerification {
  const z0 = exercice.c / (exercice.m - 1);
  return diagnostiquerValeur(valeurs[0] ?? "", z0);
}

// ============================================================================
// Famille D — "solutions réelles imposées".
// ============================================================================

const POINTS_M = [1.3, -0.8, 2.6, -1.4, 0.4];

export function diagnostiquerDReellesEcran1(exercice: ExerciceComplexesDReelles, valeurs: string[]): StatutVerification {
  const A = exercice.x1 + exercice.x2;
  const P = exercice.x1 * exercice.x2;
  const referenceReel = (x: number, _m: number) => x * x - A * x + P;
  const referenceImag = (x: number, m: number) => (exercice.m0 - m) * (x - exercice.k);
  const statutReel = diagnostiquerEquationDifference2Var(valeurs[0] ?? "", "x", "m", referenceReel, POINTS_X, POINTS_M);
  const statutImag = diagnostiquerEquationDifference2Var(valeurs[1] ?? "", "x", "m", referenceImag, POINTS_X, POINTS_M);
  return combinerStatuts(statutReel, statutImag);
}
export function diagnostiquerDReellesEcran2(exercice: ExerciceComplexesDReelles, valeurs: string[]): StatutVerification {
  return diagnostiquerValeur(valeurs[0] ?? "", exercice.m0);
}
export function diagnostiquerDReellesEcran3(exercice: ExerciceComplexesDReelles, valeurs: string[]): StatutVerification {
  return diagnostiquerEnsembleValeurs(valeurs, [exercice.x1, exercice.x2]);
}

// ============================================================================
// Famille D — "coefficients depuis une racine donnée".
// ============================================================================

const POINTS_ALPHA = [-2.2, -0.5, 1.1, 2.7];
const POINTS_BETA = [1.6, -1.3, 0.4, -2.5];

export function diagnostiquerDCoefEcran1(exercice: ExerciceComplexesDCoef, valeurs: string[]): StatutVerification {
  const { p, q } = exercice;
  const referenceReel = (alpha: number, beta: number) => p * alpha + beta + (p * p - q * q);
  const referenceImag = (alpha: number, _beta: number) => q * alpha + 2 * p * q;
  const statutReel = diagnostiquerEquationDifference2Var(valeurs[0] ?? "", "alpha", "beta", referenceReel, POINTS_ALPHA, POINTS_BETA);
  const statutImag = diagnostiquerEquationDifference2Var(valeurs[1] ?? "", "alpha", "beta", referenceImag, POINTS_ALPHA, POINTS_BETA);
  return combinerStatuts(statutReel, statutImag);
}
export function diagnostiquerDCoefEcran2(exercice: ExerciceComplexesDCoef, valeurs: string[]): StatutVerification {
  const alpha = -2 * exercice.p;
  const beta = exercice.p * exercice.p + exercice.q * exercice.q;
  return combinerStatuts(diagnostiquerValeur(valeurs[0] ?? "", alpha), diagnostiquerValeur(valeurs[1] ?? "", beta));
}

// ============================================================================
// Famille D — "modules simultanés".
// ============================================================================

export function diagnostiquerDModulesEcran1(exercice: ExerciceComplexesDModules, valeurs: string[]): StatutVerification {
  void exercice;
  return diagnostiquerValeur(valeurs[0] ?? "", 1);
}
export function diagnostiquerDModulesEcran2(exercice: ExerciceComplexesDModules, valeurs: string[]): StatutVerification {
  const { p, q, r } = exercice;
  const cibles: Complexe[] = [
    { re: p / r, im: q / r },
    { re: p / r, im: -q / r },
  ];
  return diagnostiquerEnsembleComplexes(valeurs, cibles);
}

export function diagnostiquerEcranD(exercice: ExerciceComplexesD, phase: PhaseComplexesAvances, valeurs: string[]): StatutVerification {
  switch (exercice.sousType) {
    case "ratio":
      return phase === "dRatioEcran1" ? diagnostiquerDRatioEcran1(exercice, valeurs) : diagnostiquerDRatioEcran2(exercice, valeurs);
    case "reelles":
      if (phase === "dReellesEcran1") return diagnostiquerDReellesEcran1(exercice, valeurs);
      if (phase === "dReellesEcran2") return diagnostiquerDReellesEcran2(exercice, valeurs);
      return diagnostiquerDReellesEcran3(exercice, valeurs);
    case "coef":
      return phase === "dCoefEcran1" ? diagnostiquerDCoefEcran1(exercice, valeurs) : diagnostiquerDCoefEcran2(exercice, valeurs);
    case "modules":
      return phase === "dModulesEcran1" ? diagnostiquerDModulesEcran1(exercice, valeurs) : diagnostiquerDModulesEcran2(exercice, valeurs);
  }
}

// ============================================================================
// Famille E.
// ============================================================================

function ratioE(exercice: ExerciceComplexesE): Complexe {
  const num: AffixeSimple = { a: exercice.zD.a - exercice.zC.a, b: exercice.zD.b - exercice.zC.b };
  const den: AffixeSimple = { a: exercice.zB.a - exercice.zA.a, b: exercice.zB.b - exercice.zA.b };
  const norme = den.a * den.a + den.b * den.b;
  return { re: (num.a * den.a + num.b * den.b) / norme, im: (num.b * den.a - num.a * den.b) / norme };
}

export function diagnostiquerEEcran1(exercice: ExerciceComplexesE, valeurs: string[]): StatutVerification {
  const ratio = ratioE(exercice);
  return diagnostiquerComplexe(valeurs[0] ?? "", ratio);
}
export function diagnostiquerEEcran2(exercice: ExerciceComplexesE, valeurs: string[]): StatutVerification {
  const ratio = ratioE(exercice);
  const argument = Math.atan2(ratio.im, ratio.re);
  return diagnostiquerValeur(valeurs[0] ?? "", argument);
}
export function diagnostiquerEEcran3(exercice: ExerciceComplexesE, valeurs: string[]): StatutVerification {
  return valeurs[0] === exercice.statut ? "correct" : "not_equivalent";
}

// ============================================================================
// Dispatcher générique.
// ============================================================================

export function diagnostiquerEcran(exercice: ExerciceComplexesAvances, phase: PhaseComplexesAvances, valeurs: string[]): StatutVerification {
  switch (exercice.famille) {
    case "A":
      if (phase === "aEcran1") return diagnostiquerAEcran1(exercice, valeurs);
      if (phase === "aEcran2") return diagnostiquerAEcran2(exercice, valeurs);
      return diagnostiquerAEcran3(exercice, valeurs);
    case "B":
      return diagnostiquerEcranB(exercice, phase, valeurs);
    case "C":
      if (phase === "cEcran1") return diagnostiquerCEcran1(exercice, valeurs);
      if (phase === "cEcran2") return diagnostiquerCEcran2(exercice, valeurs);
      return diagnostiquerCEcran3(exercice, valeurs);
    case "D":
      return diagnostiquerEcranD(exercice, phase, valeurs);
    case "E":
      if (phase === "eEcran1") return diagnostiquerEEcran1(exercice, valeurs);
      if (phase === "eEcran2") return diagnostiquerEEcran2(exercice, valeurs);
      return diagnostiquerEEcran3(exercice, valeurs);
  }
}

export function verifierEcran(exercice: ExerciceComplexesAvances, phase: PhaseComplexesAvances, valeurs: string[]): boolean {
  return diagnostiquerEcran(exercice, phase, valeurs) === "correct";
}
