import type { ExerciceLimiteLogD } from "../../../core6e/limitesLogarithmiques.types";
import { tirerParmi } from "../aleatoire";

/**
 * Famille D — forme 1^∞, technique f^g=e^(g·ln f), 3 écrans (exposant, limite de l'exposant,
 * conclure). f(x) = (cos(kx))^(c/x²), x→0.
 *
 * Dérivation (vérifiée par construction) : f = e^(g·ln(cos(kx))) avec g=c/x². Au voisinage de 0,
 * ln(cos(kx)) ~ −(kx)²/2 (équivalent à ln(1+u)~u appliqué à u=cos(kx)−1~−(kx)²/2, lui-même dérivé
 * de cos(t)~1−t²/2). Donc g·ln(cos(kx)) = (c/x²)·ln(cos(kx)) → (c/x²)·(−k²x²/2) = −ck²/2. En
 * exponentiant : f → e^(−ck²/2).
 */

const K_CANDIDATS = [1, 2, 3] as const;
const C_CANDIDATS = [1, 2, 3, 4] as const;

export function construireD(): ExerciceLimiteLogD {
  const k = tirerParmi(K_CANDIDATS);
  const c = tirerParmi(C_CANDIDATS);
  const limiteExposant = -(c * k * k) / 2;
  const limiteFinale = Math.exp(limiteExposant);
  return { famille: "D", k, c, limiteExposant, limiteFinale };
}
