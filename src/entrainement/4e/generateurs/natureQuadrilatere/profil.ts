import type { ProfilInstance } from "../../../export/genererFeuilleExercices";
import type { ExerciceNatureQuadrilatere } from "../../core/natureQuadrilatere.types";

/**
 * Profil d'instance de gen84 pour le TIRAGE ÉQUILIBRÉ des évaluations (`.claude/rules/
 * feuilles-evaluations.md`, « Tirage équilibré »).
 *
 * - `forme` = la variante, affirmation comprise (« nature », « quatrieme », « montrer-rectangle »,
 *   « montrer-losange ») : c'est tout ce qui change la structure de la question. Les 4 étapes sont
 *   les mêmes quelle que soit la nature.
 * - La NATURE est le verdict : jamais dans `forme`, jamais un cas particulier — elle reste tirée au
 *   hasard dans chaque série (issues équilibrées dans le générateur), sinon la réponse des séries
 *   B, C… serait connue d'avance.
 * - Pas de cas particulier (aucune instance ne raccourcit la démarche : les 4 tests se font
 *   toujours) ; pas de `calcul` : toutes les instances sont exactes (coordonnées entières, normes
 *   en √), faisables sans calculatrice.
 */
export function formeNatureQuadrilatere(e: ExerciceNatureQuadrilatere): string {
  return e.variante === "montrer" ? `montrer-${e.affirmation}` : e.variante;
}

export function profilNatureQuadrilatere(e: ExerciceNatureQuadrilatere): ProfilInstance {
  return { casParticulier: null, forme: formeNatureQuadrilatere(e) };
}
