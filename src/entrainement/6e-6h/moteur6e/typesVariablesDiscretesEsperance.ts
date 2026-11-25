import type { ExerciceVariablesDiscretesEsperance } from "../core6e/variablesDiscretesEsperance.types";

/**
 * Écrans de `6gen49` (socle commun du 6e ch. 7, `sessionCombinatoire.ts`).
 * - A : P(E₁), P(E₂), puis « contraires ? » (choix fermé seul, une tentative).
 * - B : loi de X (une probabilité par valeur), puis E(X).
 * - C « vérifier » : E(X) du gain net, puis la conclusion (choix fermé).
 * - C « imposer » : E du gain brut, mise équitable, puis jugement d'une mise proposée (choix fermé).
 * Le nombre d'écrans ne dépend d'aucun verdict.
 */
export type PhaseVariablesDiscretesEsperance = "aP1" | "aP2" | "aContraires" | "bLoi" | "bEsperance" | "cEsperanceNette" | "cConclusion" | "cEsperanceBrute" | "cMise" | "cJugerMise";

export function phasesPourExercice(e: ExerciceVariablesDiscretesEsperance): PhaseVariablesDiscretesEsperance[] {
  if (e.famille === "A") return ["aP1", "aP2", "aContraires"];
  if (e.famille === "B") return ["bLoi", "bEsperance"];
  return e.sousType === "verifier" ? ["cEsperanceNette", "cConclusion"] : ["cEsperanceBrute", "cMise", "cJugerMise"];
}
