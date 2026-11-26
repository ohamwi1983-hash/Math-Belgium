import { pgcd } from "./lecture56";

/** Rationnel exact (entiers ordinaires : les nouvelles variantes restent sous 10⁹). */
export interface Fr56 {
  n: number;
  d: number;
}

export function fr56(n: number, d = 1): Fr56 {
  if (d < 0) [n, d] = [-n, -d];
  const g = pgcd(n, d);
  return { n: n / g, d: d / g };
}
export const mulF = (a: Fr56, b: Fr56): Fr56 => fr56(a.n * b.n, a.d * b.d);
export const divF = (a: Fr56, b: Fr56): Fr56 => fr56(a.n * b.d, a.d * b.n);
export const addF = (a: Fr56, b: Fr56): Fr56 => fr56(a.n * b.d + b.n * a.d, a.d * b.d);
export const subF = (a: Fr56, b: Fr56): Fr56 => fr56(a.n * b.d - b.n * a.d, a.d * b.d);
export const negF = (a: Fr56): Fr56 => fr56(-a.n, a.d);
export function powF(a: Fr56, k: number): Fr56 {
  let r = fr56(1);
  for (let i = 0; i < k; i++) r = mulF(r, a);
  return r;
}
export const valF = (a: Fr56): number => a.n / a.d;
export const egalF = (a: Fr56, b: Fr56): boolean => a.n === b.n && a.d === b.d;

/** LaTeX : entier, ou `\dfrac{p}{q}` avec le signe devant. */
/** Entier en LaTeX, milliers séparés par `\,` dès 10 000. */
function entL(n: number): string {
  const s = String(Math.abs(n));
  return s.length > 4 ? s.replace(/\B(?=(\d{3})+(?!\d))/g, "\\,") : s;
}

export function latexF(a: Fr56): string {
  if (a.d === 1) return `${a.n < 0 ? "-" : ""}${entL(a.n)}`;
  return `${a.n < 0 ? "-" : ""}\\dfrac{${entL(a.n)}}{${entL(a.d)}}`;
}
/** LaTeX entre parenthèses si négatif ou fractionnaire (base d'une puissance, facteur d'un produit). */
export function latexFP(a: Fr56): string {
  return a.d === 1 && a.n >= 0 ? latexF(a) : `\\left(${latexF(a)}\\right)`;
}
/** Texte brut (« 3/2 » est une notation clavier : on écrit « 1,5 » si décimal exact, sinon « 3 sur 2 » n'apparaît jamais à l'écran — réservé aux libellés d'aria). */
export function texteF(a: Fr56): string {
  if (a.d === 1) return `${a.n < 0 ? "−" : ""}${Math.abs(a.n)}`;
  return `${a.n < 0 ? "−" : ""}${Math.abs(a.n)} sur ${a.d}`;
}
