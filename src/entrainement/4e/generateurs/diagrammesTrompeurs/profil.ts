import type { ProfilInstance } from "../../../export/genererFeuilleExercices";
import type { ExerciceDiagrammesTrompeurs } from "../../core/diagrammesTrompeurs.types";

/**
 * Profil d'instance de gen111 pour le TIRAGE ÉQUILIBRÉ des évaluations (`.claude/rules/
 * feuilles-evaluations.md`, « Tirage équilibré »).
 *
 * - `forme` = variante + sous-type (fiche validée par l'utilisateur) : sens du calcul pour le
 *   diagramme circulaire (`direct` / `inverse`), type de diagramme lu (`batons` / `circulaire`),
 *   type de manipulation pour un graphique trompeur. La série A fixe cette forme question par
 *   question ; les autres séries la reproduisent avec d'autres données. Dans sa variante, chaque
 *   forme sort avec une probabilité de 50 % ou 25 % (`index.ts`) : 20 000 essais suffisent très
 *   largement (mesuré : voir le rapport du générateur).
 *   Le type de manipulation détermine toute la suite de l'exercice (ce qu'on lit, ce qu'on corrige) :
 *   c'est une signature de difficulté, pas un verdict tiré dans un exercice identique — décision de
 *   la fiche.
 * - Aucun cas particulier : chaque instance demande toute la démarche.
 * - Pas de `calcul` : toutes les instances sont exactes (fréquences au plus à une décimale, angles
 *   et effectifs entiers, évolutions entières), faisables sans calculatrice.
 */
export function formeDiagrammesTrompeurs(e: ExerciceDiagrammesTrompeurs): string {
  return `${e.variante}|${e.sousType}`;
}

export function profilDiagrammesTrompeurs(e: ExerciceDiagrammesTrompeurs): ProfilInstance {
  return { casParticulier: null, forme: formeDiagrammesTrompeurs(e) };
}
