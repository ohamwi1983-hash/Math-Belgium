import type { ExerciceLongueurArcC } from "../../core6e/longueurArc.types";
import { tirerEntier, tirerParmi } from "../calculPrimitives/aleatoire";

/**
 * Couche A (6e) — génération, famille C ("Cas simple, substitution directe") de `6gen28`.
 * f(x)=x^(3/2), f'(x)=(3/2)√x, f'(x)²=(9/4)x — 1+f'(x)² = 1+(9/4)x est AFFINE en x, PAS un carré
 * parfait : contraste EXPLICITE avec la famille A (spec), voir en-tête `core6e/longueurArc.types.ts`.
 *
 * Primitive de √(1+(9/4)x) par substitution u=1+(9/4)x, du=(9/4)dx :
 * ∫√u · (4/9)du = (4/9)·(2/3)u^(3/2) = (8/27)u^(3/2), d'où (8/27)(1+(9/4)x)^(3/2).
 */

/** Valeurs de c (f(x) = c·x^{3/2}) et, pour chacune, les abscisses entières où 1 + k·x (k = 9c²/4)
 * est un carré parfait — la longueur est alors rationnelle (u = √(1 + kx) entier ou demi-entier).
 * La première ligne est l'exemple du cours : f(x) = (2/3)x^{3/2} sur [0 ; 3], L = 14/3. */
const CAS_C: { cNum: number; cDen: number; kNum: number; kDen: number; bornes: number[] }[] = [
  { cNum: 2, cDen: 3, kNum: 1, kDen: 1, bornes: [0, 3, 8, 15] },
  { cNum: 4, cDen: 3, kNum: 4, kDen: 1, bornes: [0, 2, 6, 12] },
  { cNum: 8, cDen: 3, kNum: 16, kDen: 1, bornes: [0, 3, 5, 14] },
  { cNum: 1, cDen: 3, kNum: 1, kDen: 4, bornes: [0, 5, 12] },
  { cNum: 2, cDen: 1, kNum: 9, kDen: 1, bornes: [0, 7, 11] },
  { cNum: 1, cDen: 1, kNum: 9, kDen: 4, bornes: [0, 5, 13] },
];

export function construireFamilleLongueurArcC(): ExerciceLongueurArcC {
  const cas = tirerParmi(CAS_C);
  let i = tirerEntier(0, cas.bornes.length - 1);
  let j = tirerEntier(0, cas.bornes.length - 1);
  while (j === i) j = tirerEntier(0, cas.bornes.length - 1);
  if (i > j) [i, j] = [j, i];
  const k = cas.kNum / cas.kDen;
  return {
    famille: "C",
    cNum: cas.cNum,
    cDen: cas.cDen,
    kNum: cas.kNum,
    kDen: cas.kDen,
    a: cas.bornes[i],
    b: cas.bornes[j],
    unPlusFPrimeCarreReference: (x) => 1 + k * x,
    primitiveReference: (x) => (2 / (3 * k)) * Math.pow(1 + k * x, 1.5),
  };
}
