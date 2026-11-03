import type { CandidatDeriveeLogC, ExerciceGraphiqueDeriveeLogC } from "../../../core6e/graphiqueDeriveeLogarithme.types";
import { melangerAvecIndexCorrect, tirerParmi } from "../aleatoire";

const K_VALEURS = [-3, -2, -1, 1, 2, 3] as const;
/** Coefficient du terme p·x — déplace l'extremum de f (zéro de f' en x = e^(−1−p/k)). */
const P_VALEURS = [-1, 0, 1] as const;


/**
 * Famille C — `f(x) = k·x·ln(x) + p·x + c`. 2 écrans : `f'(x) = k·(ln(x)+1) + p = k·(ln(x)+s)`,
 * s = 1+p/k — le zéro de `f'` (l'extremum de f) est en x = e^(−s) ; cette dérivée est ELLE-MÊME
 * monotone (croissante si k>0, décroissante si k<0). Distracteur "zeroMalPlace" : même courbe
 * monotone, zéro décalé d'un facteur e (s±1) — la fenêtre X, centrée sur l'extremum (voir
 * `fenetreX`), le garde toujours visible.
 */
export function construireC(): ExerciceGraphiqueDeriveeLogC {
  const k = tirerParmi(K_VALEURS);
  const p = tirerParmi(P_VALEURS);
  const s = 1 + p / k;

  const reel: CandidatDeriveeLogC = { k, type: "reel", constanteAdditive: s };
  const signeInverse: CandidatDeriveeLogC = { k, type: "signeInverse", constanteAdditive: s };
  const zeroMalPlace: CandidatDeriveeLogC = { k, type: "zeroMalPlace", constanteAdditive: tirerParmi([s + 1, s - 1]) };
  const formeEnPic: CandidatDeriveeLogC = { k, type: "formeEnPic", constanteAdditive: s };

  const { candidats, indexCorrect } = melangerAvecIndexCorrect([reel, signeInverse, zeroMalPlace, formeEnPic]);
  // c = 0 : un décalage vertical forcerait l'axe y=0 dans le cadre (axes toujours visibles) et
  // écraserait le creux de f autour de x0.
  return { famille: "C", k, p, c: 0, candidats, indexCorrect };
}

export { K_VALEURS as C_K_VALEURS, P_VALEURS as C_P_VALEURS };
