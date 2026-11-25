import type { ExercicePointsDroitesRemarquablesTriangle } from "../core6e/pointsDroitesRemarquablesTriangle.types";

/** Écrans de `6gen54` (audit du 6e ch. 9, lots B et C). */
export type PhasePointsDroitesRemarquablesTriangle =
  | "aSommetA"
  | "aSommetsBC"
  | "bLongueurs"
  | "bPointI"
  | "cExpression"
  | "cValeursT"
  | "cPointsC"
  | "dPointB"
  | "dPointC"
  | "dCotes"
  | "eNombre"
  | "eDroites"
  | "fPerpendiculaire"
  | "fPied"
  | "fSymetrique"
  | "gPremier"
  | "gDeuxieme"
  | "gTroisieme"
  | "hSymetrique"
  | "hRayon";

export function phasesPourExercice(e: ExercicePointsDroitesRemarquablesTriangle): PhasePointsDroitesRemarquablesTriangle[] {
  switch (e.famille) {
    case "A":
      return ["aSommetA", "aSommetsBC"];
    case "B":
      return ["bLongueurs", "bPointI"];
    case "C":
      return ["cExpression", "cValeursT", "cPointsC"];
    case "D":
      return ["dPointB", "dPointC", "dCotes"];
    case "E":
      return e.position === "milieu" ? ["eNombre"] : ["eNombre", "eDroites"];
    case "F":
      return ["fPerpendiculaire", "fPied", "fSymetrique"];
    case "G":
      return ["gPremier", "gDeuxieme", "gTroisieme"];
    case "H":
      return ["hSymetrique", "hRayon"];
  }
}
