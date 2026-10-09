import type { ExerciceFamilleF, SousTypeF } from "../../../core6e/calculPrimitives.types";
import { tirerEntierNonNul, tirerParmi } from "../aleatoire";

/**
 * Couche A (6e) — génération, famille F ("Identités trigonométriques") de `6gen23`. PAS de contrat
 * de réutilisation en aval (D/E/F exclues). 6 sous-types (spec : "plusieurs sous-types", pas de
 * nombre fixé — 2 variantes sin/cos comptées séparément pour l'angle double et la puissance impaire,
 * afin que le panneau dev puisse forcer chaque variante distinctement, point 10 des clarifications) :
 * - "tan" : k·tan(x) = k·sin(x)/cos(x) → primitive -k·ln|cos(x)|.
 * - "angleDoubleSin"/"angleDoubleCos" : k·sin²(x)/k·cos²(x) via cos(2x)=1-2sin²x=2cos²x-1.
 * - "pythagoreanFactor" : k·sin²(x)/(1-cos(x)) = k(1+cos(x)) via sin²x=(1-cosx)(1+cosx).
 * - "oddPowerSin"/"oddPowerCos" : k·sin³(x)/k·cos³(x), séparation d'un facteur pour u=cos(x)/sin(x).
 */

const TOUS_SOUS_TYPES: SousTypeF[] = ["tan", "angleDoubleSin", "angleDoubleCos", "pythagoreanFactor", "oddPowerSin", "oddPowerCos"];

function construireAvecSousType(sousType: SousTypeF): ExerciceFamilleF {
  const k = tirerEntierNonNul(1, 4);
  let integrandeReference: (x: number) => number;
  let rewrittenReference: (x: number) => number;
  let primitiveReference: (x: number) => number;

  switch (sousType) {
    case "tan":
      integrandeReference = (x) => k * Math.tan(x);
      rewrittenReference = (x) => (k * Math.sin(x)) / Math.cos(x);
      primitiveReference = (x) => -k * Math.log(Math.abs(Math.cos(x)));
      break;
    case "angleDoubleSin":
      integrandeReference = (x) => k * Math.pow(Math.sin(x), 2);
      rewrittenReference = (x) => (k * (1 - Math.cos(2 * x))) / 2;
      primitiveReference = (x) => (k * x) / 2 - (k * Math.sin(2 * x)) / 4;
      break;
    case "angleDoubleCos":
      integrandeReference = (x) => k * Math.pow(Math.cos(x), 2);
      rewrittenReference = (x) => (k * (1 + Math.cos(2 * x))) / 2;
      primitiveReference = (x) => (k * x) / 2 + (k * Math.sin(2 * x)) / 4;
      break;
    case "pythagoreanFactor":
      integrandeReference = (x) => (k * Math.pow(Math.sin(x), 2)) / (1 - Math.cos(x));
      rewrittenReference = (x) => k * (1 + Math.cos(x));
      primitiveReference = (x) => k * (x + Math.sin(x));
      break;
    case "oddPowerSin":
      integrandeReference = (x) => k * Math.pow(Math.sin(x), 3);
      rewrittenReference = (x) => k * Math.sin(x) * (1 - Math.pow(Math.cos(x), 2));
      primitiveReference = (x) => k * (-Math.cos(x) + Math.pow(Math.cos(x), 3) / 3);
      break;
    case "oddPowerCos":
      integrandeReference = (x) => k * Math.pow(Math.cos(x), 3);
      rewrittenReference = (x) => k * Math.cos(x) * (1 - Math.pow(Math.sin(x), 2));
      primitiveReference = (x) => k * (Math.sin(x) - Math.pow(Math.sin(x), 3) / 3);
      break;
  }

  return { famille: "F", sousType, k, rewrittenReference, primitiveReference, integrandeReference };
}

export function construireFamilleFTan(): ExerciceFamilleF {
  return construireAvecSousType("tan");
}
export function construireFamilleFAngleDoubleSin(): ExerciceFamilleF {
  return construireAvecSousType("angleDoubleSin");
}
export function construireFamilleFAngleDoubleCos(): ExerciceFamilleF {
  return construireAvecSousType("angleDoubleCos");
}
export function construireFamilleFPythagoreanFactor(): ExerciceFamilleF {
  return construireAvecSousType("pythagoreanFactor");
}
export function construireFamilleFOddPowerSin(): ExerciceFamilleF {
  return construireAvecSousType("oddPowerSin");
}
export function construireFamilleFOddPowerCos(): ExerciceFamilleF {
  return construireAvecSousType("oddPowerCos");
}

/** Tirage équiprobable du sous-type. */
export function construireFamilleF(): ExerciceFamilleF {
  return construireAvecSousType(tirerParmi(TOUS_SOUS_TYPES));
}
