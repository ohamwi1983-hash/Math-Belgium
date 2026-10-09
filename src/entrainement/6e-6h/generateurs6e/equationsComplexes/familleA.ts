import type { ExerciceFamilleA, ExerciceFamilleAAvecBarre, ExerciceFamilleASansBarre, ValeurComplexe } from "../../core6e/equationsComplexes.types";
import { tirerEntier, tirerEntierNonNul } from "../calculPrimitives/aleatoire";

/**
 * Couche A (6e) — génération, famille A ("Linéaire en z, avec ou sans z̄") de `6gen36`. 2
 * sous-types, tirage équiprobable À L'INTÉRIEUR de la famille (voir `index.ts` pour le tirage entre
 * familles A-F, à un seul niveau au-dessus de celui-ci — même patron à 2 niveaux que la famille B de
 * `6gen34`, `core6e/nombresComplexes.types.ts`).
 *
 * ============================================================================
 * **Sous-type "sansBarre" — az+b=cz+d, a≠c**
 * ============================================================================
 * Isolé directement : (a-c)z=d-b, z=(d-b)/(a-c) — même technique que la division de `6gen34`
 * (`generateurs6e/nombresComplexes/fractionComplexe.ts`). Construit À L'ENVERS depuis un z CIBLE
 * (Gaussien entier) plutôt que l'inverse (jamais a,b,c,d tirés au hasard en espérant une division
 * exacte) : a,c (a≠c),b tirés d'abord, puis d=b+(a-c)z — garantit ALGÉBRIQUEMENT que
 * z=(d-b)/(a-c) retombe EXACTEMENT sur le z choisi au départ.
 *
 * ============================================================================
 * **Sous-type "avecBarre" — az+bz̄=c+di, a,b,c,d RÉELS**
 * ============================================================================
 * Substituer z=x+yi, z̄=x-yi : a(x+yi)+b(x-yi) = (a+b)x + (a-b)yi = c+di, d'où le système réel
 * {(a+b)x=c, (a-b)y=d}. Construit À L'ENVERS depuis x,y CIBLES (entiers non nuls) plutôt que
 * l'inverse : a,b tirés d'abord (garantissant a+b≠0 ET a-b≠0 par tirage), puis c=(a+b)x,
 * d=(a-b)y — garantit ALGÉBRIQUEMENT que x=c/(a+b) et y=d/(a-b) retombent EXACTEMENT sur les
 * entiers x,y choisis au départ, jamais un quotient qui tombe juste par coïncidence.
 */

const COEF_MIN = -6;
const COEF_MAX = 6;
const XY_MIN = -5;
const XY_MAX = 5;
const AB_MIN = -4;
const AB_MAX = 4;

function tirerGaussien(): ValeurComplexe {
  return { re: tirerEntier(COEF_MIN, COEF_MAX), im: tirerEntier(COEF_MIN, COEF_MAX) };
}

/** Gaussien entier NON NUL (re et im pas tous 2 nuls) — utilisé pour "a" (coefficient de z, jamais
 * un terme "0z" dégénéré à l'écran). */
function tirerGaussienNonNul(): ValeurComplexe {
  let v = tirerGaussien();
  while (v.re === 0 && v.im === 0) v = tirerGaussien();
  return v;
}

function egalComplexe(u: ValeurComplexe, v: ValeurComplexe): boolean {
  return u.re === v.re && u.im === v.im;
}

function multiplierGaussien(u: ValeurComplexe, v: ValeurComplexe): ValeurComplexe {
  return { re: u.re * v.re - u.im * v.im, im: u.re * v.im + u.im * v.re };
}

export function construireSansBarre(): ExerciceFamilleASansBarre {
  const a = tirerGaussienNonNul();
  const b = tirerGaussien();
  let c = tirerGaussienNonNul();
  while (egalComplexe(c, a)) c = tirerGaussienNonNul();
  const z = tirerGaussien();

  const denom = { re: a.re - c.re, im: a.im - c.im };
  const produit = multiplierGaussien(denom, z);
  const d: ValeurComplexe = { re: b.re + produit.re, im: b.im + produit.im };
  return { famille: "A", sousType: "sansBarre", a, b, c, d, z };
}

export function construireAvecBarre(): ExerciceFamilleAAvecBarre {
  let a = 0;
  let b = 0;
  do {
    a = tirerEntier(AB_MIN, AB_MAX);
    b = tirerEntier(AB_MIN, AB_MAX);
  } while (a + b === 0 || a - b === 0);
  const x = tirerEntierNonNul(XY_MIN, XY_MAX);
  const y = tirerEntierNonNul(XY_MIN, XY_MAX);
  const c = (a + b) * x;
  const d = (a - b) * y;
  return { famille: "A", sousType: "avecBarre", a, b, c, d, x, y };
}

export function construireFamilleA(): ExerciceFamilleA {
  return Math.random() < 0.5 ? construireSansBarre() : construireAvecBarre();
}
