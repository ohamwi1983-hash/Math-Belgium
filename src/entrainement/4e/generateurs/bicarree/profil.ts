import type { ProfilInstance } from "../../../export/genererFeuilleExercices";
import type { ExerciceBicarree } from "../../core/bicarree.types";

/**
 * Profil d'instance de gen116 pour le TIRAGE ÉQUILIBRÉ des évaluations.
 * - La VARIANTE fixe la forme de (E) (bicarrée, changement u = x² + k) ; `forme` = la variante.
 * - Le nombre de valeurs de t gardées (2, 1, 0) est un VERDICT : jamais dans le profil, il reste
 *   tiré au hasard dans chaque série (50 / 40 / 10 %). Les racines √n non entières ne sont pas non
 *   plus dans le profil : elles n'existent que si une valeur est gardée (les y mettre trahirait le
 *   verdict « aucune solution »).
 * - Aucun cas particulier ; pas de `calcul` (tout est exact).
 */
export function profilBicarree(e: ExerciceBicarree): ProfilInstance {
  return { casParticulier: null, forme: e.variante };
}
