import type { ExerciceFamilleA } from "../../core6e/nombresComplexes.types";
import { tirerEntier, tirerParmi } from "../calculPrimitives/aleatoire";

/**
 * Couche A (6e) — génération, famille A ("Addition et soustraction") de `6gen34`. Coefficients
 * entiers simples ∈[-6;6] (spec), opération +/- tirée équiprobable. `tirerEntier`/`tirerParmi`
 * réutilisés depuis `generateurs6e/calculPrimitives/aleatoire.ts` (Couche A ↔ Couche A libre —
 * CLAUDE.md).
 */

const COEFF_MIN = -6;
const COEFF_MAX = 6;

export function construireFamilleA(): ExerciceFamilleA {
  const a = tirerEntier(COEFF_MIN, COEFF_MAX);
  const b = tirerEntier(COEFF_MIN, COEFF_MAX);
  const c = tirerEntier(COEFF_MIN, COEFF_MAX);
  const d = tirerEntier(COEFF_MIN, COEFF_MAX);
  const operation = tirerParmi(["+", "-"] as const);
  const resultat = operation === "+" ? { re: a + c, im: b + d } : { re: a - c, im: b - d };
  return { famille: "A", a, b, c, d, operation, resultat };
}
