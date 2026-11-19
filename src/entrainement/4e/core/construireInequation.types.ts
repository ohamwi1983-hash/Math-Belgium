import type { Relation } from "../moteur/algebreTransfertSecondDegre";

/**
 * gen120 — « Construire une inéquation ou une équation à partir de sa solution » (4e, chapitre 2,
 * § 1 et § 2, processus 3 TRANSFÉRER). Démarche inverse : l'ensemble-solution S est donné.
 * - `inequation` : S = ]r₁ ; r₂[, [r₁ ; r₂], ]−∞ ; r₁[ ∪ ]r₂ ; +∞[ ou ]−∞ ; r₁] ∪ [r₂ ; +∞[ ;
 * - `equation` : S = {r₁ ; r₂} (deux entiers, ou un entier et une fraction).
 * Écran 1 : une (in)équation ax² + bx + c ◇ 0 de solution S — TOUTE réponse juste est acceptée
 * (comparaison des ensembles) ; écran 2 : la même avec a imposé ; écran 3 : la parabole de racines
 * r₁, r₂ qui passe par P(x₀ ; y₀) → a, b, c.
 */

export type VarianteConstruireInequation = "inequation" | "equation";

export interface ExerciceConstruireInequation {
  variante: VarianteConstruireInequation;
  /** `interieur` / `exterieur` (inéquation), `entiers` / `fraction` (équation). */
  allure: "interieur" | "exterieur" | "entiers" | "fraction";
  r1: number;
  r2: number;
  /** Symbole de l'inéquation « naturelle » (a > 0) ; « = » pour une équation. */
  symbole: Relation;
  /** Dénominateur commun des racines (1 si entières). */
  den: number;
  /** Coefficient de x² imposé à l'écran 2. */
  aImpose: number;
  /** Point de la parabole (écran 3) et coefficient a qui en résulte. */
  x0: number;
  y0: number;
  a3: number;
}
