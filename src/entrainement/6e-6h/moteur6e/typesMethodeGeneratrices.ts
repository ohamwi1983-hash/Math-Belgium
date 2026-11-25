import type { ExerciceMethodeGeneratrices } from "../core6e/methodeGeneratrices.types";

/**
 * Écrans de `6gen57` (audit du 6e ch. 9, lots B et C) : génératrices, élimination ET factorisation
 * (anciens écrans 2 et 3, qui vérifiaient la même équation, fusionnés), statut de chaque morceau
 * (un écran par morceau, choix fermé), restriction.
 */
export type PhaseMethodeGeneratrices = "generatrices" | "elimination" | "statut1" | "statut2" | "restriction";

export function phasesPourExercice(e: ExerciceMethodeGeneratrices): PhaseMethodeGeneratrices[] {
  return e.morceaux.length === 2 ? ["generatrices", "elimination", "statut1", "statut2", "restriction"] : ["generatrices", "elimination", "statut1", "restriction"];
}
