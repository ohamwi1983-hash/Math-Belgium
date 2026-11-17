import type { ProfilInstance } from "../../../export/genererFeuilleExercices";
import type { ExerciceDetectiveComplexes } from "../../core6e/detectiveComplexes.types";

/**
 * Profil d'instance de 6gen99 pour le TIRAGE ÉQUILIBRÉ des évaluations (`.claude/rules/
 * feuilles-evaluations.md`, « Tirage équilibré », et fiche validée par l'utilisateur) — même
 * principe que 5gen49.
 *
 * - La VARIANTE fixe l'exercice support (forme trigonométrique, quotient, puissance, Moivre,
 *   racines n-ièmes, module d'une somme, « démonstration » de n = −n). Pour cette dernière, le
 *   type d'erreur est toujours le même (√(ab) = √a·√b appliquée à deux négatifs) mais la POSITION
 *   de la ligne fausse (2, 3 ou 4) est tirée dans chaque série : la réponse a) n'est pas recopiable.
 * - La LIGNE FAUSSE et le TYPE D'ERREUR sont les verdicts des étapes a) et b) : tirés au hasard
 *   dans chaque série (équiprobables dans la variante, `index.ts`), JAMAIS dans `forme` — sinon la
 *   série B aurait la même erreur à la même ligne que la série A (réponse recopiable).
 * - `forme` = la variante seule (même support, même nombre de lignes de copie, même démarche).
 *   Probabilité 1 dans sa variante : 20 000 essais suffisent largement.
 * - Aucun cas particulier : chaque copie demande la même démarche (trouver, nommer, corriger).
 * - Pas de `calcul` : toutes les instances sont exactes (entiers, fractions, √3, √2, angles kπ/q),
 *   faisables sans calculatrice — et le mode de calcul ne peut donc pas trahir le verdict.
 */
export function profilDetectiveComplexes(e: ExerciceDetectiveComplexes): ProfilInstance {
  return { casParticulier: null, forme: e.variante };
}
