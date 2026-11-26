// Copie 5e (6h) de `5e-4h/generateurs5e/troisTermes/profilEvaluation.ts` (56gen5 ← 5gen46, chantier D du 26/11/2026) — copiée pour que les deux années puissent diverger.
import type { ProfilInstance } from "../../../export/genererFeuilleExercices";
import { avecCarres, degreEquation } from "./core/troisTermes.types";
import type { ExerciceTroisTermes } from "./core/troisTermes.types";

/**
 * Profil de tirage équilibré de `5gen46` « Trois termes consécutifs »
 * (`.claude/rules/feuilles-evaluations.md`, « Tirage équilibré des évaluations »).
 *
 * - Aucun cas particulier : le NOMBRE de valeurs de x qui conviennent (0, 1 ou 2 en géométrique)
 *   est un verdict — jamais filtré, jamais fixé d'une série à l'autre ; il reste tiré au hasard
 *   dans chaque série, issues équilibrées (voir `index.ts`).
 * - Pas de `calcul` : toutes les instances sont exactes (racines entières, termes entiers).
 * - `forme` = signature de difficulté, reproduite d'une série à l'autre avec d'autres nombres :
 *   `arithmetique:affine|carres` (des x² qui s'éliminent), `geometrique:degre1|degre2` (degré de
 *   l'équation réduite). Forme la plus rare ≈ 22 % des tirages de sa variante (`geometrique:degre1`,
 *   mesuré, voir le rapport de 5gen46).
 */
export function profilTroisTermes(e: ExerciceTroisTermes): ProfilInstance {
  if (e.variante === "arithmetique") return { casParticulier: null, forme: `arithmetique:${avecCarres(e) ? "carres" : "affine"}` };
  return { casParticulier: null, forme: `geometrique:degre${degreEquation(e)}` };
}
