import type { Q } from "../moteur6e/algebreLieux";

/**
 * `6gen60` — Aire, rayons focaux et excentricité (6e ch. 10, § 3, processus 3 TRANSFÉRER ; audit, lots B
 * et C). Énoncés TIRÉS (a, b, k, condition), valeurs EXACTES (aire en racine simplifiée), toute relation
 * équivalente acceptée pour l'excentricité.
 */

/** A — ellipse x²/a² + y²/b² = 1, P tel que PF = k·PF′. */
export interface ExerciceAireA {
  famille: "A";
  a: number;
  b: number;
  k: Q;
  pf: Q;
  pfp: Q;
  cos: Q;
  /** Carré de l'aire du triangle FPF′ (rationnel). */
  aire2: Q;
}

export type SousTypeB = "abscisseFoyerParallele" | "angleSommetNonFocal" | "distanceDirectrices";

/** B — l'excentricité d'une ellipse à partir d'une condition géométrique. */
export interface ExerciceAireB {
  famille: "B";
  sousType: SousTypeB;
  /** Paramètre de la condition : t (OP ∥ A′K, K(0 ; t·b)), cos de l'angle FBF′, ou k (directrices). */
  parametre: Q;
  /** e² exact. */
  e2: Q;
}

export type ExerciceAireExcentriciteConique = ExerciceAireA | ExerciceAireB;
