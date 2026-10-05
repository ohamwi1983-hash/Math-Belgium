import type { CandidatA, ExerciceGraphiqueA } from "../../../core6e/graphiquesCyclometriques.types";
import { melangerAvecIndexCorrect, tirerAutre, tirerParmi } from "../aleatoire";
import { calculerProprietesA } from "../proprietes";

const M_VALEURS = [1, 2, 3] as const;
const N_VALEURS = [-4, -3, -2, -1, 0, 1, 2, 3, 4] as const;
const K_VALEURS = [-3, -2, -1, 1, 2, 3] as const;
const C_VALEURS = [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5] as const;

/**
 * Famille A — `f(x) = c + k·arcfonction(mx+n)`, arcfonction∈{arcsin,arccos}. Écran unique
 * (sélection directe) : les 3 distracteurs répliquent chacun l'un des 3 pièges nommés de la spec.
 */
export function construireA(): ExerciceGraphiqueA {
  const arcfonction = tirerParmi(["arcsin", "arccos"] as const);
  const m = tirerParmi(M_VALEURS);
  const n = tirerParmi(N_VALEURS);
  const k = tirerParmi(K_VALEURS);
  const c = tirerParmi(C_VALEURS);
  const reel: CandidatA = { m, n, k, c, arcfonction };

  const domaineDecale: CandidatA = { ...reel, n: tirerAutre(n, N_VALEURS) };

  const sensInverse: CandidatA =
    Math.random() < 0.5
      ? { ...reel, arcfonction: arcfonction === "arcsin" ? "arccos" : "arcsin" }
      : { ...reel, k: -k };

  const echelleIncorrecte: CandidatA =
    Math.random() < 0.5 ? { ...reel, c: tirerAutre(c, C_VALEURS) } : { ...reel, k: tirerAutre(k, K_VALEURS) };

  const { candidats, indexCorrect } = melangerAvecIndexCorrect([reel, domaineDecale, sensInverse, echelleIncorrecte]);
  return { famille: "A", reel, proprietes: calculerProprietesA(reel), candidats, indexCorrect };
}

export { M_VALEURS as A_M_VALEURS, N_VALEURS as A_N_VALEURS, K_VALEURS as A_K_VALEURS, C_VALEURS as A_C_VALEURS };
