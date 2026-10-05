import type { ExerciceLimiteN } from "../../../core6e/limitesExponentielles.types";
import { tirerBaseExponentielle, tirerEntierNonNul } from "../aleatoire";

/**
 * Famille N — FI `∞^0`/`0^0` via loi des puissances sur une base déjà exponentielle (2 écrans :
 * combiner, conclure). f(x) = (base^(k/x))^(mx+x²), x→0, base quelconque (entier 2 à 7).
 *
 * PAS une vraie FI une fois réécrite : loi des puissances `(a^p)^q=a^(pq)` ⟹
 * f(x) = base^((k/x)(mx+x²)) = base^(km+kx) → base^(km) (simple substitution après réécriture —
 * aucune dérivée, donc aucun logarithme nécessaire quelle que soit la base).
 */
export function construireN(): ExerciceLimiteN {
  const base = tirerBaseExponentielle();
  const k = tirerEntierNonNul(-4, 4);
  const m = tirerEntierNonNul(-4, 4);
  return { famille: "N", base, k, m, limiteFinale: Math.pow(base, k * m) };
}
