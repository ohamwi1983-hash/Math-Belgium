import type { ProfilInstance } from "../../../export/genererFeuilleExercices";
import type { ExerciceLectureCercle } from "../../core/lectureCercle.types";
import { position } from "../../moteur/modeleLectureCercle";
import { LIBELLE_CAS_QUADRANT_I } from "../profilsEvaluation4eCh5";

/**
 * Profil d'instance de gen122 (tirage équilibré, `.claude/rules/feuilles-evaluations.md`).
 *
 * - Cas particulier = M dans le quadrant I (17,5 % des tirages) : aucun signe à chercher, θ est
 *   l'angle du premier quadrant — la lecture se raccourcit (même case que gen14 et gen15).
 * - Les angles sur un axe ne sont PAS un cas particulier : « tan θ n'est pas définie » (90°, 270°)
 *   est un verdict de l'écran 3, et le filtrer rendrait la réponse « définie » toujours vraie. Un
 *   tirage d'évaluation par défaut (quadrant I exclu) donne donc ≈ 24 % de « n'est pas définie ».
 * - Pas de `calcul` : tout est exact (même choix que gen14–gen18 et gen76 ; `calcul: 'exacte'`
 *   exclurait gen122 des évaluations avec calculatrice).
 */
export function profilLectureCercle(e: ExerciceLectureCercle): ProfilInstance {
  return { casParticulier: position(e) === "I" ? "quadrant-I" : null };
}

export const LIBELLE_CAS_LECTURE_CERCLE = LIBELLE_CAS_QUADRANT_I;
