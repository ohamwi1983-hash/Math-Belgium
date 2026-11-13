import type { ProfilInstance } from "../../../export/genererFeuilleExercices";
import type { ExerciceViserCible } from "../../core/viserCible.types";

/**
 * Profil d'instance de gen89 pour le TIRAGE ÉQUILIBRÉ des évaluations (`.claude/rules/
 * feuilles-evaluations.md`, « Tirage équilibré »).
 *
 * - `forme` = situation + sens (directe / inverse), ex. « billard:directe » : la série A fixe le
 *   contexte et le type de question, les autres séries le reproduisent avec d'autres nombres. Le
 *   sens est déjà fixé par la variante ; la situation est tirée au hasard (1 chance sur 4).
 *   Mesure (5 000 tirages par variante, `scratchpad/gen89/sim89.mts`) : chaque forme sort avec une
 *   fréquence d'environ 1/4 — des milliers de correspondances attendues en 20 000 essais, aucune
 *   bride nécessaire.
 * - L'ISSUE (touche / passe à côté / bonne droite mais mauvais sens ; m convient / aucune valeur)
 *   est le VERDICT de l'exercice : jamais dans `forme`, jamais un cas particulier — elle reste tirée
 *   au hasard dans chaque série, issues équiprobables (sinon la réponse deviendrait prévisible).
 * - Aucun cas particulier : rien ne raccourcit la résolution (u⃗ n'a jamais de composante nulle, la
 *   cible n'est jamais au bout de la flèche, AC⃗ n'a jamais de composante nulle).
 * - `calcul` absent : coordonnées entières, tout se fait sans calculatrice.
 */
export function formeViserCible(e: ExerciceViserCible): string {
  return `${e.situation}:${e.sens}`;
}

export function profilViserCible(e: ExerciceViserCible): ProfilInstance {
  return { casParticulier: null, forme: formeViserCible(e) };
}
