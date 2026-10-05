import type { ExerciceLimiteC } from "../../../core6e/limitesExponentielles.types";
import { tirerParmi } from "../aleatoire";

/**
 * Famille C — produit, FI ∞·0, 2 écrans (facteurs, globale). f(x) = x^r · e^(−x^s), x→+∞.
 * r∈{1,2}, s∈{2,3} — tous deux positifs, donc les 3 limites sont STRUCTURELLEMENT FIXES quel que
 * soit le tirage (aucune "cible d'abord" nécessaire, contrairement aux autres familles) :
 * `x^r→+∞` (r>0), `e^(−x^s)→0` (s>0, x→+∞ ⟹ −x^s→−∞), et le produit → 0 (dominance de la
 * décroissance exponentielle sur la croissance polynomiale, quel que soit r/s).
 */
export function construireC(): ExerciceLimiteC {
  const r = tirerParmi([1, 2] as const);
  const s = tirerParmi([2, 3] as const);
  return { famille: "C", r, s, limiteFacteur1: { type: "plus_infini" }, limiteFacteur2: { type: "zero" }, limiteGlobale: 0 };
}
