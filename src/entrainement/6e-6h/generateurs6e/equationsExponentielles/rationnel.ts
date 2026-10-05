import type { BaseExpo, ValeurExacteExpo } from "../../core6e/equationsExponentielles.types";

/**
 * Couche A (6e) — petites primitives numériques PURES pour `6gen9`, partagées par les 4 familles.
 * `src/generateurs6e/` n'importe jamais `src/ui6e/` — le formatage LaTeX de `BaseExpo`/
 * `ValeurExacteExpo` vit dans `ui6e/formatEquationsExponentielles.ts`, jamais ici.
 */

function pgcd(a: number, b: number): number {
  return b === 0 ? a : pgcd(b, a % b);
}

export function baseEntiere(n: number): BaseExpo {
  return { estE: false, num: n, den: 1 };
}

export function baseFraction(num: number, den: number): BaseExpo {
  const d = pgcd(Math.abs(num), Math.abs(den));
  return { estE: false, num: num / d, den: den / d };
}

export const BASE_E: BaseExpo = { estE: true, num: 0, den: 1 };

/** Valeur JS `number` de la base (`Math.E` pour `estE`). */
export function baseValeur(base: BaseExpo): number {
  return base.estE ? Math.E : base.num / base.den;
}

/**
 * `base^exposant` EXACT, en fraction réduite — `base` doit être RATIONNELLE (jamais `estE`),
 * `exposant` un entier relatif quelconque. Arithmétique entière exacte (pas d'approximation
 * flottante suivie d'une recherche de fraction) : `num`/`den` restent petits pour les plages de ce
 * générateur (base≤7, |exposant|≤5), donc `Math.pow` sur des entiers reste exact.
 */
export function puissanceExacteRationnelle(base: BaseExpo, exposant: number): ValeurExacteExpo {
  if (base.estE) throw new Error("puissanceExacteRationnelle : base e non rationnelle");
  const e = Math.abs(exposant);
  let num = Math.round(Math.pow(base.num, e));
  let den = Math.round(Math.pow(base.den, e));
  if (exposant < 0) [num, den] = [den, num];
  const signe = Math.sign(num) * Math.sign(den);
  const d = pgcd(Math.abs(num), Math.abs(den)) || 1;
  return { num: (signe * Math.abs(num)) / d, den: Math.abs(den) / d };
}

export function valeurExacteVersNombre(v: ValeurExacteExpo): number {
  return v.num / v.den;
}

/** `log_base(t)` — `Math.log(t)` directement si `estE`, sinon changement de base. */
export function logBase(base: BaseExpo, t: number): number {
  return base.estE ? Math.log(t) : Math.log(t) / Math.log(baseValeur(base));
}
