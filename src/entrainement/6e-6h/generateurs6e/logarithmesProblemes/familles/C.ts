import type { ExerciceLogProbC, SensDemiVieC } from "../../../core6e/logarithmesProblemes.types";
import { CONTEXTES_C } from "../contextes";
import { tirerParmi } from "../aleatoire";

/** Famille C — radioactivité, demi-vie `T=ln(2)/λ`. `sens` tiré détermine quelle grandeur est
 * DONNÉE directement (l'autre est DÉRIVÉE, exacte) — voir en-tête `core6e/logarithmesProblemes.types.ts`. */
const LAMBDA_POOL = [0.015, 0.02, 0.03, 0.05, 0.07, 0.1, 0.12, 0.15, 0.2] as const;
const T_POOL = [5, 8, 10, 12, 15, 20, 25, 30, 40, 50, 60, 80, 100] as const;
const FRACTION_ECRAN2_POOL = [0.5, 0.25, 0.1, 0.05, 0.02, 0.01] as const;
const T1_POOL = [10, 20, 30, 40, 50, 60, 80] as const;
const FACTEUR_ECART_POOL = [1.1, 1.2, 1.3, 0.8, 0.9, 0.7] as const;

const LN2 = Math.log(2);

export function construireC(sensForce?: SensDemiVieC): ExerciceLogProbC {
  const sens = sensForce ?? tirerParmi(["versT", "versLambda"] as const);
  const contexte = tirerParmi(CONTEXTES_C);

  let lambda: number;
  let T: number;
  if (sens === "versT") {
    lambda = tirerParmi(LAMBDA_POOL);
    T = LN2 / lambda;
  } else {
    T = tirerParmi(T_POOL);
    lambda = LN2 / T;
  }

  const fractionEcran2 = tirerParmi(FRACTION_ECRAN2_POOL);
  const tEcran2 = (-T * Math.log(fractionEcran2)) / LN2;

  const T1 = tirerParmi(T1_POOL);
  const T2 = arrondiUnDecimal(T1 * tirerParmi(FACTEUR_ECART_POOL));
  const facteurCorrectif = T2 / T1;

  return { famille: "C", contexteId: contexte.id, sens, lambda, T, fractionEcran2, tEcran2, T1, T2, facteurCorrectif };
}

function arrondiUnDecimal(v: number): number {
  return Math.round(v * 10) / 10;
}
