import type { ProfilInstance } from "../../../export/genererFeuilleExercices";
import type { ExerciceComparerEncadrerLog } from "../../core6e/comparerEncadrerLogarithmes.types";

/**
 * Profil d'instance de `6gen86` « Comparer et encadrer des logarithmes sans calculatrice » pour le
 * TIRAGE ÉQUILIBRÉ des évaluations (`.claude/rules/feuilles-evaluations.md`, « Tirage équilibré »).
 *
 * - Aucun cas particulier : chaque instance fait toutes ses étapes.
 * - `calcul: 'exacte'` : tout est exact par construction (puissances connues, croissance de logₐ,
 *   changement de base avec des valeurs DONNÉES). Décision de l'utilisateur du 24/11/2026 (un
 *   exercice « sans calculatrice » n'a de sens que sans elle) : tiré seulement en « calculatrice
 *   interdite » ; calculatrice autorisée, il ne sort plus qu'au palier de repli. Avant : pas de
 *   `calcul` (disponible dans les deux cas).
 * - `forme` = variante, + « base < 1 » pour la comparaison (sens inversé : une difficulté de plus).
 *   Le VERDICT de la comparaison (<, >, =) et le type d'encadrement (séparés ou identiques, qui en
 *   dépend) ne sont jamais dans `forme` : ils restent tirés au hasard dans chaque série (1/3
 *   chacun). Fréquence de la forme la plus rare (comparer, bases < 1) : 1/3 de la variante.
 */
export function profilComparerEncadrerLog(e: ExerciceComparerEncadrerLog): ProfilInstance {
  if (e.variante === "comparer") return { casParticulier: null, forme: e.baseInf1 ? "comparer-base-inf-1" : "comparer", calcul: "exacte" };
  return { casParticulier: null, forme: e.variante, calcul: "exacte" };
}
