import type { ExerciceFamilleF, ValeurComplexe } from "../../core6e/nombresComplexes.types";
import { multiplierC } from "./arithmetiqueComplexe";
import { tirerEntier } from "../calculPrimitives/aleatoire";

/**
 * Couche A (6e) — famille F (« Simplifier le quotient avant de mettre au carré ») de `6gen34`. Le
 * quotient simplifié q est un entier de Gauss non nul de [-2 ; 2]² (24 valeurs, contre 10 avant),
 * le dénominateur interne c+di un entier de Gauss non nul de [-3 ; 3]², et le numérateur affiché vaut
 * q·(c+di) : la simplification est toujours exacte, et q² reste entier (|q²| ≤ 8).
 */

const Q_MAX = 2;
const DENOM_MAX = 3;

function tirerGaussienNonNul(max: number): ValeurComplexe {
  let v: ValeurComplexe = { re: 0, im: 0 };
  while (v.re === 0 && v.im === 0) v = { re: tirerEntier(-max, max), im: tirerEntier(-max, max) };
  return v;
}

export function construireFamilleF(): ExerciceFamilleF {
  const quotientSimplifie = tirerGaussienNonNul(Q_MAX);
  let den = tirerGaussienNonNul(DENOM_MAX);
  // Dénominateur réel (d = 0) : la « simplification » serait une simple division réelle — rare.
  while (den.im === 0 && Math.random() < 0.8) den = tirerGaussienNonNul(DENOM_MAX);
  const numerateurInterne = multiplierC(quotientSimplifie, den);
  const resultat = multiplierC(quotientSimplifie, quotientSimplifie);
  return { famille: "F", c: den.re, d: den.im, numRe: numerateurInterne.re, numIm: numerateurInterne.im, quotientSimplifie, resultat };
}
