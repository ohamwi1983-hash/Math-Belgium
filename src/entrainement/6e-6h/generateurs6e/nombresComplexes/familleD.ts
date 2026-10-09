import type { ExerciceFamilleD } from "../../core6e/nombresComplexes.types";
import { diviserComplexeExact, valeurFraction } from "./fractionComplexe";
import { tirerEntier, tirerParmi } from "../calculPrimitives/aleatoire";

/**
 * Couche A (6e) — génération, famille D ("Division par i, cas particulier") de `6gen34`. a,b
 * entiers simples ∈[-6;6], k∈{1,2,3} — k=1 tiré comme le cas LE PLUS FRÉQUENT (spec explicite),
 * via une banque pondérée plutôt qu'un poids ad hoc.
 */

const COEFF_MIN = -6;
const COEFF_MAX = 6;
/** k=1 apparaît 3 fois plus souvent que 2 ou 3 (spec : "le cas le plus fréquent"). */
const BANQUE_K = [1, 1, 1, 2, 3] as const;

export function construireFamilleD(): ExerciceFamilleD {
  const a = tirerEntier(COEFF_MIN, COEFF_MAX);
  const b = tirerEntier(COEFF_MIN, COEFF_MAX);
  const k = tirerParmi(BANQUE_K);

  const { reFrac, imFrac } = diviserComplexeExact({ re: a, im: b }, { re: 0, im: k });
  const resultat = { re: valeurFraction(reFrac), im: valeurFraction(imFrac) };

  return { famille: "D", a, b, k, resultat };
}
