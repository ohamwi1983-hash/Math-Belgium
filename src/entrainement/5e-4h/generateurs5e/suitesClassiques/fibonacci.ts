import type { ExerciceFibonacci } from "../../core5e/suitesClassiques.types";
import { choisirParmi, entierAleatoire } from "./aleatoire";

/** Premiers termes des suites « de type Fibonacci » tirées (Lucas : 2, 1). */
const DEPARTS_TYPE_FIBONACCI: readonly [number, number][] = [
  [2, 1],
  [1, 3],
  [2, 3],
  [3, 1],
  [1, 4],
  [3, 2],
];

/** Scénario 5 — la suite de Fibonacci (u₁ = u₂ = 1), une fois sur deux, sinon une suite de type
 * Fibonacci (même règle uₙ = uₙ₋₂ + uₙ₋₁, autres premiers termes). Le rapport vₖ = uₖ₊₁/uₖ (k tiré
 * entre 5 et 9) tend dans tous les cas vers φ, racine positive de x² = x + 1 (formule du second
 * degré). */
export function construireFibonacci(historique: boolean = Math.random() < 0.5): ExerciceFibonacci {
  const [t1, t2] = historique ? [1, 1] : choisirParmi(DEPARTS_TYPE_FIBONACCI);
  const termes = [t1, t2];
  while (termes.length < 10) termes.push(termes[termes.length - 2] + termes[termes.length - 1]);
  const rangRapport = entierAleatoire(5, 9);
  const vk = termes[rangRapport] / termes[rangRapport - 1]; // u_{k+1}/u_k (tableau indexé à 0)
  const discriminant = 1 - 4 * 1 * -1; // b² − 4ac pour x² − x − 1 = 0
  const phi = (1 + Math.sqrt(discriminant)) / 2;
  return { scenario: "fibonacci", historique, dixPremiersTermes: termes, rangRapport, vk, phi };
}
