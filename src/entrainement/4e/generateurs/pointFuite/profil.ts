import type { ProfilInstance } from "../../../export/genererFeuilleExercices";
import type { ExercicePointFuite } from "../../core/pointFuite.types";

/**
 * Profil d'instance de gen105 pour le TIRAGE ÉQUILIBRÉ des évaluations (`.claude/rules/
 * feuilles-evaluations.md`, « Tirage équilibré »).
 *
 * - `forme` = la variante seule (boîte, carrelage, poteaux, panneaux) : même scène et même
 *   construction (deux points à construire, puis l'affirmation vraie) d'une série à l'autre. Ce que
 *   l'élève doit DÉCIDER — les droites qui portent chaque point, l'affirmation vraie — n'entre jamais
 *   dans `forme` : l'affirmation vraie et les deux fausses sont tirées au hasard dans chaque série.
 *   Chaque variante sort un quart du temps (bien au-delà du seuil du 1er centile) ; variété mesurée :
 *   des centaines de figures distinctes par variante (rapport du générateur).
 * - Aucun cas particulier : toutes les instances demandent la même construction complète (deux
 *   points, chacun à l'intersection de deux droites à tracer).
 * - Pas de `calcul` : aucun calcul numérique.
 */
export function profilPointFuite(e: ExercicePointFuite): ProfilInstance {
  return { casParticulier: null, forme: e.variante };
}
