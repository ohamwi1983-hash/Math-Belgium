import type { CibleLimite, DirectionX, ExerciceLimiteB } from "../../../core6e/limitesExponentielles.types";
import { tirerEntier, tirerEntierNonNul, tirerParmi } from "../aleatoire";

const BASES_SUP = [2, 3, 4, 5] as const;
const BASES_INF = [0.5, 0.4, 0.3, 0.2] as const;

/**
 * Famille B — somme à terme exponentiel dominant, 3 écrans (exponentielle, polynomiale, globale).
 * f(x) = k^(x²+p) + q·x^d + r, x→±∞.
 *
 * `limiteExponentielle` : x²+p → +∞ TOUJOURS (quelle que soit la direction), donc k^(x²+p) →
 * +∞ (base>1) ou 0 (base<1) — jamais fini.
 *
 * `limitePolynomiale` : d IMPAIR (1 ou 3) garantit que x^d change de signe selon la direction —
 * q·x^d+r → ±∞ selon le signe de q et la direction (jamais fini, r négligeable à l'infini).
 *
 * `limiteGlobale` — fait mathématique central de cette famille (voir CLAUDE.md, section
 * "6gen6") : une exponentielle qui diverge l'emporte TOUJOURS sur un polynôme, quel que soit son
 * degré. Donc : si `limiteExponentielle=+∞` (base>1), la somme est TOUJOURS +∞ (dominance,
 * indépendamment du signe du terme polynomial — c'est ce qui produit tantôt une addition triviale
 * de même signe, tantôt une vraie FI ∞−∞ résolue par dominance, exactement la "variabilité
 * assumée" de la spec) ; si `limiteExponentielle=0` (base<1, terme négligeable), la somme suit
 * directement `limitePolynomiale`.
 */
export function construireB(): ExerciceLimiteB {
  const baseSuperieureA1 = Math.random() < 0.5;
  const base = tirerParmi(baseSuperieureA1 ? BASES_SUP : BASES_INF);
  const direction: DirectionX = Math.random() < 0.5 ? "plus_infini" : "moins_infini";
  const p = tirerEntier(-3, 3);
  const q = tirerEntierNonNul(-3, 3);
  const d = tirerParmi([1, 3] as const);
  const r = tirerEntier(-4, 4);

  const limiteExponentielle: CibleLimite = baseSuperieureA1 ? { type: "plus_infini" } : { type: "zero" };

  // x^d (d impair) : x→+∞ garde le signe de x (positif) ; x→−∞ inverse (négatif).
  const signeXPuissanceD = direction === "plus_infini" ? 1 : -1;
  const signePolynomiale = q * signeXPuissanceD > 0 ? 1 : -1;
  const limitePolynomiale: CibleLimite = signePolynomiale === 1 ? { type: "plus_infini" } : { type: "moins_infini" };

  const limiteGlobale: CibleLimite = baseSuperieureA1 ? { type: "plus_infini" } : limitePolynomiale;

  return { famille: "B", base, baseSuperieureA1, direction, p, q, d, r, limiteExponentielle, limitePolynomiale, limiteGlobale };
}
