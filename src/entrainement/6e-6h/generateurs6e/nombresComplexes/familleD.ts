import type { ExerciceFamilleD } from "../../core6e/nombresComplexes.types";
import { diviserComplexeExact, valeurFraction } from "./fractionComplexe";
import { tirerParmi } from "../calculPrimitives/aleatoire";
import { tirerCasParticulier, tirerNonNul } from "./casParticuliers";

/**
 * Couche A (6e) — famille D (« Division par ki ») de `6gen34`. k ∈ {1, 2, 4, 5} (plus de k=3 : un
 * résultat en tiers ne s'écrit pas sans « / ») ; cas particulier (~10 %) : numérateur réel ou
 * imaginaire pur.
 */

const COEFF_MAX = 6;
const BANQUE_K = [1, 1, 2, 2, 4, 5] as const;

export function construireFamilleD(): ExerciceFamilleD {
  let a = tirerNonNul(-COEFF_MAX, COEFF_MAX);
  let b = tirerNonNul(-COEFF_MAX, COEFF_MAX);
  if (tirerCasParticulier()) {
    if (Math.random() < 0.5) a = 0;
    else b = 0;
  }
  const k = tirerParmi(BANQUE_K);
  const { reFrac, imFrac } = diviserComplexeExact({ re: a, im: b }, { re: 0, im: k });
  const resultat = { re: valeurFraction(reFrac), im: valeurFraction(imFrac) };
  return { famille: "D", a, b, k, resultat };
}
