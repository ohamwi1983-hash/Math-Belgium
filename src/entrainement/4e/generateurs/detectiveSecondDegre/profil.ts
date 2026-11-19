import type { ProfilInstance } from "../../../export/genererFeuilleExercices";
import type { ExerciceDetectiveSecondDegre } from "../../core/detectiveSecondDegre.types";

/**
 * Profil d'instance de gen121 pour le TIRAGE ÉQUILIBRÉ des évaluations (`.claude/rules/
 * feuilles-evaluations.md`, « Tirage équilibré ») — même principe que gen112 et 5gen49.
 *
 * - La VARIANTE fixe l'exercice support (discriminant, facteur commun, équation sans solution,
 *   inéquation, équation rationnelle, inéquation rationnelle).
 * - La LIGNE FAUSSE et le TYPE D'ERREUR sont les verdicts des étapes a) et b) : tirés au hasard
 *   dans chaque série (équiprobables dans la variante, `index.ts`), JAMAIS dans `forme` — sinon la
 *   série B aurait la même erreur à la même ligne que la série A. Les contraintes sur les données
 *   sont communes aux deux types d'une variante : aucun détail des nombres ne trahit le verdict.
 * - `forme` = la variante seule (même support, même nombre de lignes, même démarche) : probabilité 1
 *   dans sa variante.
 * - Aucun cas particulier : chaque copie demande la même démarche (trouver, nommer, corriger).
 * - Pas de `calcul` : toutes les instances sont exactes (entiers, fractions), sans calculatrice.
 */
export function profilDetectiveSecondDegre(e: ExerciceDetectiveSecondDegre): ProfilInstance {
  return { casParticulier: null, forme: e.variante };
}
