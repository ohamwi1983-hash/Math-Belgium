import type { ExerciceIneqB } from "../../../core6e/inequationsExponentielles.types";
import { tirerEntier, tirerParmi } from "../aleatoire";
import { baseEntiere, baseFraction, BASE_E } from "../rationnel";

/**
 * Famille B — `c·base^(±x) [comparateur] -k`, `c>0`, `k>0` — TOUJOURS ∅ (voir
 * `core6e/inequationsExponentielles.types.ts::ExerciceIneqB`). `comparateur` restreint à
 * `{"<=","<"}` (jamais `">"`/`">="`), spec explicite.
 */

const POOL_BASE = [baseEntiere(2), baseEntiere(3), baseEntiere(5), baseFraction(1, 2), BASE_E];

export function construireB(): ExerciceIneqB {
  const base = tirerParmi(POOL_BASE);
  const c = tirerEntier(1, 5);
  const k = tirerEntier(1, 5);
  const exposantNegatif = tirerParmi([true, false] as const);
  const comparateur = tirerParmi(["<=", "<"] as const);
  return { famille: "B", base, c, k, exposantNegatif, comparateur };
}
