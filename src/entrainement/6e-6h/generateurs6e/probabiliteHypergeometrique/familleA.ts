import { coefficientBinomial } from "../combinatoire";
import type { ExerciceHypergeoA, SousTypeHypergeoA } from "../../core6e/probabiliteHypergeometrique.types";
import { tirerEntier, tirerParmi } from "./aleatoire";
import { contexteInstance, tirerEntreeContexteA } from "./contextesA";
import type { EntreeContexteA } from "./contextesA";

/** Famille A de `6gen47` — P(X = k) = Cₖᴷ·Cₙ₋ₖᴺ⁻ᴷ / Cₙᴺ (aucun, tous, exactement k). */

const PROBABILITE_MIN_ACCEPTABLE = 0.03;
const PROBABILITE_MAX_ACCEPTABLE = 0.9;
const ESSAIS_MAX = 60;

export function dansPlageAcceptable(p: number, min = PROBABILITE_MIN_ACCEPTABLE, max = PROBABILITE_MAX_ACCEPTABLE): boolean {
  return p >= min && p <= max;
}

export interface CalculHypergeo {
  numerateurFacteur1: number;
  numerateurFacteur2: number;
  denominateur: number;
  probabilite: number;
}

/** Partagée avec 6gen51 (`variablesDiscretesEsperance`) : signature et comportement stables. */
export function calculerHypergeo(N: number, K: number, n: number, k: number): CalculHypergeo {
  const numerateurFacteur1 = coefficientBinomial(K, k);
  const numerateurFacteur2 = coefficientBinomial(N - K, n - k);
  const denominateur = coefficientBinomial(N, n);
  return { numerateurFacteur1, numerateurFacteur2, denominateur, probabilite: (numerateurFacteur1 * numerateurFacteur2) / denominateur };
}

function construireDepuisEntree(entree: EntreeContexteA, sousType: SousTypeHypergeoA): ExerciceHypergeoA {
  const N = tirerEntier(entree.populationRange.min, entree.populationRange.max);
  const K = tirerEntier(entree.succesRange.min, Math.min(entree.succesRange.max, N - 3));
  const n = tirerEntier(sousType === "tous" ? 2 : entree.tirageRange.min, Math.min(entree.tirageRange.max, sousType === "tous" ? K : N - K));
  let k: number;
  if (sousType === "aucun") k = 0;
  else if (sousType === "tous") k = n;
  else {
    const candidats: number[] = [];
    for (let j = Math.max(1, n - (N - K)); j <= Math.min(K, n - 1); j++) candidats.push(j);
    k = candidats.length > 0 ? tirerParmi(candidats) : 1;
  }
  return { famille: "A", sousType, contexte: contexteInstance(entree, N, K, n, k, sousType), N, K, n, k, ...calculerHypergeo(N, K, n, k) };
}

function construireAvecSousType(sousType: SousTypeHypergeoA): ExerciceHypergeoA {
  let dernier: ExerciceHypergeoA | null = null;
  for (let essai = 0; essai < ESSAIS_MAX; essai++) {
    const exercice = construireDepuisEntree(tirerEntreeContexteA(), sousType);
    dernier = exercice;
    if (exercice.k <= exercice.K && exercice.n - exercice.k <= exercice.N - exercice.K && dansPlageAcceptable(exercice.probabilite)) return exercice;
  }
  return dernier as ExerciceHypergeoA;
}

export function construireAucun(): ExerciceHypergeoA {
  return construireAvecSousType("aucun");
}
export function construireTous(): ExerciceHypergeoA {
  return construireAvecSousType("tous");
}
export function construireExactement(): ExerciceHypergeoA {
  return construireAvecSousType("exactement");
}
