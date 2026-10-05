/**
 * Couche core (5e) — 5gen11 ("Extremums d'une fonction sinusoïdale"), pont entre 5gen8/9
 * (paramètres) et 5gen10 (résolution d'équations trigonométriques). Réutilise `AmplitudeSinusoide`/
 * `RationnelPi` (`core5e/parametresSinusoide.types.ts`, import core→core déjà établi ailleurs sur la
 * plateforme, ex. `OrientationParabole` 4e) — jamais un second type dupliqué.
 *
 * `a`/`bArg` sont TOUJOURS des `RationnelPi` exacts (jamais de régime décimal, contrairement à
 * 5gen10) : `a` = B = 2π/T et `bArg` = C = -B·φ sont dérivés ALGÉBRIQUEMENT de T/φ (déjà des
 * `RationnelPi` exacts, `generateurs5e/parametresSinusoide/rationnelPi.ts`), jamais approximés. `a`
 * peut lui-même être lié à π (`degrePi=1`, si T est un entier plat) — contrairement à
 * `CoefficientRationnel` de 5gen10 (toujours plat, jamais lié à π) : `RationnelPi` est le type
 * correct ici, plus général, puisque diviser un argument déjà lié à π par un `a` LUI-MÊME lié à π
 * annule le π et donne une période résultante "pure" en x (voir CLAUDE.md section 5gen11).
 */
import type { AmplitudeSinusoide, RationnelPi } from "./parametresSinusoide.types";

export type { RationnelPi };

export type FonctionExtremum = "sin" | "cos";

/** Une branche fusionnée constante+k·période — UNE SEULE branche pour tout l'exercice (jamais 2
 * comme le cas spécial k=±1 de 5gen10 : sin(u)=±1 ⟺ u=π/2+kπ, cos(u)=±1 ⟺ u=kπ, période TOUJOURS π,
 * jamais 2π — voir CLAUDE.md section 5gen11 pour la preuve de fusion). */
export interface BrancheExtremum {
  constante: RationnelPi;
  periode: RationnelPi;
}

export interface ExerciceExtremumsSinusoide {
  fonction: FonctionExtremum;
  /** Affichée dans l'énoncé (fonction source complète), jamais utilisée dans le calcul. */
  amplitude: AmplitudeSinusoide;
  /** Toujours un entier simple, jamais lié à π — affiché dans l'énoncé, jamais utilisé dans le
   * calcul (la position d'un extremum ne dépend pas du décalage vertical). */
  decalageVertical: number;
  /** Coefficient de x dans l'argument — = B de 5gen8/9. */
  a: RationnelPi;
  /** Constante additive de l'argument — = C de 5gen8/9. */
  bArg: RationnelPi;
  /** u = a·x + bArg = brancheU (écran 1). */
  brancheU: BrancheExtremum;
  /** x = (u - bArg) / a (écran 2). */
  brancheX: BrancheExtremum;
  /** Positions x distinctes dans [0;2π[ (écran 3, bonus) — TOUJOURS entre 1 et 5 par construction
   * (reroll borné à la génération, voir `generateurs5e/extremumsSinusoide/index.ts`). */
  solutions: number[];
}

export type GenerateurExerciceExtremumsSinusoide = () => ExerciceExtremumsSinusoide;
