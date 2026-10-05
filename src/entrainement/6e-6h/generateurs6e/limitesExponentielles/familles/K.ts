import type { ExerciceLimiteK } from "../../../core6e/limitesExponentielles.types";
import { tirerBaseExponentielle, tirerEntierNonNul, tirerPointLimite } from "../aleatoire";

/**
 * Famille K — L'Hôpital, DEUX applications successives (6 écrans : forme, numérateur1,
 * dénominateur1, numérateur2, dénominateur2, conclure). Base `a` quelconque (voir en-tête du
 * contrat), dénominateur TOUJOURS m·(x-x0)², point de limite `x0` quelconque (entier -3 à 3).
 *
 * `expAuNumerateur` choisit l'orientation :
 * - `true`  : f(x) = (a^(k(x-x0))−1−k(x-x0)·ln(a))/(m(x-x0)²) → limite = k²·ln(a)²/(2m) (INCHANGÉE
 *   par rapport à x0=0 — translation pure).
 * - `false` : f(x) = (m(x-x0)²)/(a^(k(x-x0))−1−k(x-x0)·ln(a)) → limite = 2m/(k²·ln(a)²).
 *
 * Degré PLAFONNÉ à 2 — par construction, toujours EXACTEMENT 2 applications nécessaires (jamais
 * une boucle, nombre d'écrans FIXE) : N(x)=a^(k(x-x0))-1-k(x-x0)·ln(a), D(x)=m·(x-x0)² ⟹
 * N(x0)=D(x0)=0 (FI 0/0). N'(x)=k·ln(a)·(a^(k(x-x0))-1), D'(x)=2m(x-x0) ⟹ les deux s'annulent
 * encore en x0 (FI 0/0 PERSISTE, d'où la 2e application). N''(x)=k²·ln(a)²·a^(k(x-x0)), D''(x)=2m
 * ⟹ limite = N''(x0)/D''(x0) = k²·ln(a)²/(2m).
 */
export function construireK(): ExerciceLimiteK {
  const base = tirerBaseExponentielle();
  const k = tirerEntierNonNul(-4, 4);
  const m = tirerEntierNonNul(-4, 4);
  const x0 = tirerPointLimite();
  const expAuNumerateur = Math.random() < 0.5;
  const lnA = Math.log(base);
  const limiteFinale = expAuNumerateur ? (k * k * lnA * lnA) / (2 * m) : (2 * m) / (k * k * lnA * lnA);
  return { famille: "K", base, k, m, x0, expAuNumerateur, limiteFinale };
}
