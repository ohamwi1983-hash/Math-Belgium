import { exactA, nbL, nbT } from "../../5e-4h/ui5e/nombresTrigo";

export { exactA, nbL, nbT };

/**
 * Écriture des nombres des générateurs 6gen148–6gen151 (6e ch. 2, lot G) : virgule `{,}`, « − »
 * typographique, espaces fines des milliers, bases rationnelles en fraction. Une seule source pour
 * l'écran, les aides, le papier et le corrigé.
 */

/** Rationnel p/q (q > 0), réduit. */
export interface Rat {
  num: number;
  den: number;
}

function pgcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

export function rat(num: number, den = 1): Rat {
  if (den < 0) {
    num = -num;
    den = -den;
  }
  const g = pgcd(num, den);
  return { num: num / g, den: den / g };
}

export const ratVal = (r: Rat): number => r.num / r.den;
export const ratMul = (a: Rat, b: Rat): Rat => rat(a.num * b.num, a.den * b.den);
export const ratPow = (a: Rat, n: number): Rat => (n >= 0 ? rat(a.num ** n, a.den ** n) : rat(a.den ** -n, a.num ** -n));

/** Rationnel en LaTeX : « 5 », « -\dfrac{3}{4} ». */
export function ratL(r: Rat, frac = "\\dfrac"): string {
  if (r.den === 1) return String(r.num);
  return `${r.num < 0 ? "-" : ""}${frac}{${Math.abs(r.num)}}{${r.den}}`;
}

/** Rationnel en texte : « 5 », « −3/4 ». */
export function ratT(r: Rat): string {
  return r.den === 1 ? nbT(r.num, 0) : `${r.num < 0 ? "−" : ""}${Math.abs(r.num)}/${r.den}`;
}

/** Facteur entre parenthèses s'il est négatif (substitution) : « (−2) », « 3 ». */
export function parL(s: string): string {
  return s.startsWith("-") ? `(${s})` : s;
}

/** Nombre avec espaces fines des milliers (LaTeX) : « 10\,512{,}67 ». */
export function milliersL(x: number, dec = 2, fixe = false): string {
  const s = nbL(x, dec, fixe);
  const [ent, frac] = s.split("{,}");
  const signe = ent.startsWith("-") ? "-" : "";
  const chiffres = ent.replace("-", "");
  const groupes = chiffres.length > 4 ? chiffres.replace(/\B(?=(\d{3})+(?!\d))/g, "\\,") : chiffres;
  return `${signe}${groupes}${frac !== undefined ? `{,}${frac}` : ""}`;
}

/** Nombre avec espaces (insécables fines) des milliers (texte) : « 10 512,67 ». */
export function milliersT(x: number, dec = 2, fixe = false): string {
  return milliersL(x, dec, fixe).replace(/\\,/g, " ").replace("{,}", ",").replace("-", "−");
}

/** « = 1,5 » si exact à `dec` décimales, sinon « \approx 1,53 ». */
export function egalApprox(x: number, dec: number): string {
  return exactA(x, dec) ? `=${milliersL(x, dec)}` : `\\approx ${milliersL(x, dec, true)}`;
}
