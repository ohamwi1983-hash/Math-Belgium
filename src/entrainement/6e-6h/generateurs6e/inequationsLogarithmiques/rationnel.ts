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
