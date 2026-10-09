import type { ExerciceAffixesRacines, FamilleAffixesRacines } from "../../core6e/affixesRacines.types";
import { construireFamilleA } from "./familleA";
import { construireFamilleB } from "./familleB";
import { construireFamilleC } from "./familleC";

export { construireFamilleA, construireFamilleB, construireFamilleC };

/**
 * Couche A (6e) — point d'entrée `6gen35` ("Nombres complexes : affixes et racines carrées",
 * chapitre 7). Tirage à 1 seul niveau (contrairement à 6gen34, aucune famille n'a de sous-type ici)
 * : la famille (A/B/C) est tirée ÉQUIPROBABLE, mirroir `generateurs6e/nombresComplexes/index.ts`.
 */

export type IdVarianteAffixesRacines = FamilleAffixesRacines;

export const CATALOGUE_VARIANTES: { id: IdVarianteAffixesRacines; label: string }[] = [
  { id: "A", label: "A — Propriétés de z+z̄ et z−z̄" },
  { id: "B", label: "B — Parallélogramme via affixes" },
  { id: "C", label: "C — Racines carrées d'un nombre complexe" },
];

export function construireAvecVarianteId(id: IdVarianteAffixesRacines): ExerciceAffixesRacines {
  switch (id) {
    case "A":
      return construireFamilleA();
    case "B":
      return construireFamilleB();
    case "C":
      return construireFamilleC();
  }
}

const FAMILLES: FamilleAffixesRacines[] = ["A", "B", "C"];

export function genererExerciceAffixesRacines(): ExerciceAffixesRacines {
  const famille = FAMILLES[Math.floor(Math.random() * FAMILLES.length)];
  return construireAvecVarianteId(famille);
}
