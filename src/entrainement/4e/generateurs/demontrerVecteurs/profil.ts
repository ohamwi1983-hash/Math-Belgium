import type { ProfilInstance } from "../../../export/genererFeuilleExercices";
import type { ExerciceDemontrerVecteurs } from "../../core/demontrerVecteurs.types";

/**
 * Profil d'instance de gen85 pour le TIRAGE ÉQUILIBRÉ des évaluations (`.claude/rules/
 * feuilles-evaluations.md`, « Tirage équilibré »).
 *
 * - `forme` = ce qu'il faut démontrer (alignement, parallélisme, milieu, parallélogramme — la
 *   variante le fixe déjà) + la figure de base (parallélogramme, triangle, trapèze) : même
 *   démarche et même difficulté d'une série à l'autre, seuls les points et les coefficients
 *   changent. Ce n'est pas un verdict : la propriété est toujours vraie, on la démontre.
 *   Fréquences mesurées (5 000 tirages par variante) : la figure la plus rare d'une variante sort
 *   encore dans ≥ 15 % des tirages — largement assez pour la recherche de graine.
 * - Aucun cas particulier : toutes les instances demandent les quatre étapes.
 * - `calcul` absent : coefficients exacts (fractions simples), sans calculatrice.
 */
export function profilDemontrerVecteurs(e: ExerciceDemontrerVecteurs): ProfilInstance {
  return { casParticulier: null, forme: `${e.cible.type}:${e.figure}` };
}
