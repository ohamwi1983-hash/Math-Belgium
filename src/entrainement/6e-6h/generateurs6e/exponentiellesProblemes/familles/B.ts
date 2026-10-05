import type { ExerciceExpoProbB } from "../../../core6e/exponentiellesProblemes.types";
import { CONTEXTES_B } from "../contextes";
import { tirerEntier, tirerParmi } from "../aleatoire";

const Q0_POOL = [10, 20, 30, 50] as const;
const P_POOL = [15, 20, 25, 30] as const;
const TOLERANCE_POOL = [0.2, 0.4, 0.5, 1] as const;

/** `toleranceSeuil` reste TOUJOURS strictement inférieur à `Q0` (max du pool 1 < min du pool 10)
 * — garantit `reste(t)=toleranceSeuil/Q0` dans `]0,1[`, donc `tSeuil` fini et positif. */
export function construireB(): ExerciceExpoProbB {
  const Q0 = tirerParmi(Q0_POOL);
  const p = tirerParmi(P_POOL);
  const q = 1 - p / 100;
  const n = tirerEntier(5, 10);
  const toleranceSeuil = tirerParmi(TOLERANCE_POOL);
  const contexte = tirerParmi(CONTEXTES_B);
  const complementN = Q0 * (1 - Math.pow(q, n));
  const tSeuil = Math.log(toleranceSeuil / Q0) / Math.log(q);
  return { famille: "B", contexteId: contexte.id, Q0, p, q, n, toleranceSeuil, complementN, tSeuil };
}
