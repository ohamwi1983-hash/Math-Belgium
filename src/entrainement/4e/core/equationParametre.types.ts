import type { Poly2 } from "../moteur/algebreTransfertSecondDegre";

/**
 * gen115 — « Équation à paramètre m » (4e, chapitre 2, § 1, processus 3 TRANSFÉRER).
 * (E) : a(m)·x² + b(m)·x + c(m) = 0, chaque coefficient étant affine en m : `a = [a1, a0]` pour
 * a1·m + a0. Variantes : `b-egal-m` (a x² + m x + c, l'exemple du cours), `affine` (b et c
 * dépendent de m), `a-egal-m` (a = m : le cas m = 0 rend l'équation du premier degré).
 * Δ(m) est un trinôme en m à racines entières distinctes m₁ < m₂ (par construction).
 */

export type VarianteEquationParametre = "b-egal-m" | "affine" | "a-egal-m";

export interface ExerciceEquationParametre {
  variante: VarianteEquationParametre;
  /** Coefficients affines en m : [coefficient de m, constante]. */
  a: [number, number];
  b: [number, number];
  c: [number, number];
  /** Δ(m) = L m² + M m + N. */
  delta: Poly2;
  m1: number;
  m2: number;
}
