import type { ExerciceLogD } from "../../../core6e/inequationsLogarithmiques.types";
import { ensembleUnMorceau, versLeHautDepuis } from "../../ensembleReel";
import { tirerEntier, tirerParmi } from "../aleatoire";
import { COMPARATEURS, tirerComparateur } from "../comparateur";
import { convertirIntervalleYVersX, intersecterEnsembles, resoudreQuadratiqueFacteurs } from "../intervalle";
import { baseEntiere, baseFraction, baseValeurLog } from "../rationnel";

/**
 * Famille D — `A(log_base x)²+B·log_base x+C [comparateur] 0`, construite DEPUIS des racines
 * cibles `y1,y2` (`A(y-y1)(y-y2)`). Écran 1 : CE constante (`x>0`). Écran 2 : poser `y=log_base x`
 * (vérifié en texte côté moteur). Écran 3 : résoudre en y (`resoudreQuadratiqueFacteurs`, réutilisé
 * tel quel). Écran 4 : convertir en x via `x=base^y` (`convertirIntervalleYVersX`) — piège central
 * : sens préservé si `base>1`, INVERSÉ si `base<1`.
 *
 * **Pool de bases ÉTENDU** par rapport à la spec source (voir en-tête de
 * `core6e/inequationsLogarithmiques.types.ts`) : `{2,3,5}` (>1) ET `{1/2,1/3,1/5}` (<1), 50/50 —
 * pour que le piège de l'écran 4 (inversion des bornes) soit réellement rencontré.
 */

const POOL_BASE_SUP = [baseEntiere(2), baseEntiere(3), baseEntiere(5)];
const POOL_BASE_INF = [baseFraction(1, 2), baseFraction(1, 3), baseFraction(1, 5)];

export function construireD(): ExerciceLogD {
  const superieure = tirerParmi([true, false] as const);
  const base = superieure ? tirerParmi(POOL_BASE_SUP) : tirerParmi(POOL_BASE_INF);
  const baseSuperieureA1 = baseValeurLog(base) > 1;
  const baseVal = baseValeurLog(base);

  const A = tirerParmi([-2, -1, 1, 2] as const);
  const y1 = tirerEntier(-3, 3);
  let y2 = tirerEntier(-3, 3);
  while (y2 === y1) y2 = tirerEntier(-3, 3);
  const comparateur = tirerComparateur(COMPARATEURS);

  // A(y-y1)(y-y2) = Ay² - A(y1+y2)y + A·y1·y2
  const B = -A * (y1 + y2);
  const C = A * y1 * y2;

  const ceEcran1 = ensembleUnMorceau(versLeHautDepuis(0, false));
  const solutionEcran3 = resoudreQuadratiqueFacteurs(A, y1, y2, comparateur);
  const solutionEcran4Brute = convertirIntervalleYVersX(solutionEcran3, baseVal);
  const solutionEcran4 = intersecterEnsembles(ceEcran1, solutionEcran4Brute);

  return { famille: "D", base, baseSuperieureA1, y1, y2, A, B, C, comparateur, ceEcran1, solutionEcran3, solutionEcran4 };
}
