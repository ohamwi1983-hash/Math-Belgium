import type { BaseLog } from "../../core6e/inequationsLogarithmiques.types";

/**
 * Couche A (6e) — petites primitives numériques PURES pour `6gen15`. Réplique le PRINCIPE de
 * `generateurs6e/inequationsExponentielles/rationnel.ts` (6gen9/6gen10), simplifié : une base de
 * logarithme reste toujours un rationnel explicite ici (jamais `e`, voir en-tête de
 * `core6e/inequationsLogarithmiques.types.ts`).
 */

function pgcd(a: number, b: number): number {
  return b === 0 ? a : pgcd(b, a % b);
}

export function baseEntiere(n: number): BaseLog {
  return { num: n, den: 1 };
}

export function baseFraction(num: number, den: number): BaseLog {
  const d = pgcd(Math.abs(num), Math.abs(den));
  return { num: num / d, den: den / d };
}

export function baseValeurLog(base: BaseLog): number {
  return base.num / base.den;
}

/** `base^exposant` EXACT, en fraction réduite — `exposant` un entier relatif quelconque. */
export function puissanceExacteLog(base: BaseLog, exposant: number): { num: number; den: number } {
  const e = Math.abs(exposant);
  let num = Math.round(Math.pow(base.num, e));
  let den = Math.round(Math.pow(base.den, e));
  if (exposant < 0) [num, den] = [den, num];
  const signe = Math.sign(num) * Math.sign(den);
  const d = pgcd(Math.abs(num), Math.abs(den)) || 1;
  return { num: (signe * Math.abs(num)) / d, den: Math.abs(den) / d };
}

export function valeurExacteVersNombre(v: { num: number; den: number }): number {
  return v.num / v.den;
}

/** Vrai si `valeur` s'écrit comme une fraction de dénominateur ≤ `maxDenominateur` (12 par défaut)
 * — garde de génération (audit 6e ch. 3, point 22) : une borne d'ensemble-solution que l'élève doit
 * taper ne doit jamais exiger une fraction du type 5001/3000. */
export function estFractionSimple(valeur: number, maxDenominateur = 12): boolean {
  for (let d = 1; d <= maxDenominateur; d++) {
    const n = valeur * d;
    if (Math.abs(n - Math.round(n)) < 1e-9) return true;
  }
  return false;
}

/** Toutes les bornes finies d'un ensemble sont-elles des fractions simples (voir
 * `estFractionSimple`) ? */
export function bornesSimples(ensemble: { morceaux: { inf: number | null; sup: number | null }[] }, maxDenominateur = 12): boolean {
  return ensemble.morceaux.every((m) => (m.inf === null || estFractionSimple(m.inf, maxDenominateur)) && (m.sup === null || estFractionSimple(m.sup, maxDenominateur)));
}
