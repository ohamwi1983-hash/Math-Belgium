import type { ExercicePapyrusRhind } from "../../core5e/suitesClassiques.types";
import { sommeArithmetique, termeArithmetique } from "../suitesArithmetiques/parametres";
import { choisirParmi } from "./aleatoire";

/** Couples (nombre de pains S, facteur k) retenus : parts a et Δ de dénominateur au plus 6 (les
 * fractions restent lisibles, comme les 5/3 et 55/6 du papyrus). (100, 7) est le problème 40 du
 * papyrus de Rhind lui-même. */
export const COUPLES_PAPYRUS: readonly { somme: number; facteur: number }[] = (() => {
  const couples: { somme: number; facteur: number }[] = [];
  for (const somme of [50, 60, 75, 80, 90, 100, 120, 150, 180, 200, 240, 300]) {
    for (const facteur of [3, 4, 5, 7]) {
      const den = 15 * (facteur + 1);
      const numA = somme * (9 - facteur);
      const numD = somme * (2 * facteur - 3);
      const denA = den / pgcd(numA, den);
      const denD = den / pgcd(numD, den);
      if (denA <= 6 && denD <= 6) couples.push({ somme, facteur });
    }
  }
  return couples;
})();

function pgcd(a: number, b: number): number {
  return b === 0 ? Math.abs(a) : pgcd(b, a % b);
}

/** Scénario 2 — papyrus de Rhind : S pains partagés entre 5 personnes, parts en progression
 * arithmétique (a, a + Δ, …, a + 4Δ), et la somme des 3 plus grandes parts vaut k fois celle des 2
 * plus petites (papyrus : S = 100, k = 7).
 *
 * Système : 5a + 10Δ = S (somme des 5 parts) et k(2a + Δ) = 3a + 9Δ (2a + Δ = u₁ + u₂, les 2 plus
 * petites ; 3a + 9Δ = u₃ + u₄ + u₅, les 3 plus grandes). La seconde équation donne
 * (2k − 3)a = (9 − k)Δ ; avec a = S/5 − 2Δ : a = S(9 − k)/(15(k + 1)), Δ = S(2k − 3)/(15(k + 1)). */
export function construirePapyrusRhind(couple = choisirParmi(COUPLES_PAPYRUS)): ExercicePapyrusRhind {
  const { somme: sommeTotale, facteur } = couple;
  const a = (sommeTotale * (9 - facteur)) / (15 * (facteur + 1));
  const delta = (sommeTotale * (2 * facteur - 3)) / (15 * (facteur + 1));
  const termes: [number, number, number, number, number] = [
    termeArithmetique(a, delta, 1),
    termeArithmetique(a, delta, 2),
    termeArithmetique(a, delta, 3),
    termeArithmetique(a, delta, 4),
    termeArithmetique(a, delta, 5),
  ];
  return { scenario: "papyrusRhind", sommeTotale, facteur, a, delta, termes };
}

/** Les deux membres du système d'origine en (a, Δ) — pour recouper la résolution en test. */
export function verifieSystemePapyrusRhind(e: ExercicePapyrusRhind): { somme: number; gauche: number; droite: number } {
  return {
    somme: sommeArithmetique(e.a, e.delta, 5),
    gauche: e.facteur * (e.termes[0] + e.termes[1]),
    droite: e.termes[2] + e.termes[3] + e.termes[4],
  };
}
