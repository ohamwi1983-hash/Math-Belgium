import type { ExerciceLimiteH } from "../../../core6e/limitesExponentielles.types";
import { tirerBaseExponentielle, tirerEntierNonNul, tirerPointLimite } from "../aleatoire";

/**
 * Famille H — L'Hôpital, 0/0 pur exponentiel, une application (4 écrans : forme, numérateur,
 * dénominateur, conclure). Base `a` quelconque (voir en-tête du contrat — `ln(a)` est déjà connu
 * via `6gen7`, même chapitre, comme simple facteur numérique). Point de limite `x0` quelconque
 * (entier -3 à 3, y compris 0).
 *
 * `expAuNumerateur` choisit l'orientation :
 * - `true`  : f(x) = (a^(k(x-x0))−1)/(m(x-x0)) → f'(x)=k·ln(a)·a^(k(x-x0)), g'(x)=m (constante) ⟹
 *   limite = k·ln(a)/m (INCHANGÉE par rapport à x0=0 — translation pure, voir en-tête du contrat).
 * - `false` : f(x) = (m(x-x0))/(a^(k(x-x0))−1) → limite = m/(k·ln(a)).
 *
 * f(x0)=0/0 par construction (a^0−1=0, m·0=0, m≠0 jamais nul) ⟹ toujours une vraie FI 0/0.
 */
export function construireH(): ExerciceLimiteH {
  const base = tirerBaseExponentielle();
  const k = tirerEntierNonNul(-4, 4);
  const m = tirerEntierNonNul(-4, 4);
  const x0 = tirerPointLimite();
  const expAuNumerateur = Math.random() < 0.5;
  const lnA = Math.log(base);
  const limiteFinale = expAuNumerateur ? (k * lnA) / m : m / (k * lnA);
  return { famille: "H", base, k, m, x0, expAuNumerateur, limiteFinale };
}
