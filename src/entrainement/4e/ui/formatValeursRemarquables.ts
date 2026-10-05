import type { AngleRemarquable } from "../core/valeursRemarquables.types";
import { formatEnonceCercleTrigLatex } from "./formatCercleTrigonometrique";

/** Bloc "énoncé" fixe — réutilise directement `formatEnonceCercleTrigLatex` (premier générateur du
 * chapitre, déjà générique sur un angle en degrés) plutôt que de le réécrire. */
export { formatEnonceCercleTrigLatex };

const LIBELLES_ANGLE_REMARQUABLE: Record<AngleRemarquable, string> = {
  0: "0°",
  30: "30°",
  45: "45°",
  60: "60°",
  90: "90°",
};

export function libelleAngleRemarquable(angle: AngleRemarquable): string {
  return LIBELLES_ANGLE_REMARQUABLE[angle];
}
