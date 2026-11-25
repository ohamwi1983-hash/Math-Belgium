import type { ExerciceLoiPoisson } from "../core6e/loiPoisson.types";

/**
 * Écrans de `6gen53` (socle commun `sessionCombinatoire.ts`).
 * - A : « approximable ? » (choix seul, une tentative) ; oui → λ, P(X = k) ; non → la condition qui
 *   échoue (choix). L'appli montre 3 puces tant que le verdict n'est pas jugé.
 * - B : λ ajusté, probabilité (plus d'écran « stratégie », que le type de question donnait).
 */
export type PhaseLoiPoisson = "aVerdict" | "aLambda" | "aProba" | "aCondition" | "bLambda" | "bProba";

export function phasesPourExercice(e: ExerciceLoiPoisson): PhaseLoiPoisson[] {
  if (e.famille === "A") return e.approximable ? ["aVerdict", "aLambda", "aProba"] : ["aVerdict", "aCondition"];
  return ["bLambda", "bProba"];
}
