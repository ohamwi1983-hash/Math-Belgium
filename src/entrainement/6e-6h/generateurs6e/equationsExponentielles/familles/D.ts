import type { ExerciceEqExpoD1, ExerciceEqExpoD2 } from "../../../core6e/equationsExponentielles.types";
import { tirerEntier, tirerEntierNonNul } from "../aleatoire";
import { tirerBaseD } from "../bases";

/**
 * Famille D — positivité stricte, impossible par construction, ∅ TOUJOURS. Écran unique de pure
 * reconnaissance (aucun calcul, voir `moteur6e/verificationEquationsExponentielles.ts`).
 *
 * - D1 — `c·base^(mx+n) = 0`, `c≠0` : `base^(quoi que ce soit)` est STRICTEMENT positif, un
 *   produit par `c≠0` ne peut jamais s'annuler.
 * - D2 — `base1^(m1x+n1) + base2^(m2x+n2) + k = 0`, `k≥0` : somme de 2 termes strictement positifs
 *   plus une constante NON-NÉGATIVE, jamais nulle.
 */

export function construireD1(): ExerciceEqExpoD1 {
  const base = tirerBaseD();
  const c = tirerEntierNonNul(-5, 5);
  const m = tirerEntierNonNul(-4, 4);
  const n = tirerEntier(-5, 5);
  return { famille: "D", sousType: "D1", base, c, m, n };
}

export function construireD2(): ExerciceEqExpoD2 {
  const base1 = tirerBaseD();
  const base2 = tirerBaseD();
  const m1 = tirerEntierNonNul(-4, 4);
  const n1 = tirerEntier(-5, 5);
  const m2 = tirerEntierNonNul(-4, 4);
  const n2 = tirerEntier(-5, 5);
  const k = tirerEntier(0, 5);
  return { famille: "D", sousType: "D2", base1, base2, m1, n1, m2, n2, k };
}
