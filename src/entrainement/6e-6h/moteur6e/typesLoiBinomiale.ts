import type { ExerciceLoiBinomiale } from "../core6e/loiBinomiale.types";

/**
 * Écrans de `6gen50` (socle commun `sessionCombinatoire.ts`).
 * - A : « binomiale ? » (choix seul, une tentative), puis n et p — ou la condition qui échoue (choix).
 *   Deux écrans dans les deux cas : le nombre de puces ne dit pas le verdict.
 * - B : loi complète, diagramme (choix), E(X) et V(X), σ(X).
 * - C : inéquation en n, n isolé (le sens change : on divise par un logarithme négatif), n minimal.
 */
export type PhaseLoiBinomiale = "aVerdict" | "aParametres" | "aCondition" | "bLoi" | "bDiagramme" | "bEV" | "bSigma" | "cInequation" | "cIsole" | "cN";

export function phasesPourExercice(e: ExerciceLoiBinomiale): PhaseLoiBinomiale[] {
  if (e.famille === "A") return ["aVerdict", e.binomiale ? "aParametres" : "aCondition"];
  if (e.famille === "B") return ["bLoi", "bDiagramme", "bEV", "bSigma"];
  return ["cInequation", "cIsole", "cN"];
}
