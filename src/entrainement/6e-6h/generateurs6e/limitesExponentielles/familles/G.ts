import type { ExerciceLimiteG } from "../../../core6e/limitesExponentielles.types";

/**
 * Famille G — ∞−∞ avancée, développement à l'ordre 2, 3 écrans (combiner, ordre1, conclure).
 * f(x) = 1/cos(x) + 1/(1−e^(π/2−x)), x→π/2. Limite = 1/2.
 *
 * **INSTANCE UNIQUE codée en dur** — cette propriété (les termes divergents s'annulent exactement
 * à l'ordre 1, nécessitant l'ordre 2) n'a été vérifiée rigoureusement que pour CETTE instance
 * précise (spec explicite) — ne JAMAIS généraliser à d'autres coefficients sans un calcul de
 * vérification analogue. `construireG()` retourne donc toujours le même exercice ; c'est
 * `genererExerciceLimiteExponentielle` (voir `index.ts`) qui la tire avec un poids RÉDUIT par
 * rapport aux 6 autres familles, pour éviter la répétition d'une instance unique trop fréquente.
 *
 * Dérivation (u=π/2−x, x→π/2 ⟺ u→0) : cos(x)=cos(π/2−u)=sin(u)≈u−u³/6 ; 1−e^(π/2−x)=1−e^u≈
 * −u−u²/2−u³/6. Donc 1/cos(x)+1/(1−e^u) ≈ 1/(u−u³/6) + 1/(−u−u²/2−u³/6). Au premier ordre déjà
 * (1/u et −1/u), les deux termes s'annulent EXACTEMENT — un développement à l'ordre 1 seul ne
 * suffit donc pas (d'où l'écran "ordre1"), il faut pousser au second ordre pour extraire le terme
 * fini résiduel, qui vaut 1/2 (calcul détaillé disponible dans la spec source, cross-vérifié
 * numériquement dans `G.test.ts` en évaluant f(x) directement très près de x=π/2).
 */
export function construireG(): ExerciceLimiteG {
  return { famille: "G", limiteFinale: 0.5 };
}
