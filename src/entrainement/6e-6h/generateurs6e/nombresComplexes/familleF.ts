import type { ExerciceFamilleF, ValeurComplexe } from "../../core6e/nombresComplexes.types";
import { multiplierC } from "./arithmetiqueComplexe";
import { tirerEntier, tirerParmi } from "../calculPrimitives/aleatoire";

/**
 * Couche A (6e) — génération, famille F ("Simplifier le quotient avant de développer une
 * puissance") de `6gen34` — PIÈGE CENTRAL du générateur. Construite À L'ENVERS depuis la forme
 * simplifiée CIBLE (spec) : on choisit d'abord `T` (une valeur "simple" — i, -i, ±1, ±2, 1±i, -1±i),
 * puis un dénominateur interne (c+di) NON NUL librement tiré, puis on EN DÉDUIT le numérateur interne
 * `numRe+numIm·i = T·(c+di)` — garantissant PAR CONSTRUCTION ALGÉBRIQUE (jamais par un tirage qui
 * "tombe juste" par chance) que le quotient interne `(numRe+numIm·i)/(c+di)` se simplifie EXACTEMENT
 * en `T`, quels que soient les entiers tirés pour `c,d`.
 *
 * Preuve : `(T·(c+di))/(c+di) = T` trivialement (division exacte par construction). La méthode
 * ATTENDUE de l'élève (multiplier par le conjugué `c-di`) mène au même résultat : `T·(c+di)·(c-di) /
 * ((c+di)(c-di)) = T·(c²+d²) / (c²+d²) = T`.
 */

const BANQUE_CIBLES_F: ValeurComplexe[] = [
  { re: 0, im: 1 },
  { re: 0, im: -1 },
  { re: 1, im: 0 },
  { re: -1, im: 0 },
  { re: 2, im: 0 },
  { re: -2, im: 0 },
  { re: 1, im: 1 },
  { re: 1, im: -1 },
  { re: -1, im: 1 },
  { re: -1, im: -1 },
];

const DENOM_MIN = -3;
const DENOM_MAX = 3;

function tirerDenominateurInterneNonNul(): { c: number; d: number } {
  let c = 0;
  let d = 0;
  while (c === 0 && d === 0) {
    c = tirerEntier(DENOM_MIN, DENOM_MAX);
    d = tirerEntier(DENOM_MIN, DENOM_MAX);
  }
  return { c, d };
}

export function construireFamilleF(): ExerciceFamilleF {
  const quotientSimplifie = tirerParmi(BANQUE_CIBLES_F);
  const { c, d } = tirerDenominateurInterneNonNul();
  const numerateurInterne = multiplierC(quotientSimplifie, { re: c, im: d });
  const resultat = multiplierC(quotientSimplifie, quotientSimplifie);

  return { famille: "F", c, d, numRe: numerateurInterne.re, numIm: numerateurInterne.im, quotientSimplifie, resultat };
}
