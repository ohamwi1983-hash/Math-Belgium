import type { ProfilInstance } from "../../../export/genererFeuilleExercices";
import type { ExerciceValeurAberrante } from "../../core/valeurAberrante.types";

/**
 * Profil d'instance de gen110 pour le TIRAGE ÉQUILIBRÉ des évaluations (`.claude/rules/
 * feuilles-evaluations.md`, « Tirage équilibré »).
 *
 * - `forme` = contexte, c'est-à-dire le type de série (fiche validée par l'utilisateur) : salaires,
 *   trajet, immobilier, basket, notes, livraison. C'est aussi la VARIANTE du catalogue : avec une
 *   variante imposée, la forme sort à 100 % ; en tirage libre, chaque contexte sort avec une
 *   probabilité de 1/6 (≈ 3 300 correspondances attendues sur 20 000 essais, très loin du seuil).
 * - Le VERDICT (médiane / les deux se valent) est ce que l'élève doit DÉCIDER à l'écran c : il
 *   n'entre JAMAIS dans `forme` et n'est jamais un cas particulier (décision de l'utilisateur, leçon
 *   de gen111) — il est tiré à pile ou face dans chaque série, AVANT la construction.
 * - Aucun cas particulier : chaque instance demande toute la démarche (deux fois moyenne et médiane,
 *   puis le choix justifié).
 * - Pas de `calcul` : toutes les instances sont exactes (moyennes à au plus 2 décimales, médiane
 *   lue dans la liste rangée), faisables sans calculatrice.
 */
export function formeValeurAberrante(e: ExerciceValeurAberrante): string {
  return e.contexte;
}

export function profilValeurAberrante(e: ExerciceValeurAberrante): ProfilInstance {
  return { casParticulier: null, forme: formeValeurAberrante(e) };
}
