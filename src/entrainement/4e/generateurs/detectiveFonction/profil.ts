import type { ProfilInstance } from "../../../export/genererFeuilleExercices";
import type { ExerciceDetectiveFonction } from "../../core/detectiveFonction.types";

/**
 * Profil d'instance de gen127 pour le TIRAGE ÉQUILIBRÉ des évaluations — même principe que gen121.
 * - La VARIANTE fixe l'exercice support (sommet, forme canonique, image, optimum sur un intervalle).
 * - La LIGNE FAUSSE et le TYPE D'ERREUR sont les verdicts des étapes a) et b) : tirés au hasard dans
 *   chaque série (équiprobables dans la variante), JAMAIS dans `forme` — sinon la série B aurait la
 *   même erreur à la même ligne que la série A. Aucun nom de variante ne donne le type d'erreur :
 *   pas de groupe à verdict.
 * - `forme` = la variante seule ; aucun cas particulier ; pas de `calcul` (tout est entier).
 */
export function profilDetectiveFonction(e: ExerciceDetectiveFonction): ProfilInstance {
  return { casParticulier: null, forme: e.variante };
}
