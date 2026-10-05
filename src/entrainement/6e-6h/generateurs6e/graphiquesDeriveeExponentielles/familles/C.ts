import type { CandidatDeriveeC, ExerciceGraphiqueDeriveeC } from "../../../core6e/graphiquesDeriveeExponentielles.types";
import { melangerAvecIndexCorrect, tirerAutre, tirerParmi } from "../aleatoire";

const K_VALEURS = [1, 2, 3] as const;

/**
 * Famille C — `f(x) = (e^(kx)+e^(-kx))/2`, `k∈{1,2,3}`. Écran unique (QCM direct) :
 * `f'(x) = k·(e^(kx)-e^(-kx))/2`, IMPAIRE, strictement croissante, NON BORNÉE, passe par (0,0).
 */
export function construireC(): ExerciceGraphiqueDeriveeC {
  const k = tirerParmi(K_VALEURS);
  const reel: CandidatDeriveeC = { k, type: "reel", facteurAffiche: k };

  const paire: CandidatDeriveeC = { k, type: "paire", facteurAffiche: k };
  const bornee: CandidatDeriveeC = { k, type: "bornee", facteurAffiche: k };
  const facteurErrone = tirerAutre(k, K_VALEURS);
  const echelle: CandidatDeriveeC = { k, type: "echelle", facteurAffiche: facteurErrone };

  const { candidats, indexCorrect } = melangerAvecIndexCorrect([reel, paire, bornee, echelle]);
  return { famille: "C", k, candidats, indexCorrect };
}

export { K_VALEURS as C_K_VALEURS };
