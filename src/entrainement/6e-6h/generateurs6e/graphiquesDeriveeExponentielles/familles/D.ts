import type { CandidatDeriveeD, ExerciceGraphiqueDeriveeD } from "../../../core6e/graphiquesDeriveeExponentielles.types";
import { melangerAvecIndexCorrect, tirerParmi } from "../aleatoire";

const K_VALEURS = [-2, -1, 1, 2] as const;

/**
 * Famille D — `f(x) = 1/(e^(kx)-1)`, `k∈{-2,-1,1,2}`. 2 écrans : `f'(x) = -k·e^(kx)/(e^(kx)-1)²` —
 * point exclu `x=0` (quel que soit `k`), signe de `f'` constant (déterminé par `-k`).
 */
export function construireD(): ExerciceGraphiqueDeriveeD {
  const k = tirerParmi(K_VALEURS);
  const reel: CandidatDeriveeD = { k, type: "reel" };

  const signeInverse: CandidatDeriveeD = { k, type: "signeInverse" };
  const continu: CandidatDeriveeD = { k, type: "continu" };
  const sansCarre: CandidatDeriveeD = { k, type: "sansCarre" };

  const { candidats, indexCorrect } = melangerAvecIndexCorrect([reel, signeInverse, continu, sansCarre]);
  return { famille: "D", k, candidats, indexCorrect };
}

export { K_VALEURS as D_K_VALEURS };
