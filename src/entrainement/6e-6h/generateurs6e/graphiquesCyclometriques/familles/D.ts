import type { CandidatD, ExerciceGraphiqueD } from "../../../core6e/graphiquesCyclometriques.types";
import { melangerAvecIndexCorrect, tirerAutre, tirerParmi } from "../aleatoire";
import { calculerProprietesD } from "../proprietes";

const K_VALEURS = [-3, -2, -1, 1, 2, 3] as const;
const P_VALEURS = [-3, -2, -1, 0, 1, 2, 3] as const;
const C_VALEURS = [-3, -2, -1, 0, 1, 2, 3] as const;

/**
 * Famille D — `f(x) = c + arctan(k/(x-p))`. Écran 1 : donner la valeur exclue du domaine (x=p).
 * Écran 2 : sélectionner le bon graphique — piège central "domaine continu" (distracteur qui
 * remplace `k/(x-p)` par `k·(x-p)`, supprimant la singularité, jamais un simple clip visuel).
 */
export function construireD(): ExerciceGraphiqueD {
  const k = tirerParmi(K_VALEURS);
  const p = tirerParmi(P_VALEURS);
  const c = tirerParmi(C_VALEURS);
  const reel: CandidatD = { k, p, c, continu: false };

  const domaineContinu: CandidatD = { ...reel, continu: true };
  const mauvaisPointExclu: CandidatD = { ...reel, p: tirerAutre(p, P_VALEURS) };
  const mauvaisNiveaux: CandidatD = { ...reel, c: tirerAutre(c, C_VALEURS) };

  const { candidats, indexCorrect } = melangerAvecIndexCorrect([reel, domaineContinu, mauvaisPointExclu, mauvaisNiveaux]);
  return { famille: "D", reel, proprietes: calculerProprietesD(reel), valeurExclue: p, candidats, indexCorrect };
}

export { K_VALEURS as D_K_VALEURS, P_VALEURS as D_P_VALEURS, C_VALEURS as D_C_VALEURS };
