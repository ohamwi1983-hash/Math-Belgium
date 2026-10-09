import type { ExerciceFamilleA } from "../../core6e/affixesRacines.types";
import { tirerEntier, tirerEntierNonNul } from "../calculPrimitives/aleatoire";

/**
 * Couche A (6e) — génération, famille A ("Propriétés de z+z̄ et z−z̄") de `6gen35`. `a` entier
 * simple ∈[-8;8], `b` non nul ∈[-8;8]\{0} (spec : b≠0, sinon z̄=z et les 2 propriétés à démontrer
 * sont triviales). `tirerEntier`/`tirerEntierNonNul` réutilisés depuis
 * `generateurs6e/calculPrimitives/aleatoire.ts` (Couche A ↔ Couche A libre — CLAUDE.md).
 */

const COEFF_MIN = -8;
const COEFF_MAX = 8;

export function construireFamilleA(): ExerciceFamilleA {
  const a = tirerEntier(COEFF_MIN, COEFF_MAX);
  const b = tirerEntierNonNul(COEFF_MIN, COEFF_MAX);
  return { famille: "A", a, b, somme: { re: 2 * a, im: 0 }, difference: { re: 0, im: 2 * b } };
}
