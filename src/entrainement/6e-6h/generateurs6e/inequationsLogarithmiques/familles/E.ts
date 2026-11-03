import type { ExerciceLogE } from "../../../core6e/inequationsLogarithmiques.types";
import { ensembleUnMorceau } from "../../ensembleReel";
import { tirerEntier, tirerParmi } from "../aleatoire";
import { COMPARATEURS, inverserComparateur, tirerComparateur } from "../comparateur";
import { intersecterEnsembles, resoudreAffine } from "../intervalle";
import { baseEntiere, baseFraction, baseValeurLog } from "../rationnel";

/**
 * Famille E — `log_base(f) [comparateur] log_base(g)`, `f(x)=x-p`, `g(x)=r-x`. CE : `x>p ET x<r`.
 *
 * Refonte (décision K3, voir `core6e/inequationsLogarithmiques.types.ts`) : CE incompatible
 * (`r≤p`) ou satisfiable (`r>p`) à parts égales — jamais toujours ∅. Si la CE est satisfiable,
 * `f [comparateur'] g` (sens inversé si `base<1`) équivaut à `2x [comparateur'] p+r`, résolu par
 * `resoudreAffine` puis intersecté avec `]p;r[` — le seuil `(p+r)/2` est TOUJOURS strictement
 * intérieur à `]p;r[`, donc la solution n'est jamais vide ni réduite à un point.
 */

const POOL_BASE = [baseEntiere(2), baseEntiere(3), baseEntiere(5), baseEntiere(10), baseFraction(1, 2), baseFraction(1, 5), baseFraction(1, 10)];

const ENSEMBLE_VIDE = { forme: "intervalles" as const, points: [], morceaux: [] };

export function construireE(): ExerciceLogE {
  const base = tirerParmi(POOL_BASE);
  const baseSuperieureA1 = baseValeurLog(base) > 1;
  const comparateur = tirerComparateur(COMPARATEURS);
  const ceCompatible = tirerParmi([true, false] as const);
  const p = tirerEntier(-5, 5);
  // r=p (CE x>p ET x<p) compte comme incompatible, au même titre que r<p : piège « bornes égales ».
  const r = ceCompatible ? p + tirerEntier(1, 6) : p - tirerEntier(0, 6);

  if (!ceCompatible) return { famille: "E", base, baseSuperieureA1, p, r, comparateur, ceCompatible, ceEcran1: ENSEMBLE_VIDE, solution: ENSEMBLE_VIDE };

  const ceEcran1 = ensembleUnMorceau({ inf: p, sup: r, infInclus: false, supInclus: false });
  const comparateurArgument = baseSuperieureA1 ? comparateur : inverserComparateur(comparateur);
  // (x-p) [cmp'] (r-x)  <=>  2x - (p+r) [cmp'] 0
  const solution = intersecterEnsembles(ceEcran1, ensembleUnMorceau(resoudreAffine(2, -(p + r), comparateurArgument, 0)));
  return { famille: "E", base, baseSuperieureA1, p, r, comparateur, ceCompatible, ceEcran1, solution };
}
