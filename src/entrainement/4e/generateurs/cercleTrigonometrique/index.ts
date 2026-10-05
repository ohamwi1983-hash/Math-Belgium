import type {
  ExerciceCercleTrigonometrique,
  GenerateurExerciceCercleTrigonometrique,
  VarianteCercleTrigId,
} from "../../core/cercleTrigonometrique.types";
import { randomInt } from "./aleatoire";
import { construireAngleNegatif } from "./construireAngleNegatif";
import { construireAngleSuperieur360 } from "./construireAngleSuperieur360";
import { construireMultiple90 } from "./construireMultiple90";

/**
 * Catalogue de variantes (convention CLAUDE.md) — 3 variantes, tirées avec un poids égal.
 * `angle_simple` (angle déjà dans [0°,360°[, sans réduction) a été retirée
 * (promptcorrectionsgenerateur14aides.md, section 5) : chaque exercice doit désormais toujours
 * nécessiter une réduction, pour que l'écran "Réduction" ait toujours une utilité pédagogique.
 */
export const CATALOGUE_VARIANTES: { id: VarianteCercleTrigId; label: string }[] = [
  { id: "angle_negatif", label: "Angle négatif à réduire" },
  { id: "angle_superieur_360", label: "Angle ≥ 360° à réduire" },
  { id: "multiple_90", label: "Angle multiple de 90° (sur un axe)" },
];

const CONSTRUCTEURS_PAR_ID: Record<VarianteCercleTrigId, (overrides?: { angleReduit?: number }) => ExerciceCercleTrigonometrique> = {
  angle_negatif: construireAngleNegatif,
  angle_superieur_360: construireAngleSuperieur360,
  multiple_90: construireMultiple90,
};

/** Convention CLAUDE.md ("Catalogue de variantes") — force la variante demandée sans casser le contrat zéro-argument. */
export function construireAvecVarianteId(
  varianteId: VarianteCercleTrigId,
  overrides?: { angleReduit?: number },
): ExerciceCercleTrigonometrique {
  return CONSTRUCTEURS_PAR_ID[varianteId](overrides);
}

/** Implémentation de la Couche A — les 3 variantes tirées avec un poids égal. */
export const genererExerciceCercleTrigonometrique: GenerateurExerciceCercleTrigonometrique = () => {
  const varianteId = CATALOGUE_VARIANTES[randomInt(0, CATALOGUE_VARIANTES.length - 1)].id;
  return construireAvecVarianteId(varianteId);
};
