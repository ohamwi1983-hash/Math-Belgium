import type { ExerciceLogProbC, SensDemiVieC } from "../../../core6e/logarithmesProblemes.types";
import { CONTEXTES_C } from "../contextes";
import { tirerParmi } from "../aleatoire";

/**
 * Famille C — radioactivité, demi-vie `T=ln(2)/λ`. `sens` tiré détermine quelle grandeur est DONNÉE
 * (l'autre est DÉRIVÉE). Valeurs physiques réelles pour le carbone 14 et l'iode 131 (voir
 * `contextes.ts`) — l'ancienne version associait le carbone 14 à λ ≈ 0,07, soit T ≈ 10.
 *
 * Sens "versT" : λ est affiché arrondi à 3 chiffres significatifs, et T de référence est recalculé
 * DEPUIS cette valeur affichée (seule donnée dont dispose l'élève).
 */
const FRACTION_ECRAN2_POOL = [0.5, 0.25, 0.1, 0.05, 0.02, 0.01] as const;
const FACTEUR_ANCIENNE_ESTIMATION_POOL = [0.8, 0.9, 1.1, 1.2] as const;

const LN2 = Math.log(2);

/** Arrondi à 3 chiffres significatifs. */
function troisChiffresSignificatifs(v: number): number {
  const exposant = Math.floor(Math.log10(Math.abs(v)));
  const facteur = Math.pow(10, 2 - exposant);
  return Math.round(v * facteur) / facteur;
}

export function construireC(sensForce?: SensDemiVieC): ExerciceLogProbC {
  const sens = sensForce ?? tirerParmi(["versT", "versLambda"] as const);
  const contexte = tirerParmi(CONTEXTES_C);
  const tAdmise = contexte.T ?? tirerParmi(contexte.poolT);

  let lambda: number;
  let T: number;
  if (sens === "versT") {
    lambda = troisChiffresSignificatifs(LN2 / tAdmise);
    T = LN2 / lambda;
  } else {
    T = tAdmise;
    lambda = LN2 / T;
  }

  const fractionEcran2 = tirerParmi(FRACTION_ECRAN2_POOL);
  const tEcran2 = (-T * Math.log(fractionEcran2)) / LN2;

  const T1 = contexte.ancienneEstimation ?? Math.round(tAdmise * tirerParmi(FACTEUR_ANCIENNE_ESTIMATION_POOL) * 10) / 10;
  const T2 = tAdmise;
  const facteurCorrectif = T2 / T1;

  return { famille: "C", contexteId: contexte.id, unite: contexte.unite, sens, lambda, T, fractionEcran2, tEcran2, T1, T2, facteurCorrectif };
}
