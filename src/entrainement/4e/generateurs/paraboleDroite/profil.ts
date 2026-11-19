import type { ProfilInstance } from "../../../export/genererFeuilleExercices";
import type { ExerciceParaboleDroite } from "../../core/paraboleDroite.types";

/**
 * Profil d'instance de gen118 pour le TIRAGE ÉQUILIBRÉ des évaluations.
 * - La VARIANTE fixe le type de droite (oblique, horizontale) ; `forme` = la variante (même
 *   démarche dans toutes les instances).
 * - Le nombre de points communs (2, 1 ou 0) est un VERDICT (ce que l'élève doit découvrir) : jamais
 *   dans le profil, il reste tiré au hasard dans chaque série (70 / 15 / 15 %).
 * - Aucun cas particulier ; pas de `calcul` (racines et coordonnées entières).
 */
export function profilParaboleDroite(e: ExerciceParaboleDroite): ProfilInstance {
  return { casParticulier: null, forme: e.variante };
}
