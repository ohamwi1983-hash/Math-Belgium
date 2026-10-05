import type { ExerciceGraphiqueDeriveeB, ExerciceGraphiqueDeriveeD, ExerciceGraphiqueDeriveeExponentielle } from "../core6e/graphiquesDeriveeExponentielles.types";
import { diagnostiquerEquivalenceFonction } from "./equivalenceExponentielle";

/**
 * Couche B (6e) — vérification pour `6gen8`. N'importe jamais rien de `src/generateurs6e/` — voir
 * `verificationGraphiquesDeriveeExponentielles.test.ts` pour la preuve avec des exercices factices
 * définis localement. Chaque référence de dérivée (familles B/D, seules à avoir un écran "calcul")
 * est reconstruite directement depuis les paramètres BRUTS de l'exercice (`base`/`k`), jamais
 * importée — même principe déjà établi par `6gen6`/`6gen7`.
 *
 * L'écran "selection" (les 4 familles) réutilise UNE SEULE fonction, indépendante de la famille —
 * `indexChoisi === exercice.indexCorrect`, exactement comme `6gen5` — le QCM lui-même ne dépend
 * jamais de ce que l'élève a répondu à l'écran "calcul" précédent (spec : "à partir de la valeur
 * correcte").
 */

const TOLERANCE = 0.01;
const POINTS_B = [-1.7, -0.8, 0.8, 1.7];
const POINTS_D = [-1.6, -0.7, 0.7, 1.6];

function referenceBDerivee(base: number): (x: number) => number {
  const lnBase = Math.log(base);
  return (x: number) => {
    const u = Math.pow(base, x);
    return (u * lnBase) / ((u + 1) * (u + 1));
  };
}

export function verifierBDerivee(exercice: ExerciceGraphiqueDeriveeB, texte: string): boolean {
  return diagnostiquerEquivalenceFonction(texte, referenceBDerivee(exercice.base), POINTS_B, TOLERANCE) === "correct";
}

function referenceDDerivee(k: number): (x: number) => number {
  return (x: number) => {
    const u = Math.exp(k * x);
    return (-k * u) / ((u - 1) * (u - 1));
  };
}

export function verifierDDerivee(exercice: ExerciceGraphiqueDeriveeD, texte: string): boolean {
  return diagnostiquerEquivalenceFonction(texte, referenceDDerivee(exercice.k), POINTS_D, TOLERANCE) === "correct";
}

/** Écran "derivee" (familles B/D uniquement — jamais atteinte pour A/C, garde défensive). */
export function verifierEcranDerivee(exercice: ExerciceGraphiqueDeriveeExponentielle, texte: string): boolean {
  if (exercice.famille === "B") return verifierBDerivee(exercice, texte);
  if (exercice.famille === "D") return verifierDDerivee(exercice, texte);
  return false;
}

/** Écran "selection" (les 4 familles) — l'index sélectionné doit correspondre à `indexCorrect`,
 * déterminé à la génération avant randomisation de l'ordre d'affichage. */
export function verifierEcranSelection(exercice: ExerciceGraphiqueDeriveeExponentielle, indexChoisi: number): boolean {
  return indexChoisi === exercice.indexCorrect;
}
