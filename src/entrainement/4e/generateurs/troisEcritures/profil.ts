import type { ProfilInstance } from "../../../export/genererFeuilleExercices";
import type { ExerciceTroisEcritures } from "../../core/troisEcritures.types";

/**
 * Profil d'instance de gen126 pour le TIRAGE ÉQUILIBRÉ des évaluations (`.claude/rules/
 * feuilles-evaluations.md`, « Tirage équilibré »).
 * - La VARIANTE fixe l'écriture de départ ; `forme` = la variante seule.
 * - `depuisCanonique` : « deux zéros / aucun zéro » est le VERDICT de l'écran des zéros (tiré
 *   2/3 – 1/3 avant les nombres) — jamais un cas particulier, jamais dans `forme` (sinon la série B
 *   reproduirait le verdict de A). Aucun nom de variante ne donne ce verdict : pas de groupe à verdict.
 *   Niveau et durée sont CONSTANTS dans la variante (`criteresDifficulte`) : la feuille ne le trahit pas.
 * - Aucun cas particulier, pas de `calcul` (entiers, sans calculatrice).
 */
export function profilTroisEcritures(e: ExerciceTroisEcritures): ProfilInstance {
  return { casParticulier: null, forme: e.variante };
}
