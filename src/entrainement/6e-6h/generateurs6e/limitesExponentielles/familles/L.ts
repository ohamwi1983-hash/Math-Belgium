import type { ExerciceLimiteL, ExerciceLimiteL1, ExerciceLimiteL2 } from "../../../core6e/limitesExponentielles.types";
import { tirerEntierNonNul } from "../aleatoire";

/**
 * Famille L — FI `1^∞` via changement de variable vers le pivot `(1+1/u)^u → e` (2 écrans :
 * reformuler, conclure). 2 sous-types.
 *
 * **L1** — f(x) = (1+k/x)^(mx), x→+∞. Substitution u=x/k (x=ku) : f = (1+1/u)^(kmu) =
 * [(1+1/u)^u]^(km) → e^(km) (continuité de la puissance, ZÉRO logarithme).
 *
 * **L2** — f(x) = (1+kx)^(m/x), x→0. Substitution t=kx (x→0 ⟹ t→0) : f = (1+t)^(km/t) =
 * [(1+t)^(1/t)]^(km) → e^(km), même principe.
 */
export function construireL(): ExerciceLimiteL {
  return Math.random() < 0.5 ? construireL1() : construireL2();
}

function construireL1(): ExerciceLimiteL1 {
  const k = tirerEntierNonNul(-4, 4);
  const m = tirerEntierNonNul(-4, 4);
  return { famille: "L", sousType: "L1", k, m, limiteFinale: Math.exp(k * m) };
}

function construireL2(): ExerciceLimiteL2 {
  const k = tirerEntierNonNul(-4, 4);
  const m = tirerEntierNonNul(-4, 4);
  return { famille: "L", sousType: "L2", k, m, limiteFinale: Math.exp(k * m) };
}
