import type { CandidatDeriveeLogB, ExerciceGraphiqueDeriveeLogB } from "../../../core6e/graphiqueDeriveeLogarithme.types";
import { melangerAvecIndexCorrect, tirerParmi } from "../aleatoire";

const K_VALEURS = [-3, -2, -1, 1, 2, 3] as const;

/**
 * Famille B — `f(x) = k·e^x·ln(x)`. 2 écrans : `f'(x) = k·e^x·[ln(x)+1/x]` — `ln(x)+1/x ≥ 1` pour
 * tout x>0 (minimum en x=1), donc cette parenthèse est TOUJOURS strictement positive : le signe de
 * `f'` est entièrement déterminé par le signe de k, JAMAIS nul.
 */
export function construireB(): ExerciceGraphiqueDeriveeLogB {
  const k = tirerParmi(K_VALEURS);

  const reel: CandidatDeriveeLogB = { k, type: "reel" };
  const signeInverse: CandidatDeriveeLogB = { k, type: "signeInverse" };
  const traverseZero: CandidatDeriveeLogB = { k, type: "traverseZero" };
  const borneMauvaise: CandidatDeriveeLogB = { k, type: "borneMauvaise" };

  const { candidats, indexCorrect } = melangerAvecIndexCorrect([reel, signeInverse, traverseZero, borneMauvaise]);
  return { famille: "B", k, candidats, indexCorrect };
}

export { K_VALEURS as B_K_VALEURS };
