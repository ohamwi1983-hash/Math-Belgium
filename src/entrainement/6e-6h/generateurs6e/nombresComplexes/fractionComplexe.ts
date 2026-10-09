import type { ValeurComplexe } from "../../core6e/nombresComplexes.types";
import { pgcd } from "../calculPrimitives/aleatoire";

/**
 * Couche A (6e) — arithmétique RATIONNELLE EXACTE pour les familles C/D/E de `6gen34` (les seules 3
 * dont le résultat peut être une fraction non entière — voir en-tête
 * `core6e/nombresComplexes.types.ts`). `pgcd` réutilisé tel quel depuis
 * `generateurs6e/calculPrimitives/aleatoire.ts` (Couche A ↔ Couche A, réutilisation libre —
 * CLAUDE.md).
 */

export interface FractionEntiere {
  num: number;
  den: number;
}

/** Réduit num/den au pgcd, dénominateur TOUJOURS strictement positif (signe reporté sur le
 * numérateur) — convention standard pour un affichage LaTeX jamais ambigu (`ui6e/
 * formatNombresComplexes.ts`). */
export function reduireFraction(num: number, den: number): FractionEntiere {
  if (num === 0) return { num: 0, den: 1 };
  const signe = den < 0 ? -1 : 1;
  const n = signe * num;
  const d = signe * den;
  const g = pgcd(n, d);
  return { num: n / g, den: d / g };
}

export function valeurFraction(f: FractionEntiere): number {
  return f.num / f.den;
}

/** (a.re+a.im·i)/(c.re+c.im·i), par multiplication par le conjugué de `c` — fraction EXACTE par
 * composante (réel/imaginaire réduits chacun indépendamment, jamais un dénominateur commun forcé
 * entre les deux). `c` doit être non nul (vérifié par l'appelant lors de la génération — voir
 * `familleC.ts`/`familleD.ts`/`familleE.ts`, jamais ici : ce module reste une brique arithmétique
 * pure, sans logique de tirage). */
export function diviserComplexeExact(a: ValeurComplexe, c: ValeurComplexe): { reFrac: FractionEntiere; imFrac: FractionEntiere } {
  const denom = c.re * c.re + c.im * c.im;
  const numRe = a.re * c.re + a.im * c.im;
  const numIm = a.im * c.re - a.re * c.im;
  return { reFrac: reduireFraction(numRe, denom), imFrac: reduireFraction(numIm, denom) };
}

/** Somme de 2 fractions entières EXACTES (dénominateur commun = produit, puis réduction). */
export function additionnerFractions(f1: FractionEntiere, f2: FractionEntiere): FractionEntiere {
  return reduireFraction(f1.num * f2.den + f2.num * f1.den, f1.den * f2.den);
}
