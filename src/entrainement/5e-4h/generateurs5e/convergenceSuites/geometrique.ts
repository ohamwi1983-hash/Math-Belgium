import type { ExerciceConvergenceGeometrique } from "../../core5e/convergenceSuites.types";
import type { FractionQ } from "../../core5e/suitesGeometriques.types";

// Q_POOL_* : magnitudes garantissant strictement la catégorie visée (jamais un tirage continu qui
// laisserait "q=1"/"q=-1" quasi inatteignables — "5 cas à FRÉQUENCE GARANTIE", spec explicite).
// `FractionQ` littérales (jamais une division flottante) — `prompt5gen155gen16arithmetiqueexacte.md` :
// affiché en fraction irréductible, jamais en décimal.
const Q_POOL_ABS_LT1: FractionQ[] = [
  { num: 1, den: 2 },
  { num: -1, den: 2 },
  { num: 1, den: 3 },
  { num: -1, den: 3 },
  { num: 2, den: 3 },
  { num: -2, den: 3 },
  { num: 1, den: 4 },
  { num: -1, den: 4 },
  { num: 3, den: 4 },
  { num: -3, den: 4 },
];
const Q_POOL_GT1: FractionQ[] = [
  { num: 2, den: 1 },
  { num: 3, den: 1 },
  { num: 3, den: 2 },
  { num: 4, den: 3 },
  { num: 5, den: 2 },
];
const Q_POOL_LT_MOINS1: FractionQ[] = [
  { num: -2, den: 1 },
  { num: -3, den: 1 },
  { num: -3, den: 2 },
  { num: -4, den: 3 },
  { num: -5, den: 2 },
];

const BUCKETS = ["q1", "absLt1", "qGt1", "qEqMoins1", "qLtMoins1"] as const;

function entierNonNul(min: number, max: number): number {
  let v = 0;
  while (v === 0) v = Math.floor(Math.random() * (max - min + 1)) + min;
  return v;
}
function elementAleatoire<T>(tab: readonly T[]): T {
  return tab[Math.floor(Math.random() * tab.length)];
}

/** "Bucket d'abord" : le tirage porte sur les 5 CATÉGORIES de la spec (uniforme entre elles),
 * jamais sur q directement — sinon q=1/q=-1 (des points isolés dans un espace continu) seraient
 * quasi jamais tirés. La catégorie "q>1" se scinde ensuite en 2 classifications selon le signe de
 * u1 (tiré indépendamment, 50/50). */
export function genererExerciceConvergenceGeometrique(): ExerciceConvergenceGeometrique {
  const bucket = elementAleatoire(BUCKETS);
  const u1 = entierNonNul(-15, 15);
  switch (bucket) {
    case "q1":
      return { variante: "geometrique", u1, q: { num: 1, den: 1 }, classification: "convergeVersU1" };
    case "absLt1":
      return { variante: "geometrique", u1, q: elementAleatoire(Q_POOL_ABS_LT1), classification: "convergeVersZero" };
    case "qGt1": {
      const q = elementAleatoire(Q_POOL_GT1);
      return { variante: "geometrique", u1, q, classification: u1 > 0 ? "divergePlusInfini" : "divergeMoinsInfini" };
    }
    case "qEqMoins1":
      return { variante: "geometrique", u1, q: { num: -1, den: 1 }, classification: "oscilleNeConvergePas" };
    case "qLtMoins1":
      return { variante: "geometrique", u1, q: elementAleatoire(Q_POOL_LT_MOINS1), classification: "oscilleDivergeSansLimite" };
  }
}
