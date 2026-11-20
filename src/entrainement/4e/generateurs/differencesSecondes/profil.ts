import type { ProfilInstance } from "../../../export/genererFeuilleExercices";
import type { ExerciceDifferences } from "../../core/differencesSecondes.types";

/**
 * Profil d'instance de gen124 (tirage équilibré, `.claude/rules/feuilles-evaluations.md`).
 * - La VARIANTE est le verdict (premier degré, second degré à a entier ou demi-entier, ni l'un ni
 *   l'autre) : groupe `groupe_degre` dans le panneau d'évaluation, `construirePlan` distribue les
 *   membres d'une série à l'autre. « Ni l'un ni l'autre » (plus court : pas d'écran 4) est un
 *   VERDICT, jamais un cas particulier (décision de l'utilisateur : choisir « lequel » = verdict).
 * - `forme` = la variante réelle portée par le plan.
 * - Aucun cas particulier, pas de `calcul` (valeurs entières, a au pire demi-entier).
 */
export function profilDifferences(e: ExerciceDifferences): ProfilInstance {
  return { casParticulier: null, forme: e.variante };
}
