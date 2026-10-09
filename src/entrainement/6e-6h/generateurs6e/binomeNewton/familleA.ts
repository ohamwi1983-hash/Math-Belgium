import type { ExerciceBinomeA, TermeBinome } from "../../core6e/binomeNewton.types";
import { coefficientBinomial } from "../combinatoire";
import { tirerParmi } from "./aleatoire";

/**
 * Couche A (6e) — génération, famille A ("Développement complet de (ax+b)ⁿ") de `6gen45`.
 * `coefficientBinomial` réutilisé TEL QUEL de `generateurs6e/combinatoire.ts` (jamais réimplémenté
 * — voir CLAUDE.md, section infrastructure partagée).
 */

const VALEURS_A = [-3, -2, -1, 1, 2, 3] as const;
const VALEURS_B = [-5, -4, -3, -2, -1, 1, 2, 3, 4, 5] as const;
const VALEURS_N = [3, 4, 5, 6] as const;

function construireTermes(a: number, b: number, n: number): TermeBinome[] {
  const termes: TermeBinome[] = [];
  for (let k = 0; k <= n; k++) {
    const exposantX = n - k;
    const bPuissanceK = Math.pow(b, k);
    const coefFinal = coefficientBinomial(n, k) * Math.pow(a, exposantX) * bPuissanceK;
    termes.push({ k, coefficientBinomial: coefficientBinomial(n, k), exposantX, bPuissanceK, coefficientFinal: coefFinal });
  }
  return termes;
}

export function construireFamilleA(a: number = tirerParmi(VALEURS_A), b: number = tirerParmi(VALEURS_B), n: number = tirerParmi(VALEURS_N)): ExerciceBinomeA {
  return { famille: "A", a, b, n, termes: construireTermes(a, b, n) };
}
