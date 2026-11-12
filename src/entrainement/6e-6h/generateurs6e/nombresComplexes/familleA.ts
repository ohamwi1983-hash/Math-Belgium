import type { ExerciceFamilleA } from "../../core6e/nombresComplexes.types";
import { tirerEntier, tirerParmi } from "../calculPrimitives/aleatoire";
import { tirerCasParticulier, tirerNonNul } from "./casParticuliers";

/**
 * Couche A (6e) — famille A (« Addition et soustraction ») de `6gen34`. Coefficients entiers non nuls
 * de [-6 ; 6] ; ~10 % de cas particuliers (un des deux nombres réel ou imaginaire pur, ou résultat à
 * partie réelle/imaginaire nulle) au lieu d'un coefficient nul une fois sur 13 par coefficient.
 */

const COEFF_MAX = 6;

export function construireFamilleA(): ExerciceFamilleA {
  const operation = tirerParmi(["+", "-"] as const);
  let a = tirerNonNul(-COEFF_MAX, COEFF_MAX);
  let b = tirerNonNul(-COEFF_MAX, COEFF_MAX);
  let c = tirerNonNul(-COEFF_MAX, COEFF_MAX);
  let d = tirerNonNul(-COEFF_MAX, COEFF_MAX);
  if (tirerCasParticulier()) {
    switch (tirerEntier(0, 2)) {
      case 0: // un nombre imaginaire pur
        if (Math.random() < 0.5) a = 0;
        else c = 0;
        break;
      case 1: // un nombre réel
        if (Math.random() < 0.5) b = 0;
        else d = 0;
        break;
      default: // partie imaginaire du résultat nulle
        d = operation === "+" ? -b : b;
    }
  } else {
    // Hors cas particulier : aucune partie du résultat nulle.
    while ((operation === "+" ? a + c : a - c) === 0) c = tirerNonNul(-COEFF_MAX, COEFF_MAX);
    while ((operation === "+" ? b + d : b - d) === 0) d = tirerNonNul(-COEFF_MAX, COEFF_MAX);
  }
  const resultat = operation === "+" ? { re: a + c, im: b + d } : { re: a - c, im: b - d };
  return { famille: "A", a, b, c, d, operation, resultat };
}
