import { latexCarreDecale, latexPoly, latexQ, polyAdd, polyConst, polyScal, polyVar, q } from "../moteur6e/algebreLieux";
import type { Poly, Q } from "../moteur6e/algebreLieux";
import type { PointConique } from "../moteur6e/algebreConiques";
import { f } from "./fragmentsCombinatoire";
import type { FragmentConsigne } from "./fragmentsCombinatoire";

/**
 * Briques de texte communes aux écrans du 6e ch. 10 (6gen58–6gen63, audit, lot B) : équations en
 * KaTeX (signe « − » rendu par KaTeX, jamais de notation clavier), coefficients 1 et −1 omis, points
 * nommés, phrase « valeurs exactes ».
 */

export const EXACT = " Donne des valeurs exactes (fractions ou racines simplifiées), jamais arrondies.";
export const L = (...l: string[]): FragmentConsigne[][] => l.map((x) => f(x));

/** « P = 0 » d'un polynôme en x, y. */
export const eqPoly = (p: Poly, ordre: readonly string[] = ["x", "y"]) => `${latexPoly(p, ordre)}=0`;

/** Polynôme Ax² + By² + Dx + Ey + F. */
export function polyGeneral(A: number, B: number, D: number, E: number, F: number): Poly {
  const x = polyVar("x");
  const y = polyVar("y");
  const x2 = polyScal(new Map([["x:2", q(1)]]), q(A));
  const y2 = polyScal(new Map([["y:2", q(1)]]), q(B));
  return polyAdd(polyAdd(polyAdd(polyAdd(x2, y2), polyScal(x, q(D))), polyScal(y, q(E))), polyConst(q(F)));
}

/** Coefficient devant une expression : 1 → « », −1 → « - », sinon le nombre. */
export function coefDevant(c: Q | number): string {
  const r = typeof c === "number" ? q(c) : c;
  if (r.n === 1n && r.d === 1n) return "";
  if (r.n === -1n && r.d === 1n) return "-";
  return latexQ(r);
}

/** α(x − h)² + β(y − k)² = γ en KaTeX (termes nuls omis). */
export function latexDeuxCarres(cx: Q | number, h: Q | number, cy: Q | number, k: Q | number, M: Q | number): string {
  const Qc = (v: Q | number) => (typeof v === "number" ? q(v) : v);
  const tx = `${coefDevant(cx)}${latexCarreDecale("x", Qc(h))}`;
  const cyQ = Qc(cy);
  const neg = cyQ.n < 0n;
  const ty = `${coefDevant(neg ? q(-cyQ.n, cyQ.d) : cyQ)}${latexCarreDecale("y", Qc(k))}`;
  return `${tx}${neg ? "-" : "+"}${ty}=${latexQ(Qc(M))}`;
}

export const nomPC = (nom: string, p: PointConique) => `${nom}${p.latex}`;

/** Fraction m = num/den en KaTeX (entier si den = 1). */
export const latexFrac = (num: number, den: number) => latexQ(q(num, den));
