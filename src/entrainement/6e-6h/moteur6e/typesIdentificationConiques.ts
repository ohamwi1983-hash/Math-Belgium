import type { ExerciceIdentificationConiques } from "../core6e/identificationConiques.types";

/**
 * Écrans de `6gen58` (audit du 6e ch. 10, lots B et C). La nature est un choix fermé (une tentative) ;
 * le nombre d'écrans qui suivent dépend de la nature, donc il est MASQUÉ (puces fixes) tant que
 * l'écran « nature » n'est pas jugé.
 */
export type PhaseIdentificationConiques =
  | "a1Nature"
  | "a1Rayon"
  | "a1Point"
  | "a1Droites"
  | "a1DemiAxes"
  | "a1Foyers"
  | "a2Nature"
  | "a2P"
  | "a2FoyerDirectrice"
  | "a2Droites"
  | "bForme"
  | "bNature"
  | "bCentreRayon"
  | "bPoint"
  | "bDroites"
  | "bCentreDemiAxes"
  | "bFoyers"
  | "cCarre"
  | "cForme"
  | "cNature"
  | "cElements";

export function phasesPourExercice(e: ExerciceIdentificationConiques): PhaseIdentificationConiques[] {
  switch (e.famille) {
    case "A1":
      switch (e.nature) {
        case "vide":
          return ["a1Nature"];
        case "point":
          return ["a1Nature", "a1Point"];
        case "droitesSecantes":
          return ["a1Nature", "a1Droites"];
        case "cercle":
          return ["a1Nature", "a1Rayon"];
        default:
          return ["a1Nature", "a1DemiAxes", "a1Foyers"];
      }
    case "A2":
      return e.nature === "parabole" ? ["a2Nature", "a2P", "a2FoyerDirectrice"] : ["a2Nature", "a2Droites"];
    case "B":
      switch (e.nature) {
        case "vide":
          return ["bForme", "bNature"];
        case "point":
          return ["bForme", "bNature", "bPoint"];
        case "droitesSecantes":
          return ["bForme", "bNature", "bDroites"];
        case "cercle":
          return ["bForme", "bNature", "bCentreRayon"];
        default:
          return ["bForme", "bNature", "bCentreDemiAxes", "bFoyers"];
      }
    case "C":
      return ["cCarre", "cForme", "cNature", "cElements"];
  }
}

/** Puces montrées tant que l'écran « nature » n'est pas jugé (le nombre réel trahirait la nature). */
export function pucesMasquees6gen58(e: ExerciceIdentificationConiques): { nombre: number; jusqua: number } | null {
  if (e.famille === "A1" || e.famille === "A2") return { nombre: 3, jusqua: 0 };
  if (e.famille === "B") return { nombre: 4, jusqua: 1 };
  return null;
}
