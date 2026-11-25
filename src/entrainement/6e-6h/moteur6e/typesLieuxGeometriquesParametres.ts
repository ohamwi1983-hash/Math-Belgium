import type { ExerciceLieuxGeometriquesParametres, PhaseLieuxGeometriquesParametres } from "../core6e/lieuxGeometriquesParametres.types";

/** Écrans de `6gen56` : décrits par l'instance (audit du 6e ch. 9, lots B et C). */
export type { PhaseLieuxGeometriquesParametres };

export function phasesPourExercice(e: ExerciceLieuxGeometriquesParametres): PhaseLieuxGeometriquesParametres[] {
  return e.phases;
}
