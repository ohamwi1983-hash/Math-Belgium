// Copie 5e (6h) de `5e-4h/generateurs5e/sommeInfinieSituation/profilEvaluation.ts` (56gen7 ← 5gen48, chantier D du 26/11/2026) — copiée pour que les deux années puissent diverger.
import type { ProfilInstance } from "../../../export/genererFeuilleExercices";
import type { ExerciceSommeInfinie } from "./core/sommeInfinieSituation.types";

/**
 * Profil de tirage équilibré de `5gen48` « Somme infinie en situation »
 * (`.claude/rules/feuilles-evaluations.md`, « Tirage équilibré des évaluations »).
 *
 * - Aucun cas particulier : chaque instance a ses quatre étapes (premier terme, raison, somme infinie
 *   justifiée, réponse au problème) ; aucune ne se raccourcit.
 * - Toutes les instances sont exactes (fractions, décimaux finis) et faisables sans calculatrice.
 *   `calcul: 'exacte'` pour « périodique » seulement (écrire 0,3777… en fraction : beaucoup de
 *   calculatrices convertissent directement un décimal en fraction — revue des profils, 24/11/2026) ;
 *   rebonds, Zénon, figures (modélisation) : pas de `calcul`.
 * - `forme` = famille, précisée par le sous-cas quand il change la résolution : `periodique:pur`
 *   (partie fixe entière) ou `periodique:mixte` (un chiffre ne se répète pas, à ajouter en fraction),
 *   `rebonds`, `zenon`, `figures:triangle` (q = 1/4) ou `figures:hexagones` (une couronne sur deux,
 *   q = (3/4)²). Chaque sous-cas est tiré à pile ou face : forme la plus rare ≈ 50 % de sa variante
 *   (mesuré, voir le rapport de 5gen48).
 */
export function profilSommeInfinie(e: ExerciceSommeInfinie): ProfilInstance {
  switch (e.variante) {
    case "periodique":
      return { casParticulier: null, calcul: "exacte", forme: `periodique:${e.sousCas}` };
    case "figures":
      return { casParticulier: null, forme: `figures:${e.sousCas}` };
    default:
      return { casParticulier: null, forme: e.variante };
  }
}
