import type { ExerciceFamilleE } from "../../core6e/nombresComplexes.types";
import { additionnerFractions, diviserComplexeExact, valeurFraction } from "./fractionComplexe";
import { tirerEntier } from "../calculPrimitives/aleatoire";

/**
 * Couche A (6e) — génération, famille E ("Combiner 2 fractions à dénominateurs différents") de
 * `6gen34`. Chaque fraction (a_i+b_i·i)/(c_i+d_i·i) tirée indépendamment (mêmes bornes/contrainte de
 * dénominateur non nul que la famille C, réutilisation Couche A ↔ Couche A) — spec : un facteur
 * commun entre les 2 résultats intermédiaires est SOUHAITÉ dans l'exemple source mais explicitement
 * PAS une exigence stricte du générateur ("sans que ce soit une exigence stricte... accepter aussi
 * les cas sans facteur commun") : un tirage pleinement indépendant satisfait donc la spec telle
 * quelle, sans biais artificiel à maintenir.
 */

const COEFF_MIN = -6;
const COEFF_MAX = 6;

function tirerDenominateurNonNul(): { c: number; d: number } {
  let c = 0;
  let d = 0;
  while (c === 0 && d === 0) {
    c = tirerEntier(COEFF_MIN, COEFF_MAX);
    d = tirerEntier(COEFF_MIN, COEFF_MAX);
  }
  return { c, d };
}

function tirerUneFraction(): { a: number; b: number; c: number; d: number; valeur: { re: number; im: number } } {
  const a = tirerEntier(COEFF_MIN, COEFF_MAX);
  const b = tirerEntier(COEFF_MIN, COEFF_MAX);
  const { c, d } = tirerDenominateurNonNul();
  const { reFrac, imFrac } = diviserComplexeExact({ re: a, im: b }, { re: c, im: d });
  return { a, b, c, d, valeur: { re: valeurFraction(reFrac), im: valeurFraction(imFrac) } };
}

export function construireFamilleE(): ExerciceFamilleE {
  const f1 = tirerUneFraction();
  const f2 = tirerUneFraction();

  const { reFrac: reFrac1, imFrac: imFrac1 } = diviserComplexeExact({ re: f1.a, im: f1.b }, { re: f1.c, im: f1.d });
  const { reFrac: reFrac2, imFrac: imFrac2 } = diviserComplexeExact({ re: f2.a, im: f2.b }, { re: f2.c, im: f2.d });
  const sommeRe = additionnerFractions(reFrac1, reFrac2);
  const sommeIm = additionnerFractions(imFrac1, imFrac2);

  return {
    famille: "E",
    a1: f1.a,
    b1: f1.b,
    c1: f1.c,
    d1: f1.d,
    a2: f2.a,
    b2: f2.b,
    c2: f2.c,
    d2: f2.d,
    fraction1: f1.valeur,
    fraction2: f2.valeur,
    resultat: { re: valeurFraction(sommeRe), im: valeurFraction(sommeIm) },
  };
}
