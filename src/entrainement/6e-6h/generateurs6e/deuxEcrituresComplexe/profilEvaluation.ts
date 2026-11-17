import type { ProfilInstance } from "../../../export/genererFeuilleExercices";
import type { ExerciceDeuxEcritures } from "../../core6e/deuxEcrituresComplexe";

/**
 * Profil de tirage équilibré de `6gen94` « Valeurs exactes par deux écritures d'un même complexe »
 * (`.claude/rules/feuilles-evaluations.md`, « Tirage équilibré des évaluations »).
 *
 * - `forme` = type (fiche validée) : `produit` ou `quotient` — la variante elle-même. La série A
 *   fixe le type ; les autres séries le reprennent avec d'autres facteurs (192 énoncés distincts
 *   par type, l'angle visé varie parmi ±π/12, ±5π/12, ±7π/12, ±11π/12). Ni l'angle visé ni l'ordre
 *   des facteurs n'entrent dans la forme : la démarche est la même.
 * - Aucun cas particulier : toutes les instances demandent les quatre étapes complètes (aucune ne
 *   raccourcit la résolution).
 * - Toutes les valeurs sont exactes (angles remarquables, racines) : pas de `calcul`.
 */
export function profilDeuxEcritures(e: ExerciceDeuxEcritures): ProfilInstance {
  return { casParticulier: null, forme: e.variante };
}
