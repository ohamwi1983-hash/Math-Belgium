import type { ExerciceTrianglesComplexes, FamilleTrianglesComplexes } from "../../core6e/trianglesComplexes.types";
import { construireFamilleA } from "./familleA";
import { construireFamilleB } from "./familleB";
import { construireFamilleC } from "./familleC";
import { construireFamilleD } from "./familleD";
import { construireFamilleE } from "./familleE";

export { construireFamilleA, construireFamilleB, construireFamilleC, construireFamilleD, construireFamilleE };

/**
 * Couche A (6e) — point d'entrée `6gen41` ("Propriétés géométriques de triangles via les nombres
 * complexes", chapitre 5 "Nombres complexes"). Tirage ÉQUIPROBABLE de la famille (A à E — E ajoutée par
 * l'audit 6e ch. 5, point 44) — mirroir
 * `generateurs6e/formeTrigonometrique/index.ts` (6gen37).
 */

export type IdVarianteTrianglesComplexes = "A" | "B" | "C" | "D" | "E";

export const CATALOGUE_VARIANTES: { id: IdVarianteTrianglesComplexes; label: string }[] = [
  { id: "A", label: "A — Isocèle, rectangle, les deux ou aucun" },
  { id: "B", label: "B — Triangle isocèle, loi des cosinus" },
  { id: "C", label: "C — Triangle équilatéral : A est-il le centre ?" },
  { id: "D", label: "D — Similitude entre deux triangles (cohérente ou non)" },
  { id: "E", label: "E — Alignés, perpendiculaires ou ni l'un ni l'autre" },
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
    case "E":
      return construireFamilleE();
  }
}

const FAMILLES: FamilleTrianglesComplexes[] = ["A", "B", "C", "D", "E"];

const CONSTRUCTEURS_PAR_FAMILLE: Record<FamilleTrianglesComplexes, () => ExerciceTrianglesComplexes> = {
  A: () => construireFamilleA(),
  B: () => construireFamilleB(),
  C: () => construireFamilleC(),
  D: () => construireFamilleD(),
  E: () => construireFamilleE(),
};

export function genererExerciceTrianglesComplexes(): ExerciceTrianglesComplexes {
  const famille = FAMILLES[Math.floor(Math.random() * FAMILLES.length)];
  return CONSTRUCTEURS_PAR_FAMILLE[famille]();
}
