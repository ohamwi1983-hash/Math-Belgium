import type { ExerciceExpoProbE } from "../../../core6e/exponentiellesProblemes.types";
import { CONTEXTES_E } from "../contextes";
import { tirerParmi } from "../aleatoire";

const N_POOL = [2, 3, 4] as const;
const A_POOL = [0.5, 1, 2] as const;
const K_POOL = [10, 20, 30, 40] as const;

/** Famille E — f(t)=k·t^n·e^(-at). Propriété vérifiée (voir tests) : f'(t)=k·t^(n-1)·e^(-at)·(n-at)
 * s'annule en t=0 (minimum trivial, f(0)=0, PAS la bonne réponse — piège central de l'écran 2) et
 * en t=n/a (maximum). */
export function construireE(): ExerciceExpoProbE {
  const n = tirerParmi(N_POOL);
  const a = tirerParmi(A_POOL);
  const k = tirerParmi(K_POOL);
  const contexte = tirerParmi(CONTEXTES_E);
  const tMax = n / a;
  const fMax = k * Math.pow(tMax, n) * Math.exp(-a * tMax);
  return { famille: "E", contexteId: contexte.id, n, a, k, tMax, fMax };
}
