import type { ExerciceCercleTrigonometrique } from "../../core/cercleTrigonometrique.types";
import { construireAngleReduitNonAxe, randomInt } from "./aleatoire";
import { construireDepuisAngleReduit } from "./construction";

/**
 * Variante 2 — "angle négatif" : angle strictement négatif (ex. -120°), à réduire dans [0°,360°[.
 * `angleReduit` n'est jamais un multiple de 90° (construireAngleReduitNonAxe), donc `angleDepart`
 * n'est jamais un pur multiple de 360° — jamais de réduction triviale à 0° sans intérêt
 * pédagogique (ex. -360°, explicitement exclu par la spec).
 */
export function construireAngleNegatif(overrides?: { angleReduit?: number }): ExerciceCercleTrigonometrique {
  const angleReduit = overrides?.angleReduit ?? construireAngleReduitNonAxe();
  const k = randomInt(1, 2);
  const angleDepart = angleReduit - 360 * k;
  return construireDepuisAngleReduit("angle_negatif", angleDepart, angleReduit);
}
