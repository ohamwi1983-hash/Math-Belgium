import type { ExerciceDomaineDeriveeLogA, ExerciceDomaineDeriveeLogAAffine, ExerciceDomaineDeriveeLogACarre, ExerciceDomaineDeriveeLogAPuissance } from "../../../core6e/domaineDeriveeLogarithme.types";
import { ensembleReel, ensembleUnMorceau, versLeBasJusque, versLeHautDepuis } from "../../ensembleReel";
import { tirerBaseLogAvecE, tirerEntier, tirerParmi } from "../aleatoire";

/**
 * Famille A — application directe log_base(u), domaine simple (2 écrans : domaine, dérivée). 3
 * sous-types (spec littérale) :
 * - "puissance" : f(x) = log_base(k^x), domaine ℝ (k^x > 0 pour tout x, k>0).
 * - "carre" : f(x) = log_base(x²+c), c>0, domaine ℝ (x²+c > 0 pour tout x).
 * - "affine" : f(x) = log_base(mx+n), domaine mx+n > 0.
 */
export function construireA(): ExerciceDomaineDeriveeLogA {
  const r = Math.random();
  if (r < 1 / 3) return construirePuissance();
  if (r < 2 / 3) return construireCarre();
  return construireAffine();
}

function construirePuissance(): ExerciceDomaineDeriveeLogAPuissance {
  const { base, baseEstE } = tirerBaseLogAvecE();
  const k = tirerEntier(2, 9);
  return { famille: "A", sousType: "puissance", domaine: ensembleReel(), base, baseEstE, k };
}

function construireCarre(): ExerciceDomaineDeriveeLogACarre {
  const { base, baseEstE } = tirerBaseLogAvecE();
  const c = tirerEntier(1, 5);
  return { famille: "A", sousType: "carre", domaine: ensembleReel(), base, baseEstE, c };
}

function construireAffine(): ExerciceDomaineDeriveeLogAAffine {
  const { base, baseEstE } = tirerBaseLogAvecE();
  const m = tirerParmi([-4, -3, -2, -1, 1, 2, 3, 4] as const);
  const n = tirerEntier(-5, 5);
  const borne = -n / m;
  const domaine = ensembleUnMorceau(m > 0 ? versLeHautDepuis(borne, false) : versLeBasJusque(borne, false));
  return { famille: "A", sousType: "affine", domaine, base, baseEstE, m, n };
}
