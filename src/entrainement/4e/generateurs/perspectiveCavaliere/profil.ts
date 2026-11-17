import type { ProfilInstance } from "../../../export/genererFeuilleExercices";
import type { ExercicePerspectiveCavaliere } from "../../core/perspectiveCavaliere.types";

/**
 * Profil d'instance de gen104 pour le TIRAGE ÉQUILIBRÉ des évaluations (`.claude/rules/
 * feuilles-evaluations.md`, « Tirage équilibré »).
 *
 * - `forme` = la variante seule (pavé, prisme droit, pyramide) : même nombre et même type d'étapes
 *   d'une série à l'autre (une fuyante, puis les autres sommets arrière ou le sommet S, puis les
 *   arêtes cachées). Ce que l'élève DÉCIDE — en particulier, pour le prisme et la pyramide, si la face
 *   de gauche est vue (une seule arête cachée) ou non (trois) — n'entre jamais dans `forme` : tiré
 *   moitié-moitié dans chaque série. Variété mesurée (rapport du générateur) : environ 400 énoncés
 *   distincts pour le pavé, 1 400 pour le prisme, 170 pour la pyramide.
 * - Pas de cas particulier : aucune instance ne raccourcit la construction (le cube garde les
 *   mêmes étapes que le pavé).
 * - Pas de `calcul` : la seule opération est une division par 2, faisable sans calculatrice.
 */
export function profilPerspectiveCavaliere(e: ExercicePerspectiveCavaliere): ProfilInstance {
  return { casParticulier: null, forme: e.variante };
}
