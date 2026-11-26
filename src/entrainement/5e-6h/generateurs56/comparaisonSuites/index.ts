// Copie 5e (6h) de `5e-4h/generateurs5e/comparaisonSuites/index.ts` (56gen11 ← 5gen18, chantier D du 26/11/2026) — copiée pour que les deux années puissent diverger.
import type { ExerciceComparaisonSuites, FamilleComparaisonSuites } from "./core/comparaisonSuites.types";
import { construireEpargneCroissance } from "./epargneCroissance";
import { construireStockDemande } from "./stockDemande";
import { construireVillesCroissance } from "./villesCroissance";
import { construireMalthus } from "./malthus";

/** Familles d'origine (5gen18) : tirage libre de l'adaptateur et des `?code=` libres, inchangé. */
const FAMILLES_ORIGINE: FamilleComparaisonSuites[] = ["villesCroissance", "stockDemande", "epargneCroissance"];

/** 5e (6h) : « Malthus » AJOUTÉE EN FIN de catalogue (indices 0–2 et `?code=` d'origine inchangés). */
export type IdVarianteComparaison56 = FamilleComparaisonSuites | "malthus";

export const CATALOGUE_FAMILLES: { id: IdVarianteComparaison56; label: string }[] = [
  { id: "villesCroissance", label: "Suite arithmétique vs suite géométrique" },
  { id: "stockDemande", label: "Suite arithmétique vs arithmétique" },
  { id: "epargneCroissance", label: "Suite géométrique vs géométrique" },
  { id: "malthus", label: "Malthus : population géométrique contre nourriture arithmétique" },
];

export function construireAvecFamilleId(familleId: IdVarianteComparaison56): ExerciceComparaisonSuites {
  switch (familleId) {
    case "malthus":
      return construireMalthus();
    case "villesCroissance":
      return construireVillesCroissance();
    case "stockDemande":
      return construireStockDemande();
    case "epargneCroissance":
      return construireEpargneCroissance();
  }
}

export function genererExerciceComparaisonSuites(): ExerciceComparaisonSuites {
  const familles = FAMILLES_ORIGINE;
  const id = familles[Math.floor(Math.random() * familles.length)];
  return construireAvecFamilleId(id);
}

/** Tirage de l'appli 56gen11 : « Malthus » une fois sur quatre, sinon le tirage d'origine. */
export function genererExercice56gen11Libre(): ExerciceComparaisonSuites {
  return Math.random() < 0.25 ? construireMalthus() : genererExerciceComparaisonSuites();
}
