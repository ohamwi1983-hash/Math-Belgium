import type { ExerciceProprietesOptiquesConiques } from "../../core6e/proprietesOptiquesConiques.types";
import { construireExercice } from "./familleUnique";

export { construireExercice } from "./familleUnique";
export type { OverridesFamilleUnique } from "./familleUnique";

/**
 * Couche A (6e) — point d'entrée `6gen63` ("Propriétés optiques des coniques"). Une seule famille
 * (voir `familleUnique.ts`) — le catalogue de variantes couvre les 2 natures de conique ET les 2
 * signes de la pente auxiliaire (`signeT`, voir en-tête `familleUnique.ts`) pour exercer les 2
 * orientations possibles du rayon incident (piège directionnel de l'écran 3, différent selon le
 * quadrant), mirroir `identificationConiques/index.ts` (6gen58).
 */

export type IdVarianteProprietesOptiquesConiques = "ellipse_pentePositive" | "ellipse_penteNegative" | "hyperbole_pentePositive" | "hyperbole_penteNegative";

export const CATALOGUE_VARIANTES: { id: IdVarianteProprietesOptiquesConiques; label: string }[] = [
  { id: "ellipse_pentePositive", label: "Ellipse — pente auxiliaire positive" },
  { id: "ellipse_penteNegative", label: "Ellipse — pente auxiliaire négative" },
  { id: "hyperbole_pentePositive", label: "Hyperbole — pente auxiliaire positive" },
  { id: "hyperbole_penteNegative", label: "Hyperbole — pente auxiliaire négative" },
];

export function construireAvecVarianteId(id: IdVarianteProprietesOptiquesConiques): ExerciceProprietesOptiquesConiques {
  switch (id) {
    case "ellipse_pentePositive":
      return construireExercice({ natureConique: "ellipse", signeT: 1 });
    case "ellipse_penteNegative":
      return construireExercice({ natureConique: "ellipse", signeT: -1 });
    case "hyperbole_pentePositive":
      return construireExercice({ natureConique: "hyperbole", signeT: 1 });
    case "hyperbole_penteNegative":
      return construireExercice({ natureConique: "hyperbole", signeT: -1 });
  }
}

export function genererExerciceProprietesOptiquesConiques(): ExerciceProprietesOptiquesConiques {
  return construireExercice();
}
