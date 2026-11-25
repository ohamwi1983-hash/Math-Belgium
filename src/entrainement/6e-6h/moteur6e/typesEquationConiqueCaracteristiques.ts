import type { ExerciceEquationConiqueCaracteristiques } from "../core6e/equationConiqueCaracteristiques.types";

/** Écrans de `6gen59` (audit du 6e ch. 10, lots B et C) : un choix fermé est SEUL sur son écran. */
export type PhaseEquationConiqueCaracteristiques =
  | "mNature"
  | "mValeurs"
  | "pAxe"
  | "pValeurs"
  | "sValeurs"
  | "bOuverture"
  | "bP"
  | "cValeurs"
  | "cNature"
  | "cEquation"
  | "dValeurs"
  | "equation";

export function phasesPourExercice(e: ExerciceEquationConiqueCaracteristiques): PhaseEquationConiqueCaracteristiques[] {
  switch (e.famille) {
    case "A":
      if (e.sousType === "memeAxe") return ["mNature", "mValeurs", "equation"];
      if (e.sousType === "axesPerpendiculaires") return ["pAxe", "pValeurs", "equation"];
      return ["sValeurs", "equation"];
    case "B":
      return ["bOuverture", "bP", "equation"];
    case "C":
      return ["cValeurs", "cNature", "cEquation"];
    case "D":
      return ["dValeurs", "equation"];
  }
}
