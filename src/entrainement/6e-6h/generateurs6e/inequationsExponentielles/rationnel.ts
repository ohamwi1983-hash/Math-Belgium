import type { BaseIneq, ValeurExacteIneq } from "../../core6e/inequationsExponentielles.types";

/**
 * Couche A (6e) — petites primitives numériques PURES pour `6gen10`, réplique de
 * `generateurs6e/equationsExponentielles/rationnel.ts` (6gen9) — dupliquée plutôt qu'importée,
 * convention déjà établie sur ce chantier (voir `aleatoire.ts`). `src/generateurs6e/` n'importe
 * jamais `src/ui6e/` — le formatage LaTeX vit dans `ui6e/formatInequationsExponentielles.ts`.
 */

function pgcd(a: number, b: number): number {
  return b === 0 ? a : pgcd(b, a % b);
}

export function baseEntiere(n: number): BaseIneq {
  return { estE: false, num: n, den: 1 };
}

export function baseFraction(num: number, den: number): BaseIneq {
  const d = pgcd(Math.abs(num), Math.abs(den));
  return { estE: false, num: num / d, den: den / d };
}

export const BASE_E: BaseIneq = { estE: true, num: 0, den: 1 };

/** Valeur JS `number` de la base (`Math.E` pour `estE`). */
export function baseValeurIneq(base: BaseIneq): number {
  return base.estE ? Math.E : base.num / base.den;
}

/**
 * `base^exposant` EXACT, en fraction réduite — `base` doit être RATIONNELLE (jamais `estE`),
 * `exposant` un entier relatif quelconque.
 */
export function puissanceExacteIneq(base: BaseIneq, exposant: number): ValeurExacteIneq {
  if (base.estE) throw new Error("puissanceExacteIneq : base e non rationnelle");
  const e = Math.abs(exposant);
  let num = Math.round(Math.pow(base.num, e));
  let den = Math.round(Math.pow(base.den, e));
  if (exposant < 0) [num, den] = [den, num];
  const signe = Math.sign(num) * Math.sign(den);
  const d = pgcd(Math.abs(num), Math.abs(den)) || 1;
  return { num: (signe * Math.abs(num)) / d, den: Math.abs(den) / d };
}

export function valeurExacteIneqVersNombre(v: ValeurExacteIneq): number {
  return v.num / v.den;
}
