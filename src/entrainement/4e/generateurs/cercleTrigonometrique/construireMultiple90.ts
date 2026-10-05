import type { ExerciceCercleTrigonometrique } from "../../core/cercleTrigonometrique.types";
import { randomInt } from "./aleatoire";
import { ANGLES_AXE, construireDepuisAngleReduit } from "./construction";

/**
 * Variante 3 — "multiple de 90°" : 0°, 90°, 180° ou 270°, uniformément. Traite aussi le cas
 * négatif/≥360° équivalent (ex. -90° → 270°). Un décalage est désormais TOUJOURS appliqué, y
 * compris pour angleReduit=0 (promptcorrectionsgenerateur14aides.md, section 5 : chaque exercice
 * doit toujours nécessiter une réduction) — ce cas produit alors un angleDepart pur multiple de
 * 360° (ex. -360°, 720°), ce qui était auparavant explicitement évité (réduction jugée triviale) ;
 * cette exclusion n'a plus lieu d'être puisque la réduction elle-même reste un vrai travail pour
 * l'élève (rien dans l'énoncé ne révèle que l'angle réduit vaut justement 0°).
 */
export function construireMultiple90(overrides?: { angleReduit?: number }): ExerciceCercleTrigonometrique {
  const angleReduit = overrides?.angleReduit ?? ANGLES_AXE[randomInt(0, ANGLES_AXE.length - 1)];

  const modeDecalage = randomInt(1, 2); // 1 = négatif, 2 = ≥360°
  const k = randomInt(1, 2);
  const angleDepart = modeDecalage === 1 ? angleReduit - 360 * k : angleReduit + 360 * k;

  return construireDepuisAngleReduit("multiple_90", angleDepart, angleReduit);
}
