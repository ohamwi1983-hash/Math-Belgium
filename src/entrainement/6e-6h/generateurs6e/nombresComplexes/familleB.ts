import type { ExerciceFamilleB, ExerciceFamilleB_Carre, ExerciceFamilleB_Cube, ExerciceFamilleB_Produit } from "../../core6e/nombresComplexes.types";
import { multiplierC } from "./arithmetiqueComplexe";
import { tirerParmi } from "../calculPrimitives/aleatoire";
import { tirerCasParticulier, tirerNonNul } from "./casParticuliers";

/**
 * Couche A (6e) — famille B (produit, carré, cube) de `6gen34`. Coefficients non nuls ; ~10 % de cas
 * particuliers (produit de conjugués → réel, carré de a±ai → imaginaire pur, cube d'un imaginaire
 * pur). Cube : coefficients bornés à [-3 ; 3] (résultats ≤ 2·27+… ≈ 100 en valeur absolue).
 */

const COEFF_MAX = 6;
const COEFF_MAX_CUBE = 3;

export function construireFamilleBProduit(): ExerciceFamilleB_Produit {
  const a = tirerNonNul(-COEFF_MAX, COEFF_MAX);
  const b = tirerNonNul(-COEFF_MAX, COEFF_MAX);
  let c: number;
  let d: number;
  if (tirerCasParticulier()) {
    c = a;
    d = -b;
  } else {
    do {
      c = tirerNonNul(-COEFF_MAX, COEFF_MAX);
      d = tirerNonNul(-COEFF_MAX, COEFF_MAX);
    } while ((c === a && d === -b) || a * d + b * c === 0 || a * c - b * d === 0);
  }
  const resultat = multiplierC({ re: a, im: b }, { re: c, im: d });
  return { famille: "B", sousType: "produit", a, b, c, d, resultat };
}

export function construireFamilleBCarre(): ExerciceFamilleB_Carre {
  const a = tirerNonNul(-COEFF_MAX, COEFF_MAX);
  let b: number;
  if (tirerCasParticulier()) b = Math.random() < 0.5 ? a : -a;
  else {
    do b = tirerNonNul(-COEFF_MAX, COEFF_MAX);
    while (Math.abs(b) === Math.abs(a));
  }
  const resultat = multiplierC({ re: a, im: b }, { re: a, im: b });
  return { famille: "B", sousType: "carre", a, b, resultat };
}

export function construireFamilleBCube(): ExerciceFamilleB_Cube {
  const a = tirerCasParticulier() ? 0 : tirerNonNul(-COEFF_MAX_CUBE, COEFF_MAX_CUBE);
  const b = tirerNonNul(-COEFF_MAX_CUBE, COEFF_MAX_CUBE);
  const carre = multiplierC({ re: a, im: b }, { re: a, im: b });
  const cube = multiplierC(carre, { re: a, im: b });
  return { famille: "B", sousType: "cube", a, b, carre, cube };
}

export function construireFamilleB(): ExerciceFamilleB {
  const sousType = tirerParmi(["produit", "carre", "cube"] as const);
  if (sousType === "produit") return construireFamilleBProduit();
  if (sousType === "carre") return construireFamilleBCarre();
  return construireFamilleBCube();
}
