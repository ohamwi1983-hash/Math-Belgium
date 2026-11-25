import type { ExerciceAireExcentriciteConique } from "../core6e/aireExcentriciteConique.types";

/** Écrans de `6gen60` (audit du 6e ch. 10, lots B et C). */
export type PhaseAireExcentriciteConique = "aRayons" | "aCos" | "aAire" | "bRelation" | "bE";

export function phasesPourExercice(e: ExerciceAireExcentriciteConique): PhaseAireExcentriciteConique[] {
  return e.famille === "A" ? ["aRayons", "aCos", "aAire"] : ["bRelation", "bE"];
}
