import type { CandidatDeriveeLogB, ExerciceGraphiqueDeriveeLogB } from "../../../core6e/graphiqueDeriveeLogarithme.types";
import { melangerAvecIndexCorrect, tirerParmi } from "../aleatoire";

const K_VALEURS = [-3, -2, -1, 1, 2, 3] as const;
/** Coefficient de x dans e^(ax) — a·ln(x)+1/x reste strictement positive pour a∈{1,2}. */
const A_VALEURS = [1, 2] as const;
/** Décalage vertical de f — ne change rien à f'. */
const CONSTANTES_C = [-1, 0, 1] as const;

/**
 * Famille B — `f(x) = k·e^(ax)·ln(x) + c`. 2 écrans : `f'(x) = k·e^(ax)·[a·ln(x)+1/x]` — cette
 * parenthèse est TOUJOURS strictement positive pour a∈{1,2}, donc le signe de `f'` est celui de k,
 * JAMAIS nul (f n'a aucun extremum).
 */
export function construireB(): ExerciceGraphiqueDeriveeLogB {
  const k = tirerParmi(K_VALEURS);
  const a = tirerParmi(A_VALEURS);

  const reel: CandidatDeriveeLogB = { k, a, type: "reel" };
  const signeInverse: CandidatDeriveeLogB = { k, a, type: "signeInverse" };
  const traverseZero: CandidatDeriveeLogB = { k, a, type: "traverseZero" };
  const borneMauvaise: CandidatDeriveeLogB = { k, a, type: "borneMauvaise" };

  const { candidats, indexCorrect } = melangerAvecIndexCorrect([reel, signeInverse, traverseZero, borneMauvaise]);
  return { famille: "B", k, a, c: tirerParmi(CONSTANTES_C), candidats, indexCorrect };
}

export { K_VALEURS as B_K_VALEURS, A_VALEURS as B_A_VALEURS };
