import type { ExerciceHyperboliquesD } from "../../../core6e/hyperboliques.types";
import { tirerParmi } from "../aleatoire";

const COEFFICIENTS_D = [-4, -3, -2, -1, 1, 2, 3, 4] as const;

/** f(x) = a·sh(x) + b·ch(x), a,b∈{-4,...,-1,1,...,4}, en EXCLUANT a+b=0 et a=b (cas limites non
 * génériques — voir `core6e/hyperboliques.types.ts`). Tirage par rejet (64 couples, 16 rejetés :
 * a=-b et a=b), 48 exercices distincts. */
export function construireD(): ExerciceHyperboliquesD {
  let a = 0;
  let b = 0;
  do {
    a = tirerParmi(COEFFICIENTS_D);
    b = tirerParmi(COEFFICIENTS_D);
  } while (a + b === 0 || a === b);
  return { famille: "D", a, b };
}
