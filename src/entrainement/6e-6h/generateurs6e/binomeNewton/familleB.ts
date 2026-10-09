import type { ExerciceBinomeB, SousTypeBinomeB } from "../../core6e/binomeNewton.types";
import { coefficientBinomial } from "../combinatoire";
import { tirerEntier, tirerParmi } from "./aleatoire";

/**
 * Couche A (6e) — génération, famille B ("Terme spécifique sans développement complet") de
 * `6gen45`. Mêmes plages `a`/`b`/`n` que la famille A (mission). `coefficientBinomial` réutilisé de
 * `generateurs6e/combinatoire.ts`.
 */

const VALEURS_A = [-3, -2, -1, 1, 2, 3] as const;
const VALEURS_B = [-5, -4, -3, -2, -1, 1, 2, 3, 4, 5] as const;
const VALEURS_N = [3, 4, 5, 6] as const;

function construireAvecK(a: number, b: number, n: number, k: number, sousType: SousTypeBinomeB, p: number | undefined): ExerciceBinomeB {
  const exposantX = n - k;
  const bPuissanceK = Math.pow(b, k);
  const coefBinom = coefficientBinomial(n, k);
  const coefficientFinal = coefBinom * Math.pow(a, exposantX) * bPuissanceK;
  return { famille: "B", a, b, n, sousType, p, k, coefficientBinomial: coefBinom, exposantX, bPuissanceK, coefficientFinal };
}

/** Sous-type "rang" : `k` donné directement, écran "trouver k" sauté. */
export function construireRang(
  a: number = tirerParmi(VALEURS_A),
  b: number = tirerParmi(VALEURS_B),
  n: number = tirerParmi(VALEURS_N),
  k: number = tirerEntier(0, n),
): ExerciceBinomeB {
  return construireAvecK(a, b, n, k, "rang", undefined);
}

/** Sous-type "puissance" : `p=n-k` donné (via `k` tiré en interne puis dérivé), `k` À RETROUVER. */
export function construirePuissance(
  a: number = tirerParmi(VALEURS_A),
  b: number = tirerParmi(VALEURS_B),
  n: number = tirerParmi(VALEURS_N),
  k: number = tirerEntier(0, n),
): ExerciceBinomeB {
  return construireAvecK(a, b, n, k, "puissance", n - k);
}

export function construireFamilleB(): ExerciceBinomeB {
  return tirerParmi([construireRang, construirePuissance] as const)();
}
