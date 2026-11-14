/**
 * Profil d'instance de `6gen80` « Accumuler une grandeur » pour le TIRAGE ÉQUILIBRÉ des évaluations
 * (`.claude/rules/feuilles-evaluations.md`).
 *
 * - Aucun cas particulier : chaque instance est un problème COMPLET (5 étapes) ; aucune variante ne
 *   raccourcit la résolution.
 * - `forme` = situation + type de question de transfert = l'identifiant de variante (cuve-max,
 *   cuve-vide, salle-pleine, solaire-seuil, solaire-comparer, pluie-seuil, pluie-comparer,
 *   co2-seuil) : la série A fixe la situation et le transfert de chaque question, les autres séries
 *   les reproduisent avec d'autres nombres. Chaque variante a une seule forme (probabilité 1/8 en
 *   tirage libre : ≈ 2 500 correspondances attendues en 20 000 essais, aucune bride nécessaire).
 * - `calcul` : cuve, salle et les deux comparaisons (polynômes, paramètres entiers) se font sans
 *   calculatrice ; le modèle sinusoïdal (cosinus, arccos) et les modèles exponentiels (e^(kt), ln)
 *   exigent la calculatrice. Le régime est FIXÉ par la variante (mesuré sur 5 000 tirages par
 *   variante : 100 % dans chaque cas).
 */
import type { ProfilInstance } from "../../../export/genererFeuilleExercices";
import type { ExerciceAccumulerGrandeur, IdVarianteAccumulerGrandeur } from "../../core6e/accumulerGrandeur.types";

/** Variantes dont TOUTES les instances exigent la calculatrice. */
export const VARIANTES_CALCULATRICE_ACCUMULER: IdVarianteAccumulerGrandeur[] = ["solaire-seuil", "pluie-seuil", "co2-seuil"];

export function profilAccumulerGrandeur(e: ExerciceAccumulerGrandeur): ProfilInstance {
  return { casParticulier: null, calcul: VARIANTES_CALCULATRICE_ACCUMULER.includes(e.variante) ? "calculatrice" : "exacte", forme: e.variante };
}
