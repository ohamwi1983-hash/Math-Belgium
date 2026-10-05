import type { ExerciceIneqA } from "../../../core6e/inequationsExponentielles.types";
import { tirerEntier, tirerEntierNonNul, tirerParmi } from "../aleatoire";
import { COMPARATEURS, inverserComparateur, tirerComparateur } from "../comparateur";
import { ensembleUnMorceau } from "../../ensembleReel";
import { resoudreAffine } from "../intervalle";
import { baseEntiere, baseFraction, baseValeurIneq, puissanceExacteIneq } from "../rationnel";

/**
 * Famille A — même base, sens préservé/inversé selon `base>1`/`base<1` — voir
 * `core6e/inequationsExponentielles.types.ts::ExerciceIneqA`. `base` tirée 50/50 dans le pool
 * `>1` ({2,3,5,7}) ou le pool `<1` ({0,2;0,3;0,4;0,5}) — la spec donne les DEUX pools
 * explicitement, garantissant que le piège central (sens inversé pour base<1) est rencontré
 * environ une fois sur deux.
 */

const POOL_BASE_SUP = [baseEntiere(2), baseEntiere(3), baseEntiere(5), baseEntiere(7)];
const POOL_BASE_INF = [baseFraction(2, 10), baseFraction(3, 10), baseFraction(4, 10), baseFraction(1, 2)];

export function construireA(): ExerciceIneqA {
  const superieure = tirerParmi([true, false] as const);
  const base = superieure ? tirerParmi(POOL_BASE_SUP) : tirerParmi(POOL_BASE_INF);
  const m = tirerEntierNonNul(-4, 4);
  const n = tirerEntier(-5, 5);
  const p = tirerEntier(-4, 4);
  const valeurNumerique = puissanceExacteIneq(base, p);
  const comparateur = tirerComparateur(COMPARATEURS);
  const baseSuperieureA1 = baseValeurIneq(base) > 1;
  const comparateurExposants = baseSuperieureA1 ? comparateur : inverserComparateur(comparateur);
  const solutionEcran2 = ensembleUnMorceau(resoudreAffine(m, n, comparateurExposants, p));

  return { famille: "A", base, m, n, p, valeurNumerique, comparateur, baseSuperieureA1, solutionEcran2 };
}
