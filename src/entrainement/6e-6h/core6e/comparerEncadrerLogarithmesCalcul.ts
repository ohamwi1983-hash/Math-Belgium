import type { Decomposition, NombreARanger, Rationnel, TermeLog } from "./comparerEncadrerLogarithmes.types";

/**
 * Couche A (6e) — calculs partagés de `6gen86` (générateur, vérification, textes) : valeurs des
 * logarithmes, encadrements, valeurs DONNÉES de log 2, log 3 (ou ln 2, ln 3) en millièmes. Aucune
 * dépendance vers `generateurs6e/` : la vérification (`moteur6e/`) peut l'importer.
 */

export const rat = (num: number, den = 1): Rationnel => {
  const g = pgcd(Math.abs(num), Math.abs(den));
  return { num: num / g, den: den / g };
};

export function pgcd(a: number, b: number): number {
  return b === 0 ? a : pgcd(b, a % b);
}

export function valeurRat(r: Rationnel): number {
  return r.num / r.den;
}

export function valeurLog(t: Pick<TermeLog, "base" | "argument">): number {
  return Math.log(valeurRat(t.argument)) / Math.log(valeurRat(t.base));
}

/** Vrai si `v` est (à 1e-9 près) un entier. */
export function estEntier(v: number): boolean {
  return Math.abs(v - Math.round(v)) < 1e-9;
}

/** Plancher d'un logarithme NON entier (`null` s'il est entier). */
export function plancherLog(base: Rationnel, argument: Rationnel): number | null {
  const v = valeurLog({ base, argument });
  if (estEntier(v)) return null;
  return Math.floor(v);
}

export function valeurNombre(n: NombreARanger): number {
  if (n.type === "log") return valeurLog(n.terme);
  return (n.negatif ? -1 : 1) * valeurRat(n.valeur);
}

/** Valeurs DONNÉES dans l'énoncé, en millièmes : log 2 ≈ 0,301, log 3 ≈ 0,477, log 5 = 1 − log 2 ≈ 0,699 ;
 * ln 2 ≈ 0,693, ln 3 ≈ 1,099. */
export const MILLIEMES = {
  log: { deux: 301, trois: 477, cinq: 699 },
  ln: { deux: 693, trois: 1099, cinq: 0 },
} as const;

/** log(2^p 3^q 5^r) approché à partir des valeurs données, en millièmes. */
export function logApprocheMilli(d: Decomposition, mode: "log" | "ln"): number {
  const m = MILLIEMES[mode];
  return d.p * m.deux + d.q * m.trois + d.r * m.cinq;
}

export function valeurDecomposition(d: Decomposition): Rationnel {
  const num = Math.pow(2, Math.max(d.p, 0)) * Math.pow(3, Math.max(d.q, 0)) * Math.pow(5, Math.max(d.r, 0));
  const den = Math.pow(2, Math.max(-d.p, 0)) * Math.pow(3, Math.max(-d.q, 0)) * Math.pow(5, Math.max(-d.r, 0));
  return rat(num, den);
}

/** Vraie valeur de log_a(N) (pour les contrôles du générateur). */
export function vraieValeurChangementBase(a: Decomposition, N: Decomposition): number {
  const ln = (d: Decomposition) => d.p * Math.LN2 + d.q * Math.log(3) + d.r * Math.log(5);
  return ln(N) / ln(a);
}
