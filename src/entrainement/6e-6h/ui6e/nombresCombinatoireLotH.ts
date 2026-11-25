import { arrangements, coefficientBinomial, factorielle } from "../generateurs6e/combinatoire";

/**
 * Écritures partagées des générateurs 6gen100–6gen104 (6e ch. 7, lot H) : notation du cours
 * (`C_n^k`, `A_n^k`, `P_n`, `B_n^p`, `\Gamma_n^p`, `n!`), espaces de milliers (« 34\,650 » en KaTeX,
 * « 34 650 » en texte), et les comptages (fonctions STABLES de `generateurs6e/combinatoire.ts`).
 */

export const fact = factorielle;
export const comb = coefficientBinomial;
export const arr = arrangements;
export const gamma = (n: number, p: number) => coefficientBinomial(n + p - 1, p);

/** Entier en LaTeX, espaces de milliers fines (`34\,650`), signe « − ». */
export function mil(n: number): string {
  const s = Math.abs(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "\\,");
  return n < 0 ? `-${s}` : s;
}

/** Entier en texte brut, espaces insécables fines (« 34 650 »). */
export function milTexte(n: number): string {
  const s = Math.abs(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return n < 0 ? `−${s}` : s;
}

export const CL = (n: number | string, k: number | string) => `C_{${n}}^{${k}}`;
export const AL = (n: number | string, k: number | string) => `A_{${n}}^{${k}}`;
export const GL = (n: number | string, p: number | string) => `\\Gamma_{${n}}^{${p}}`;

/** Produit décroissant n × (n−1) × … × (n−k+1) en LaTeX. */
export function produitDecroissant(n: number, k: number): string {
  const f: number[] = [];
  for (let i = 0; i < k; i++) f.push(n - i);
  return f.join("\\times ");
}

/** n!/(n₁!·n₂!…) en LaTeX (seules les répétitions > 1 au dénominateur). */
export function multinomialeLatex(n: number, effectifs: number[]): string {
  const rep = effectifs.filter((x) => x > 1);
  if (rep.length === 0) return `${n}!`;
  return `\\dfrac{${n}!}{${rep.map((x) => `${x}!`).join("\\times ")}}`;
}

export function multinomiale(n: number, effectifs: number[]): number {
  return effectifs.reduce((acc, x) => acc / factorielle(x), factorielle(n));
}
