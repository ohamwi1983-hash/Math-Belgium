import type {
  ExerciceGraphiqueDeriveeLogA,
  ExerciceGraphiqueDeriveeLogB,
  ExerciceGraphiqueDeriveeLogC,
  ExerciceGraphiqueDeriveeLogarithme,
} from "../core6e/graphiqueDeriveeLogarithme.types";
import type { StatutVerification } from "../moteur/statutVerification";
import { diagnostiquerEquivalenceFonction } from "./equivalenceExponentielle";

/**
 * Couche B (6e) — vérification pour `6gen20`. N'importe jamais rien de `src/generateurs6e/` — voir
 * `verificationGraphiqueDeriveeLogarithme.test.ts` pour la preuve avec des exercices factices
 * définis localement. Vérification par ÉCHANTILLONNAGE NUMÉRIQUE (`diagnostiquerEquivalenceFonction`,
 * `moteur6e/equivalenceExponentielle.ts`, partagé avec les chapitres 2/3 — "Algebrite/mathjs" des
 * specs source désigne cette même convention, voir CLAUDE.md). Chaque référence de dérivée est
 * reconstruite ICI directement depuis les paramètres BRUTS de l'exercice (`k`/`base`/`baseEstE`),
 * jamais importée depuis `ui6e/formatGraphiqueDeriveeLogarithme.ts` (qui réimplémente la même
 * formule indépendamment pour le tracé Mafs) — même principe déjà établi par
 * `verificationDomaineDeriveeLogarithme.ts` (6gen16) et `verificationGraphiquesDeriveeExponentielles.ts`
 * (6gen8) : 2 implémentations indépendantes de la même math, jamais l'une réutilisant l'autre,
 * pour qu'une erreur dans l'une ne se propage jamais silencieusement à l'autre.
 *
 * L'écran "selection" (les 3 familles) réutilise UNE SEULE fonction, indépendante de la famille —
 * `indexChoisi === exercice.indexCorrect`, exactement comme `6gen5`/`6gen8` — le QCM ne dépend
 * jamais de ce que l'élève a répondu à l'écran "derivee" précédent (spec : "à partir de la valeur
 * correcte").
 */

const TOLERANCE = 0.01;

function diviseurLn(base: number, baseEstE: boolean): number {
  return baseEstE ? 1 : Math.log(base);
}

// ============================================================================
// Famille A — f'(x) = k·[1−ln(x)]/(x²·ln(base)) [ou /x² seul si base=e].
// ============================================================================

const POINTS_A = [0.3, 0.9, 2, 5.5];

function referenceADerivee(exercice: ExerciceGraphiqueDeriveeLogA): (x: number) => number {
  const div = diviseurLn(exercice.base, exercice.baseEstE);
  const { k } = exercice;
  return (x) => (k * (1 - Math.log(x))) / (x * x * div);
}

export function diagnostiquerADerivee(exercice: ExerciceGraphiqueDeriveeLogA, texte: string): StatutVerification {
  return diagnostiquerEquivalenceFonction(texte, referenceADerivee(exercice), POINTS_A, TOLERANCE);
}
export function verifierADerivee(exercice: ExerciceGraphiqueDeriveeLogA, texte: string): boolean {
  return diagnostiquerADerivee(exercice, texte) === "correct";
}

// ============================================================================
// Famille B — f'(x) = k·e^x·[ln(x)+1/x].
// ============================================================================

const POINTS_B = [0.2, 0.6, 1.5, 3];

function referenceBDerivee(exercice: ExerciceGraphiqueDeriveeLogB): (x: number) => number {
  const { k } = exercice;
  return (x) => k * Math.exp(x) * (Math.log(x) + 1 / x);
}

export function diagnostiquerBDerivee(exercice: ExerciceGraphiqueDeriveeLogB, texte: string): StatutVerification {
  return diagnostiquerEquivalenceFonction(texte, referenceBDerivee(exercice), POINTS_B, TOLERANCE);
}
export function verifierBDerivee(exercice: ExerciceGraphiqueDeriveeLogB, texte: string): boolean {
  return diagnostiquerBDerivee(exercice, texte) === "correct";
}

// ============================================================================
// Famille C — f'(x) = k·(ln(x)+1).
// ============================================================================

const POINTS_C = [0.1, 0.5, 1.4, 4];

function referenceCDerivee(exercice: ExerciceGraphiqueDeriveeLogC): (x: number) => number {
  const { k } = exercice;
  return (x) => k * (Math.log(x) + 1);
}

export function diagnostiquerCDerivee(exercice: ExerciceGraphiqueDeriveeLogC, texte: string): StatutVerification {
  return diagnostiquerEquivalenceFonction(texte, referenceCDerivee(exercice), POINTS_C, TOLERANCE);
}
export function verifierCDerivee(exercice: ExerciceGraphiqueDeriveeLogC, texte: string): boolean {
  return diagnostiquerCDerivee(exercice, texte) === "correct";
}

// ============================================================================
// Dispatch par famille — écran "derivee" (les 3 familles, toujours atteint).
// ============================================================================

export function diagnostiquerEcranDerivee(exercice: ExerciceGraphiqueDeriveeLogarithme, texte: string): StatutVerification {
  switch (exercice.famille) {
    case "A":
      return diagnostiquerADerivee(exercice, texte);
    case "B":
      return diagnostiquerBDerivee(exercice, texte);
    case "C":
      return diagnostiquerCDerivee(exercice, texte);
  }
}
export function verifierEcranDerivee(exercice: ExerciceGraphiqueDeriveeLogarithme, texte: string): boolean {
  return diagnostiquerEcranDerivee(exercice, texte) === "correct";
}

/** Écran "selection" (les 3 familles) — l'index sélectionné doit correspondre à `indexCorrect`,
 * déterminé à la génération avant randomisation de l'ordre d'affichage. */
export function verifierEcranSelection(exercice: ExerciceGraphiqueDeriveeLogarithme, indexChoisi: number): boolean {
  return indexChoisi === exercice.indexCorrect;
}
