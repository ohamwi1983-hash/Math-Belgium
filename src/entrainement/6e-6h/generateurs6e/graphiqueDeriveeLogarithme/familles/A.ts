import type { CandidatDeriveeLogA, ExerciceGraphiqueDeriveeLogA } from "../../../core6e/graphiqueDeriveeLogarithme.types";
import { melangerAvecIndexCorrect, tirerParmi } from "../aleatoire";

const K_VALEURS = [-3, -2, -1, 1, 2, 3] as const;
/** `base∈{2,3,5,7}∪{e}` — 5 options équiprobables (spec : "base∈{2,3,5,7}∪{e}", tirage uniforme
 * parmi ces 5 valeurs, `"e"` un marqueur interne remplacé par `Math.E`/`baseEstE=true`). */
const BASES_OPTIONS = [2, 3, 5, 7, "e"] as const;
/** Pool de constantes pour le distracteur "zéro mal placé" — jamais `1` (sinon son zéro
 * coïnciderait avec x=e du candidat réel, cf. `constanteNumerateur`). */
const CONSTANTES_ZERO_MAL_PLACE = [-1, 0, 2, 3] as const;

function tirerBase(): { base: number; baseEstE: boolean } {
  const choix = tirerParmi(BASES_OPTIONS);
  return choix === "e" ? { base: Math.E, baseEstE: true } : { base: choix, baseEstE: false };
}

/**
 * Famille A — `f(x) = k·log_base(x)/x`. 2 écrans : `f'(x) = k·[1−ln(x)]/(x²·ln(base))` (ou sans le
 * `ln(base)` si `base=e`) — le zéro de `f'` est TOUJOURS en x=e, quels que soient k et base ; la
 * courbe n'est PAS monotone (pic).
 */
export function construireA(): ExerciceGraphiqueDeriveeLogA {
  const { base, baseEstE } = tirerBase();
  const k = tirerParmi(K_VALEURS);

  const reel: CandidatDeriveeLogA = { k, base, baseEstE, type: "reel", constanteNumerateur: 1 };
  const signeInverse: CandidatDeriveeLogA = { k, base, baseEstE, type: "signeInverse", constanteNumerateur: 1 };
  const zeroMalPlace: CandidatDeriveeLogA = { k, base, baseEstE, type: "zeroMalPlace", constanteNumerateur: tirerParmi(CONSTANTES_ZERO_MAL_PLACE) };
  const monotone: CandidatDeriveeLogA = { k, base, baseEstE, type: "monotone", constanteNumerateur: 1 };

  const { candidats, indexCorrect } = melangerAvecIndexCorrect([reel, signeInverse, zeroMalPlace, monotone]);
  return { famille: "A", k, base, baseEstE, candidats, indexCorrect };
}

export { K_VALEURS as A_K_VALEURS, BASES_OPTIONS as A_BASES_OPTIONS, CONSTANTES_ZERO_MAL_PLACE as A_CONSTANTES_ZERO_MAL_PLACE };
