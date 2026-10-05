import type { ExerciceLimiteJ } from "../../../core6e/limitesExponentielles.types";
import { tirerBaseExponentielle, tirerEntierNonNul, tirerPointLimite } from "../aleatoire";

/**
 * Famille J — L'Hôpital, 0/0 mixte arcfonction (4 écrans : forme, numérateur, dénominateur,
 * conclure). Base `a` quelconque, `arcFn` ∈ {arctan, arcsin} (jamais arccos : arccos(0)=π/2≠0,
 * casserait la FI 0/0). Point de limite `x0` quelconque (entier -3 à 3).
 *
 * `arcAuNumerateur` choisit l'orientation :
 * - `true`  : f(x) = arcFn(k(x-x0))/(a^(m(x-x0))−1) → limite = k/(m·ln(a)) (INCHANGÉE par rapport
 *   à x0=0 — translation pure ; arctan'(0)=1/(1+0)=1, arcsin'(0)=1/√(1-0)=1, donc dans les deux cas
 *   f'(x0)=k·1).
 * - `false` : f(x) = (a^(m(x-x0))−1)/arcFn(k(x-x0)) → limite = m·ln(a)/k.
 *
 * f(x0)=0/0 par construction (arcFn(0)=0, a^0−1=0, m≠0 jamais nul) ⟹ toujours une vraie FI 0/0.
 */
export function construireJ(): ExerciceLimiteJ {
  const base = tirerBaseExponentielle();
  const k = tirerEntierNonNul(-4, 4);
  const m = tirerEntierNonNul(-4, 4);
  const x0 = tirerPointLimite();
  const arcFn = Math.random() < 0.5 ? "arctan" : "arcsin";
  const arcAuNumerateur = Math.random() < 0.5;
  const lnA = Math.log(base);
  const limiteFinale = arcAuNumerateur ? k / (m * lnA) : (m * lnA) / k;
  return { famille: "J", base, k, m, x0, arcFn, arcAuNumerateur, limiteFinale };
}
