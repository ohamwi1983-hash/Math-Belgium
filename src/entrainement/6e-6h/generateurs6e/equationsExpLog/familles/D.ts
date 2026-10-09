import type { ExerciceEqLogD } from "../../../core6e/equationsExpLog.types";
import { tirerEntier, tirerParmi } from "../aleatoire";

const K_D1 = [-3, -2, -1, 1, 2, 3] as const;
const K_D2 = [-3, -2, -1, 0, 1, 2, 3] as const;
const BASES_D2 = [2, 3, 5, 7] as const;

/** Famille D — 2 sous-types équiprobables selon la position de l'inconnue.
 * D1 (`x` = base) : `log_x(N)=k` ⟹ `x=N^(1/k)`, `N∈{2,...,100}` — `N≥2` garantit STRUCTURELLEMENT
 * `x≠1` (voir en-tête de `core6e/equationsExpLog.types.ts`/le prompt : `x=1` exigerait `N^(1/k)=1`
 * ⟺ `N=1`, jamais tiré ici — aucun trappage a posteriori nécessaire).
 * D2 (`x` = argument, base `a` connue) : `log_a(x)=k` ⟹ `x=a^k` directement, `k` peut être nul
 * (`x=1` alors valide, `x=1` n'est PAS exclu de la CE de D2 : seul `x` base d'un log doit éviter 1). */
export function construireD(): ExerciceEqLogD {
  if (Math.random() < 0.5) {
    const N = tirerEntier(2, 100);
    const k = tirerParmi(K_D1);
    const x = Math.pow(N, 1 / k);
    return { famille: "D", sousType: "D1", N, k, x };
  }
  const a = tirerParmi(BASES_D2);
  const k = tirerParmi(K_D2);
  const x = Math.pow(a, k);
  return { famille: "D", sousType: "D2", a, k, x };
}
