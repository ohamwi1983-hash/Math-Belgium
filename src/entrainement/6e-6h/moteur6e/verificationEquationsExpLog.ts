import type { EnsembleReelGuide } from "../core6e/ensembleReel.types";
import type { ExerciceEqLogA, ExerciceEqLogB, ExerciceEqLogC, ExerciceEqLogD, ExerciceEqLogE, ExerciceEqLogF, ExerciceEqLogG, IssueSimplificationG } from "../core6e/equationsExpLog.types";
import type { StatutVerification } from "../moteur/statutVerification";
import { diagnostiquerEnsembleValeurs, diagnostiquerEquationDifference, diagnostiquerEquationTexte, diagnostiquerValeur } from "./equivalenceExponentielle";
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
 * irrationnelle) issue d'une arithmétique déterministe (familles A, B, C, D) ; `TOLERANCE_LARGE`
 * (5e-2) pour les comparaisons d'ÉQUATIONS/EXPRESSIONS par échantillonnage numérique (marge pour
 * l'arrondi de calcul de l'élève, même ordre que `TOLERANCE_EXPRESSION` de 6gen12) ;
 * `TOLERANCE_F` (0,05, proportionnellement large) pour la famille F — la SEULE où le prompt accepte
 * explicitement une tolérance numérique sur la valeur finale ("réponses potentiellement
 * irrationnelles... vérification symbolique/numérique tolérante, pas de forme exacte imposée").
 */
const TOLERANCE_EXACTE = 1e-3;
const TOLERANCE_LARGE = 0.05;
const TOLERANCE_F = 0.05;

const POINTS_X = [-4, -3, -2, -1, -0.5, 0.5, 1, 2, 3, 4, 5];
const POINTS_T = [0.1, 0.5, 1, 1.5, 2, 3, 4, 5, 7, 10];
/** Évite 0 (famille F écran 2, l'équation manipule `1/y`). */
const POINTS_Y = [-4, -3, -2, -1, 1, 2, 3, 4];

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
  return diagnostiquerEquationTexte(texte, (x) => (exercice.m1 * x + exercice.n1) * Math.log(exercice.base1), (x) => (exercice.m2 * x + exercice.n2) * Math.log(exercice.base2), POINTS_X, TOLERANCE_LARGE);
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
  return diagnostiquerEquationDifference(texte, "t", (t) => exercice.A * t * t + exercice.B * t + exercice.Cc, POINTS_T, TOLERANCE_LARGE);
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

/** CE attendue, différente selon le sous-type (piège central de la famille, spec explicite) :
 * D1 (`x` = base) : `ℝ₀⁺\{1}` = `]0;1[∪]1;+∞[`. D2 (`x` = argument) : `]0;+∞[`. */
export function ceAttendueD(exercice: ExerciceEqLogD): EnsembleReelGuide {
  if (exercice.sousType === "D1") {
    return {
      forme: "intervalles",
      points: [],
      morceaux: [
        { inf: 0, sup: 1, infInclus: false, supInclus: false },
        { inf: 1, sup: null, infInclus: false, supInclus: false },
      ],
    };
  }
  return { forme: "intervalles", points: [], morceaux: [{ inf: 0, sup: null, infInclus: false, supInclus: false }] };
}
export function verifierDEcran1(exercice: ExerciceEqLogD, reponse: EnsembleReelGuide): boolean {
  return verifierEnsembleReelGuide(reponse, ceAttendueD(exercice));
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
  return diagnostiquerEquationDifference(texte, "x", (x) => x * x - (p + q + e) * x + (p * q - d), POINTS_X, TOLERANCE_LARGE);
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
// Famille F — 3 écrans.
// ============================================================================

export function ceAttendueF(): EnsembleReelGuide {
  return {
    forme: "intervalles",
    points: [],
    morceaux: [
      { inf: 0, sup: 1, infInclus: false, supInclus: false },
      { inf: 1, sup: null, infInclus: false, supInclus: false },
    ],
  };
}
export function verifierFEcran1(_exercice: ExerciceEqLogF, reponse: EnsembleReelGuide): boolean {
  return verifierEnsembleReelGuide(reponse, ceAttendueF());
}
export function diagnostiquerFEcran2(exercice: ExerciceEqLogF, texte: string): StatutVerification {
  return diagnostiquerEquationDifference(texte, "y", (y) => y + 1 / y - exercice.k, POINTS_Y, TOLERANCE_LARGE);
}
/** Tolérance ABSOLUE mais PROPORTIONNÉE à l'échelle des valeurs comparées (`x=a^y`, amplitude très
 * variable d'un tirage à l'autre) — même principe que `toleranceArrondie` (6gen12). */
function toleranceRelativeF(valeurs: number[]): number {
  const echelle = Math.max(1, ...valeurs.map((v) => Math.abs(v)));
  return TOLERANCE_F * echelle;
}

export function diagnostiquerFEcran3(exercice: ExerciceEqLogF, textes: string[]): StatutVerification {
  return diagnostiquerEnsembleValeurs(textes, exercice.xValides, toleranceRelativeF(exercice.xValides));
}
export function verifierFEcran2(exercice: ExerciceEqLogF, texte: string): boolean {
  return diagnostiquerFEcran2(exercice, texte) === "correct";
}
export function verifierFEcran3(exercice: ExerciceEqLogF, textes: string[]): boolean {
  return diagnostiquerFEcran3(exercice, textes) === "correct";
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
  return diagnostiquerEquationDifference(texte, "x", referenceDifferenceG(exercice), POINTS_X, TOLERANCE_LARGE);
}
export function verifierGEcran1(exercice: ExerciceEqLogG, texte: string): boolean {
  return diagnostiquerGEcran1(exercice, texte) === "correct";
}
export function verifierGEcran2(exercice: ExerciceEqLogG, choix: IssueSimplificationG): boolean {
  return choix === issueAttendueG(exercice);
}
