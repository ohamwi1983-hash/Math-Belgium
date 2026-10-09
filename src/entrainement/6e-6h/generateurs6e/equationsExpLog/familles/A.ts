import type { ExerciceEqLogA } from "../../../core6e/equationsExpLog.types";
import { estPuissanceEntiereDe, tirerEntier, tirerParmi } from "../aleatoire";

const BASES_A = [2, 3, 5, 7, 10] as const;
const M_NON_NUL = [-4, -3, -2, -1, 1, 2, 3, 4] as const;

/** Famille A — `base^(mx+n) = C`. ~50% du temps `C` est choisi comme une puissance ENTIÈRE
 * reconnaissable de `base` (log superflu), ~50% comme une valeur générique n'étant PAS une
 * puissance propre de la base (log réellement nécessaire) — "variabilité assumée", le signal
 * diagnostique central de cette famille (voir en-tête du prompt). */
export function construireA(): ExerciceEqLogA {
  const base = tirerParmi(BASES_A);
  const m = tirerParmi(M_NON_NUL);
  const n = tirerEntier(-5, 5);
  const estPuissancePropre = Math.random() < 0.5;

  let p: number | null = null;
  let C: number;
  if (estPuissancePropre) {
    p = tirerEntier(-2, 2);
    C = Math.pow(base, p);
  } else {
    let candidate: number;
    do {
      candidate = tirerEntier(2, 60);
    } while (estPuissanceEntiereDe(candidate, base));
    C = candidate;
  }

  const exposantCible = estPuissancePropre ? (p as number) : Math.log(C) / Math.log(base);
  const x = (exposantCible - n) / m;

  return { famille: "A", base, m, n, estPuissancePropre, p, C, exposantCible, x };
}
