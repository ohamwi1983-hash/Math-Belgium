import type { CandidatDeriveeLogC, ExerciceGraphiqueDeriveeLogC } from "../../../core6e/graphiqueDeriveeLogarithme.types";
import { melangerAvecIndexCorrect, tirerParmi } from "../aleatoire";

const K_VALEURS = [-3, -2, -1, 1, 2, 3] as const;
/** Coefficient du terme p·x — déplace l'extremum de f (zéro de f' en x = e^(−1−p/k)). */
const P_VALEURS = [-1, 0, 1] as const;
/** Décalage vertical de f — ne change rien à f'. */
const CONSTANTES_C = [-1, 0, 1] as const;

/** Bornes de la fenêtre X de la famille C (voir `fenetreX`, `ui6e/formatGraphiqueDeriveeLogarithme.ts`)
 * — un zéro de distracteur doit y rester nettement visible. */
const ZERO_VISIBLE_MIN = 0.06;
const ZERO_VISIBLE_MAX = 2.3;

/**
 * Famille C — `f(x) = k·x·ln(x) + p·x + c`. 2 écrans : `f'(x) = k·(ln(x)+1) + p = k·(ln(x)+s)`,
 * s = 1+p/k — le zéro de `f'` (l'extremum de f) est en x = e^(−s) ; cette dérivée est ELLE-MÊME
 * monotone (croissante si k>0, décroissante si k<0). Distracteur "zeroMalPlace" : même droite
 * monotone, zéro décalé d'un facteur e (s±1), toujours visible dans la fenêtre.
 */
export function construireC(): ExerciceGraphiqueDeriveeLogC {
  const k = tirerParmi(K_VALEURS);
  const p = tirerParmi(P_VALEURS);
  const s = 1 + p / k;
  const decalages = [s + 1, s - 1].filter((sp) => Math.exp(-sp) >= ZERO_VISIBLE_MIN && Math.exp(-sp) <= ZERO_VISIBLE_MAX);

  const reel: CandidatDeriveeLogC = { k, type: "reel", constanteAdditive: s };
  const signeInverse: CandidatDeriveeLogC = { k, type: "signeInverse", constanteAdditive: s };
  const zeroMalPlace: CandidatDeriveeLogC = { k, type: "zeroMalPlace", constanteAdditive: tirerParmi(decalages) };
  const formeEnPic: CandidatDeriveeLogC = { k, type: "formeEnPic", constanteAdditive: s };

  const { candidats, indexCorrect } = melangerAvecIndexCorrect([reel, signeInverse, zeroMalPlace, formeEnPic]);
  return { famille: "C", k, p, c: tirerParmi(CONSTANTES_C), candidats, indexCorrect };
}

export { K_VALEURS as C_K_VALEURS, P_VALEURS as C_P_VALEURS };
