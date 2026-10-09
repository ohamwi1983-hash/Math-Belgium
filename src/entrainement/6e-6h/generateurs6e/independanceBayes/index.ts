import type { ExerciceIndependanceBayes } from "../../core6e/independanceBayes.types";
import { construireFamilleAPannes, construireFamilleAUnion, genererFamilleA } from "./familleA";
import { construireFamilleBHistogramme, construireFamilleBReconstruire, construireFamilleBTableauDonne, genererFamilleB } from "./familleB";
import { construireFamilleC, genererFamilleC } from "./familleC";

/**
 * Couche A (6e) — point d'entrée pour `6gen32`. Tirage ÉQUIPROBABLE de la famille (A/B/C, spec),
 * chaque famille tirant ensuite son propre sous-type/contexte en interne (voir `familleA.ts`/
 * `familleB.ts`/`familleC.ts`).
 */

function tirerParmi<T>(candidats: readonly T[]): T {
  return candidats[Math.floor(Math.random() * candidats.length)];
}

export function genererExerciceIndependanceBayes(): ExerciceIndependanceBayes {
  const famille = tirerParmi(["A", "B", "C"] as const);
  if (famille === "A") return genererFamilleA();
  if (famille === "B") return genererFamilleB();
  return genererFamilleC();
}

/** Identifiants de variante forcée — granularité "ce qui change la structure de la question" (même
 * principe que `6gen30`), jamais un identifiant par tirage numérique individuel. */
export type IdVarianteIndependanceBayes = "A-pannes-lesDeux" | "A-pannes-aucun" | "A-pannes-auMoinsUn" | "A-pannes-exactementUn" | "A-union" | "B-histogramme-inferieur" | "B-histogramme-auMoins" | "B-tableauDonne" | "B-reconstruire" | "C-causeSachantEffet" | "C-causeSachantPasEffet";

export const CATALOGUE_VARIANTES: { id: IdVarianteIndependanceBayes; label: string }[] = [
  { id: "A-pannes-lesDeux", label: "A — pannes, écran 2 : les deux se produisent" },
  { id: "A-pannes-aucun", label: "A — pannes, écran 2 : aucun ne se produit" },
  { id: "A-pannes-auMoinsUn", label: "A — pannes, écran 2 : au moins un se produit" },
  { id: "A-pannes-exactementUn", label: "A — pannes, écran 2 : exactement un (double indépendance)" },
  { id: "A-union", label: "A — P(A), P(A∪B) donnés, indépendance" },
  { id: "B-histogramme-inferieur", label: "B — histogramme, P(X < cible)" },
  { id: "B-histogramme-auMoins", label: "B — histogramme, P(X ≥ cible)" },
  { id: "B-tableauDonne", label: "B — grand tableau donné (lecture)" },
  { id: "B-reconstruire", label: "B — reconstruire un tableau depuis des %" },
  { id: "C-causeSachantEffet", label: "C — Bayes, P(cause1|effet)" },
  { id: "C-causeSachantPasEffet", label: "C — Bayes, P(cause1|pas effet)" },
];

export function construireAvecVarianteId(id: IdVarianteIndependanceBayes): ExerciceIndependanceBayes {
  switch (id) {
    case "A-pannes-lesDeux":
      return construireFamilleAPannes("lesDeux");
    case "A-pannes-aucun":
      return construireFamilleAPannes("aucun");
    case "A-pannes-auMoinsUn":
      return construireFamilleAPannes("auMoinsUn");
    case "A-pannes-exactementUn":
      return construireFamilleAPannes("exactementUn");
    case "A-union":
      return construireFamilleAUnion();
    case "B-histogramme-inferieur":
      return construireFamilleBHistogramme("inferieur");
    case "B-histogramme-auMoins":
      return construireFamilleBHistogramme("auMoins");
    case "B-tableauDonne":
      return construireFamilleBTableauDonne(tirerParmi(["jointe", "margLigne", "margColonne", "condLigneSachantColonne", "condColonneSachantLigne"] as const));
    case "B-reconstruire":
      return construireFamilleBReconstruire(tirerParmi(["jointe", "margLigne", "margColonne", "condLigneSachantColonne", "condColonneSachantLigne"] as const));
    case "C-causeSachantEffet":
      return construireFamilleC("cause1SachantEffet");
    case "C-causeSachantPasEffet":
      return construireFamilleC("cause1SachantPasEffet");
  }
}
