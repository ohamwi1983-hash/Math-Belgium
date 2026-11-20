import type { ProfilInstance } from "../../../export/genererFeuilleExercices";
import type { ExerciceLectureParabole } from "../../core/lectureParabole.types";

/**
 * Profil d'instance de gen123 (tirage équilibré, `.claude/rules/feuilles-evaluations.md`).
 * - La VARIANTE (deux zéros, un zéro, aucun zéro) est la réponse de l'écran « zéros » : un verdict,
 *   regroupé dans `groupe_zeros` (panneau d'évaluation) ; `construirePlan` distribue les membres
 *   d'une série à l'autre. `forme` = la variante réelle (c'est elle que le plan porte).
 * - Les signes de a, b et c sont des issues de la lecture, tirées au hasard (jamais dans le profil).
 * - Aucun cas particulier (b = 0 ou c = 0 ne raccourcissent rien), pas de `calcul` (tout est entier).
 */
export function profilLectureParabole(e: ExerciceLectureParabole): ProfilInstance {
  return { casParticulier: null, forme: e.variante };
}
