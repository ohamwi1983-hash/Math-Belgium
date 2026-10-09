import type { ExerciceMethodeGeneratrices } from "../../core6e/methodeGeneratrices.types";
import { construireFamilleA } from "./familleA";
import { construireFamilleB } from "./familleB";
import { construireFamilleC } from "./familleC";
import { construireFamilleD, construireSousCas1, construireSousCas2 } from "./familleD";
import { construireFamilleE } from "./familleE";

export { construireFamilleA, construireFamilleB, construireFamilleC, construireFamilleD, construireSousCas1, construireSousCas2, construireFamilleE };

/**
 * Couche A (6e) — point d'entrée `6gen57` ("Problèmes de lieux : méthode des génératrices").
 * Tirage à 2 niveaux : la FAMILLE (A à E) est tirée ÉQUIPROBABLE, PUIS pour la famille D
 * uniquement, un sous-cas (1 ou 2) est tiré à son tour ÉQUIPROBABLE (voir `familleD.ts`) — mirroir
 * du patron `generateurs6e/denombrementFondamental/index.ts` (6gen43).
 */
export type IdVarianteMethodeGeneratrices = "A" | "B" | "C" | "D_sousCas1" | "D_sousCas2" | "E";

export const CATALOGUE_VARIANTES: { id: IdVarianteMethodeGeneratrices; label: string }[] = [
  { id: "A", label: "A — Parallélogramme" },
  { id: "B", label: "B — Triangle et céviennes parallèles" },
  { id: "C", label: "C — Angles α et 2α, cercle" },
  { id: "D_sousCas1", label: "D — Centre de gravité (sous-cas 1 : BC∥d)" },
  { id: "D_sousCas2", label: "D — Centre de gravité (sous-cas 2 : BC non∥d)" },
  { id: "E", label: "E — Perpendiculaires variables" },
];

export function construireAvecVarianteId(id: IdVarianteMethodeGeneratrices): ExerciceMethodeGeneratrices {
  switch (id) {
    case "A":
      return construireFamilleA();
    case "B":
      return construireFamilleB();
    case "C":
      return construireFamilleC();
    case "D_sousCas1":
      return construireSousCas1();
    case "D_sousCas2":
      return construireSousCas2();
    case "E":
      return construireFamilleE();
  }
}

const CONSTRUCTEURS: (() => ExerciceMethodeGeneratrices)[] = [construireFamilleA, construireFamilleB, construireFamilleC, construireFamilleD, construireFamilleE];

export function genererExerciceMethodeGeneratrices(): ExerciceMethodeGeneratrices {
  return CONSTRUCTEURS[Math.floor(Math.random() * CONSTRUCTEURS.length)]();
}
