import type { ExerciceIneqE } from "../../../core6e/inequationsExponentielles.types";
import { tirerDeuxDistincts, tirerEntier, tirerEntierNonNul } from "../aleatoire";
import { COMPARATEURS, inverserComparateur, tirerComparateur } from "../comparateur";
import { ensembleUnMorceau } from "../../ensembleReel";
import { resoudreAffine } from "../intervalle";
import { baseEntiere, baseValeurIneq } from "../rationnel";

/**
 * Famille E — bases différentes, même exposant affine — voir
 * `core6e/inequationsExponentielles.types.ts::ExerciceIneqE`. `base1`/`base2` toujours RATIONNELLES
 * DISTINCTES (`{2,3,5,7}`, jamais `e`) — spec explicite. `comparateur` tiré librement parmi les 4.
 */

const POOL_BASES = [baseEntiere(2), baseEntiere(3), baseEntiere(5), baseEntiere(7)];

export function construireE(): ExerciceIneqE {
  const [base1, base2] = tirerDeuxDistincts(POOL_BASES);
  const m = tirerEntierNonNul(-3, 3);
  const n = tirerEntier(-5, 5);
  const comparateur = tirerComparateur(COMPARATEURS);

  const ratioSuperieurA1 = baseValeurIneq(base1) / baseValeurIneq(base2) > 1;
  const comparateurExposants = ratioSuperieurA1 ? comparateur : inverserComparateur(comparateur);
  // (base1/base2)^(mx+n) [comparateur] 1 = (base1/base2)^0 ⟺ mx+n [comparateurExposants] 0.
  const solutionEcran2 = ensembleUnMorceau(resoudreAffine(m, n, comparateurExposants, 0));

  return { famille: "E", base1, base2, m, n, comparateur, ratioSuperieurA1, solutionEcran2 };
}
