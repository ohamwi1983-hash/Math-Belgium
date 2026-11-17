import type { ProfilInstance } from "../../../export/genererFeuilleExercices";
import type { ExerciceDetectiveEspace } from "../../core/detectiveEspace.types";

/**
 * Profil d'instance de gen107 pour le TIRAGE ÉQUILIBRÉ des évaluations (`.claude/rules/
 * feuilles-evaluations.md`, « Tirage équilibré ») — même principe que 6gen99.
 *
 * - `forme` = le THÈME seul (= la variante) : même genre de copie, même nombre de lignes, même
 *   démarche ; probabilité 1 dans sa variante, 20 000 essais suffisent largement.
 * - La LIGNE FAUSSE et le TYPE D'ERREUR sont les verdicts des étapes a) et b) : tirés au hasard dans
 *   chaque série (équiprobables dans le thème, `index.ts`), JAMAIS dans `forme` — sinon la série B
 *   aurait la même erreur à la même ligne que la série A.
 * - Aucun cas particulier : chaque copie demande la même démarche (trouver, expliquer, corriger).
 * - Pas de `calcul` : aucune instance ne demande la calculatrice (aucune coordonnée ; des demis au
 *   plus, en perspective cavalière).
 */
export function profilDetectiveEspace(e: ExerciceDetectiveEspace): ProfilInstance {
  return { casParticulier: null, forme: e.theme };
}
