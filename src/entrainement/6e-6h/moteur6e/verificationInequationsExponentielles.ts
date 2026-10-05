import type { EnsembleReelGuide } from "../core6e/ensembleReel.types";
import type { Comparateur, DirectionSigne, ExerciceIneqA, ExerciceIneqB, ExerciceIneqC, ExerciceIneqD, ExerciceIneqE, ExerciceInequationExponentielle } from "../core6e/inequationsExponentielles.types";
import { diagnostiquerEquivalenceFonction, diagnostiquerValeur, separerEquationTexte } from "./equivalenceExponentielle";
import { verifierEnsembleReelGuide } from "./verificationEnsembleReel";

/**
 * Couche B (6e) — vérification pour `6gen10`. N'importe jamais rien de `src/generateurs6e/` — voir
 * `verificationInequationsExponentielles.test.ts` pour la preuve avec des exercices factices
 * définis localement. `verifierXxx` retourne un simple booléen (jamais un statut à 3 valeurs
 * séparé exposé à `etapeTentatives.ts`) — même convention déjà en place sur ce chantier (6gen6/
 * 6gen7/6gen8/6gen9) : un seul message générique "Incorrect — tentative N/M" pour tout échec,
 * `parse_error` compris.
 *
 * Réutilise DIRECTEMENT (moteur→moteur, déjà établi ailleurs sur ce chantier — voir 6gen9)
 * `diagnostiquerEquivalenceFonction`/`diagnostiquerValeur`/`separerEquationTexte`
 * (`equivalenceExponentielle.ts`) et `verifierEnsembleReelGuide` (`verificationEnsembleReel.ts`,
 * déjà partagé par 6gen1/6gen3/6gen7 — voir la doc de `core6e/inequationsExponentielles.types.ts`
 * pour la décision de NE PAS étendre `EnsembleReelGuide` d'une 4e forme "vide").
 */
const TOLERANCE = 0.01;
const POINTS_X = [-4, -2, -1, 0, 1, 2, 3, 5];

function baseValeurLocale(base: { estE: boolean; num: number; den: number }): number {
  return base.estE ? Math.E : base.num / base.den;
}

/** Normalise un symbole de comparaison TEXTE (`separerEquationTexte`, qui reconnaît aussi
 * `≤`/`≥`) contre un `Comparateur` attendu. */
function symbolesEquivalents(symbole: string, attendu: Comparateur): boolean {
  const NORMALISE: Record<string, Comparateur> = { "≤": "<=", "≥": ">=", "<=": "<=", ">=": ">=", "<": "<", ">": ">" };
  return NORMALISE[symbole] === attendu;
}

/** Compare une inéquation TEXTE ("A op B") REGROUPÉE à 2 références + un comparateur ATTENDU (le
 * symbole lui-même compte : le piège central des écrans "regrouper" est de perdre le bon sens,
 * voir `diagnostiquerCkRegrouper`/`diagnostiquerERegrouper`). `parse_error` prioritaire — jamais
 * confondu avec un simple mauvais symbole (qui reste `not_equivalent`, le texte ayant bien pu être
 * lu). */
function diagnostiquerInequationRegroupeeTexte(
  texte: string,
  referenceGauche: (x: number) => number,
  referenceDroite: (x: number) => number,
  comparateurAttendu: Comparateur,
  points: number[] = POINTS_X,
  tolerance: number = TOLERANCE,
): "correct" | "not_equivalent" | "parse_error" {
  const separe = separerEquationTexte(texte);
  if (separe === null) return "parse_error";
  const statutGauche = diagnostiquerEquivalenceFonction(separe.gauche, referenceGauche, points, tolerance);
  if (statutGauche === "parse_error") return "parse_error";
  const statutDroite = diagnostiquerEquivalenceFonction(separe.droite, referenceDroite, points, tolerance);
  if (statutDroite === "parse_error") return "parse_error";
  if (statutGauche === "not_equivalent" || statutDroite === "not_equivalent") return "not_equivalent";
  if (!symbolesEquivalents(separe.symbole, comparateurAttendu)) return "not_equivalent";
  return "correct";
}

// ============================================================================
// Famille A — 2 écrans.
// ============================================================================

export function verifierAReconnaitre(exercice: ExerciceIneqA, texte: string): boolean {
  return diagnostiquerValeur(texte, exercice.p, TOLERANCE) === "correct";
}

export function verifierAResoudre(exercice: ExerciceIneqA, reponse: EnsembleReelGuide): boolean {
  return verifierEnsembleReelGuide(reponse, exercice.solutionEcran2);
}

// ============================================================================
// Famille B — 1 écran, TOUJOURS ∅.
// ============================================================================

export function verifierBReconnaitre(_exercice: ExerciceIneqB, estImpossible: boolean): boolean {
  return estImpossible === true;
}

// ============================================================================
// Famille C — sous-type f (1 écran, TOUJOURS ℝ) / sous-type k (2 écrans, TOUJOURS ℝ).
// ============================================================================

export function verifierCfReconnaitre(_exercice: ExerciceIneqC, estToujoursVraie: boolean): boolean {
  return estToujoursVraie === true;
}

export function diagnostiquerCkRegrouper(exercice: ExerciceIneqC, texte: string): "correct" | "not_equivalent" | "parse_error" {
  if (exercice.sousType !== "k") return "parse_error";
  const b1 = baseValeurLocale(exercice.base1);
  const b2 = baseValeurLocale(exercice.base2);
  const ratio = b1 / (b2 * b2);
  const g = (x: number) => exercice.a * x * x + exercice.b * x + exercice.c;
  const gauche = (x: number) => Math.pow(ratio, g(x));
  const droite = () => 1;
  return diagnostiquerInequationRegroupeeTexte(texte, gauche, droite, exercice.comparateur);
}

export function verifierCkRegrouper(exercice: ExerciceIneqC, texte: string): boolean {
  return diagnostiquerCkRegrouper(exercice, texte) === "correct";
}

export function verifierCkConclure(exercice: ExerciceIneqC, estToujoursVraie: boolean): boolean {
  if (exercice.sousType !== "k") return false;
  return estToujoursVraie === true;
}

// ============================================================================
// Famille D — sous-type "constant" (2 écrans) / "variable" (3 écrans).
// ============================================================================

export function verifierDConstantSigne(exercice: ExerciceIneqD, signe: "positif" | "negatif"): boolean {
  if (exercice.sousType !== "constant") return false;
  return (signe === "positif") === exercice.premierFacteur.positif;
}

export function verifierDConstantResoudre(exercice: ExerciceIneqD, reponse: EnsembleReelGuide): boolean {
  if (exercice.sousType !== "constant") return false;
  return verifierEnsembleReelGuide(reponse, exercice.solutionEcran2);
}

export interface ReponseSigneUnZero {
  zeroTexte: string;
  sens: DirectionSigne;
}

function verifierSigneUnZero(zeroAttendu: number, sensAttendu: DirectionSigne, reponse: ReponseSigneUnZero): boolean {
  if (reponse.sens !== sensAttendu) return false;
  return diagnostiquerValeur(reponse.zeroTexte, zeroAttendu, TOLERANCE) === "correct";
}

export function verifierDVariableSigne1(exercice: ExerciceIneqD, reponse: ReponseSigneUnZero): boolean {
  if (exercice.sousType !== "variable") return false;
  return verifierSigneUnZero(exercice.zero1, exercice.sens1, reponse);
}

export function verifierDVariableSigne2(exercice: ExerciceIneqD, reponse: ReponseSigneUnZero): boolean {
  if (exercice.sousType !== "variable") return false;
  return verifierSigneUnZero(exercice.zero2, exercice.sens2, reponse);
}

export function verifierDVariableTableau(exercice: ExerciceIneqD, reponse: EnsembleReelGuide): boolean {
  if (exercice.sousType !== "variable") return false;
  return verifierEnsembleReelGuide(reponse, exercice.solutionEcran3);
}

// ============================================================================
// Famille E — 2 écrans.
// ============================================================================

export function diagnostiquerERegrouper(exercice: ExerciceIneqE, texte: string): "correct" | "not_equivalent" | "parse_error" {
  const b1 = baseValeurLocale(exercice.base1);
  const b2 = baseValeurLocale(exercice.base2);
  const ratio = b1 / b2;
  const gauche = (x: number) => Math.pow(ratio, exercice.m * x + exercice.n);
  const droite = () => 1;
  return diagnostiquerInequationRegroupeeTexte(texte, gauche, droite, exercice.comparateur);
}

export function verifierERegrouper(exercice: ExerciceIneqE, texte: string): boolean {
  return diagnostiquerERegrouper(exercice, texte) === "correct";
}

export function verifierEResoudre(exercice: ExerciceIneqE, reponse: EnsembleReelGuide): boolean {
  return verifierEnsembleReelGuide(reponse, exercice.solutionEcran2);
}

/** Réexport de commodité — narrowing complet depuis `ExerciceInequationExponentielle`, utile aux
 * appelants (`sessionInequationsExponentielles.ts`) qui narrowent déjà sur `famille` avant d'appeler
 * ces fonctions. */
export type { ExerciceInequationExponentielle };
