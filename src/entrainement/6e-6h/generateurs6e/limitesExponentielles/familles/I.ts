import type { ExerciceLimiteI } from "../../../core6e/limitesExponentielles.types";
import { tirerBaseExponentielle, tirerEntierNonNul, tirerPointLimite } from "../aleatoire";

/**
 * Famille I — L'Hôpital, 0/0 mixte trigonométrique (4 écrans : forme, numérateur, dénominateur,
 * conclure). Base `a` quelconque, point de limite `x0` quelconque (entier -3 à 3, voir en-tête du
 * contrat).
 *
 * `sinAuNumerateur` choisit l'orientation :
 * - `true`  : f(x) = sin(k(x-x0))/(a^(m(x-x0))−1) → limite = k/(m·ln(a)) (INCHANGÉE par rapport à
 *   x0=0 — translation pure).
 * - `false` : f(x) = (a^(m(x-x0))−1)/sin(k(x-x0)) → limite = m·ln(a)/k.
 *
 * f(x0)=0/0 par construction (sin(0)=0, a^0−1=0, m≠0 jamais nul) ⟹ toujours une vraie FI 0/0.
 */
export function construireI(): ExerciceLimiteI {
  const base = tirerBaseExponentielle();
  const k = tirerEntierNonNul(-4, 4);
  const m = tirerEntierNonNul(-4, 4);
  const x0 = tirerPointLimite();
  const sinAuNumerateur = Math.random() < 0.5;
  const lnA = Math.log(base);
  const limiteFinale = sinAuNumerateur ? k / (m * lnA) : (m * lnA) / k;
  return { famille: "I", base, k, m, x0, sinAuNumerateur, limiteFinale };
}
