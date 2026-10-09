import type { ExerciceEqLogF } from "../../../core6e/equationsExpLog.types";
import { tirerParmi } from "../aleatoire";

const BASES_F = [2, 3, 5, 7] as const;
const K_POOL = [-6, -5, -4, -3, 3, 4, 5, 6] as const;

/**
 * Famille F — `log_x(a) + log_a(x) = k`. Changement de base : `log_x(a) = log_a(a)/log_a(x) =
 * 1/log_a(x)` ; en posant `y=log_a(x)` : `y+1/y=k` ⟺ `y²-ky+1=0`. `|k|>2` (pool `{-6..-3,3..6}`)
 * GARANTIT un discriminant `k²-4>0` (2 racines y réelles DISTINCTES) et, puisque leur produit vaut
 * 1, ni l'une ni l'autre n'est jamais nulle (`1/y` toujours défini). Réponses `x=a^y`
 * potentiellement irrationnelles — voir prompt, tolérance numérique acceptée pour cette seule
 * famille.
 */
export function construireF(): ExerciceEqLogF {
  const a = tirerParmi(BASES_F);
  const k = tirerParmi(K_POOL);

  const discriminant = k * k - 4;
  const racineDiscriminant = Math.sqrt(discriminant);
  const yValides = [(k - racineDiscriminant) / 2, (k + racineDiscriminant) / 2].sort((u, v) => u - v);
  const xValides = yValides.map((y) => Math.pow(a, y));

  return { famille: "F", a, k, yValides, xValides };
}
