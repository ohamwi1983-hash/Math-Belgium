import type { ProfilInstance } from "../../../export/genererFeuilleExercices";
import type { ExerciceProblemesFraction } from "../../core/problemesFraction.types";

/**
 * Profil d'instance de gen119 pour le TIRAGE ÉQUILIBRÉ des évaluations (`.claude/rules/
 * feuilles-evaluations.md`, « Tirage équilibré »).
 * - La VARIANTE fixe le contexte (prix, trajet, robinets).
 * - `forme` = signature de difficulté : la question porte sur x (`directe`) ou sur une grandeur qui
 *   s'en déduit (`deduite`, une étape de plus) — tirée AVANT les nombres, 50 / 50.
 * - Aucun cas particulier : les cinq étapes sont toujours à faire, une racine est toujours rejetée
 *   par le contexte (ce n'est pas un verdict : c'est la même démarche à chaque fois).
 * - Pas de `calcul` : racines rationnelles par construction (Δ carré parfait), tout se fait sans
 *   calculatrice.
 */
export function profilProblemesFraction(e: ExerciceProblemesFraction): ProfilInstance {
  return { casParticulier: null, forme: `${e.variante}:${e.forme}` };
}
