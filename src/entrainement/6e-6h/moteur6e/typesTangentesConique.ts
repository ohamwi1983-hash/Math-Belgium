import type { ExerciceTangentesConique } from "../core6e/tangentesConique.types";

/** Écrans de `6gen62` (audit du 6e ch. 10, lots B et C). */
export type PhaseTangentesConique = "aPente" | "aTangente" | "bEquationK" | "bNombre" | "bTangentes" | "cEquationM" | "cNombre" | "cTangentes" | "dValeurs" | "dEquation" | "eContacts" | "eProche";

export function phasesPourExercice(e: ExerciceTangentesConique): PhaseTangentesConique[] {
  switch (e.famille) {
    case "A":
      return ["aPente", "aTangente"];
    case "B":
      return e.verdict === 2 ? ["bEquationK", "bNombre", "bTangentes"] : ["bEquationK", "bNombre"];
    case "C":
      return e.verdict === 2 ? ["cEquationM", "cNombre", "cTangentes"] : ["cEquationM", "cNombre"];
    case "D":
      return ["dValeurs", "dEquation"];
    case "E":
      return ["eContacts", "eProche"];
  }
}

/** Trois puces tant que le nombre de tangentes n'est pas jugé (B, C). */
export function pucesMasquees6gen62(e: ExerciceTangentesConique): { nombre: number; jusqua: number } | null {
  return e.famille === "B" || e.famille === "C" ? { nombre: 3, jusqua: 1 } : null;
}
