/**
 * Couche A (5e) — Famille 0 de 5gen20 : "Nombre réel" (substitution directe, résultat fini).
 * Construction à l'envers : `a` et `D(a)` (non nul) sont choisis EN PREMIER, `bD` s'en déduit —
 * aucun rejet/régénération possible, `D(a)≠0` est garanti par construction et non par un test.
 */
import type { ExerciceLimiteReelle } from "../../core5e/limites.types";
import { entierAleatoire, entierNonNul, reduireFraction } from "./fraction";

export function genererExerciceLimiteReelle(): ExerciceLimiteReelle {
  const a = entierAleatoire(-4, 4);

  const kN = entierNonNul(4);
  const bN = entierAleatoire(-6, 6);

  const kD = entierNonNul(4);
  const dA = entierNonNul(6);
  const bD = dA - kD * a;

  const nA = kN * a + bN;

  return {
    famille: "limiteReelle",
    a,
    kN,
    bN,
    kD,
    bD,
    limite: reduireFraction(nA, dA),
  };
}
