import type { ExerciceFamilleE, ValeurComplexe } from "../../core6e/nombresComplexes.types";
import { additionnerFractions, diviserComplexeExact, valeurFraction } from "./fractionComplexe";
import { tirerEntier, tirerParmi } from "../calculPrimitives/aleatoire";
import { tirerCasParticulier } from "./casParticuliers";

/**
 * Couche A (6e) — famille E (« Combiner 2 fractions ») de `6gen34`. Le dénominateur commun N (norme
 * des dénominateurs, c²+d²) est tiré D'ABORD dans {2, 5, 10}, puis chaque dénominateur parmi les
 * entiers de Gauss de norme divisant N (hors 1) : les 2 fractions et leur somme sont des décimaux
 * courts, et les nombres restent petits (avant : 2 dénominateurs indépendants, jusqu'à 72·72).
 * Cas particulier (~10 %) : les 2 dénominateurs sont conjugués.
 */

const DENOMINATEURS_PAR_NORME: Record<number, ValeurComplexe[]> = {
  2: [
    { re: 1, im: 1 },
    { re: 1, im: -1 },
    { re: -1, im: 1 },
    { re: -1, im: -1 },
  ],
  5: [
    { re: 1, im: 2 },
    { re: 1, im: -2 },
    { re: 2, im: 1 },
    { re: 2, im: -1 },
    { re: -1, im: 2 },
    { re: -2, im: 1 },
  ],
  10: [
    { re: 1, im: 3 },
    { re: 1, im: -3 },
    { re: 3, im: 1 },
    { re: 3, im: -1 },
    { re: -1, im: 3 },
    { re: -3, im: 1 },
  ],
};
const NORMES_PAR_N: Record<number, number[]> = { 2: [2], 5: [5], 10: [2, 5, 10] };
const NUM_MAX = 5;

function tirerNumerateur(): ValeurComplexe {
  let v: ValeurComplexe = { re: 0, im: 0 };
  while (v.re === 0 && v.im === 0) v = { re: tirerEntier(-NUM_MAX, NUM_MAX), im: tirerEntier(-NUM_MAX, NUM_MAX) };
  return v;
}

export function construireFamilleE(): ExerciceFamilleE {
  const N = tirerParmi([2, 5, 10, 10] as const);
  const conjugues = tirerCasParticulier();
  for (;;) {
    const den1 = tirerParmi(DENOMINATEURS_PAR_NORME[tirerParmi(NORMES_PAR_N[N])]);
    const den2 = conjugues ? { re: den1.re, im: -den1.im } : tirerParmi(DENOMINATEURS_PAR_NORME[tirerParmi(NORMES_PAR_N[N])]);
    if (!conjugues && den2.re === den1.re && den2.im === -den1.im) continue;
    const num1 = tirerNumerateur();
    const num2 = tirerNumerateur();
    const q1 = diviserComplexeExact(num1, den1);
    const q2 = diviserComplexeExact(num2, den2);
    const sommeRe = additionnerFractions(q1.reFrac, q2.reFrac);
    const sommeIm = additionnerFractions(q1.imFrac, q2.imFrac);
    const resultat = { re: valeurFraction(sommeRe), im: valeurFraction(sommeIm) };
    // Hors cas particulier, jamais de somme nulle.
    if (!conjugues && (resultat.re === 0 && resultat.im === 0)) continue;
    return {
      famille: "E",
      a1: num1.re,
      b1: num1.im,
      c1: den1.re,
      d1: den1.im,
      a2: num2.re,
      b2: num2.im,
      c2: den2.re,
      d2: den2.im,
      fraction1: { re: valeurFraction(q1.reFrac), im: valeurFraction(q1.imFrac) },
      fraction2: { re: valeurFraction(q2.reFrac), im: valeurFraction(q2.imFrac) },
      resultat,
    };
  }
}
