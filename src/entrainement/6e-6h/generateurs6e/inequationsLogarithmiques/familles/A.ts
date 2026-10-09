import type { ExerciceLogA } from "../../../core6e/inequationsLogarithmiques.types";
import { ensembleUnMorceau } from "../../ensembleReel";
import { tirerEntier, tirerEntierNonNul, tirerParmi } from "../aleatoire";
import { COMPARATEURS, inverserComparateur, tirerComparateur } from "../comparateur";
import { intersecterEnsembles, resoudreAffine } from "../intervalle";
import { baseEntiere, baseFraction, baseValeurLog, puissanceExacteLog, valeurExacteVersNombre } from "../rationnel";

/**
 * Famille A — `log_base(mx+n) [comparateur] k` — piège central : sens direct si `base>1`, inversé
 * si `base<1`. `base` tirée 50/50 dans le pool `>1` ({2,3,5,10}) ou `<1` ({1/2,1/5,1/10}) — les
 * DEUX pools explicitement donnés par la spec.
 *
 * Non-vacuité GARANTIE mathématiquement (jamais de retry nécessaire) : `k=base^0=1>0` toujours (en
 * fait `base^k>0` pour tout `k` entier), donc le seuil de la comparaison sur l'argument (`x` tel
 * que `mx+n=base^k`) est TOUJOURS strictement du côté "CE satisfaite" du seuil de la CE (`x` tel
 * que `mx+n=0`) — l'intersection des deux demi-droites reste donc toujours non dégénérée (borne
 * propre, jamais un seul et même seuil) — voir `A.test.ts` pour la preuve par échantillonnage.
 */

const POOL_BASE_SUP = [baseEntiere(2), baseEntiere(3), baseEntiere(5), baseEntiere(10)];
const POOL_BASE_INF = [baseFraction(1, 2), baseFraction(1, 5), baseFraction(1, 10)];

export function construireA(): ExerciceLogA {
  const superieure = tirerParmi([true, false] as const);
  const base = superieure ? tirerParmi(POOL_BASE_SUP) : tirerParmi(POOL_BASE_INF);
  const baseSuperieureA1 = baseValeurLog(base) > 1;
  const m = tirerEntierNonNul(-4, 4);
  const n = tirerEntier(-5, 5);
  const k = tirerEntier(-3, 3);
  const comparateur = tirerComparateur(COMPARATEURS);

  const baseK = valeurExacteVersNombre(puissanceExacteLog(base, k));
  const comparateurArgument = baseSuperieureA1 ? comparateur : inverserComparateur(comparateur);

  const ceEcran1 = ensembleUnMorceau(resoudreAffine(m, n, ">", 0));
  const argumentBrutEcran2 = ensembleUnMorceau(resoudreAffine(m, n, comparateurArgument, baseK));
  const solutionEcran2 = intersecterEnsembles(ceEcran1, argumentBrutEcran2);

  return { famille: "A", base, baseSuperieureA1, m, n, k, comparateur, ceEcran1, argumentBrutEcran2, solutionEcran2 };
}
