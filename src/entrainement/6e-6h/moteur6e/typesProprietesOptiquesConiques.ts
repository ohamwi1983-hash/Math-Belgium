import type { ExerciceProprietesOptiquesConiques } from "../core6e/proprietesOptiquesConiques.types";

/** Écrans de `6gen63` (audit du 6e ch. 10, lots B et C) : quatre écrans pour les trois coniques. */
export type PhaseProprietesOptiquesConiques = "foyers" | "impact" | "propriete" | "reflechi";

export function phasesPourExercice(_e: ExerciceProprietesOptiquesConiques): PhaseProprietesOptiquesConiques[] {
  return ["foyers", "impact", "propriete", "reflechi"];
}
