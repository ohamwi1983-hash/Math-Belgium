import type { ExerciceHyperboliquesC } from "../../../core6e/hyperboliques.types";
import { tirerCoefficientNonNul, tirerEntier } from "../aleatoire";

/** f(x) = a·sh(kx) + b·ch(kx), a,b∈{-3,...,-1,1,...,3}, k∈{1,2,3} (spec littérale). */
export function construireC(overrides?: { a?: number; b?: number; k?: number }): ExerciceHyperboliquesC {
  return {
    famille: "C",
    a: overrides?.a ?? tirerCoefficientNonNul(),
    b: overrides?.b ?? tirerCoefficientNonNul(),
    k: overrides?.k ?? tirerEntier(1, 3),
  };
}
