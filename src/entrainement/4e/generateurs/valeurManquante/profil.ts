import type { ProfilInstance } from "../../../export/genererFeuilleExercices";
import type { ExerciceValeurManquante } from "../../core/valeurManquante.types";

/**
 * Profil d'instance de gen109 pour le TIRAGE ÉQUILIBRÉ des évaluations (`.claude/rules/
 * feuilles-evaluations.md`, « Tirage équilibré »).
 *
 * - La VARIANTE fixe le type de problème (note à obtenir, effectif manquant, valeurs à ajouter pour
 *   une médiane, deux groupes).
 * - `forme` = signature de difficulté à l'intérieur de la variante, tirée AVANT les nombres avec des
 *   poids fixes (`index.ts`) : note → `sans-coef` (40 %) / `avec-coef` (60 %) ; médiane → `haut`
 *   (on ajoute la plus grande valeur, l'égalité suffit) / `bas` (on ajoute la plus petite, il faut
 *   dépasser strictement : une unité de plus) à 50 % chacune ; groupes → `globale` (formule
 *   directe) / `groupe` (sens inverse, une équation) à 50 % chacune ; effectif manquant : une seule
 *   forme. Mesures (5 000 tirages par variante, scratchpad gen109) dans le rapport du commit — la
 *   forme la plus rare est attendue des milliers de fois sur 20 000 essais, très loin du seuil ~5.
 * - Le VERDICT de « note à obtenir » (possible / impossible, ≈ 20 % d'impossibles) n'est JAMAIS dans
 *   le profil : c'est ce que l'élève doit décider, il reste tiré au hasard dans chaque série.
 * - Aucun cas particulier : les trois étapes sont toujours à faire.
 * - Pas de `calcul` : toutes les instances se font sans calculatrice (petits entiers, moyennes à au
 *   plus deux décimales, divisions exactes).
 */
export function formeValeurManquante(e: ExerciceValeurManquante): string {
  return `${e.variante}:${e.forme}`;
}

export function profilValeurManquante(e: ExerciceValeurManquante): ProfilInstance {
  return { casParticulier: null, forme: formeValeurManquante(e) };
}
