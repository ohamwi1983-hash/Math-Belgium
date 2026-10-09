import type { ExerciceLimiteLogE } from "../../../core6e/limitesLogarithmiques.types";

/**
 * Famille E — cas avancé, développement à l'ordre 2, 3 écrans (développer, simplifier, conclure).
 * f(x) = (3^x·sin(x) − ln(1+x)) / (x⁴+4x²), x→0.
 *
 * **INSTANCE UNIQUE codée en dur** — même patron que la famille G de
 * `generateurs6e/limitesExponentielles/familles/G.ts` (6gen6) : cette propriété (les
 * développements à l'ordre 1 s'annulent EXACTEMENT au numérateur, il faut pousser à l'ordre 2)
 * n'a été vérifiée rigoureusement que pour CETTE instance précise — ne JAMAIS généraliser à
 * d'autres coefficients sans un calcul de vérification analogue. `construireE()` retourne donc
 * toujours le même exercice ; c'est `genererExerciceLimiteLogarithmique` (voir `index.ts`) qui la
 * tire avec un poids RÉDUIT par rapport aux 4 autres familles.
 *
 * Dérivation (développements limités à l'ordre 2 en x→0) :
 *   3^x = e^(x·ln3) ≈ 1 + x·ln3 + O(x²)           [le terme O(x²) ne contribue qu'à l'ordre 3+
 *                                                    une fois multiplié par sin(x)~x, donc omis]
 *   sin(x) ≈ x + O(x³)
 *   3^x·sin(x) ≈ (1+x·ln3)·x = x + x²·ln3 + O(x³)
 *   ln(1+x) ≈ x − x²/2 + O(x³)
 *   Numérateur = 3^x·sin(x) − ln(1+x) ≈ (x+x²·ln3) − (x−x²/2) = x²·(ln3 + 1/2)
 *   Dénominateur = x⁴+4x² ~ 4x² (x→0, le terme x⁴ est négligeable)
 *   Rapport ≈ x²·(ln3+1/2) / (4x²) = (ln3+1/2)/4 = (2ln3+1)/8   [le facteur x² se simplifie EXACTEMENT]
 *
 * Vérifié numériquement : (2*Math.log(3)+1)/8 ≈ 0.3373, cohérent avec une évaluation directe de
 * f(x) très près de 0 (voir `E.test.ts`).
 */
export function construireE(): ExerciceLimiteLogE {
  return { famille: "E", limiteFinale: (2 * Math.log(3) + 1) / 8 };
}
