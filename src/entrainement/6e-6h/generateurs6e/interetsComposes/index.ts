import type { ExerciceInteretsComposes, VarianteInteretsComposes } from "../../core6e/interetsComposes";
import { capital, capitalLimite } from "../../core6e/interetsComposes";

/**
 * Couche A — générateur de `6gen151` « Intérêts composés et nombre e ». `Math.random()` seul
 * (`?code=`). Fréquences : n₁ ∈ {1, 2, 4} (annuelle, semestrielle, trimestrielle), n₂ ∈ {12, 52}
 * (mensuelle, hebdomadaire), n₃ = 365 (quotidienne).
 * - `bernoulli` : taux de 100 %, un an, K₀ ∈ {100, 200, 500, 1 000} florins ;
 * - `placement` : taux ∈ {2 ; 2,5 ; 3 ; 4 ; 5 ; 6} %, durée ∈ {5, 10, 20} ans, K₀ ∈ {1 000, 2 000,
 *   2 500, 4 000, 5 000, 10 000} € ; tirage refait si la limite K₀·e^{rt} et le capital à versement
 *   quotidien diffèrent de moins de 10 centimes (sinon la limite ne se distingue pas).
 */

function parmi<T>(t: readonly T[]): T {
  return t[Math.floor(Math.random() * t.length)];
}

export function construire(variante: VarianteInteretsComposes): ExerciceInteretsComposes {
  const frequences: [number, number, number] = [parmi([1, 2, 4]), parmi([12, 52]), 365];
  if (variante === "bernoulli") {
    const K0 = parmi([100, 200, 500, 1000]);
    return { variante, K0, tauxPourcent: 100, t: 1, frequences, cleCollecteur: `${variante}/n${frequences[0]}-${frequences[1]}` };
  }
  for (;;) {
    const K0 = parmi([1000, 2000, 2500, 4000, 5000, 10000]);
    const tauxPourcent = parmi([2, 2.5, 3, 4, 5, 6]);
    const t = parmi([5, 10, 20]);
    const e: ExerciceInteretsComposes = { variante, K0, tauxPourcent, t, frequences, cleCollecteur: `${variante}/t${t}` };
    // La limite doit se distinguer du capital à versement quotidien (au moins 10 centimes d'écart).
    if (capitalLimite(e) - capital(e, 365) < 0.1) continue;
    return e;
  }
}

export const CATALOGUE_VARIANTES: { id: VarianteInteretsComposes; label: string }[] = [
  { id: "bernoulli", label: "Le problème de Bernoulli : 100 % par an" },
  { id: "placement", label: "Un placement réaliste sur plusieurs années" },
];

export function construireAvecVarianteId(id: VarianteInteretsComposes): ExerciceInteretsComposes {
  return construire(id);
}

export function genererExerciceInteretsComposes(): ExerciceInteretsComposes {
  return construire(parmi(CATALOGUE_VARIANTES).id);
}
