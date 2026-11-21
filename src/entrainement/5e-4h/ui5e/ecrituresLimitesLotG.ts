import type { Q } from "./nombresTrigo";
import { pgcd, q } from "./nombresTrigo";

/**
 * Écritures communes des générateurs du lot G du 5e ch. 4 (5gen64–5gen67) : polynômes, cibles de
 * limite (`\lim\limits_{x\to a^+}`, x → a SOUS « lim »), infinis, valeurs exactes q·√r. Typographie
 * du site : « − » en texte, virgule `{,}`, KaTeX ; aucune notation clavier. Source unique de l'écran,
 * du papier et du corrigé.
 */

/** Cible d'une limite : +∞, −∞, ou un réel (éventuellement à gauche / à droite). */
export type Cible = { type: "plus" } | { type: "moins" } | { type: "point"; a: number; cote?: "+" | "-" };

export const PLUS: Cible = { type: "plus" };
export const MOINS: Cible = { type: "moins" };
export const pointC = (a: number, cote?: "+" | "-"): Cible => ({ type: "point", a, cote });

/** « +\infty », « -\infty », « 2^+ », « -3^- », « 0 ». */
export function cibleL(c: Cible): string {
  if (c.type === "plus") return "+\\infty";
  if (c.type === "moins") return "-\\infty";
  return `${c.a}${c.cote ? `^{${c.cote}}` : ""}`;
}

/** « \lim\limits_{x\to +\infty} » (x → a sous « lim »). */
export const limL = (c: Cible, v = "x"): string => `\\lim\\limits_{${v}\\to ${cibleL(c)}}`;

/** Texte brut d'une cible (« +∞ », « 2⁺ », « −3⁻ »). */
export function cibleT(c: Cible): string {
  if (c.type === "plus") return "+∞";
  if (c.type === "moins") return "−∞";
  const a = c.a < 0 ? `−${-c.a}` : `${c.a}`;
  return `${a}${c.cote === "+" ? "⁺" : c.cote === "-" ? "⁻" : ""}`;
}

/** ±∞ ou nombre (LaTeX). */
export function limiteL(v: number, dec = 4): string {
  if (v === Infinity) return "+\\infty";
  if (v === -Infinity) return "-\\infty";
  return nombreL(v, dec);
}

/** Nombre en LaTeX : entier, ou rationnel simple en fraction, sinon décimal à virgule. */
export function nombreL(v: number, dec = 4): string {
  if (Number.isInteger(v)) return `${v}`;
  for (let d = 2; d <= 60; d++) {
    const n = Math.round(v * d);
    if (Math.abs(v * d - n) < 1e-9) return `${n < 0 ? "-" : ""}\\dfrac{${Math.abs(n)}}{${d}}`;
  }
  const f = 10 ** dec;
  return `${Math.round(v * f) / f}`.replace(".", "{,}");
}

/** Nombre en texte brut (« − » typographique). */
export const nombreT = (v: number): string => (v < 0 ? `−${-v}` : `${v}`);

/** Polynôme en x à coefficients entiers, du plus haut degré au plus bas (« 4x^2+3x-1 »). */
export function polyL(coefs: number[], v = "x"): string {
  const deg = coefs.length - 1;
  let s = "";
  coefs.forEach((c, i) => {
    const p = deg - i;
    if (c === 0) return;
    const abs = Math.abs(c);
    const signe = c < 0 ? "-" : s === "" ? "" : "+";
    const coef = p === 0 ? `${abs}` : abs === 1 ? "" : `${abs}`;
    const varP = p === 0 ? "" : p === 1 ? v : `${v}^${p}`;
    s += `${signe}${coef}${varP}`;
  });
  return s === "" ? "0" : s;
}

/** Valeur de polynôme. */
export function polyV(coefs: number[], x: number): number {
  return coefs.reduce((acc, c) => acc * x + c, 0);
}

/** « + 3 », « − 3 » (LaTeX, collé), rien pour 0. */
export const plusL = (v: number): string => (v === 0 ? "" : v > 0 ? `+${v}` : `${v}`);

/** Facteur entre parenthèses s'il est négatif. */
export const parL = (v: number): string => (v < 0 ? `(${v})` : `${v}`);

/** « kx » (k = 1 → « x », k = −1 → « −x »). */
export function coefX(k: number, v = "x"): string {
  if (k === 1) return v;
  if (k === -1) return `-${v}`;
  return `${k}${v}`;
}

/** Valeur exacte q·√r (r sans facteur carré, r = 1 : rationnel). */
export interface Exacte {
  q: Q;
  r: number;
}

export const exacte = (n: number, d = 1, r = 1): Exacte => ({ q: q(n, d), r });
export const exacteV = (e: Exacte): number => (e.q.n / e.q.d) * Math.sqrt(e.r);

/** « \dfrac{\sqrt{3}}{6} », « -\dfrac{3}{2} », « 2\sqrt{2} », « 0 ». */
export function exacteL(e: Exacte): string {
  const { n, d } = e.q;
  if (n === 0) return "0";
  const s = n < 0 ? "-" : "";
  const a = Math.abs(n);
  const haut = e.r === 1 ? `${a}` : `${a === 1 ? "" : a}\\sqrt{${e.r}}`;
  return d === 1 ? `${s}${haut}` : `${s}\\dfrac{${haut}}{${d}}`;
}

/** √n = c√r. */
export function extraire(n: number): { c: number; r: number } {
  let c = 1;
  let r = n;
  for (let k = 2; k * k <= r; k++) {
    while (r % (k * k) === 0) {
      r /= k * k;
      c *= k;
    }
  }
  return { c, r };
}

/** Fraction n/d réduite, en LaTeX. */
export function fracL(n: number, d: number): string {
  if (d < 0) {
    n = -n;
    d = -d;
  }
  const g = pgcd(n, d);
  return exacteL({ q: { n: n / g, d: d / g }, r: 1 });
}
