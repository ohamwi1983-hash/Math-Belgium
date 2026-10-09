import type { ExerciceFamilleB, ExerciceFamilleB_Carre, ExerciceFamilleB_Cube, ExerciceFamilleB_Produit } from "../../core6e/nombresComplexes.types";
import { multiplierC } from "./arithmetiqueComplexe";
import { tirerEntier, tirerParmi } from "../calculPrimitives/aleatoire";

/**
 * Couche A (6e) — génération, famille B ("Multiplication et puissances") de `6gen34`. 3
 * sous-types tirés équiprobablement (`construireFamilleB`) — voir aussi les constructeurs
 * GRANULAIRES par sous-type (mirroir `calculPrimitives`) pour un contrôle fin (`SelecteurVarianteDev`,
 * tests ciblés).
 */

const COEFF_MIN = -6;
const COEFF_MAX = 6;

function tirerCoef(): number {
  return tirerEntier(COEFF_MIN, COEFF_MAX);
}

export function construireFamilleBProduit(): ExerciceFamilleB_Produit {
  const a = tirerCoef();
  const b = tirerCoef();
  const c = tirerCoef();
  const d = tirerCoef();
  const resultat = multiplierC({ re: a, im: b }, { re: c, im: d });
  return { famille: "B", sousType: "produit", a, b, c, d, resultat };
}

export function construireFamilleBCarre(): ExerciceFamilleB_Carre {
  const a = tirerCoef();
  const b = tirerCoef();
  const resultat = multiplierC({ re: a, im: b }, { re: a, im: b });
  return { famille: "B", sousType: "carre", a, b, resultat };
}

/** Écran 1 = (a+bi)² ; écran 2 = ce carré (déjà CORRECT, jamais recalculé depuis la saisie élève —
 * voir `moteur6e/verificationNombresComplexes.ts`) multiplié par (a+bi) = (a+bi)³. */
export function construireFamilleBCube(): ExerciceFamilleB_Cube {
  const a = tirerCoef();
  const b = tirerCoef();
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
