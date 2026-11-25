import { C } from "../ui6e/nombresCombinatoireLotH2";

/**
 * Couche core — `6gen107` « Terme indépendant » (6e ch. 7, § 3, processus 2 APPLIQUER).
 * Développement de (a·xᵖ + b/x^q)ⁿ ; terme général (notation du cours, rang k + 1) :
 *   T₍ₖ₊₁₎ = Cₙᵏ (a xᵖ)ⁿ⁻ᵏ (b x⁻q)ᵏ = Cₙᵏ aⁿ⁻ᵏ bᵏ x^(pn − (p+q)k).
 * Le terme indépendant de x correspond à pn − (p + q)k = 0, soit k = pn/(p + q) — il existe si et
 * seulement si ce k est un ENTIER (entre 0 et n, toujours vrai ici). Le VERDICT « il existe » /
 * « aucun terme indépendant » est tiré à parts égales AVANT n (jamais dans `forme` = la famille).
 * Écrans : exposant de x dans T₍ₖ₊₁₎ (expression en k), valeur de k (ou « aucun »), terme
 * indépendant (0 s'il n'y en a pas : aucun terme n'a x⁰).
 */

export type FamilleTI = "x_x" | "x2_x" | "x_x2" | "x3_x";
export type PhaseTI = "exposant" | "k" | "terme";
export const PHASES_TI: PhaseTI[] = ["exposant", "k", "terme"];

export const PUISSANCES: Record<FamilleTI, { p: number; q: number }> = {
  x_x: { p: 1, q: 1 },
  x2_x: { p: 2, q: 1 },
  x_x2: { p: 1, q: 2 },
  x3_x: { p: 3, q: 1 },
};

export interface ExerciceTI {
  variante: FamilleTI;
  a: number;
  b: number;
  n: number;
}

export const pq = (e: ExerciceTI) => PUISSANCES[e.variante];

/** Exposant de x dans T₍ₖ₊₁₎ : constante + pente·k. */
export function exposant(e: ExerciceTI): { c: number; pente: number } {
  const { p, q } = pq(e);
  return { c: p * e.n, pente: -(p + q) };
}

/** k (entier) du terme indépendant, `null` s'il n'existe pas. */
export function kIndependant(e: ExerciceTI): number | null {
  const { p, q } = pq(e);
  return (p * e.n) % (p + q) === 0 ? (p * e.n) / (p + q) : null;
}

export const existe = (e: ExerciceTI): boolean => kIndependant(e) !== null;

/** Coefficient de T₍ₖ₊₁₎ pour un k donné. */
export const coefficient = (e: ExerciceTI, k: number): number => C(e.n, k) * e.a ** (e.n - k) * e.b ** k;

/** Terme indépendant (0 s'il n'existe pas). */
export function termeIndependant(e: ExerciceTI): number {
  const k = kIndependant(e);
  return k === null ? 0 : coefficient(e, k);
}

/** k = pn/(p + q) réduit en LaTeX (« \\dfrac{9}{2} », « 6 »). */
export function kFractionL(e: ExerciceTI): string {
  const { p, q } = pq(e);
  let a = p * e.n;
  let b = p + q;
  let x = a;
  let y = b;
  while (y) [x, y] = [y, x % y];
  a /= x;
  b /= x;
  return b === 1 ? `${a}` : `\\dfrac{${a}}{${b}}`;
}
