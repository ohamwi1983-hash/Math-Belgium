import type { ProfilInstance } from "../../../export/genererFeuilleExercices";
import type { ExerciceCercleConditions } from "../../core/cercleConditions.types";

/**
 * Profil d'instance de gen93 (tirage équilibré des évaluations). `forme` = la variante (fiche validée) ;
 * aucun verdict (le cercle existe toujours), aucun cas particulier (une médiatrice parallèle à un axe ne
 * raccourcit qu'un écran : laissée au hasard ; deux médiatrices parallèles aux axes sont exclues par le
 * générateur), pas de `calcul` (centre et r² entiers, rayon exact).
 */
export function profilCercleConditions(e: ExerciceCercleConditions): ProfilInstance {
  return { casParticulier: null, forme: e.variante };
}
