import type { ExerciceCercles } from "../core6e/cercles.types";

/** Écrans de `6gen55` (audit du 6e ch. 9, lots B et C). */
export type PhaseCercles =
  | "aSysteme"
  | "aCoefficients"
  | "aCentreRayon"
  | "bNombre"
  | "bMediatrice"
  | "bCentres"
  | "cMediatrice"
  | "cCentre"
  | "cEquation"
  | "dEquationK"
  | "dCentreRayon"
  | "dEquation"
  | "eCotes"
  | "eCentre"
  | "eRayon"
  | "fDistance"
  | "fRayon2"
  | "fEquation"
  | "gSommets"
  | "gCotes"
  | "gCentre"
  | "gRayon";

export function phasesPourExercice(e: ExerciceCercles): PhaseCercles[] {
  switch (e.famille) {
    case "A":
      return ["aSysteme", "aCoefficients", "aCentreRayon"];
    case "B":
      return e.verdict === 0 ? ["bNombre"] : ["bNombre", "bMediatrice", "bCentres"];
    case "C":
      return ["cMediatrice", "cCentre", "cEquation"];
    case "D":
      return ["dEquationK", "dCentreRayon", "dEquation"];
    case "E":
      return ["eCotes", "eCentre", "eRayon"];
    case "F":
      return ["fDistance", "fRayon2", "fEquation"];
    case "G":
      return ["gSommets", "gCotes", "gCentre", "gRayon"];
  }
}
