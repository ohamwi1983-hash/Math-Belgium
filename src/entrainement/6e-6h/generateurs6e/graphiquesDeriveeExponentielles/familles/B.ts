import type { CandidatDeriveeB, ExerciceGraphiqueDeriveeB } from "../../../core6e/graphiquesDeriveeExponentielles.types";
import { melangerAvecIndexCorrect, tirerParmi } from "../aleatoire";

const BASE_SUPERIEURE_A_1 = [2, 3, 4] as const;
const BASE_INFERIEURE_A_1 = [0.5, 0.25, 0.2] as const;
/** Pool de décalages, jamais `0` (sinon le distracteur "position décalée" coïnciderait avec le
 * réel — la bosse est symétrique autour de x=0, un décalage non nul déplace vraiment le pic). */
const DECALAGE_VALEURS = [-2, -1, 1, 2] as const;

/**
 * Famille B — `f(x) = base^x/(base^x+1)`, `base∈{2,3,4}` (>1) ou `{0,5;0,25;0,2}` (<1). 2 écrans :
 * `f'(x) = base^x·ln(base)/(base^x+1)²` — le signe de `f'` est constant sur ℝ (déterminé
 * uniquement par le signe de `ln(base)`), une courbe en bosse dont le pic est en `x=0`.
 */
export function construireB(): ExerciceGraphiqueDeriveeB {
  const base = Math.random() < 0.5 ? tirerParmi(BASE_SUPERIEURE_A_1) : tirerParmi(BASE_INFERIEURE_A_1);
  const reel: CandidatDeriveeB = { base, type: "reel", decalage: 0 };

  const signeInverse: CandidatDeriveeB = { base, type: "signeInverse", decalage: 0 };
  const traverseZero: CandidatDeriveeB = { base, type: "traverseZero", decalage: 0 };
  const positionDecalee: CandidatDeriveeB = { base, type: "positionDecalee", decalage: tirerParmi(DECALAGE_VALEURS) };

  const { candidats, indexCorrect } = melangerAvecIndexCorrect([reel, signeInverse, traverseZero, positionDecalee]);
  return { famille: "B", base, candidats, indexCorrect };
}

export { BASE_SUPERIEURE_A_1 as B_BASE_SUPERIEURE_A_1, BASE_INFERIEURE_A_1 as B_BASE_INFERIEURE_A_1, DECALAGE_VALEURS as B_DECALAGE_VALEURS };
