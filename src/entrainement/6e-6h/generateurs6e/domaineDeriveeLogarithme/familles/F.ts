import type { ExerciceDomaineDeriveeLogF, ExerciceDomaineDeriveeLogFArcsinLog, ExerciceDomaineDeriveeLogFArcsinLogX, ExerciceDomaineDeriveeLogFArctanLog, ExerciceDomaineDeriveeLogFLnSurSin } from "../../../core6e/domaineDeriveeLogarithme.types";
import { ensembleDeuxMorceaux, ensembleReel, ensembleUnMorceau, versLeHautDepuis } from "../../ensembleReel";
import { tirerParmi } from "../aleatoire";

/**
 * Famille F — synthèse transversale, log+trig+exponentielle+cyclométrique (2 écrans : domaine,
 * dérivée). 4 sous-types paramétrés, tous avec un logarithme — voir
 * `core6e/domaineDeriveeLogarithme.types.ts` (25 exercices distincts, contre 6 avant l'audit).
 */
const PAIRES_ARCSIN_LOG = [
  { base: 2, k: 4, p: 2 as const },
  { base: 2, k: 8, p: 3 as const },
  { base: 3, k: 9, p: 2 as const },
  { base: 3, k: 27, p: 3 as const },
  { base: 5, k: 25, p: 2 as const },
  { base: 5, k: 125, p: 3 as const },
];
const BASES_F = [2, 3, 5, 10] as const;

export function construireF(): ExerciceDomaineDeriveeLogF {
  const r = Math.random();
  if (r < 0.25) return construireLnSurSin();
  if (r < 0.5) return construireArcsinLog();
  if (r < 0.75) return construireArcsinLogX();
  return construireArctanLog();
}

/** f(x) = ln(a+sin(e^x))/(a+sin(e^x)). Domaine ℝ. */
function construireLnSurSin(): ExerciceDomaineDeriveeLogFLnSurSin {
  return { famille: "F", sousType: "lnSurSin", domaine: ensembleReel(), a: tirerParmi([2, 3, 4] as const) };
}

/** f(x) = arcsin(log_base(k^x)), k=base^p. Domaine [-1/p;1/p]. */
function construireArcsinLog(): ExerciceDomaineDeriveeLogFArcsinLog {
  const { base, k, p } = tirerParmi(PAIRES_ARCSIN_LOG);
  const borne = 1 / p;
  return { famille: "F", sousType: "arcsinLog", domaine: ensembleUnMorceau({ inf: -borne, sup: borne, infInclus: true, supInclus: true }), base, k, p };
}

/** f(x) = arcsin(log_base(x)). Domaine [1/base ; base]. */
function construireArcsinLogX(): ExerciceDomaineDeriveeLogFArcsinLogX {
  const base = tirerParmi(BASES_F);
  return { famille: "F", sousType: "arcsinLogX", domaine: ensembleUnMorceau({ inf: 1 / base, sup: base, infInclus: true, supInclus: true }), base };
}

/** f(x) = arctan(kx)/(1−log_base(x)). Domaine x>0 ET x≠base (point exclu caché). */
function construireArctanLog(): ExerciceDomaineDeriveeLogFArctanLog {
  const base = tirerParmi(BASES_F);
  const k = tirerParmi([1, 2, 3] as const);
  const domaine = ensembleDeuxMorceaux({ inf: 0, sup: base, infInclus: false, supInclus: false }, versLeHautDepuis(base, false));
  return { famille: "F", sousType: "arctanLog", domaine, k, base };
}
