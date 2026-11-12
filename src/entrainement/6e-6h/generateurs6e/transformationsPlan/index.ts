import type { ExerciceTransformationsPlan, FamilleTransformationsPlan } from "../../core6e/transformationsPlan.types";
import { construireFamilleA } from "./familleA";
import { construireFamilleB } from "./familleB";
import { construireFamilleC } from "./familleC";
import { construireFamilleD } from "./familleD";

export { construireFamilleA, construireFamilleB, construireFamilleC, construireFamilleD };

/**
 * Couche A (6e) — point d'entrée `6gen40` ("Transformations du plan via les nombres complexes",
 * chapitre 5 "Nombres complexes"). Tirage à 2 niveaux (mirroir `generateurs6e/formeTrigonometrique/
 * index.ts`, 6gen37) : la FAMILLE (A/B/C/D — D ajoutée par l'audit 6e ch. 5, point 42) est tirée ÉQUIPROBABLE en premier, puis le sous-type des
 * familles A/B (seules à en avoir un) est tiré ÉQUIPROBABLE ensuite, DEDANS `construireFamilleA`/
 * `construireFamilleB` (jamais ici) — famille C n'a pas de sous-type.
 */

export type IdVarianteTransformationsPlan = "A_translation" | "A_homothetie" | "A_rotation" | "A_similitude" | "A_rotationTranslation" | "B_somme" | "B_produit" | "C" | "D_translation" | "D_rotation" | "D_homothetie" | "D_similitude";

export const CATALOGUE_VARIANTES: { id: IdVarianteTransformationsPlan; label: string }[] = [
  { id: "A_translation", label: "A — Translation" },
  { id: "A_homothetie", label: "A — Homothétie de centre O" },
  { id: "A_rotation", label: "A — Rotation de centre O" },
  { id: "A_similitude", label: "A — Similitude (rotation+homothétie)" },
  { id: "A_rotationTranslation", label: "A — Rotation puis translation" },
  { id: "B_somme", label: "B — Somme (translation)" },
  { id: "B_produit", label: "B — Produit (similitude)" },
  { id: "C", label: "C — Rotation de centre O, modules égaux" },
  { id: "D_translation", label: "D — z′ = az + b : translation" },
  { id: "D_rotation", label: "D — z′ = az + b : rotation de centre Ω" },
  { id: "D_homothetie", label: "D — z′ = az + b : homothétie de centre Ω" },
  { id: "D_similitude", label: "D — z′ = az + b : similitude de centre Ω" },
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
    case "D_translation":
      return construireFamilleD("translation");
    case "D_rotation":
      return construireFamilleD("rotation");
    case "D_homothetie":
      return construireFamilleD("homothetie");
    case "D_similitude":
      return construireFamilleD("similitude");
  }
}

const FAMILLES: FamilleTransformationsPlan[] = ["A", "B", "C", "D"];

const CONSTRUCTEURS_PAR_FAMILLE: Record<FamilleTransformationsPlan, () => ExerciceTransformationsPlan> = {
  A: () => construireFamilleA(),
  B: () => construireFamilleB(),
  C: construireFamilleC,
  D: () => construireFamilleD(),
};

export function genererExerciceTransformationsPlan(): ExerciceTransformationsPlan {
  const famille = FAMILLES[Math.floor(Math.random() * FAMILLES.length)];
  return CONSTRUCTEURS_PAR_FAMILLE[famille]();
}
