import type { ExerciceBinomeC, TermeBinomeC } from "../../core6e/binomeNewton.types";
import { coefficientBinomial } from "../combinatoire";
import { tirerParmi } from "./aleatoire";

/**
 * Couche A (6e) — génération, famille C ("Approximation décimale via développement binomial") de
 * `6gen45`. `(1+ε)ⁿ`, `ε` décimal petit (positif ou négatif) — `coefficientBinomial` réutilisé de
 * `generateurs6e/combinatoire.ts`.
 */

const VALEURS_EPSILON = [0.01, 0.02, 0.1, -0.01, -0.02] as const;
const VALEURS_N = [3, 4, 5] as const;

function construireTermes(epsilon: number, n: number): TermeBinomeC[] {
  const termes: TermeBinomeC[] = [];
  for (let k = 0; k <= n; k++) {
    const epsilonPuissanceK = Math.pow(epsilon, k);
    const c = coefficientBinomial(n, k);
    termes.push({ k, coefficientBinomial: c, epsilonPuissanceK, valeurTerme: c * epsilonPuissanceK });
  }
  return termes;
}

export function construireFamilleC(epsilon: number = tirerParmi(VALEURS_EPSILON), n: number = tirerParmi(VALEURS_N)): ExerciceBinomeC {
  const termes = construireTermes(epsilon, n);
  const valeurFinale = termes.reduce((acc, t) => acc + t.valeurTerme, 0);
  // Arrondi 2 décimales — evite un artefact flottant du type "1+0.1=1.0999999999999999" à
  // l'affichage (epsilon n'a jamais plus de 2 décimales dans les plages de génération).
  const base = Math.round((1 + epsilon) * 100) / 100;
  return { famille: "C", epsilon, n, base, termes, valeurFinale };
}
