import type { ProfilInstance } from "../../../export/genererFeuilleExercices";
import type { ExerciceLectureInequation } from "../../core/lectureInequationGraphique.types";

/**
 * Profil d'instance de gen117 (tirage équilibré, `.claude/rules/feuilles-evaluations.md`).
 *
 * - `forme` = la variante (axe des x, droite horizontale, droite oblique).
 * - Le NOMBRE de points communs (2, contact, aucun) et le SYMBOLE sont des issues de la lecture : tirés
 *   au hasard dans chaque série, jamais dans `forme` (la série B aurait sinon les mêmes crochets et la
 *   même allure de S que la série A). « Aucun point commun » n'est pas un cas particulier : décider
 *   que S = ℝ ou ∅ fait partie de la lecture.
 * - Pas de `calcul` : lecture de valeurs entières sur la grille.
 */
export function profilLectureInequation(e: ExerciceLectureInequation): ProfilInstance {
  return { casParticulier: null, forme: e.variante };
}
