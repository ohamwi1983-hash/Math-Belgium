import type { ProfilInstance } from "../../../export/genererFeuilleExercices";
import type { ExerciceIntersectionCercles } from "../../core/intersectionCercles.types";

/**
 * Profil d'instance de gen98 (tirage équilibré).
 * - `forme` = la variante (cercle-cercle / cercle-parabole) : même démarche dans toutes les séries.
 * - Le NOMBRE de points communs (0, 1 ou 2) est le verdict : tiré au hasard dans chaque série (1/3
 *   chacun, avant la boucle de rejet), jamais dans `forme`, jamais un cas particulier ; aucun nom de
 *   variante ne le donne (pas de groupe à verdict). Niveau et durée constants dans les trois issues.
 * - L'axe de la parabole (vertical / horizontal) reste tiré au hasard (même démarche).
 * - Pas de `calcul` : tout est entier.
 */
export function profilIntersectionCercles(e: ExerciceIntersectionCercles): ProfilInstance {
  return { casParticulier: null, forme: e.variante };
}
