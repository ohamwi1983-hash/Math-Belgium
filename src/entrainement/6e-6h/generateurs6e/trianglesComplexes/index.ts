import type { ExerciceTrianglesComplexes, FamilleTrianglesComplexes } from "../../core6e/trianglesComplexes.types";
import { construireFamilleA } from "./familleA";
import { construireFamilleB } from "./familleB";
import { construireFamilleC } from "./familleC";
import { construireFamilleD } from "./familleD";

export { construireFamilleA, construireFamilleB, construireFamilleC, construireFamilleD };

/**
 * Couche A (6e) — point d'entrée `6gen41` ("Propriétés géométriques de triangles via les nombres
 * complexes", chapitre 7 "Nombres complexes"). Tirage ÉQUIPROBABLE de la famille (A à D) — mirroir
 * `generateurs6e/formeTrigonometrique/index.ts` (6gen37).
 */

export type IdVarianteTrianglesComplexes = "A" | "B" | "C" | "D";

export const CATALOGUE_VARIANTES: { id: IdVarianteTrianglesComplexes; label: string }[] = [
  { id: "A", label: "A — Démontrer isocèle et/ou rectangle" },
  { id: "B", label: "B — Triangle isocèle non rectangle, loi des cosinus" },
  { id: "C", label: "C — Triangle équilatéral et point remarquable" },
  { id: "D", label: "D — Similitude entre deux triangles" },
];

export function construireAvecVarianteId(id: IdVarianteTrianglesComplexes): ExerciceTrianglesComplexes {
  switch (id) {
    case "A":
      return construireFamilleA();
    case "B":
      return construireFamilleB();
    case "C":
      return construireFamilleC();
    case "D":
      return construireFamilleD();
  }
}

const FAMILLES: FamilleTrianglesComplexes[] = ["A", "B", "C", "D"];

const CONSTRUCTEURS_PAR_FAMILLE: Record<FamilleTrianglesComplexes, () => ExerciceTrianglesComplexes> = {
  A: construireFamilleA,
  B: construireFamilleB,
  C: construireFamilleC,
  D: construireFamilleD,
};

export function genererExerciceTrianglesComplexes(): ExerciceTrianglesComplexes {
  const famille = FAMILLES[Math.floor(Math.random() * FAMILLES.length)];
  return CONSTRUCTEURS_PAR_FAMILLE[famille]();
}
