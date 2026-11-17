import type { ProfilInstance } from "../../../export/genererFeuilleExercices";
import type { ExercicePositionsPlans } from "../../core/positionsPlans.types";

/**
 * Profil d'instance de gen101 pour le TIRAGE ÉQUILIBRÉ des évaluations (`.claude/rules/
 * feuilles-evaluations.md`, « Tirage équilibré »).
 *
 * - `forme` = la variante seule (deux plans / trois plans). Ce que l'élève doit DÉCIDER — position
 *   de deux plans (parallèles / confondus / sécants), issue pour trois plans (un point / une droite /
 *   aucun point, et le sous-cas Toblerone ou plans parallèles) — n'entre JAMAIS dans `forme` : c'est
 *   un verdict, retiré au hasard dans chaque série (décision de l'utilisateur). Les autres
 *   caractéristiques (nombre de lettres communes aux noms, triangles disjoints sur le dessin, point
 *   construit nécessaire) n'existent que pour certains verdicts ou les trahiraient : elles restent
 *   aléatoires elles aussi. Variété mesurée (rapport du générateur) : des centaines d'énoncés
 *   distincts par variante, donc deux séries n'ont jamais le même exercice.
 * - Aucun cas particulier : chaque instance demande toute la démarche (décider, puis justifier ou
 *   construire). Pas de `calcul` : aucun calcul numérique dans ce chapitre.
 */
export function profilPositionsPlans(e: ExercicePositionsPlans): ProfilInstance {
  return { casParticulier: null, forme: e.variante };
}
