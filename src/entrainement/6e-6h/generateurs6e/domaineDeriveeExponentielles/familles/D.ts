import type { ExerciceDomaineDeriveeD, ExerciceDomaineDeriveeDF, ExerciceDomaineDeriveeDH, ExerciceDomaineDeriveeDI, ExerciceDomaineDeriveeDS } from "../../../core6e/domaineDeriveeExponentielles.types";
import { ensemblePrivePoints, ensembleReel } from "../../ensembleReel";
import { tirerBaseAvecE, tirerParmi } from "../aleatoire";

/**
 * Famille D — quotient avec terme exponentiel (3 écrans : domaine, N'/D', assemblage). Plages
 * numériques non fournies par la spec pour cette famille — voir la note de conception dans
 * `core6e/domaineDeriveeExponentielles.types.ts` (base∈{e}∪{2,...,6}, c∈{1,2,3}, k∈{1,2,3},
 * m∈{1,2}) et CLAUDE.md.
 *
 * Sous-type "f" — f(x)=(base^x+c)/(k·x). Domaine x≠0. N=base^x+c, N'=ln(base)·base^x ; D=k·x,
 * D'=k. f'(x)=(N'D−ND')/D².
 * Sous-type "h" — f(x)=(base^x+base^(-x))/(x²+c), c>0. Domaine ℝ (x²+c>0 toujours). N=base^x+
 * base^(-x), N'=ln(base)·(base^x−base^(-x)) ; D=x²+c, D'=2x.
 * Sous-type "i" — f(x)=k·x²/(base^(mx)+c), c>0. Domaine ℝ (dénominateur toujours >0). N=k·x²,
 * N'=2kx ; D=base^(mx)+c, D'=m·ln(base)·base^(mx).
 * Sous-type "s" — f(x)=(base^(-x)−base^x)/(base^(2x)+1). Domaine ℝ (dénominateur toujours >1).
 * N=base^(-x)−base^x, N'=−ln(base)·(base^(-x)+base^x) ; D=base^(2x)+1, D'=2·ln(base)·base^(2x).
 */
export function construireD(): ExerciceDomaineDeriveeD {
  const r = Math.random();
  if (r < 0.25) return construireF();
  if (r < 0.5) return construireH();
  if (r < 0.75) return construireI();
  return construireS();
}

function construireF(): ExerciceDomaineDeriveeDF {
  const { base, baseEstE } = tirerBaseAvecE(2, 6);
  const c = tirerParmi([1, 2, 3] as const);
  const k = tirerParmi([1, 2, 3] as const);
  return { famille: "D", sousType: "f", domaine: ensemblePrivePoints([0]), base, baseEstE, c, k };
}

function construireH(): ExerciceDomaineDeriveeDH {
  const { base, baseEstE } = tirerBaseAvecE(2, 6);
  const c = tirerParmi([1, 2, 3] as const);
  return { famille: "D", sousType: "h", domaine: ensembleReel(), base, baseEstE, c };
}

function construireI(): ExerciceDomaineDeriveeDI {
  const { base, baseEstE } = tirerBaseAvecE(2, 6);
  const k = tirerParmi([1, 2, 3] as const);
  const m = tirerParmi([1, 2] as const);
  const c = tirerParmi([1, 2, 3] as const);
  return { famille: "D", sousType: "i", domaine: ensembleReel(), base, baseEstE, k, m, c };
}

function construireS(): ExerciceDomaineDeriveeDS {
  const { base, baseEstE } = tirerBaseAvecE(2, 6);
  return { famille: "D", sousType: "s", domaine: ensembleReel(), base, baseEstE };
}

export function evaluerFD(exercice: ExerciceDomaineDeriveeD, x: number): number {
  if (exercice.sousType === "f") {
    return (Math.pow(exercice.base, x) + exercice.c) / (exercice.k * x);
  }
  if (exercice.sousType === "h") {
    return (Math.pow(exercice.base, x) + Math.pow(exercice.base, -x)) / (x * x + exercice.c);
  }
  if (exercice.sousType === "i") {
    return (exercice.k * x * x) / (Math.pow(exercice.base, exercice.m * x) + exercice.c);
  }
  return (Math.pow(exercice.base, -x) - Math.pow(exercice.base, x)) / (Math.pow(exercice.base, 2 * x) + 1);
}
