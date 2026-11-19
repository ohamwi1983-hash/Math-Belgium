import type { ProfilInstance } from "../../../export/genererFeuilleExercices";
import type { ExerciceMethodeNombreSolutions } from "../../core/methodeNombreSolutions.types";

/**
 * Profil d'instance de gen113 (tirage équilibré des évaluations, `.claude/rules/feuilles-evaluations.md`).
 *
 * - `forme` = la variante (équation incomplète ou complète) : même allure dans toutes les séries.
 * - La MÉTHODE est le verdict de l'étape a) (et elle décide du nombre de solutions de b)) : tirée au
 *   hasard dans chaque série, équiprobable parmi les trois de la variante — JAMAIS dans `forme`,
 *   sinon la série B aurait la même méthode que la série A, question par question.
 * - Aucun cas particulier (« aucune solution » est un verdict, pas un raccourci de rédaction) ;
 *   pas de `calcul` (coefficients entiers, solutions exactes).
 */
export function profilMethodeNombreSolutions(e: ExerciceMethodeNombreSolutions): ProfilInstance {
  return { casParticulier: null, forme: e.variante };
}
