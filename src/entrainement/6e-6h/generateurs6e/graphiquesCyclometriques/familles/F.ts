import type { CandidatF, ExerciceGraphiqueF } from "../../../core6e/graphiquesCyclometriques.types";
import { melangerAvecIndexCorrect, tirerAutre, tirerParmi } from "../aleatoire";
import { calculerProprietesF } from "../proprietes";

const ARCFONCTIONS = ["arcsin", "arccos"] as const;
const M_VALEURS = [1, 2, 3, 4] as const;
const X0_VALEURS = [-2, -1, 0, 1, 2] as const;
const C_VALEURS = [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5] as const;

/**
 * Famille F — `f(x) = (arcfonction(mx+n))²+c`, arcfonction∈{arcsin,arccos}. `n` DÉRIVÉ pour que
 * l'extremum de la mise au carré tombe exactement sur `x0` (valeur cible, choisie EN PREMIER) :
 * `arcsin` s'annule en argument=0 (`n=-m·x0`), `arccos` s'annule en argument=1 (`n=1-m·x0`) — la
 * valeur en `x0` vaut alors `c` dans les 2 cas (`arcfonction(0)=0`/`arcfonction(1)=0`).
 */
export function construireF(): ExerciceGraphiqueF {
  const arcfonction = tirerParmi(ARCFONCTIONS);
  const m = tirerParmi(M_VALEURS);
  const x0 = tirerParmi(X0_VALEURS);
  const c = tirerParmi(C_VALEURS);
  const z = arcfonction === "arcsin" ? 0 : 1;
  const n = z - m * x0;
  const reel: CandidatF = { m, n, c, arcfonction, carre: true };

  const toujoursMonotone: CandidatF = { ...reel, carre: false };

  const x0Faux = tirerAutre(x0, X0_VALEURS);
  const mauvaisePosition: CandidatF = { ...reel, n: z - m * x0Faux };

  const mauvaiseValeur: CandidatF = { ...reel, c: c === 0 ? tirerAutre(0, C_VALEURS) : 0 };

  const { candidats, indexCorrect } = melangerAvecIndexCorrect([reel, toujoursMonotone, mauvaisePosition, mauvaiseValeur]);
  return { famille: "F", reel, proprietes: calculerProprietesF(reel), positionExtremum: x0, candidats, indexCorrect };
}

export { M_VALEURS as F_M_VALEURS, X0_VALEURS as F_X0_VALEURS, C_VALEURS as F_C_VALEURS };
