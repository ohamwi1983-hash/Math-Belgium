import type { ProfilInstance } from "../../../export/genererFeuilleExercices";
import type { ExerciceTrajectoires } from "../../core/trajectoiresRencontre.types";

/**
 * Profil d'instance de gen97 (tirage équilibré, `.claude/rules/feuilles-evaluations.md`).
 * - Variante = contexte (bateaux, drones, joueurs) : même démarche dans toutes les séries.
 * - Le VERDICT (collision / croisement sans rencontre / parallèles) est la réponse : tiré au hasard
 *   dans chaque série (1/3 chacun, avant toute boucle de rejet), jamais dans `forme`, jamais un cas
 *   particulier. Aucun nom de variante ne le donne : pas de groupe à verdict. Niveau et durée
 *   CONSTANTS dans les trois verdicts (exportEvaluation).
 * - `forme` = la variante ; pas de `calcul` (tout est entier).
 */
export function profilTrajectoires(e: ExerciceTrajectoires): ProfilInstance {
  return { casParticulier: null, forme: e.contexte };
}
