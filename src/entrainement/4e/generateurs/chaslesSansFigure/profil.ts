import type { ProfilInstance } from "../../../export/genererFeuilleExercices";
import type { ExerciceChaslesSansFigure } from "../../core/chaslesSansFigure.types";

/**
 * Profil d'instance de gen130 (tirage équilibré).
 * - `forme` = signature de difficulté : réduire = nombre de vecteurs | nombre de vecteurs retournés ;
 *   simplifier = un des deux termes de même coefficient écrit retourné ? | dernier terme retourné ? ;
 *   démontrer et insérer = la sous-forme (échange / différence ; milieu / point).
 * - Le RÉSULTAT (vecteur nul ou non, coefficient final) est la réponse : tiré dans chaque série,
 *   jamais dans `forme`, jamais un cas particulier.
 * - Aucun cas particulier (rien ne raccourcit la résolution), pas de `calcul` : tout est exact.
 */
export function profilChasles(e: ExerciceChaslesSansFigure): ProfilInstance {
  if (e.variante === "reduire") return { casParticulier: null, forme: `reduire|${e.termes.length}|${e.nbRetournes}` };
  if (e.variante === "coefficients") return { casParticulier: null, forme: `coefficients|${e.retourneK ? 1 : 0}${e.retourneC ? 1 : 0}` };
  return { casParticulier: null, forme: `${e.variante}|${e.sousForme}` };
}
