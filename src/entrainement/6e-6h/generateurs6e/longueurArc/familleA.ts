import type { ExerciceLongueurArcA } from "../../core6e/longueurArc.types";
import { tirerEntier, tirerParmi } from "../calculPrimitives/aleatoire";

/**
 * Couche A (6e) — génération, famille A ("Racine parfaite par construction") de `6gen28`. Technique
 * la plus importante du générateur (voir spec) : f(x)=(1/2)[x^(n+1)/(n+1) + x^(1−n)/(n−1)] est
 * construite pour que f'(x)=(1/2)(x^n−x^(−n)), ce qui rend 1+f'(x)² TOUJOURS un carré parfait —
 * identité algébrique vraie pour tout n (jamais un accident de tirage) :
 *
 *   1+f'(x)² = 1 + (1/4)(x^n−x^(−n))² = 1 + (1/4)(x^(2n) − 2 + x^(−2n))
 *            = (1/4)(x^(2n) + 2 + x^(−2n)) = [(1/2)(x^n+x^(−n))]².
 *
 * `tirerEntier`/`tirerParmi` réutilisés tels quels depuis `generateurs6e/calculPrimitives/
 * aleatoire.ts` (Couche A ↔ Couche A, réutilisation libre — CLAUDE.md).
 */

const VALEURS_N = [2, 3, 4] as const;

function tirerBornesDistinctesOrdonnees(): [number, number] {
  let a = tirerEntier(1, 4);
  let b = tirerEntier(1, 4);
  while (b === a) b = tirerEntier(1, 4);
  return a < b ? [a, b] : [b, a];
}

export function construireFamilleLongueurArcA(): ExerciceLongueurArcA {
  const n = tirerParmi(VALEURS_N);
  const [a, b] = tirerBornesDistinctesOrdonnees();
  return {
    famille: "A",
    n,
    a,
    b,
    fReference: (x) => 0.5 * (Math.pow(x, n + 1) / (n + 1) + Math.pow(x, 1 - n) / (n - 1)),
    fPrimeReference: (x) => 0.5 * (Math.pow(x, n) - Math.pow(x, -n)),
    racineSimplifieeReference: (x) => 0.5 * (Math.pow(x, n) + Math.pow(x, -n)),
    // Primitive de racineSimplifieeReference : ∫x^n dx = x^(n+1)/(n+1), ∫x^(−n) dx = x^(1−n)/(1−n).
    primitiveReference: (x) => 0.5 * (Math.pow(x, n + 1) / (n + 1) + Math.pow(x, 1 - n) / (1 - n)),
  };
}
