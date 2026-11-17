import type { ProfilInstance } from "../../../export/genererFeuilleExercices";
import type { ExerciceDemontrerParallelisme } from "../../core/demontrerParallelisme.types";

/**
 * Profil d'instance de gen103 pour le TIRAGE ÉQUILIBRÉ des évaluations (`.claude/rules/
 * feuilles-evaluations.md`, « Tirage équilibré »).
 *
 * - `forme` = la variante seule (droite parallèle à un plan / deux plans parallèles) : elle fixe le
 *   nombre d'étapes (critère + témoin + 1 justification, ou critère + 2 parallélismes + 2
 *   justifications). Ce que l'élève doit DÉCIDER — le critère, la ou les droites témoins, le type de
 *   justification (côtés opposés d'un parallélogramme, droite des milieux, milieux de deux côtés
 *   opposés) — n'entre JAMAIS dans `forme` : il reste tiré au hasard dans chaque série (décision de
 *   l'utilisateur). Variété mesurée (rapport du générateur) : des centaines d'énoncés distincts par
 *   variante, donc deux séries n'ont presque jamais le même exercice.
 * - Aucun cas particulier : chaque instance demande toute la démonstration. Pas de `calcul` : aucun
 *   calcul numérique dans ce chapitre.
 */
export function profilDemontrerParallelisme(e: ExerciceDemontrerParallelisme): ProfilInstance {
  return { casParticulier: null, forme: e.variante };
}
