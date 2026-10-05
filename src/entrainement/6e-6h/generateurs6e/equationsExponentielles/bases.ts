import type { BaseExpo } from "../../core6e/equationsExponentielles.types";
import { tirerParmi } from "./aleatoire";
import { BASE_E, baseEntiere, baseFraction } from "./rationnel";

/** Couche A (6e) — pools de bases par famille, `6gen9`. Chaque pool est celui explicitement donné
 * par la spec ; quand la spec ne précise pas de pool distinct pour un sous-type (D1), une décision
 * documentée réutilise le pool du sous-type voisin plutôt que d'en inventer un nouveau. */

/** base∈{2,3,5,7,5/2} — familles A et B. */
const POOL_AB: BaseExpo[] = [baseEntiere(2), baseEntiere(3), baseEntiere(5), baseEntiere(7), baseFraction(5, 2)];
export function tirerBaseAB(): BaseExpo {
  return tirerParmi(POOL_AB);
}

/** base∈{e,2,3,5} — famille C, styles "direct"/"carreDeguise" (pleinement généraux). */
const POOL_C_AVEC_E: BaseExpo[] = [BASE_E, baseEntiere(2), baseEntiere(3), baseEntiere(5)];
export function tirerBaseCAvecE(): BaseExpo {
  return tirerParmi(POOL_C_AVEC_E);
}

/** base∈{2,3,5} — famille C, style "regroupement" UNIQUEMENT : `e` est exclu de ce style (jamais
 * des 2 autres) pour que le coefficient dérivé `A=base+1` reste un ENTIER propre — voir la doc de
 * `ExerciceEqExpoC` (core6e) pour la preuve complète. */
const POOL_C_SANS_E: BaseExpo[] = [baseEntiere(2), baseEntiere(3), baseEntiere(5)];
export function tirerBaseCSansE(): BaseExpo {
  return tirerParmi(POOL_C_SANS_E);
}

/** base∈{2,3,4,5,7,e} — famille D, pool EXPLICITEMENT donné par la spec pour D2 ; réutilisé pour
 * D1 également (la spec ne précise aucun pool distinct pour D1, seul son intervalle de `c` — c'est
 * la décision la plus naturelle, plutôt que d'inventer un troisième pool sans base textuelle). */
const POOL_D: BaseExpo[] = [baseEntiere(2), baseEntiere(3), baseEntiere(4), baseEntiere(5), baseEntiere(7), BASE_E];
export function tirerBaseD(): BaseExpo {
  return tirerParmi(POOL_D);
}
