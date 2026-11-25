import type { ExerciceIntersectionsConiques } from "../core6e/intersectionsConiques.types";

/** Écrans de `6gen61` (audit du 6e ch. 10, lots B et C). */
export type PhaseIntersectionsConiques = "aConique" | "aDroite" | "aEquationX" | "aNombre" | "aPoints" | "bCouple" | "bCercle" | "bCentreRayon";

export function phasesPourExercice(e: ExerciceIntersectionsConiques): PhaseIntersectionsConiques[] {
  if (e.famille === "B") return ["bCouple", "bCercle", "bCentreRayon"];
  return e.verdict === 0 ? ["aConique", "aDroite", "aEquationX", "aNombre"] : ["aConique", "aDroite", "aEquationX", "aNombre", "aPoints"];
}

/** Cinq puces tant que le nombre de points communs n'est pas jugé (le nombre d'écrans le trahirait). */
export function pucesMasquees6gen61(e: ExerciceIntersectionsConiques): { nombre: number; jusqua: number } | null {
  return e.famille === "A" ? { nombre: 5, jusqua: 3 } : null;
}
