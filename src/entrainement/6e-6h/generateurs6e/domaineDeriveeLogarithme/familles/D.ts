import type { ExerciceDomaineDeriveeLogD, ExerciceDomaineDeriveeLogDExpoSurLn, ExerciceDomaineDeriveeLogDLnSurKx, ExerciceDomaineDeriveeLogDSommeLog } from "../../../core6e/domaineDeriveeLogarithme.types";
import { ensembleDeuxMorceaux, ensembleUnMorceau, versLeHautDepuis } from "../../ensembleReel";
import { tirerBaseLogAvecE, tirerEntier } from "../aleatoire";

/**
 * Famille D — quotient avec terme logarithmique (3 écrans : domaine, N'/D', assemblage). 3
 * sous-types, le 3e ("expoSurLn") avec un point exclu caché dans le dénominateur (piège central de
 * spec : `ln(x)≠0` en plus de `x>0`).
 */
export function construireD(): ExerciceDomaineDeriveeLogD {
  const r = Math.random();
  if (r < 1 / 3) return construireSommeLog();
  if (r < 2 / 3) return construireLnSurKx();
  return construireExpoSurLn();
}

/** f(x) = (x+log_base(x))/x. Domaine x>0 (dénominateur x≠0 déjà couvert). */
function construireSommeLog(): ExerciceDomaineDeriveeLogDSommeLog {
  const { base, baseEstE } = tirerBaseLogAvecE();
  return { famille: "D", sousType: "sommeLog", domaine: ensembleUnMorceau(versLeHautDepuis(0, false)), base, baseEstE };
}

/** f(x) = ln(x)/(k·x). Domaine x>0. */
function construireLnSurKx(): ExerciceDomaineDeriveeLogDLnSurKx {
  const k = tirerEntier(2, 6);
  return { famille: "D", sousType: "lnSurKx", domaine: ensembleUnMorceau(versLeHautDepuis(0, false)), k };
}

/** f(x) = (base^x+x)/ln(x). Domaine x>0 ET x≠1 (ln(x)≠0) — piège du point exclu caché dans le
 * dénominateur, `]0;1[∪]1;+∞[`. */
function construireExpoSurLn(): ExerciceDomaineDeriveeLogDExpoSurLn {
  const { base, baseEstE } = tirerBaseLogAvecE();
  const domaine = ensembleDeuxMorceaux({ inf: 0, sup: 1, infInclus: false, supInclus: false }, versLeHautDepuis(1, false));
  return { famille: "D", sousType: "expoSurLn", domaine, base, baseEstE };
}
