import type { EnsembleReelGuide } from "../core6e/ensembleReel.types";
import type { ExerciceEqLogA, ExerciceEqLogB, ExerciceEqLogC, ExerciceEqLogD, ExerciceEqLogE, ExerciceEqLogG, IssueSimplificationG } from "../core6e/equationsExpLog.types";
import type { StatutVerification } from "../moteur/statutVerification";
import { diagnostiquerEnsembleValeurs, diagnostiquerEquationProportionnelle, diagnostiquerValeur } from "./equivalenceExponentielle";
import { verifierEnsembleReelGuide } from "./verificationEnsembleReel";

/**
 * Couche B (6e) — vérification pour `6gen14`. N'importe jamais rien de `src/generateurs6e/` — voir
 * `verificationEquationsExpLog.test.ts` pour la preuve avec des exercices factices définis
 * localement (même principe que `verificationExponentiellesProblemes.ts`, 6gen12).
 *
 * Chaque `diagnostiquerXxx` (champ libre) retourne le statut à 3 valeurs (`StatutVerification`,
 * convention CLAUDE.md) ; `verifierXxx` (booléen, consommé par `etapeTentatives.ts`) s'en déduit
 * systématiquement via `===  "correct"`. Les écrans à réponse STRUCTURÉE (CE via
 * `EnsembleReelGuide`, statut à 3 issues de la famille G) n'ont qu'un `verifierXxx` booléen — pas
 * de risque de `parse_error` sur une saisie guidée par boutons.
 *
 * **Tolérances** : `TOLERANCE_EXACTE` (1e-3) pour toute valeur numérique EXACTE (potentiellement
 * irrationnelle) issue d'une arithmétique déterministe — une valeur arrondie au MILLIÈME (écart
 * ≤ 5e-4) passe toujours, ce que dit la consigne ; `TOLERANCE_LARGE` (5e-2) pour les comparaisons
 * d'ÉQUATIONS par échantillonnage numérique (marge pour l'arrondi de calcul de l'élève).
 *
 * **Équations** : comparées via `diagnostiquerEquationProportionnelle` — gauche−droite doit être un
 * MULTIPLE NON NUL de la différence de référence. Accepte donc les membres inversés, une équation
 * divisée par son coefficient dominant, ou tout déplacement de terme (audit : ces formes justes
 * étaient refusées à 100 %). Les RACINES de la référence s'ajoutent aux points échantillonnés : une
 * équation équivalente doit s'y annuler aussi, ce qui écarte une équation fausse quasi
 * proportionnelle (référence presque constante sur les points fixes, racine lointaine).
 */
const TOLERANCE_EXACTE = 1e-3;
const TOLERANCE_LARGE = 0.05;

const POINTS_X = [-4, -3, -2, -1, -0.5, 0.5, 1, 2, 3, 4, 5];
const POINTS_T = [0.1, 0.5, 1, 1.5, 2, 3, 4, 5, 7, 10];

// ============================================================================
// Famille A — 2 écrans.
// ============================================================================

export function diagnostiquerAEcran1(exercice: ExerciceEqLogA, texte: string): StatutVerification {
  return diagnostiquerValeur(texte, exercice.exposantCible, TOLERANCE_EXACTE);
}
export function diagnostiquerAEcran2(exercice: ExerciceEqLogA, texte: string): StatutVerification {
  return diagnostiquerValeur(texte, exercice.x, TOLERANCE_EXACTE);
}
export function verifierAEcran1(exercice: ExerciceEqLogA, texte: string): boolean {
  return diagnostiquerAEcran1(exercice, texte) === "correct";
}
export function verifierAEcran2(exercice: ExerciceEqLogA, texte: string): boolean {
  return diagnostiquerAEcran2(exercice, texte) === "correct";
}

// ============================================================================
// Famille B — 2 écrans.
// ============================================================================

export function diagnostiquerBEcran1(exercice: ExerciceEqLogB, texte: string): StatutVerification {
  const { m1, n1, m2, n2, base1, base2 } = exercice;
  return diagnostiquerEquationProportionnelle(texte, "x", (x) => (m1 * x + n1) * Math.log(base1) - (m2 * x + n2) * Math.log(base2), [...POINTS_X, exercice.x], TOLERANCE_LARGE);
}
export function diagnostiquerBEcran2(exercice: ExerciceEqLogB, texte: string): StatutVerification {
  return diagnostiquerValeur(texte, exercice.x, TOLERANCE_EXACTE);
}
export function verifierBEcran1(exercice: ExerciceEqLogB, texte: string): boolean {
  return diagnostiquerBEcran1(exercice, texte) === "correct";
}
export function verifierBEcran2(exercice: ExerciceEqLogB, texte: string): boolean {
  return diagnostiquerBEcran2(exercice, texte) === "correct";
}

// ============================================================================
// Famille C — 3 écrans.
// ============================================================================

export function diagnostiquerCEcran1(exercice: ExerciceEqLogC, texte: string): StatutVerification {
  const { A, B, Cc } = exercice;
  const discriminant = B * B - 4 * A * Cc;
  const racines = discriminant >= 0 ? [(-B - Math.sqrt(discriminant)) / (2 * A), (-B + Math.sqrt(discriminant)) / (2 * A)] : [];
  return diagnostiquerEquationProportionnelle(texte, "t", (t) => A * t * t + B * t + Cc, [...POINTS_T, ...racines], TOLERANCE_LARGE);
}
export function diagnostiquerCEcran2(exercice: ExerciceEqLogC, textes: string[]): StatutVerification {
  return diagnostiquerEnsembleValeurs(textes, exercice.tValides, TOLERANCE_EXACTE);
}
export function diagnostiquerCEcran3(exercice: ExerciceEqLogC, textes: string[]): StatutVerification {
  return diagnostiquerEnsembleValeurs(textes, exercice.xValides, TOLERANCE_EXACTE);
}
export function verifierCEcran1(exercice: ExerciceEqLogC, texte: string): boolean {
  return diagnostiquerCEcran1(exercice, texte) === "correct";
}
export function verifierCEcran2(exercice: ExerciceEqLogC, textes: string[]): boolean {
  return diagnostiquerCEcran2(exercice, textes) === "correct";
}
export function verifierCEcran3(exercice: ExerciceEqLogC, textes: string[]): boolean {
  return diagnostiquerCEcran3(exercice, textes) === "correct";
}

// ============================================================================
// Famille D — 2 écrans.
// ============================================================================

/** CE attendue : `x` est l'ARGUMENT du logarithme (base connue) ⟹ `]0;+∞[`. */
export function ceAttendueD(): EnsembleReelGuide {
  return { forme: "intervalles", points: [], morceaux: [{ inf: 0, sup: null, infInclus: false, supInclus: false }] };
}
export function verifierDEcran1(_exercice: ExerciceEqLogD, reponse: EnsembleReelGuide): boolean {
  return verifierEnsembleReelGuide(reponse, ceAttendueD());
}
export function diagnostiquerDEcran2(exercice: ExerciceEqLogD, texte: string): StatutVerification {
  return diagnostiquerValeur(texte, exercice.x, TOLERANCE_EXACTE);
}
export function verifierDEcran2(exercice: ExerciceEqLogD, texte: string): boolean {
  return diagnostiquerDEcran2(exercice, texte) === "correct";
}

// ============================================================================
// Famille E — 3 écrans.
// ============================================================================

export function ceAttendueE(exercice: ExerciceEqLogE): EnsembleReelGuide {
  return { forme: "intervalles", points: [], morceaux: [{ inf: exercice.ceInf, sup: exercice.ceSup, infInclus: false, supInclus: false }] };
}
export function verifierEEcran1(exercice: ExerciceEqLogE, reponse: EnsembleReelGuide): boolean {
  return verifierEnsembleReelGuide(reponse, ceAttendueE(exercice));
}
export function diagnostiquerEEcran2(exercice: ExerciceEqLogE, texte: string): StatutVerification {
  const { p, q, e, d } = exercice;
  return diagnostiquerEquationProportionnelle(texte, "x", (x) => x * x - (p + q + e) * x + (p * q - d), [...POINTS_X, ...exercice.racinesAlgebriques], TOLERANCE_LARGE);
}
export function diagnostiquerEEcran3(exercice: ExerciceEqLogE, textes: string[]): StatutVerification {
  return diagnostiquerEnsembleValeurs(textes, exercice.solutionsFinales, TOLERANCE_EXACTE);
}
export function verifierEEcran2(exercice: ExerciceEqLogE, texte: string): boolean {
  return diagnostiquerEEcran2(exercice, texte) === "correct";
}
export function verifierEEcran3(exercice: ExerciceEqLogE, textes: string[]): boolean {
  return diagnostiquerEEcran3(exercice, textes) === "correct";
}

// ============================================================================
// Famille G — 2 écrans.
// ============================================================================

/** Fonction DIFFÉRENCE (gauche−droite) de la forme simplifiée attendue à l'écran 1 — dépend du
 * mécanisme (voir en-tête de `core6e/equationsExpLog.types.ts`). */
export function referenceDifferenceG(exercice: ExerciceEqLogG): (x: number) => number {
  if (exercice.type === "violationCE") {
    return (x) => exercice.m1 * x + exercice.n1 - (exercice.m2 * x + exercice.n2);
  }
  if (exercice.type === "identite") {
    return () => 0;
  }
  return (x) => x * x + (exercice.b0 - exercice.c0);
}

/** Issue attendue à l'écran 2, déduite directement du mécanisme tiré à la génération. */
export function issueAttendueG(exercice: ExerciceEqLogG): IssueSimplificationG {
  if (exercice.type === "violationCE") return "vide_ce";
  if (exercice.type === "identite") return "vrai_partout";
  return "vide_discriminant";
}

export function diagnostiquerGEcran1(exercice: ExerciceEqLogG, texte: string): StatutVerification {
  const racines = exercice.type === "violationCE" ? [(exercice.n2 - exercice.n1) / (exercice.m1 - exercice.m2)] : [];
  return diagnostiquerEquationProportionnelle(texte, "x", referenceDifferenceG(exercice), [...POINTS_X, ...racines], TOLERANCE_LARGE);
}
export function verifierGEcran1(exercice: ExerciceEqLogG, texte: string): boolean {
  return diagnostiquerGEcran1(exercice, texte) === "correct";
}
export function verifierGEcran2(exercice: ExerciceEqLogG, choix: IssueSimplificationG): boolean {
  return choix === issueAttendueG(exercice);
}
