import type { ProfilInstance } from "../../../export/genererFeuilleExercices";
import type { ExerciceEquationParabolePoints } from "../../core/equationParabolePoints.types";

/**
 * Profil d'instance de gen125 (tirage équilibré, `.claude/rules/feuilles-evaluations.md`).
 * - `forme` = la variante (sommet, zéros, graphique, trois points) : même démarche dans toutes les
 *   séries d'une question.
 * - Variante « graphique » : ce qui se lit (sommet ou zéros) est la décision de l'écran 1, tirée
 *   50/50 dans chaque série — jamais dans `forme` (la série B aurait sinon la même forme de départ).
 * - Aucun cas particulier (a = 1 n'est jamais tiré), pas de `calcul` (tout est exact).
 * - Pas de groupe à verdict : la forme de départ découle des données imprimées.
 */
export function profilEquationParabole(e: ExerciceEquationParabolePoints): ProfilInstance {
  return { casParticulier: null, forme: e.variante };
}
