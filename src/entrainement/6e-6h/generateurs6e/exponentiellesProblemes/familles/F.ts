import type { ExerciceExpoProbF } from "../../../core6e/exponentiellesProblemes.types";
import { CONTEXTES_F } from "../contextes";
import { tirerEntier, tirerParmi } from "../aleatoire";

const K_POOL = [0.1, 0.15, 0.2, 0.25, 0.3] as const;
const N_POOL = [1000000, 5000000, 10000000] as const;
const G_POOL = [0.5, 0.7, 1, 1.5] as const;
const F_POOL = [10000, 20000, 30000, 50000] as const;
const V_POOL = [2000, 3000, 5000] as const;

/** Famille F — p(t)=1-e^(-kt) DONNÉ (pas construit par l'élève). `pN2` est RECALCULÉ depuis `n2`,
 * jamais dérivé de `pN1` (piège explicite de la spec : confondre n1 et n2 à l'écran 3). */
export function construireF(): ExerciceExpoProbF {
  const k = tirerParmi(K_POOL);
  const N = tirerParmi(N_POOL);
  const g = tirerParmi(G_POOL);
  const F = tirerParmi(F_POOL);
  const V = tirerParmi(V_POOL);
  const n1 = tirerEntier(5, 15);
  const n2 = tirerEntier(20, 35);
  const contexte = tirerParmi(CONTEXTES_F);

  const pN1 = 1 - Math.exp(-k * n1);
  const pN2 = 1 - Math.exp(-k * n2);
  const personnesN2 = pN2 * N;
  const beneficeN2 = g * personnesN2 - (F + V * n2);

  return { famille: "F", contexteId: contexte.id, k, N, g, F, V, n1, n2, pN1, pN2, personnesN2, beneficeN2 };
}
