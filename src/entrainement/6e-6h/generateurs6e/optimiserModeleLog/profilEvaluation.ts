/**
 * Profil d'instance de `6gen91` « Optimiser un modèle logarithmique » pour le TIRAGE ÉQUILIBRÉ des
 * évaluations (`.claude/rules/feuilles-evaluations.md`).
 *
 * - Aucun cas particulier : chaque instance est un problème COMPLET (5 étapes). La nature de
 *   l'optimum (maximum ou minimum) est une ISSUE à décider, jamais un cas particulier ; elle découle
 *   de la situation (un coût moyen se minimise, un rendement se maximise).
 * - `forme` = la situation (engrais, benefice, rendement-moyen, cout-moyen, debit) = l'identifiant
 *   de variante : la série A fixe la situation de chaque question, les autres séries la reproduisent
 *   avec d'autres nombres. Une seule forme par variante (probabilité 1/5 en tirage libre :
 *   ≈ 4 000 correspondances attendues en 20 000 essais, aucune bride nécessaire).
 * - `calcul` : `exacte` quand l'écran 5 demande les valeurs exactes (optimum eᵏ, valeur en e —
 *   faisable sans calculatrice), `calculatrice` quand il demande des valeurs arrondies en contexte.
 *   `engrais` et `benefice` sont toujours `calculatrice` (la valeur optimale contient ln(a/b)) ; les
 *   trois autres situations tirent le mode à 50 % (mesuré sur 5 000 tirages par variante).
 */
import type { ProfilInstance } from "../../../export/genererFeuilleExercices";
import type { ExerciceOptimiserLog, IdVarianteOptimiserLog } from "../../core6e/optimiserModeleLog.types";

/** Variantes dont TOUTES les instances exigent la calculatrice. */
export const VARIANTES_CALCULATRICE_OPTIMISER_LOG: IdVarianteOptimiserLog[] = ["engrais", "benefice"];

export function profilOptimiserLog(e: ExerciceOptimiserLog): ProfilInstance {
  return { casParticulier: null, calcul: e.mode === "exacte" ? "exacte" : "calculatrice", forme: e.variante };
}
