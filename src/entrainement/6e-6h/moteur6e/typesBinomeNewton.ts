import type { ExerciceBinomeNewton } from "../core6e/binomeNewton.types";

/**
 * Écrans de `6gen45` (6e ch. 7, § 3). A : coefficients Cₙᵏ, coefficients des termes, polynôme
 * développé (forme développée exigée) ; B : valeur de k, les trois facteurs, coefficient ; C :
 * approximation 1 + nε, premier terme négligé, valeur à la calculatrice ; D : trois nombres de la ligne
 * suivante du triangle, somme de cette ligne.
 */
export type PhaseBinomeNewton = "aEcran1" | "aEcran2" | "aEcran3" | "bTrouverKEcran" | "bPoserEcran" | "bCalculerEcran" | "cEcran1" | "cEcran2" | "cEcran3" | "dEcran1" | "dEcran2";

export function phasesPourExercice(e: ExerciceBinomeNewton): PhaseBinomeNewton[] {
  switch (e.famille) {
    case "A":
      return ["aEcran1", "aEcran2", "aEcran3"];
    case "B":
      return ["bTrouverKEcran", "bPoserEcran", "bCalculerEcran"];
    case "C":
      return ["cEcran1", "cEcran2", "cEcran3"];
    case "D":
      return ["dEcran1", "dEcran2"];
  }
}
