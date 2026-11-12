import type { ProfilInstance } from "../../export/genererFeuilleExercices";
import type { ExerciceParadoxesProbabilites } from "../core6e/paradoxesProbabilites.types";

/**
 * Profil de tirage équilibré de `6gen76` « Quand l'intuition se trompe » (`.claude/rules/
 * feuilles-evaluations.md`, « Tirage équilibré des évaluations »).
 *
 * - Aucun cas particulier : chaque instance est un paradoxe COMPLET (4 étapes). « k = 25 » ou
 *   « l'aîné » ne raccourcissent pas la résolution, et le verdict (favorable ou non, garder ou
 *   changer) n'est jamais un cas particulier — le filtrer rendrait la réponse prévisible.
 * - `forme` = famille : la série A fixe le paradoxe de chaque question, les autres séries le
 *   reproduisent avec d'autres valeurs (k, nombre de portes, information, sexe).
 * - `calcul` : Méré exige la calculatrice ((35/36)²⁴…) ; Monty Hall et deux enfants se font en
 *   fractions exactes.
 */
export function profilParadoxesProbabilites(e: ExerciceParadoxesProbabilites): ProfilInstance {
  return { casParticulier: null, calcul: e.famille === "mere" ? "calculatrice" : "exacte", forme: e.famille };
}

/** Variantes dont TOUTES les instances exigent la calculatrice. */
export const VARIANTES_CALCULATRICE_PARADOXES = ["mere-24", "mere-25"];
