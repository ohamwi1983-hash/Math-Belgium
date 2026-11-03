import type { ExerciceEqLogD } from "../../../core6e/equationsExpLog.types";
import { tirerParmi } from "../aleatoire";

const K_D = [-3, -2, -1, 0, 1, 2, 3] as const;
const BASES_D = [2, 3, 5, 7] as const;

/** Famille D — `log_a(x)=k`, base `a` connue, `x` argument du logarithme : `x=a^k` directement.
 * `k` peut être nul (`x=1`, valide : seule une BASE de logarithme doit éviter 1). Le sous-type « x
 * base du logarithme » (`log_x(N)=k`) a été retiré (base inconnue, hors cours). */
export function construireD(): ExerciceEqLogD {
  const a = tirerParmi(BASES_D);
  const k = tirerParmi(K_D);
  return { famille: "D", a, k, x: Math.pow(a, k) };
}
