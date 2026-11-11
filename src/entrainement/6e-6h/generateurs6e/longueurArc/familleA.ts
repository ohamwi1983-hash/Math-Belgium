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

function construirePuissances(): ExerciceLongueurArcA {
  const n = tirerParmi(VALEURS_N);
  const [a, b] = tirerBornesDistinctesOrdonnees();
  return {
    famille: "A",
    forme: "puissances",
    n,
    c: 0,
    a,
    b,
    fReference: (x) => 0.5 * (Math.pow(x, n + 1) / (n + 1) + Math.pow(x, 1 - n) / (n - 1)),
    fPrimeReference: (x) => 0.5 * (Math.pow(x, n) - Math.pow(x, -n)),
    racineSimplifieeReference: (x) => 0.5 * (Math.pow(x, n) + Math.pow(x, -n)),
    primitiveReference: (x) => 0.5 * (Math.pow(x, n + 1) / (n + 1) + Math.pow(x, 1 - n) / (1 - n)),
  };
}

const VALEURS_C = [1, 2, 3] as const;

/** Forme `log` (audit chapitre 4 de 6e, point 24) : f(x) = x²/(4c) − (c/2)·ln(x), donc
 * f'(x) = x/(2c) − c/(2x) et 1 + f'(x)² = (x/(2c) + c/(2x))² — un carré parfait, comme la forme
 * `puissances` (le produit des deux termes vaut 1/4). Bornes entières dans [1 ; 5] : la longueur
 * vaut (b² − a²)/(4c) + (c/2)·ln(b/a). c = 1 donne l'exemple classique x²/4 − ½·ln(x). */
function construireLog(): ExerciceLongueurArcA {
  const c = tirerParmi(VALEURS_C);
  let a = tirerEntier(1, 5);
  let b = tirerEntier(1, 5);
  while (b === a) b = tirerEntier(1, 5);
  if (a > b) [a, b] = [b, a];
  return {
    famille: "A",
    forme: "log",
    n: 0,
    c,
    a,
    b,
    fReference: (x) => (x * x) / (4 * c) - (c / 2) * Math.log(x),
    fPrimeReference: (x) => x / (2 * c) - c / (2 * x),
    racineSimplifieeReference: (x) => x / (2 * c) + c / (2 * x),
    primitiveReference: (x) => (x * x) / (4 * c) + (c / 2) * Math.log(x),
  };
}

export function construireFamilleLongueurArcA(): ExerciceLongueurArcA {
  return Math.random() < 0.5 ? construirePuissances() : construireLog();
}
