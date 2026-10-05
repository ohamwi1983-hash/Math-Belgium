import type { CandidatDeriveeA, ExerciceGraphiqueDeriveeA } from "../../../core6e/graphiquesDeriveeExponentielles.types";
import { melangerAvecIndexCorrect, tirerParmi } from "../aleatoire";

const A_VALEURS = [-3, -2, -1, 1, 2, 3] as const;
/** Pool de décalages, jamais `0` (sinon le distracteur "extremum mal placé" coïnciderait avec le
 * réel — voir preuve dans le core). */
const DECALAGE_VALEURS = [-3, -2, -1, 1, 2, 3] as const;

/**
 * Famille A — `f(x) = a·x·e^x`, `a∈{-3,-2,-1,1,2,3}`. Écran unique (QCM direct) : `f'(x) =
 * a·e^x·(1+x)`, dont l'EXTREMUM (celui de la courbe f' elle-même) est toujours en `x=-2`, quel
 * que soit `a` — preuve : `d/dx[a·e^x(1+x)] = a·e^x(2+x)`, nul en `x=-2`.
 */
export function construireA(): ExerciceGraphiqueDeriveeA {
  const a = tirerParmi(A_VALEURS);
  const reel: CandidatDeriveeA = { a, decalageExtremum: 0, monotone: false };

  const signeInverse: CandidatDeriveeA = { a: -a, decalageExtremum: 0, monotone: false };
  const extremumMalPlace: CandidatDeriveeA = { a, decalageExtremum: tirerParmi(DECALAGE_VALEURS), monotone: false };
  const versionMonotone: CandidatDeriveeA = { a, decalageExtremum: 0, monotone: true };

  const { candidats, indexCorrect } = melangerAvecIndexCorrect([reel, signeInverse, extremumMalPlace, versionMonotone]);
  return { famille: "A", a, candidats, indexCorrect };
}

export { A_VALEURS, DECALAGE_VALEURS as A_DECALAGE_VALEURS };
