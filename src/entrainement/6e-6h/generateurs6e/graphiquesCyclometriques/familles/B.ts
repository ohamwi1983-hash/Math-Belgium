import type { CandidatB, ExerciceGraphiqueB } from "../../../core6e/graphiquesCyclometriques.types";
import { melangerAvecIndexCorrect, tirerAutre, tirerParmi } from "../aleatoire";
import { calculerProprietesB } from "../proprietes";

const M_VALEURS = [-3, -2, -1, 1, 2, 3] as const;
const N_VALEURS = [-4, -3, -2, -1, 0, 1, 2, 3, 4] as const;
const K_VALEURS = [-3, -2, -1, 1, 2, 3] as const;
const C_VALEURS = [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5] as const;

/**
 * Famille B — `f(x) = c + k·arctan(mx+n)`. Écran unique (sélection directe) : les 3 distracteurs
 * répliquent chacun l'un des 3 pièges nommés de la spec (asymptotes/sens/niveaux).
 */
export function construireB(): ExerciceGraphiqueB {
  const m = tirerParmi(M_VALEURS);
  const n = tirerParmi(N_VALEURS);
  const k = tirerParmi(K_VALEURS);
  const c = tirerParmi(C_VALEURS);
  const reel: CandidatB = { m, n, k, c };

  const asymptotesDecalees: CandidatB = { ...reel, n: tirerAutre(n, N_VALEURS) };

  const sensInverse: CandidatB = Math.random() < 0.5 ? { ...reel, k: -k } : { ...reel, m: -m };

  const niveauxIncorrects: CandidatB =
    Math.random() < 0.5 ? { ...reel, c: tirerAutre(c, C_VALEURS) } : { ...reel, k: tirerAutre(k, K_VALEURS) };

  const { candidats, indexCorrect } = melangerAvecIndexCorrect([reel, asymptotesDecalees, sensInverse, niveauxIncorrects]);
  return { famille: "B", reel, proprietes: calculerProprietesB(reel), candidats, indexCorrect };
}

export { M_VALEURS as B_M_VALEURS, N_VALEURS as B_N_VALEURS, K_VALEURS as B_K_VALEURS, C_VALEURS as B_C_VALEURS };
