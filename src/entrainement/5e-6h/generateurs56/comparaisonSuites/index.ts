// Copie 5e (6h) de `5e-4h/generateurs5e/comparaisonSuites/index.ts` (56gen11 ← 5gen18, chantier D du 26/11/2026) — copiée pour que les deux années puissent diverger.
import type { ExerciceComparaisonSuites, FamilleComparaisonSuites } from "./core/comparaisonSuites.types";
import { construireEpargneCroissance } from "./epargneCroissance";
import { construireStockDemande } from "./stockDemande";
import { construireVillesCroissance } from "./villesCroissance";

export const CATALOGUE_FAMILLES: { id: FamilleComparaisonSuites; label: string }[] = [
  { id: "villesCroissance", label: "Suite arithmétique vs suite géométrique" },
  { id: "stockDemande", label: "Suite arithmétique vs arithmétique" },
  { id: "epargneCroissance", label: "Suite géométrique vs géométrique" },
];

export function construireAvecFamilleId(familleId: FamilleComparaisonSuites): ExerciceComparaisonSuites {
  switch (familleId) {
    case "villesCroissance":
      return construireVillesCroissance();
    case "stockDemande":
      return construireStockDemande();
    case "epargneCroissance":
      return construireEpargneCroissance();
  }
}

export function genererExerciceComparaisonSuites(): ExerciceComparaisonSuites {
  const familles = CATALOGUE_FAMILLES.map((f) => f.id);
  const id = familles[Math.floor(Math.random() * familles.length)];
  return construireAvecFamilleId(id);
}
