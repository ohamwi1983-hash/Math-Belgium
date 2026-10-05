/**
 * Couche A (5e) — arithmétique EXACTE sur les fractions, partagée par les 3 familles de 5gen20.
 * Même patron que `RationnelPi` (5gen8/9, `generateurs5e/parametresSinusoide/rationnelPi.ts`) :
 * réduction par PGCD, jamais un flottant intermédiaire.
 */
import type { FractionExacte } from "../../core5e/limites.types";

export function pgcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

/** Réduit num/den par leur PGCD, `den` toujours > 0 en sortie (signe reporté sur `num`). */
export function reduireFraction(num: number, den: number): FractionExacte {
  if (den < 0) {
    num = -num;
    den = -den;
  }
  if (num === 0) return { num: 0, den: 1 };
  const g = pgcd(num, den);
  return { num: num / g, den: den / g };
}

export function entierAleatoire(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

/** Entier non nul dans [-magnitudeMax,magnitudeMax], signe/magnitude variés. */
export function entierNonNul(magnitudeMax: number): number {
  const magnitude = entierAleatoire(1, magnitudeMax);
  return Math.random() < 0.5 ? magnitude : -magnitude;
}
