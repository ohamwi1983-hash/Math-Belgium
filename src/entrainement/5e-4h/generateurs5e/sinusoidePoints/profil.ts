import type { ProfilInstance } from "../../../export/genererFeuilleExercices";
import type { ExerciceSinusoidePoints } from "../../moteur5e/modeleSinusoidePoints";

/**
 * Profil d'instance de 5gen52 (tirage équilibré) :
 * - `forme` = la variante, plus le signe de A pour « sansPi » (A < 0 inverse l'ordre des extremums :
 *   la série B garde la même difficulté) ;
 * - aucun cas particulier : φ n'est jamais nul (la courbe est toujours décalée), A et b toujours
 *   présents ; pas de verdict à décider ;
 * - pas de `calcul` : tout est exact.
 */
export function profilSinusoidePoints(e: ExerciceSinusoidePoints): ProfilInstance {
  return { casParticulier: null, forme: e.variante === "sansPi" ? `sansPi-${e.A > 0 ? "pos" : "neg"}` : e.variante };
}
