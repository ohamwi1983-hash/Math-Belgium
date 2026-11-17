import type { ProfilInstance } from "../../../export/genererFeuilleExercices";
import type { ExerciceOmbreLampe } from "../../core/ombreLampe.types";

/**
 * Profil d'instance de gen106 pour le TIRAGE ÉQUILIBRÉ des évaluations (`.claude/rules/
 * feuilles-evaluations.md`, « Tirage équilibré »).
 *
 * - `forme` = la variante seule (poteau, cube/pavé, mur, retrouver la lampe) : chaque variante a sa
 *   propre construction, de longueur fixe (deux étapes). Ce que l'élève doit DÉCIDER — la position
 *   des ombres, du point M, de la lampe — et ce qui varie sans changer la charge (cube ou pavé,
 *   sommets à projeter, côté de la lampe) n'entre jamais dans `forme`.
 * - Aucun cas particulier : aucune instance ne raccourcit la construction (la lampe est toujours plus
 *   haute que les objets, l'ombre atteint toujours le mur dans la variante `mur`).
 * - Pas de `calcul` : aucun calcul numérique (construction sur la figure).
 */
export function profilOmbreLampe(e: ExerciceOmbreLampe): ProfilInstance {
  return { casParticulier: null, forme: e.variante };
}
