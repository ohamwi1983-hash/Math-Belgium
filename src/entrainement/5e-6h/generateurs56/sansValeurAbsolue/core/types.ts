import type { Q } from "../../communReels/outilsReels";

/**
 * `56gen19` — « Écrire sans valeur absolue » (5e (6h), « Nombres réels et suites », étape 4
 * « valeur-absolue », processus 2 APPLIQUER). f(x) = α|x − p| + β|bx + c| + k écrite par morceaux :
 * zéros rangés, puis l'expression réduite sur chacun des trois intervalles ]−∞ ; z₁[, [z₁ ; z₂[,
 * [z₂ ; +∞[ (convention du cours).
 */

export type VarianteSansAbs = "somme" | "difference" | "coefficient";

/** Terme α·|a x + b|. */
export interface TermeAbs {
  alpha: number;
  a: number;
  b: number;
  zero: Q;
}

export interface ExerciceSansAbs {
  variante: VarianteSansAbs;
  termes: [TermeAbs, TermeAbs];
  k: number;
  /** Zéros rangés (z₁ < z₂) et indice du terme qui s'annule en chacun. */
  z1: Q;
  z2: Q;
  /** Expressions sur les trois intervalles : [pente, ordonnée à l'origine]. */
  morceaux: [number, number][];
}

export type PhaseSansAbs = "zeros" | "gauche" | "milieu" | "droite";
export const PHASES_SANS_ABS: PhaseSansAbs[] = ["zeros", "gauche", "milieu", "droite"];
