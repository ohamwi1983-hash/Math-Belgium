import type { ExerciceTransformationsPlan, FamilleTransformationsPlan } from "../../core6e/transformationsPlan.types";
import { construireFamilleA } from "./familleA";
import { construireFamilleB } from "./familleB";
import { construireFamilleC } from "./familleC";

export { construireFamilleA, construireFamilleB, construireFamilleC };

/**
 * Couche A (6e) — point d'entrée `6gen40` ("Transformations du plan via les nombres complexes",
 * chapitre 7 "Nombres complexes"). Tirage à 2 niveaux (mirroir `generateurs6e/formeTrigonometrique/
 * index.ts`, 6gen37) : la FAMILLE (A/B/C) est tirée ÉQUIPROBABLE en premier, puis le sous-type des
 * familles A/B (seules à en avoir un) est tiré ÉQUIPROBABLE ensuite, DEDANS `construireFamilleA`/
 * `construireFamilleB` (jamais ici) — famille C n'a pas de sous-type.
 */

export type IdVarianteTransformationsPlan = "A_translation" | "A_homothetie" | "A_rotation" | "A_similitude" | "A_rotationTranslation" | "B_somme" | "B_produit" | "C";

export const CATALOGUE_VARIANTES: { id: IdVarianteTransformationsPlan; label: string }[] = [
  { id: "A_translation", label: "A — Translation" },
  { id: "A_homothetie", label: "A — Homothétie de centre O" },
  { id: "A_rotation", label: "A — Rotation de centre O" },
  { id: "A_similitude", label: "A — Similitude (rotation+homothétie)" },
  { id: "A_rotationTranslation", label: "A — Rotation puis translation" },
  { id: "B_somme", label: "B — Somme (translation)" },
  { id: "B_produit", label: "B — Produit (similitude)" },
  { id: "C", label: "C — Similitude centrée en O, modules égaux" },
];

export function construireAvecVarianteId(id: IdVarianteTransformationsPlan): ExerciceTransformationsPlan {
  switch (id) {
    case "A_translation":
      return construireFamilleA("translation");
    case "A_homothetie":
      return construireFamilleA("homothetie");
    case "A_rotation":
      return construireFamilleA("rotation");
    case "A_similitude":
      return construireFamilleA("similitude");
    case "A_rotationTranslation":
      return construireFamilleA("rotationTranslation");
    case "B_somme":
      return construireFamilleB("somme");
    case "B_produit":
      return construireFamilleB("produit");
    case "C":
      return construireFamilleC();
  }
}

const FAMILLES: FamilleTransformationsPlan[] = ["A", "B", "C"];

const CONSTRUCTEURS_PAR_FAMILLE: Record<FamilleTransformationsPlan, () => ExerciceTransformationsPlan> = {
  A: () => construireFamilleA(),
  B: () => construireFamilleB(),
  C: construireFamilleC,
};

export function genererExerciceTransformationsPlan(): ExerciceTransformationsPlan {
  const famille = FAMILLES[Math.floor(Math.random() * FAMILLES.length)];
  return CONSTRUCTEURS_PAR_FAMILLE[famille]();
}
