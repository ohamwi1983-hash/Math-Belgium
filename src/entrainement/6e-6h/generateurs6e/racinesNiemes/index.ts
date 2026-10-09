import type { ExerciceRacinesNiemes, FamilleRacinesNiemes } from "../../core6e/racinesNiemes.types";
import { construireFamilleA } from "./familleA";
import { construireFamilleB } from "./familleB";
import { construireFamilleC } from "./familleC";

export { construireFamilleA, construireFamilleB, construireFamilleC };

/**
 * Couche A (6e) — point d'entrée `6gen39` ("Racines n-ièmes d'un nombre complexe", chapitre 7
 * "Nombres complexes"). Tirage ÉQUIPROBABLE de la famille (A/B/C) — mirroir
 * `generateurs6e/formeTrigonometrique/index.ts` (6gen37).
 */

export type IdVarianteRacinesNiemes = "A" | "B" | "C";

export const CATALOGUE_VARIANTES: { id: IdVarianteRacinesNiemes; label: string }[] = [
  { id: "A", label: "A — Racines n-ièmes, cas propre (angles remarquables)" },
  { id: "B", label: "B — Racines n-ièmes, cas général" },
  { id: "C", label: "C — zⁿ=wⁿ, astuce racine de l'unité" },
];

export function construireAvecVarianteId(id: IdVarianteRacinesNiemes): ExerciceRacinesNiemes {
  switch (id) {
    case "A":
      return construireFamilleA();
    case "B":
      return construireFamilleB();
    case "C":
      return construireFamilleC();
  }
}

const FAMILLES: FamilleRacinesNiemes[] = ["A", "B", "C"];

const CONSTRUCTEURS_PAR_FAMILLE: Record<FamilleRacinesNiemes, () => ExerciceRacinesNiemes> = {
  A: construireFamilleA,
  B: construireFamilleB,
  C: construireFamilleC,
};

export function genererExerciceRacinesNiemes(): ExerciceRacinesNiemes {
  const famille = FAMILLES[Math.floor(Math.random() * FAMILLES.length)];
  return CONSTRUCTEURS_PAR_FAMILLE[famille]();
}
