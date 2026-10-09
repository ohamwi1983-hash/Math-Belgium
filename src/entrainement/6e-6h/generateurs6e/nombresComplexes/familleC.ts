import type { ExerciceFamilleC } from "../../core6e/nombresComplexes.types";
import { diviserComplexeExact, valeurFraction } from "./fractionComplexe";
import { tirerEntier } from "../calculPrimitives/aleatoire";

/**
 * Couche A (6e) — génération, famille C ("Division par conjugué") de `6gen34`. a,b,c,d entiers
 * simples ∈[-6;6], (c,d)≠(0,0) (spec). Le cas particulier d'un simple inverse 1/(c+di) (a=1,b=0) est
 * tiré délibérément avec une probabilité non négligeable (≈1/5, voir `PROBABILITE_CAS_INVERSE`)
 * plutôt que laissé au hasard pur — spec explicite ("incluant le cas particulier") : sur un tirage
 * a,b∈[-6;6] entièrement libre, {a=1,b=0} n'apparaîtrait qu'1 fois sur 169, trop rare pour être
 * couvert de façon fiable par la session de démonstration.
 */

const COEFF_MIN = -6;
const COEFF_MAX = 6;
const PROBABILITE_CAS_INVERSE = 0.2;

function tirerDenominateurNonNul(): { c: number; d: number } {
  let c = 0;
  let d = 0;
  while (c === 0 && d === 0) {
    c = tirerEntier(COEFF_MIN, COEFF_MAX);
    d = tirerEntier(COEFF_MIN, COEFF_MAX);
  }
  return { c, d };
}

export function construireFamilleC(): ExerciceFamilleC {
  const casInverse = Math.random() < PROBABILITE_CAS_INVERSE;
  const a = casInverse ? 1 : tirerEntier(COEFF_MIN, COEFF_MAX);
  const b = casInverse ? 0 : tirerEntier(COEFF_MIN, COEFF_MAX);
  const { c, d } = tirerDenominateurNonNul();

  const numerateurDeveloppe = { re: a * c + b * d, im: b * c - a * d };
  const denominateurDeveloppe = c * c + d * d;

  const { reFrac, imFrac } = diviserComplexeExact({ re: a, im: b }, { re: c, im: d });
  const resultat = { re: valeurFraction(reFrac), im: valeurFraction(imFrac) };

  return { famille: "C", a, b, c, d, numerateurDeveloppe, denominateurDeveloppe, resultat };
}
