import type { ExerciceExtensionsBinomialeNormaleBayes } from "../core6e/extensionsBinomialeNormaleBayes.types";

/**
 * Écrans de `6gen52` (socle commun `sessionCombinatoire.ts`).
 * - A : p d'une répétition, inéquation en n, n isolé, n minimal.
 * - D : P(S), P(Cⱼ ∩ S), P(Cⱼ | S).
 * - F : loi de X, E(X), total attendu.
 */
export type PhaseExtensionsBinomialeNormaleBayes = "aP" | "aInequation" | "aIsole" | "aN" | "dTotale" | "dIntersection" | "dBayes" | "fLoi" | "fEsperance" | "fTotal";

export function phasesPourExercice(e: ExerciceExtensionsBinomialeNormaleBayes): PhaseExtensionsBinomialeNormaleBayes[] {
  if (e.famille === "A") return ["aP", "aInequation", "aIsole", "aN"];
  if (e.famille === "D") return ["dTotale", "dIntersection", "dBayes"];
  return ["fLoi", "fEsperance", "fTotal"];
}
