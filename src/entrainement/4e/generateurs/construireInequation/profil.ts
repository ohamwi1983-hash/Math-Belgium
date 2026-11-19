import type { ProfilInstance } from "../../../export/genererFeuilleExercices";
import type { ExerciceConstruireInequation } from "../../core/construireInequation.types";

/**
 * Profil d'instance de gen120 pour le TIRAGE ÉQUILIBRÉ des évaluations.
 * - La VARIANTE fixe la nature (inéquation / équation).
 * - `forme` = signature de difficulté, tirée AVANT les nombres à poids égaux : allure de S
 *   (intérieur / extérieur, ou deux entiers / une fraction parmi les solutions) et signe du
 *   coefficient imposé à l'étape 2 (négatif = sens du symbole à retourner) — 4 formes par variante,
 *   25 % chacune.
 * - Aucun cas particulier ; pas de `calcul` (tout est exact, sans calculatrice).
 */
export function profilConstruireInequation(e: ExerciceConstruireInequation): ProfilInstance {
  return { casParticulier: null, forme: `${e.variante}:${e.allure}:${e.aImpose < 0 ? "a-negatif" : "a-positif"}` };
}
