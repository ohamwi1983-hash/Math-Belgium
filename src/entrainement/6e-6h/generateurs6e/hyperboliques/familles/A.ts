import type { ExerciceHyperboliquesA, TypeCombinaisonA } from "../../../core6e/hyperboliques.types";
import { tirerEntier, tirerParmi } from "../aleatoire";

const TYPES_AVEC_K = ["shKx", "chKx"] as const;
const TYPES_SANS_K = ["shChProduit", "shCarre", "chCarre", "shPlusCh", "shMoinsCh"] as const;
const TOUS_LES_TYPES: readonly TypeCombinaisonA[] = [...TYPES_AVEC_K, ...TYPES_SANS_K];

/** Construit un exercice de famille A pour un `type` FORCÉ — utilisé par `construireAvecVarianteId`
 * (panneau dev, un bouton par type) et par `construireA` (tirage équiprobable des 7 types). */
export function construireAAvecType(type: TypeCombinaisonA, overrides?: { k?: number }): ExerciceHyperboliquesA {
  if (type === "shKx" || type === "chKx") {
    return { famille: "A", type, k: overrides?.k ?? tirerEntier(1, 3) };
  }
  return { famille: "A", type };
}

/** Tirage ÉQUIPROBABLE parmi les 7 types de combinaison (spec : type tiré parmi les 7). */
export function construireA(): ExerciceHyperboliquesA {
  return construireAAvecType(tirerParmi(TOUS_LES_TYPES));
}
