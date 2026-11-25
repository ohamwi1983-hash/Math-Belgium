import type { ExerciceProbabiliteHypergeometrique } from "../core6e/probabiliteHypergeometrique.types";

/**
 * Écrans de `6gen47` (6e ch. 7, § 5). A : formule (avec C, forme vérifiée), puis valeur ; B :
 * probabilité de la séquence, nombre d'ordres, probabilité de la composition ; C : deux probabilités,
 * puis leur produit.
 */
export type PhaseProbabiliteHypergeometrique = "aEcran1" | "aEcran2" | "bEcran1" | "bEcran2" | "bEcran3" | "cEcran1" | "cEcran2" | "cEcran3";

export function phasesPourExercice(e: ExerciceProbabiliteHypergeometrique): PhaseProbabiliteHypergeometrique[] {
  switch (e.famille) {
    case "A":
      return ["aEcran1", "aEcran2"];
    case "B":
      return ["bEcran1", "bEcran2", "bEcran3"];
    case "C":
      return ["cEcran1", "cEcran2", "cEcran3"];
  }
}
