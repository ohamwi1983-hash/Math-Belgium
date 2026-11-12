import type { ExerciceFamilleA } from "../../core6e/affixesRacines.types";
import { tirerEntierNonNul } from "../calculPrimitives/aleatoire";

/**
 * Couche A (6e) — famille A (« Propriétés de z+z̄ et z−z̄ ») de `6gen35`. a et b non nuls de [-8 ; 8] ;
 * cas particulier (~10 %) : z imaginaire pur (a = 0, z+z̄ = 0).
 */

const COEFF_MAX = 8;
const PROBABILITE_CAS_PARTICULIER = 0.1;

export function construireFamilleA(): ExerciceFamilleA {
  const a = Math.random() < PROBABILITE_CAS_PARTICULIER ? 0 : tirerEntierNonNul(-COEFF_MAX, COEFF_MAX);
  const b = tirerEntierNonNul(-COEFF_MAX, COEFF_MAX);
  return { famille: "A", a, b, somme: { re: 2 * a, im: 0 }, difference: { re: 0, im: 2 * b } };
}
