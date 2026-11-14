/**
 * Profil d'instance de `6gen91` « Optimiser un modèle logarithmique » pour le TIRAGE ÉQUILIBRÉ des
 * évaluations (`.claude/rules/feuilles-evaluations.md`).
 *
 * - Aucun cas particulier : chaque instance est un problème COMPLET (5 étapes). La nature de
 *   l'optimum (maximum ou minimum) est une ISSUE à décider, jamais un cas particulier ; elle découle
 *   de la situation (un coût moyen se minimise, un rendement se maximise).
 * - `forme` = la FAMILLE de fonctions (ln-lineaire, x-ln-x, ln-sur-x) — voir `profilOptimiserLog`.
 *   La série A fixe la famille de chaque question ; la situation est retirée dans la famille pour
 *   chaque série (x ln x : coût moyen = minimum ou débit = maximum, une fois sur deux). Une seule
 *   forme par variante (probabilité 1/3 en tirage libre, aucune bride nécessaire).
 * - `calcul` : `exacte` quand l'écran 5 demande les valeurs exactes (optimum eᵏ, valeur en e —
 *   faisable sans calculatrice), `calculatrice` quand il demande des valeurs arrondies en contexte.
 *   `engrais` et `benefice` (famille ln-lineaire) sont toujours `calculatrice` (la valeur optimale
 *   contient ln(a/b)) ; les trois autres situations tirent le mode à 50 % (mesuré sur 5 000 tirages par variante).
 */
import type { ProfilInstance } from "../../../export/genererFeuilleExercices";
import type { ExerciceOptimiserLog, IdFamilleOptimiserLog } from "../../core6e/optimiserModeleLog.types";
import { familleDeSituation } from "./index";

/** Variantes (familles) dont TOUTES les instances exigent la calculatrice. */
export const VARIANTES_CALCULATRICE_OPTIMISER_LOG: IdFamilleOptimiserLog[] = ["ln-lineaire"];

/** `forme` = FAMILLE de fonctions (décision de l'utilisateur) : la situation, et donc pour « x ln x »
 * la nature de l'optimum (minimum du coût moyen, maximum du débit), varie d'une série à l'autre. */
export function profilOptimiserLog(e: ExerciceOptimiserLog): ProfilInstance {
  return { casParticulier: null, calcul: e.mode === "exacte" ? "exacte" : "calculatrice", forme: familleDeSituation(e.variante) };
}
