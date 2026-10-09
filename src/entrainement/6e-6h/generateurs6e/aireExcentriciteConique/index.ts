import type { ExerciceAireExcentriciteConique } from "../../core6e/aireExcentriciteConique.types";
import { construireFamilleA } from "./familleA";
import { construireFamilleB } from "./familleB";
import { tirerParmi } from "./aleatoire";

export { construireFamilleA } from "./familleA";
export { construireFamilleB } from "./familleB";

/**
 * Couche A (6e) — point d'entrée `6gen60` ("Aire via rayons focaux et excentricité depuis une
 * condition géométrique"). Tirage à 1 niveau : la FAMILLE (A/B) est tirée ÉQUIPROBABLE — le
 * sous-type de la famille B est ensuite tiré équiprobable À L'INTÉRIEUR de `construireFamilleB`
 * (mirroir `equationConiqueCaracteristiques/index.ts`, 6gen59).
 */

export type IdVarianteAireExcentriciteConique =
  | "A_k_3_2"
  | "A_k_2"
  | "A_k_5_2"
  | "A_k_3"
  | "B_abscisseFoyerParallele"
  | "B_angleDroitSommetSecondaire"
  | "B_distanceDirectrices_carreParfait"
  | "B_distanceDirectrices_irrationnel";

export const CATALOGUE_VARIANTES: { id: IdVarianteAireExcentriciteConique; label: string }[] = [
  { id: "A_k_3_2", label: "A — k=3/2" },
  { id: "A_k_2", label: "A — k=2" },
  { id: "A_k_5_2", label: "A — k=5/2" },
  { id: "A_k_3", label: "A — k=3" },
  { id: "B_abscisseFoyerParallele", label: "B — abscisse = foyer + droite parallèle" },
  { id: "B_angleDroitSommetSecondaire", label: "B — angle droit depuis un sommet secondaire" },
  { id: "B_distanceDirectrices_carreParfait", label: "B — distance directrices (k=4, e propre)" },
  { id: "B_distanceDirectrices_irrationnel", label: "B — distance directrices (k=5, e irrationnel)" },
];

export function construireAvecVarianteId(id: IdVarianteAireExcentriciteConique): ExerciceAireExcentriciteConique {
  switch (id) {
    case "A_k_3_2":
      return construireFamilleA({ a: 6, b: 4, k: { num: 3, den: 2 } });
    case "A_k_2":
      return construireFamilleA({ a: 5, b: 4, k: { num: 2, den: 1 } });
    case "A_k_5_2":
      return construireFamilleA({ a: 7, b: 5, k: { num: 5, den: 2 } });
    case "A_k_3":
      return construireFamilleA({ a: 8, b: 6, k: { num: 3, den: 1 } });
    case "B_abscisseFoyerParallele":
      return construireFamilleB({ sousType: "abscisseFoyerParallele" });
    case "B_angleDroitSommetSecondaire":
      return construireFamilleB({ sousType: "angleDroitSommetSecondaire" });
    case "B_distanceDirectrices_carreParfait":
      return construireFamilleB({ sousType: "distanceDirectrices", k: 4 });
    case "B_distanceDirectrices_irrationnel":
      return construireFamilleB({ sousType: "distanceDirectrices", k: 5 });
  }
}

export function genererExerciceAireExcentriciteConique(): ExerciceAireExcentriciteConique {
  const famille = tirerParmi(["A", "B"] as const);
  return famille === "A" ? construireFamilleA() : construireFamilleB();
}
