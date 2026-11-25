/**
 * Écritures et petits calculs communs aux générateurs 6gen105–6gen109 (6e ch. 7, lot H de l'audit).
 * Notation du cours : Cₙᵏ (`C_{n}^{k}`), Aₙᵏ, n!. Entiers en LaTeX avec l'espace fine des milliers à
 * partir de 10 000 (même convention que `ui6e/nombresExp.ts::decL`) ; jamais de notation clavier.
 */

export function C(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  const kk = Math.min(k, n - k);
  let r = 1;
  for (let i = 1; i <= kk; i++) r = (r * (n - kk + i)) / i;
  return Math.round(r);
}

export function A(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  let r = 1;
  for (let i = 0; i < k; i++) r *= n - i;
  return r;
}

export function fact(n: number): number {
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

/** Entier en LaTeX : « 5376 », « 34\,650 », « -1\,792 ». */
export function entL(x: number): string {
  const s = Math.abs(Math.round(x)).toString();
  const corps = s.length > 4 ? s.replace(/\B(?=(\d{3})+(?!\d))/g, "\\,") : s;
  return `${x < 0 ? "-" : ""}${corps}`;
}

/** Entier en texte brut : « 34 650 » (espace fine insécable), « −12 ». */
export function entT(x: number): string {
  return entL(x).replace(/\\,/g, " ").replace(/^-/, "−");
}

/** « C_{12}^{4} ». */
export const cL = (n: number | string, k: number | string): string => `C_{${n}}^{${k}}`;
/** « A_{12}^{4} ». */
export const aL = (n: number | string, k: number | string): string => `A_{${n}}^{${k}}`;

/** Rationnel réduit {n, d}. */
export interface Fr {
  n: number;
  d: number;
}
function pgcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
}
export function fr(n: number, d = 1): Fr {
  if (d < 0) {
    n = -n;
    d = -d;
  }
  const g = pgcd(n, d);
  return { n: n / g, d: d / g };
}
export const frVal = (x: Fr): number => x.n / x.d;
/** Somme au plus petit dénominateur commun (évite les produits de dénominateurs > 2⁵³). */
export function frAdd(a: Fr, b: Fr): Fr {
  const g = pgcd(a.d, b.d);
  const d = (a.d / g) * b.d;
  return fr(a.n * (d / a.d) + b.n * (d / b.d), d);
}
export const frSub = (a: Fr, b: Fr): Fr => frAdd(a, { n: -b.n, d: b.d });
export const frMul = (a: Fr, b: Fr): Fr => fr(a.n * b.n, a.d * b.d);
export const frPow = (a: Fr, k: number): Fr => fr(a.n ** k, a.d ** k);

/** Fraction réduite en LaTeX (`\dfrac`, espace des milliers dans les termes). */
export function frL(x: Fr): string {
  if (x.d === 1) return entL(x.n);
  return `${x.n < 0 ? "-" : ""}\\dfrac{${entL(Math.abs(x.n))}}{${entL(x.d)}}`;
}

/** Décimal en LaTeX (au plus `dec` décimales, zéros inutiles retirés), virgule `{,}`. */
export function decL(x: number, dec = 4): string {
  const brut = Math.abs(x).toFixed(dec);
  const s = brut.includes(".") ? brut.replace(/\.?0+$/, "") : brut;
  const [ent, d] = s.split(".");
  const entier = ent!.length > 4 ? ent!.replace(/\B(?=(\d{3})+(?!\d))/g, "\\,") : ent!;
  const corps = d ? `${entier}{,}${d}` : entier;
  return `${x < 0 && Number(s) !== 0 ? "-" : ""}${corps}`;
}

/** Le nombre s'écrit-il exactement avec au plus `dec` décimales ? */
export const estDecimalExact = (x: number, dec = 4): boolean => Math.abs(x * 10 ** dec - Math.round(x * 10 ** dec)) < 1e-7;

/** « = 0{,}3087 » si exact à 4 décimales, sinon « \approx 0{,}3087 ». */
export function egalDecL(x: number, dec = 4): string {
  return `${estDecimalExact(x, dec) ? "=" : "\\approx"}${decL(x, dec)}`;
}

/** Tirage uniforme. */
export const parmi = <T,>(t: readonly T[]): T => t[Math.floor(Math.random() * t.length)]!;
export const entier = (a: number, b: number): number => a + Math.floor(Math.random() * (b - a + 1));
export function melanger<T>(t: readonly T[]): T[] {
  const r = [...t];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j]!, r[i]!];
  }
  return r;
}
