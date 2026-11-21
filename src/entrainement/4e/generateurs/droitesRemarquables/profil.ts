import type { ProfilInstance } from "../../../export/genererFeuilleExercices";
import type { ExerciceDroitesRemarquables } from "../../core/droitesRemarquables.types";

/**
 * Profil d'instance de gen94 (tirage équilibré des évaluations). `forme` = la variante (fiche validée) ;
 * aucun verdict, aucun cas particulier (une droite parallèle à un axe n'allège qu'un écran : laissée au
 * hasard, bridée par le générateur), pas de `calcul` (points de concours entiers, longueurs exactes).
 */
export function profilDroitesRemarquables(e: ExerciceDroitesRemarquables): ProfilInstance {
  return { casParticulier: null, forme: e.variante };
}
