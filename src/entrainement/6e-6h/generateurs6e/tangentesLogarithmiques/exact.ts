import type { AtomeExact, Comb, TermeExact } from "../../core6e/tangentesLogarithmiques.types";

/**
 * Nombres exacts de `6gen87` : combinaisons linéaires à coefficients rationnels d'atomes (1, ln(n),
 * eᵏ, 1/eᵏ, √e, 1/√e, 1/ln(b), 1/(e·ln(b))). Chaque combinaison porte sa valeur et son écriture
 * LaTeX — source unique de l'écran, du récapitulatif, du corrigé et du barème.
 */

export const UN: AtomeExact = { id: "1", latex: "", valeur: 1, position: "num" };

export function atomeLn(n: number): AtomeExact {
  return { id: `ln${n}`, latex: `\\ln(${n})`, valeur: Math.log(n), position: "num" };
}

/** eᵏ (k ≥ 1) au numérateur. */
export function atomeE(k: number): AtomeExact {
  return { id: `e${k}`, latex: k === 1 ? "e" : `e^{${k}}`, valeur: Math.exp(k), position: "num" };
}

/** 1/eᵏ (k ≥ 1) : « e^{k} » au dénominateur. */
export function atomeInvE(k: number): AtomeExact {
  return { id: `ie${k}`, latex: k === 1 ? "e" : `e^{${k}}`, valeur: Math.exp(-k), position: "den" };
}

export const ATOME_RACINE_E: AtomeExact = { id: "re", latex: "\\sqrt{e}", valeur: Math.sqrt(Math.E), position: "num" };
export const ATOME_INV_RACINE_E: AtomeExact = { id: "ire", latex: "\\sqrt{e}", valeur: 1 / Math.sqrt(Math.E), position: "den" };

/** 1/ln(b). */
export function atomeInvLn(b: number): AtomeExact {
  return { id: `iln${b}`, latex: `\\ln(${b})`, valeur: 1 / Math.log(b), position: "den" };
}

/** 1/(e·ln(b)). */
export function atomeInvELn(b: number): AtomeExact {
  return { id: `ieln${b}`, latex: `e\\ln(${b})`, valeur: 1 / (Math.E * Math.log(b)), position: "den" };
}

function pgcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

export function terme(n: number, d: number, atome: AtomeExact = UN): TermeExact {
  if (d < 0) {
    n = -n;
    d = -d;
  }
  const g = pgcd(n, d);
  return { n: n / g, d: d / g, atome };
}

/** Regroupe les termes de même atome, supprime les termes nuls ; constantes en tête. */
export function comb(...termes: TermeExact[]): Comb {
  const regroupes: TermeExact[] = [];
  for (const t of termes) {
    const i = regroupes.findIndex((r) => r.atome.id === t.atome.id);
    if (i === -1) regroupes.push(terme(t.n, t.d, t.atome));
    else regroupes[i] = terme(regroupes[i].n * t.d + t.n * regroupes[i].d, regroupes[i].d * t.d, t.atome);
  }
  const nonNuls = regroupes.filter((t) => t.n !== 0);
  return [...nonNuls.filter((t) => t.atome.id === "1"), ...nonNuls.filter((t) => t.atome.id !== "1")];
}

export function entier(n: number): Comb {
  return comb(terme(n, 1));
}

export function rationnel(n: number, d: number): Comb {
  return comb(terme(n, d));
}

export function oppose(c: Comb): Comb {
  return c.map((t) => terme(-t.n, t.d, t.atome));
}

export function valeur(c: Comb): number {
  return c.reduce((s, t) => s + (t.n / t.d) * t.atome.valeur, 0);
}

export function estNul(c: Comb): boolean {
  return c.length === 0;
}

function absTerme(t: TermeExact): string {
  const n = Math.abs(t.n);
  const L = t.atome.latex;
  if (t.atome.position === "den") return `\\dfrac{${n}}{${t.d === 1 ? "" : t.d}${L}}`;
  if (L === "") return t.d === 1 ? `${n}` : `\\dfrac{${n}}{${t.d}}`;
  const num = n === 1 ? L : `${n}${L}`;
  return t.d === 1 ? num : `\\dfrac{${num}}{${t.d}}`;
}

/** Écriture LaTeX d'une combinaison (« \dfrac{3}{2}-3\ln(3) », « 0 »). */
export function latexComb(c: Comb): string {
  if (c.length === 0) return "0";
  return c.map((t, i) => (t.n < 0 ? "-" : i === 0 ? "" : "+") + absTerme(t)).join("");
}

/** Coefficient de x dans « y = m x + p » (« 2x », « -x », « \dfrac{x}{e} », « \left(1+\ln(2)\right)x »). */
export function latexCoefX(m: Comb): string {
  if (m.length === 0) return "";
  if (m.length > 1) return `\\left(${latexComb(m)}\\right)x`;
  const t = m[0];
  const signe = t.n < 0 ? "-" : "";
  const n = Math.abs(t.n);
  const L = t.atome.latex;
  if (t.atome.position === "den") return `${signe}\\dfrac{${n === 1 ? "" : n}x}{${t.d === 1 ? "" : t.d}${L}}`;
  if (L === "") {
    if (t.d === 1) return `${signe}${n === 1 ? "" : n}x`;
    return `${signe}\\dfrac{${n}}{${t.d}}x`;
  }
  const num = n === 1 ? L : `${n}${L}`;
  return t.d === 1 ? `${signe}${num}\\,x` : `${signe}\\dfrac{${num}}{${t.d}}\\,x`;
}

/** « y=m x+p ». */
export function latexEquation(m: Comb, p: Comb): string {
  const mx = latexCoefX(m);
  if (mx === "") return `y=${latexComb(p)}`;
  if (p.length === 0) return `y=${mx}`;
  const pl = latexComb(p);
  return `y=${mx}${pl.startsWith("-") ? "" : "+"}${pl}`;
}

/** « x-2 », « x+1 », « x-e », « x » (x − x₀). */
export function latexXMoins(x0: Comb): string {
  if (x0.length === 0) return "x";
  const s = latexComb(oppose(x0));
  return `x${s.startsWith("-") ? "" : "+"}${s}`;
}

/** Facteur entre parenthèses quand il a plusieurs termes ou un signe (« \left(1+\ln(2)\right) »). */
export function facteur(c: Comb): string {
  const s = latexComb(c);
  return c.length > 1 || s.startsWith("-") ? `\\left(${s}\\right)` : s;
}

/** « y=f′(x₀)(x−x₀)+f(x₀) » avec les valeurs exactes, non développée. */
export function latexEquationNonDeveloppee(c: { x0: Comb; fx0: Comb; dfx0: Comb }): string {
  const unite = c.dfx0.length === 1 && c.dfx0[0].atome.id === "1" && c.dfx0[0].d === 1 && Math.abs(c.dfx0[0].n) === 1;
  const pente = c.dfx0.length === 0 ? "0" : unite ? (c.dfx0[0].n < 0 ? "-" : "") : facteur(c.dfx0);
  const f = latexComb(c.fx0);
  const reste = c.fx0.length === 0 ? "" : f.startsWith("-") ? f : `+${f}`;
  if (c.dfx0.length === 0) return `y=${f}`;
  return `y=${pente}\\left(${latexXMoins(c.x0)}\\right)${reste}`;
}

/** Écriture d'un entier/rationnel signé (« -\dfrac{3}{2} »). */
export function latexRationnel(n: number, d = 1): string {
  return latexComb(rationnel(n, d));
}
