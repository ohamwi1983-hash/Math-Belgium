import type { ProfilInstance } from "../../../export/genererFeuilleExercices";
import type { ExerciceSommeInfinie } from "../../core5e/sommeInfinieSituation.types";

/**
 * Profil de tirage équilibré de `5gen48` « Somme infinie en situation »
 * (`.claude/rules/feuilles-evaluations.md`, « Tirage équilibré des évaluations »).
 *
 * - Aucun cas particulier : chaque instance a ses quatre étapes (premier terme, raison, somme infinie
 *   justifiée, réponse au problème) ; aucune ne se raccourcit.
 * - Pas de `calcul` : toutes les instances sont exactes (fractions, décimaux finis) et faisables sans
 *   calculatrice.
 * - `forme` = famille, précisée par le sous-cas quand il change la résolution : `periodique:pur`
 *   (partie fixe entière) ou `periodique:mixte` (un chiffre ne se répète pas, à ajouter en fraction),
 *   `rebonds`, `zenon`, `figures:triangle` (q = 1/4) ou `figures:hexagones` (une couronne sur deux,
 *   q = (3/4)²). Chaque sous-cas est tiré à pile ou face : forme la plus rare ≈ 50 % de sa variante
 *   (mesuré, voir le rapport de 5gen48).
 */
export function profilSommeInfinie(e: ExerciceSommeInfinie): ProfilInstance {
  switch (e.variante) {
    case "periodique":
      return { casParticulier: null, forme: `periodique:${e.sousCas}` };
    case "figures":
      return { casParticulier: null, forme: `figures:${e.sousCas}` };
    default:
      return { casParticulier: null, forme: e.variante };
  }
}
