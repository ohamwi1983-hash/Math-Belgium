import type { ExerciceExpoProbA, ExerciceExpoProbA_Doublement, ExerciceExpoProbA_Evaluer } from "../../../core6e/exponentiellesProblemes.types";
import { CONTEXTES_A_DOUBLEMENT, CONTEXTES_A_EVALUER } from "../contextes";
import { tirerEntier, tirerParmi } from "../aleatoire";

const Q0_POOL = [500, 1000, 2000, 5000, 10000, 180000] as const;
const P_POOL = [2, 3, 5, 8, 10] as const;
const T_POOL = [30, 60, 80, 100] as const;
const K_POOL = [1, 2, 3] as const;

/** Sous-type "évaluer" — le SENS (croissance/décroissance) est tiré en premier, le contexte est
 * ensuite choisi PARMI CEUX qui correspondent à ce sens (jamais l'inverse — voir `contextes.ts`). */
export function construireAEvaluer(): ExerciceExpoProbA_Evaluer {
  const Q0 = tirerParmi(Q0_POOL);
  const p = tirerParmi(P_POOL);
  const croissance = tirerParmi([true, false]);
  const r = croissance ? 1 + p / 100 : 1 - p / 100;
  const n = tirerEntier(3, 10);
  const contexte = tirerParmi(CONTEXTES_A_EVALUER.filter((c) => c.direction === (croissance ? "croissance" : "decroissance")));
  return { famille: "A", sousType: "evaluer", contexteId: contexte.id, Q0, p, croissance, r, n, valeurFinale: Q0 * Math.pow(r, n) };
}

export function construireADoublement(): ExerciceExpoProbA_Doublement {
  const T = tirerParmi(T_POOL);
  const k = tirerParmi(K_POOL);
  const contexte = tirerParmi(CONTEXTES_A_DOUBLEMENT);
  return { famille: "A", sousType: "doublement", contexteId: contexte.id, T, k, t: T - k };
}

export function construireA(): ExerciceExpoProbA {
  return tirerParmi(["evaluer", "doublement"] as const) === "evaluer" ? construireAEvaluer() : construireADoublement();
}
