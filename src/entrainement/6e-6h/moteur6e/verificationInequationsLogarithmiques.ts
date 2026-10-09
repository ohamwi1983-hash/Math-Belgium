import type { EnsembleReelGuide } from "../core6e/ensembleReel.types";
import type { Comparateur, ExerciceLogA, ExerciceLogB, ExerciceLogC, ExerciceLogD, ExerciceLogE, ExerciceLogF, ReponseCasBaseLog } from "../core6e/inequationsLogarithmiques.types";
import { diagnostiquerEquivalenceFonction, separerEquationTexte } from "./equivalenceExponentielle";
import type { StatutVerification } from "../moteur/statutVerification";
import { verifierEnsembleReelGuide } from "./verificationEnsembleReel";

/**
 * Couche B (6e) — vérification pour `6gen15`. N'importe jamais rien de `src/generateurs6e/` — voir
 * `verificationInequationsLogarithmiques.test.ts` pour la preuve avec des exercices factices
 * définis localement.
 *
 * `verifierXxx` retourne un simple booléen (jamais un statut à 3 valeurs séparé exposé à
 * `etapeTentatives.ts`) — même convention déjà en place sur ce chantier (6gen6 à 6gen10) : un seul
 * message générique "Incorrect — tentative N/M" pour tout échec, `parse_error` compris.
 * `diagnostiquerXxx` reste exposé À CÔTÉ de chaque `verifierXxx` d'un champ texte libre (jamais à
 * la place — convention CLAUDE.md, statut à 3 valeurs).
 *
 * Réutilise DIRECTEMENT (moteur→moteur, déjà établi ailleurs sur ce chantier)
 * `diagnostiquerEquivalenceFonction`/`separerEquationTexte` (`equivalenceExponentielle.ts`,
 * chapitre 2) et `verifierEnsembleReelGuide` (`verificationEnsembleReel.ts`). Une base de
 * logarithme concrète se traduit TOUJOURS en changement de base `ln(x)/ln(base)` — l'évaluateur
 * partagé (`expressionExponentielle.ts`) n'a pas de fonction `log` native, voir CLAUDE.md.
 */
const TOLERANCE = 0.01;
const POINTS_X = [-4, -2, -1, -0.5, 0.5, 1, 2, 3, 5];
const POINTS_Y = [-4, -2, -1, -0.5, 0.5, 1, 2, 3, 5];

function symbolesEquivalents(symbole: string, attendu: Comparateur): boolean {
  const NORMALISE: Record<string, Comparateur> = { "≤": "<=", "≥": ">=", "<=": "<=", ">=": ">=", "<": "<", ">": ">" };
  return NORMALISE[symbole] === attendu;
}

// ============================================================================
// Famille A — 2 écrans.
// ============================================================================

export function verifierACE(exercice: ExerciceLogA, reponse: EnsembleReelGuide): boolean {
  return verifierEnsembleReelGuide(reponse, exercice.ceEcran1);
}

export function verifierAResoudre(exercice: ExerciceLogA, reponse: EnsembleReelGuide): boolean {
  return verifierEnsembleReelGuide(reponse, exercice.solutionEcran2);
}

// ============================================================================
// Famille B — 2 écrans.
// ============================================================================

export function verifierBCE(exercice: ExerciceLogB, reponse: EnsembleReelGuide): boolean {
  return verifierEnsembleReelGuide(reponse, exercice.ceEcran1);
}

export function verifierBResoudre(exercice: ExerciceLogB, reponse: EnsembleReelGuide): boolean {
  return verifierEnsembleReelGuide(reponse, exercice.solutionEcran2);
}

// ============================================================================
// Famille C — 3 écrans.
// ============================================================================

export function verifierCCE(exercice: ExerciceLogC, reponse: EnsembleReelGuide): boolean {
  return verifierEnsembleReelGuide(reponse, exercice.ceEcran1);
}

function referenceCombinaisonC(exercice: ExerciceLogC): (x: number) => number {
  const f = (x: number) => exercice.f.m * x + exercice.f.n;
  const g = (x: number) => exercice.g.m * x + exercice.g.n;
  return exercice.sousType === "produit" ? (x) => f(x) * g(x) : (x) => f(x) / g(x);
}

export function diagnostiquerCCombiner(exercice: ExerciceLogC, texte: string): StatutVerification {
  return diagnostiquerEquivalenceFonction(texte, referenceCombinaisonC(exercice), POINTS_X, TOLERANCE);
}

export function verifierCCombiner(exercice: ExerciceLogC, texte: string): boolean {
  return diagnostiquerCCombiner(exercice, texte) === "correct";
}

export function verifierCComparer(exercice: ExerciceLogC, reponse: EnsembleReelGuide): boolean {
  return verifierEnsembleReelGuide(reponse, exercice.solutionEcran3);
}

// ============================================================================
// Famille D — 4 écrans.
// ============================================================================

export function verifierDCE(exercice: ExerciceLogD, reponse: EnsembleReelGuide): boolean {
  return verifierEnsembleReelGuide(reponse, exercice.ceEcran1);
}

/** `texte` attendu : `"A y^2+By+C [comparateur] 0"` (variable `y`) — le SYMBOLE compte (piège
 * central des écrans "réécrire", même convention que `diagnostiquerCkRegrouper`/
 * `diagnostiquerERegrouper` de 6gen10). */
export function diagnostiquerDReecrire(exercice: ExerciceLogD, texte: string): StatutVerification {
  const separe = separerEquationTexte(texte);
  if (separe === null) return "parse_error";
  const gaucheRef = (y: number) => exercice.A * y * y + exercice.B * y + exercice.C;
  const statutGauche = diagnostiquerEquivalenceFonction(separe.gauche, gaucheRef, POINTS_Y, TOLERANCE, "y");
  if (statutGauche === "parse_error") return "parse_error";
  const statutDroite = diagnostiquerEquivalenceFonction(separe.droite, () => 0, POINTS_Y, TOLERANCE, "y");
  if (statutDroite === "parse_error") return "parse_error";
  if (statutGauche === "not_equivalent" || statutDroite === "not_equivalent") return "not_equivalent";
  if (!symbolesEquivalents(separe.symbole, exercice.comparateur)) return "not_equivalent";
  return "correct";
}

export function verifierDReecrire(exercice: ExerciceLogD, texte: string): boolean {
  return diagnostiquerDReecrire(exercice, texte) === "correct";
}

export function verifierDResoudreY(exercice: ExerciceLogD, reponse: EnsembleReelGuide): boolean {
  return verifierEnsembleReelGuide(reponse, exercice.solutionEcran3);
}

export function verifierDConvertirX(exercice: ExerciceLogD, reponse: EnsembleReelGuide): boolean {
  return verifierEnsembleReelGuide(reponse, exercice.solutionEcran4);
}

// ============================================================================
// Famille E — 1 écran, TOUJOURS ∅.
// ============================================================================

export function verifierEReconnaitre(_exercice: ExerciceLogE, estImpossible: boolean): boolean {
  return estImpossible === true;
}

// ============================================================================
// Famille F — 3 écrans.
// ============================================================================

export function verifierFCE(exercice: ExerciceLogF, reponse: EnsembleReelGuide): boolean {
  return verifierEnsembleReelGuide(reponse, exercice.ceEcran1);
}

export function diagnostiquerFSimplifier(exercice: ExerciceLogF, texte: string): StatutVerification {
  const reference = (x: number) => (x - exercice.r) * (x - exercice.r);
  return diagnostiquerEquivalenceFonction(texte, reference, POINTS_X, TOLERANCE);
}

export function verifierFSimplifier(exercice: ExerciceLogF, texte: string): boolean {
  return diagnostiquerFSimplifier(exercice, texte) === "correct";
}

export interface ReponseFConclure {
  casSuperieur: ReponseCasBaseLog;
  casInferieur: ReponseCasBaseLog;
}

function verifierCasBaseLog(reponse: ReponseCasBaseLog, attenduVide: boolean, ensembleAttendu: EnsembleReelGuide): boolean {
  if (attenduVide) return reponse.estVide === true;
  if (reponse.estVide || reponse.ensemble === null) return false;
  return verifierEnsembleReelGuide(reponse.ensemble, ensembleAttendu);
}

export function verifierFConclure(exercice: ExerciceLogF, reponse: ReponseFConclure): boolean {
  const superieurVide = exercice.casVideEstSuperieurA1;
  const okSuperieur = verifierCasBaseLog(reponse.casSuperieur, superieurVide, exercice.ensembleSansR);
  const okInferieur = verifierCasBaseLog(reponse.casInferieur, !superieurVide, exercice.ensembleSansR);
  return okSuperieur && okInferieur;
}
