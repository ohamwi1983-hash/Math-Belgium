/**
 * Couche A (5e) — point d'entrée unifié pour 5gen23 ("Limites et asymptotes en contexte"). 4
 * familles FIXES à fréquence égale (`POIDS`), jamais des dimensions combinables (contrairement à
 * 5gen22) — chaque famille reste fidèle à son contexte source.
 */
import type { ExerciceLimitesContexte } from "../../core5e/limitesContexte.types";
import { genererExerciceClubLoisirs } from "./clubLoisirs";
import { genererExerciceEauSalee } from "./eauSalee";
import { genererExercicePopulation } from "./population";
import { genererExercicePrixRevient } from "./prixRevient";

const POIDS: Record<ExerciceLimitesContexte["famille"], number> = {
  prixRevient: 1,
  eauSalee: 1,
  clubLoisirs: 1,
  population: 1,
};

function tirerFamille(): ExerciceLimitesContexte["famille"] {
  const entrees = Object.entries(POIDS) as [ExerciceLimitesContexte["famille"], number][];
  const total = entrees.reduce((s, [, p]) => s + p, 0);
  let r = Math.random() * total;
  for (const [famille, poids] of entrees) {
    if (r < poids) return famille;
    r -= poids;
  }
  return "prixRevient";
}

export function genererExerciceLimitesContexte(familleForcee?: ExerciceLimitesContexte["famille"]): ExerciceLimitesContexte {
  const famille = familleForcee ?? tirerFamille();
  switch (famille) {
    case "prixRevient":
      return genererExercicePrixRevient();
    case "eauSalee":
      return genererExerciceEauSalee();
    case "clubLoisirs":
      return genererExerciceClubLoisirs();
    case "population":
      return genererExercicePopulation();
  }
}

export const CATALOGUE_FAMILLES: { id: string; label: string }[] = [
  { id: "prixRevient", label: "A — Prix de revient" },
  { id: "eauSalee", label: "B — Eau salée" },
  { id: "clubLoisirs", label: "C — Club de loisirs" },
  { id: "population", label: "D — Population" },
];

export function construireAvecFamilleId(id: string): ExerciceLimitesContexte {
  if (id === "prixRevient" || id === "eauSalee" || id === "clubLoisirs" || id === "population") {
    return genererExerciceLimitesContexte(id);
  }
  throw new Error(`construireAvecFamilleId : id inconnu "${id}"`);
}
