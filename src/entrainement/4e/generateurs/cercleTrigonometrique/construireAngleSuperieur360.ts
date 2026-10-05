import type { ExerciceCercleTrigonometrique } from "../../core/cercleTrigonometrique.types";
import { construireAngleReduitNonAxe, randomInt } from "./aleatoire";
import { construireDepuisAngleReduit } from "./construction";

/**
 * Variante 3 — "angle ≥ 360°" : angle supérieur ou égal à 360° (ex. 480°), à réduire dans
 * [0°,360°[. Même garantie que la variante négative : `angleReduit` jamais multiple de 90°, donc
 * `angleDepart` jamais un pur multiple de 360°.
 */
export function construireAngleSuperieur360(overrides?: { angleReduit?: number }): ExerciceCercleTrigonometrique {
  const angleReduit = overrides?.angleReduit ?? construireAngleReduitNonAxe();
  const k = randomInt(1, 2);
  const angleDepart = angleReduit + 360 * k;
  return construireDepuisAngleReduit("angle_superieur_360", angleDepart, angleReduit);
}
