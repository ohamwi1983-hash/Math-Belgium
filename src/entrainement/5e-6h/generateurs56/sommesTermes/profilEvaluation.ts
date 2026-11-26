// Copie 5e (6h) de `5e-4h/generateurs5e/sommesTermes/profilEvaluation.ts` (56gen4 ← 5gen45, chantier D du 26/11/2026) — copiée pour que les deux années puissent diverger.
import type { ProfilInstance } from "../../../export/genererFeuilleExercices";
import { estFraction } from "./core/sommesTermes.types";
import type { ExerciceSommesTermes } from "./core/sommesTermes.types";

/**
 * Profil de tirage équilibré de `5gen45` « Sommes de termes consécutifs »
 * (`.claude/rules/feuilles-evaluations.md`, « Tirage équilibré des évaluations »).
 *
 * - Aucun cas particulier : chaque instance a ses trois étapes (compter les termes, trouver le
 *   premier terme ou la raison, appliquer la formule) ; la somme ne commence jamais à u₁.
 * - Pas de `calcul` : toutes les instances sont exactes et faisables sans calculatrice (termes
 *   entiers, puissances connues).
 * - `forme` = signature de difficulté, reproduite d'une série à l'autre avec d'autres nombres :
 *   `arith-indices:formule|u1r`, `arith-extension:liste|naturels|multiples`,
 *   `geom-indices:u1q|formule` (+ `:fraction` si q = ±1/2), `geom-extension` (+ `:fraction`).
 *   Forme la plus rare ≈ 12 % des tirages de sa variante (mesuré, voir le rapport de 5gen45).
 */
export function profilSommesTermes(e: ExerciceSommesTermes): ProfilInstance {
  switch (e.variante) {
    case "arith-indices":
      return { casParticulier: null, forme: `arith-indices:${e.donnee}` };
    case "arith-extension":
      return { casParticulier: null, forme: `arith-extension:${e.sousCas}` };
    case "geom-indices":
      return { casParticulier: null, forme: `geom-indices:${e.donnee}${estFraction(e.q) ? ":fraction" : ""}` };
    case "geom-extension":
      return { casParticulier: null, forme: `geom-extension${estFraction(e.q) ? ":fraction" : ""}` };
  }
}
