import type { ProfilInstance } from "../../../export/genererFeuilleExercices";
import type { ExerciceEquationParametre } from "../../core/equationParametre.types";

/**
 * Profil d'instance de gen115 pour le TIRAGE ÉQUILIBRÉ des évaluations.
 * - La VARIANTE fixe la famille (b = m, b et c affines, a = m).
 * - `forme` ajoute le signe du coefficient de m² dans Δ(m) (« deux solutions » à l'extérieur ou
 *   entre m₁ et m₂) : il change la lecture du signe, pas la réponse à deviner. Seule la famille
 *   a = m peut avoir un coefficient négatif (mesures dans le rapport du commit).
 * - Aucun cas particulier ; pas de `calcul` (racines entières, tout est exact).
 */
export function profilEquationParametre(e: ExerciceEquationParametre): ProfilInstance {
  return { casParticulier: null, forme: `${e.variante}:${e.delta[0] > 0 ? "exterieur" : "interieur"}` };
}
