import type { ExerciceHyperboliquesD } from "../../../core6e/hyperboliques.types";
import { tirerCoefficientNonNul } from "../aleatoire";

/** f(x) = a·sh(x) + b·ch(x), a,b∈{-3,...,-1,1,...,3}, en EXCLUANT a+b=0 et a=b (cas limites non
 * génériques, spec explicite — voir `core6e/hyperboliques.types.ts`). Tirage par rejet, jamais
 * plus de quelques essais en pratique (36 couples possibles, seuls 2×3=6 rejetés : a=-b et a=b). */
export function construireD(): ExerciceHyperboliquesD {
  let a = 0;
  let b = 0;
  do {
    a = tirerCoefficientNonNul();
    b = tirerCoefficientNonNul();
  } while (a + b === 0 || a === b);
  return { famille: "D", a, b };
}
