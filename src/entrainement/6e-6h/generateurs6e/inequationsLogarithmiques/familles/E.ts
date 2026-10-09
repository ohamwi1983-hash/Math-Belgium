import type { ExerciceLogE } from "../../../core6e/inequationsLogarithmiques.types";
import { tirerEntier, tirerEntierNonNul, tirerParmi } from "../aleatoire";
import { COMPARATEURS, tirerComparateur } from "../comparateur";
import { baseEntiere, baseFraction } from "../rationnel";

/**
 * Famille E — `log_base(f) [comparateur] log_base(g)`, `f(x)=x-p`, `g(x)=r-x`, `r<p` — CE
 * (`f>0 ET g>0`, soit `x>p` ET `x<r`) TOUJOURS impossible puisque `r<p`. `base` tirée pour
 * l'affichage seulement (n'affecte jamais le raisonnement : la conclusion ∅ se lit sur la CE
 * seule, sans jamais résoudre l'inégalité principale — piège explicite de la spec).
 */

const POOL_BASE = [baseEntiere(2), baseEntiere(3), baseEntiere(5), baseEntiere(10), baseFraction(1, 2), baseFraction(1, 5), baseFraction(1, 10)];

export function construireE(): ExerciceLogE {
  const p = tirerEntier(-5, 5);
  const r = p - tirerEntierNonNul(1, 6);
  const base = tirerParmi(POOL_BASE);
  const comparateur = tirerComparateur(COMPARATEURS);
  return { famille: "E", base, p, r, comparateur };
}
