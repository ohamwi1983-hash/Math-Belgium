import type { CandidatDeriveeLogC, ExerciceGraphiqueDeriveeLogC } from "../../../core6e/graphiqueDeriveeLogarithme.types";
import { melangerAvecIndexCorrect, tirerParmi } from "../aleatoire";

const K_VALEURS = [-3, -2, -1, 1, 2, 3] as const;
/** Pool de constantes pour le distracteur "zéro mal placé" — jamais `1` (sinon son zéro
 * coïnciderait avec x=1/e du candidat réel, cf. `constanteAdditive`). */
const CONSTANTES_ZERO_MAL_PLACE = [-1, 0, 2, 3] as const;

/**
 * Famille C — `f(x) = k·x·ln(x)`. 2 écrans : `f'(x) = k·(ln(x)+1)` — le zéro de `f'` est TOUJOURS
 * en x=1/e, quel que soit k ; contrairement à la famille A, cette dérivée est ELLE-MÊME monotone
 * (croissante si k>0, décroissante si k<0).
 */
export function construireC(): ExerciceGraphiqueDeriveeLogC {
  const k = tirerParmi(K_VALEURS);

  const reel: CandidatDeriveeLogC = { k, type: "reel", constanteAdditive: 1 };
  const signeInverse: CandidatDeriveeLogC = { k, type: "signeInverse", constanteAdditive: 1 };
  const zeroMalPlace: CandidatDeriveeLogC = { k, type: "zeroMalPlace", constanteAdditive: tirerParmi(CONSTANTES_ZERO_MAL_PLACE) };
  const formeEnPic: CandidatDeriveeLogC = { k, type: "formeEnPic", constanteAdditive: 1 };

  const { candidats, indexCorrect } = melangerAvecIndexCorrect([reel, signeInverse, zeroMalPlace, formeEnPic]);
  return { famille: "C", k, candidats, indexCorrect };
}

export { K_VALEURS as C_K_VALEURS, CONSTANTES_ZERO_MAL_PLACE as C_CONSTANTES_ZERO_MAL_PLACE };
