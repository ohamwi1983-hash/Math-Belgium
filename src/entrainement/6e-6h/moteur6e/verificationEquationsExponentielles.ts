import type { ExerciceEqExpoA, ExerciceEqExpoB, ExerciceEqExpoC, ExerciceEqExpoD } from "../core6e/equationsExponentielles.types";
import { diagnostiquerEnsembleValeurs, diagnostiquerEquationDifference, diagnostiquerEquationTexte, diagnostiquerEquivalenceFonction, diagnostiquerValeur } from "./equivalenceExponentielle";

/**
 * Couche B (6e) — vérification pour `6gen9`. N'importe jamais rien de `src/generateurs6e/` — voir
 * `verificationEquationsExponentielles.test.ts` pour la preuve avec des exercices factices définis
 * localement. `verifierXxx` retourne un simple booléen (jamais un statut à 3 valeurs séparé exposé
 * à `etapeTentatives.ts`) — même convention déjà en place sur tout ce chantier (6gen6/6gen7/6gen8) :
 * un seul message générique "Incorrect — tentative N/M" pour tout échec, `parse_error` compris.
 */
const TOLERANCE = 0.01;
const POINTS_X = [-4, -2, -1, 0, 1, 2, 3, 5];
const POINTS_T = [-4, -2, -1, 0.5, 1, 2, 4, 7];

function baseValeurLocale(base: { estE: boolean; num: number; den: number }): number {
  return base.estE ? Math.E : base.num / base.den;
}

// ============================================================================
// Famille A — 2 écrans, dispatch par sous-type (A1/A2/A3).
// ============================================================================

export function verifierAEcran1(exercice: ExerciceEqExpoA, texte: string): boolean {
  if (exercice.sousType === "A2") {
    const baseVal = baseValeurLocale(exercice.base);
    const gauche = (x: number) => Math.pow(baseVal, exercice.m * x + exercice.n) - Math.pow(baseVal, exercice.c);
    return diagnostiquerEquationTexte(texte, gauche, () => 0, POINTS_X, TOLERANCE) === "correct";
  }
  const cible = exercice.sousType === "A1" ? exercice.p : exercice.d;
  return diagnostiquerValeur(texte, cible, TOLERANCE) === "correct";
}

/** Écran 2 des sous-types A1/A2 — valeur x UNIQUE. */
export function verifierAEcran2Valeur(exercice: ExerciceEqExpoA, texte: string): boolean {
  if (exercice.sousType === "A3") return false;
  return diagnostiquerValeur(texte, exercice.x, TOLERANCE) === "correct";
}

/** Écran 2 du sous-type A3 — add-as-needed, 0/1/2 valeurs. */
export function verifierAEcran2Liste(exercice: ExerciceEqExpoA, textes: string[]): boolean {
  if (exercice.sousType !== "A3") return false;
  return diagnostiquerEnsembleValeurs(textes, exercice.solutions, TOLERANCE) === "correct";
}

// ============================================================================
// Famille B — 2 écrans.
// ============================================================================

export function verifierBEcran1(exercice: ExerciceEqExpoB, texte: string): boolean {
  const ref = (x: number) => (exercice.m1 * x + exercice.n1) / 2;
  return diagnostiquerEquivalenceFonction(texte, ref, POINTS_X, TOLERANCE) === "correct";
}

/** Écran 2 — valeur x OU ∅ (même patron que 6gen3, "existe/n'existe pas" gate le champ). */
export interface ReponseValeurOuVide {
  existe: boolean;
  texte: string | null;
}

export function verifierBEcran2(exercice: ExerciceEqExpoB, reponse: ReponseValeurOuVide): boolean {
  if (exercice.contradictoire) return reponse.existe === false;
  if (reponse.existe !== true || reponse.texte === null) return false;
  return diagnostiquerValeur(reponse.texte, exercice.x as number, TOLERANCE) === "correct";
}

// ============================================================================
// Famille C — 3 écrans.
// ============================================================================

export function verifierCEcran1(exercice: ExerciceEqExpoC, texte: string): boolean {
  const ref = (t: number) => exercice.A * t * t + exercice.B * t + exercice.C;
  return diagnostiquerEquationDifference(texte, "t", ref, POINTS_T, TOLERANCE) === "correct";
}

export function verifierCEcran2(exercice: ExerciceEqExpoC, textes: string[]): boolean {
  return diagnostiquerEnsembleValeurs(textes, exercice.solutionsT, TOLERANCE) === "correct";
}

export function verifierCEcran3(exercice: ExerciceEqExpoC, textes: string[]): boolean {
  return diagnostiquerEnsembleValeurs(textes, exercice.solutionsX, TOLERANCE) === "correct";
}

// ============================================================================
// Famille D — 1 écran, pure reconnaissance (jamais de calcul), TOUJOURS ∅.
// ============================================================================

export function verifierDEcran(_exercice: ExerciceEqExpoD, existeUneSolution: boolean): boolean {
  return existeUneSolution === false;
}
