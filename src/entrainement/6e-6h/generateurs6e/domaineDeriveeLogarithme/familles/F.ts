import type { ExerciceDomaineDeriveeLogF, ExerciceDomaineDeriveeLogFArcsinLog, ExerciceDomaineDeriveeLogFArctanLog, ExerciceDomaineDeriveeLogFLnSurSin, ExerciceDomaineDeriveeLogFRacineArcsin } from "../../../core6e/domaineDeriveeLogarithme.types";
import { ensembleDeuxMorceaux, ensembleReel, ensembleUnMorceau, versLeBasJusque, versLeHautDepuis } from "../../ensembleReel";
import { tirerParmi } from "../aleatoire";

/**
 * Famille F — synthèse transversale, log+trig+exponentielle+cyclométrique (2 écrans : domaine,
 * dérivée). 4 sous-types — voir `core6e/domaineDeriveeLogarithme.types.ts` pour la justification
 * des reformulations "lnSurSin"/"racineArcsin" (domaine exactement constructible).
 */
const PAIRES_ARCSIN_LOG = [
  { base: 2, k: 4, p: 2 as const },
  { base: 2, k: 8, p: 3 as const },
  { base: 3, k: 9, p: 2 as const },
];

export function construireF(): ExerciceDomaineDeriveeLogF {
  const r = Math.random();
  if (r < 0.25) return construireLnSurSin();
  if (r < 0.5) return construireArcsinLog();
  if (r < 0.75) return construireRacineArcsin();
  return construireArctanLog();
}

/** f(x) = ln(2+sin(e^x))/(2+sin(e^x)). Domaine ℝ. */
function construireLnSurSin(): ExerciceDomaineDeriveeLogFLnSurSin {
  return { famille: "F", sousType: "lnSurSin", domaine: ensembleReel() };
}

/** f(x) = arcsin(log_base(k^x)), k=base^p. Domaine [-1/p;1/p]. */
function construireArcsinLog(): ExerciceDomaineDeriveeLogFArcsinLog {
  const { base, k, p } = tirerParmi(PAIRES_ARCSIN_LOG);
  const borne = 1 / p;
  return { famille: "F", sousType: "arcsinLog", domaine: ensembleUnMorceau({ inf: -borne, sup: borne, infInclus: true, supInclus: true }), base, k, p };
}

/** f(x) = arcsin(√(1−e^x)) — reformulation de "√(1−arcsin(e^x))" (voir note de tête). Domaine
 * x≤0. */
function construireRacineArcsin(): ExerciceDomaineDeriveeLogFRacineArcsin {
  return { famille: "F", sousType: "racineArcsin", domaine: ensembleUnMorceau(versLeBasJusque(0, true)) };
}

/** f(x) = arctan(2x)/(1−log₁₀(2x)). Domaine x>0 ET x≠5 (point exclu caché). */
function construireArctanLog(): ExerciceDomaineDeriveeLogFArctanLog {
  const domaine = ensembleDeuxMorceaux({ inf: 0, sup: 5, infInclus: false, supInclus: false }, versLeHautDepuis(5, false));
  return { famille: "F", sousType: "arctanLog", domaine };
}
