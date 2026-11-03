import type { ExerciceHyperboliquesA, TypeCombinaisonA } from "../../../core6e/hyperboliques.types";
import { tirerEntier, tirerParmi } from "../aleatoire";

/** 11 types, parité équilibrée (4 impaires, 4 paires, 3 ni l'une ni l'autre) — jamais une parité
 * devinable au seul nom de la brique de base (sh(x)², x·sh(x) sont PAIRES ; sh(x)+c n'a aucune
 * parité). */
const TOUS_LES_TYPES: readonly TypeCombinaisonA[] = [
  "shKx",
  "chKx",
  "shChProduit",
  "shCarre",
  "chCarre",
  "shPlusCh",
  "shMoinsCh",
  "shPlusConstante",
  "xSh",
  "xCh",
  "shCube",
];

const COEFFICIENTS_A = [-3, -2, -1, 1, 2, 3] as const;
const CONSTANTES_C = [-3, -2, -1, 1, 2, 3] as const;

/** Construit un exercice de famille A pour un `type` FORCÉ — utilisé par `construireAvecVarianteId`
 * (panneau dev, un bouton par type) et par `construireA` (tirage équiprobable des 11 types). */
export function construireAAvecType(type: TypeCombinaisonA, overrides?: { a?: number; k?: number; c?: number }): ExerciceHyperboliquesA {
  if (type === "shKx" || type === "chKx") {
    return { famille: "A", type, a: overrides?.a ?? tirerParmi(COEFFICIENTS_A), k: overrides?.k ?? tirerEntier(1, 3) };
  }
  if (type === "shPlusConstante") {
    return { famille: "A", type, c: overrides?.c ?? tirerParmi(CONSTANTES_C) };
  }
  return { famille: "A", type };
}

/** Tirage ÉQUIPROBABLE parmi les 11 types de combinaison. */
export function construireA(): ExerciceHyperboliquesA {
  return construireAAvecType(tirerParmi(TOUS_LES_TYPES));
}
