import type { ExerciceProbabilitesEnsembles } from "../../core6e/probabilitesEnsembles.types";
import { construireFamilleA, genererFamilleA } from "./familleA";
import { construireFamilleB, genererFamilleB } from "./familleB";

/**
 * Couche A (6e) — point d'entrée pour `6gen30`. Tirage ÉQUIPROBABLE de la famille (A/B, spec),
 * chaque famille tirant ensuite son propre contexte/sous-type en interne (voir `familleA.ts`/
 * `familleB.ts`).
 */

function tirerParmi<T>(candidats: readonly T[]): T {
  return candidats[Math.floor(Math.random() * candidats.length)];
}

export function genererExerciceProbabilitesEnsembles(): ExerciceProbabilitesEnsembles {
  return tirerParmi(["A", "B"] as const) === "A" ? genererFamilleA() : genererFamilleB();
}

/** Identifiants de variante forcée — granularité "ce qui change la structure de la question",
 * jamais un identifiant par tirage numérique individuel (les effectifs/le contexte restent
 * aléatoires même une fois la variante forcée). Famille A : croise `troisiemeDonnee` (3 valeurs) et
 * `sousTypeEcran3` (2 valeurs) = 6 entrées. Famille B : croise `sousType` (cartes/dés) et
 * `demandeEcran2` (intersection/union) = 4 entrées. */
export type IdVarianteProbabilitesEnsembles = "A-PAetB-incompatibilite" | "A-PAetB-comparaison" | "A-PAouB-incompatibilite" | "A-PAouB-comparaison" | "A-PniAniB-incompatibilite" | "A-PniAniB-comparaison" | "B-cartes-intersection" | "B-cartes-union" | "B-des-intersection" | "B-des-union";

export const CATALOGUE_VARIANTES: { id: IdVarianteProbabilitesEnsembles; label: string }[] = [
  { id: "A-PAetB-incompatibilite", label: "A — donnée P(A∩B), écran 3 incompatibilité" },
  { id: "A-PAetB-comparaison", label: "A — donnée P(A∩B), écran 3 comparaison conditionnelle" },
  { id: "A-PAouB-incompatibilite", label: "A — donnée P(A∪B), écran 3 incompatibilité" },
  { id: "A-PAouB-comparaison", label: "A — donnée P(A∪B), écran 3 comparaison conditionnelle" },
  { id: "A-PniAniB-incompatibilite", label: "A — donnée P(ni A ni B), écran 3 incompatibilité" },
  { id: "A-PniAniB-comparaison", label: "A — donnée P(ni A ni B), écran 3 comparaison conditionnelle" },
  { id: "B-cartes-intersection", label: "B — cartes, écran 2 intersection" },
  { id: "B-cartes-union", label: "B — cartes, écran 2 union" },
  { id: "B-des-intersection", label: "B — dés, écran 2 intersection" },
  { id: "B-des-union", label: "B — dés, écran 2 union" },
];

export function construireAvecVarianteId(id: IdVarianteProbabilitesEnsembles): ExerciceProbabilitesEnsembles {
  switch (id) {
    case "A-PAetB-incompatibilite":
      return construireFamilleA("PAetB", "incompatibilite");
    case "A-PAetB-comparaison":
      return construireFamilleA("PAetB", "comparaisonConditionnelle");
    case "A-PAouB-incompatibilite":
      return construireFamilleA("PAouB", "incompatibilite");
    case "A-PAouB-comparaison":
      return construireFamilleA("PAouB", "comparaisonConditionnelle");
    case "A-PniAniB-incompatibilite":
      return construireFamilleA("PniAniB", "incompatibilite");
    case "A-PniAniB-comparaison":
      return construireFamilleA("PniAniB", "comparaisonConditionnelle");
    case "B-cartes-intersection":
      return construireFamilleB("cartes", "intersection");
    case "B-cartes-union":
      return construireFamilleB("cartes", "union");
    case "B-des-intersection":
      return construireFamilleB("des", "intersection");
    case "B-des-union":
      return construireFamilleB("des", "union");
  }
}
