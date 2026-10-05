import type { ExerciceCercleTrigonometrique, VarianteCercleTrigId } from "../../core/cercleTrigonometrique.types";
import { calculerAnglePremierQuadrant, calculerQuadrant, calculerSigneCos, calculerSigneSin, calculerSigneTan } from "./quadrantCalculs";

/** Les 4 angles axiaux possibles, valeur de `angleReduit` pour la variante "multiple de 90". */
export const ANGLES_AXE = [0, 90, 180, 270] as const;

/**
 * Construit l'exercice complet à partir de angleDepart/angleReduit déjà décidés par le constructeur
 * de variante — quadrant/anglePremierQuadrant/signes sont toujours dérivés de angleReduit ici,
 * jamais recalculés différemment côté vérification (voir core/cercleTrigonometrique.types.ts).
 */
export function construireDepuisAngleReduit(
  variante: VarianteCercleTrigId,
  angleDepart: number,
  angleReduit: number,
): ExerciceCercleTrigonometrique {
  const quadrant = calculerQuadrant(angleReduit);
  return {
    variante,
    angleDepart,
    angleReduit,
    quadrant,
    anglePremierQuadrant: calculerAnglePremierQuadrant(angleReduit, quadrant),
    signeSin: calculerSigneSin(angleReduit, quadrant),
    signeCos: calculerSigneCos(angleReduit, quadrant),
    signeTan: calculerSigneTan(quadrant),
  };
}
