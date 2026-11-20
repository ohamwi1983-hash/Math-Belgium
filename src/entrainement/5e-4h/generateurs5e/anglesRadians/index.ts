import { ANGLES_REMARQUABLES, type ExerciceAnglesRadians, type VarianteAnglesRadians } from "../../moteur5e/modeleAnglesRadians";
import { choisir, entier } from "../../moteur5e/trigExact";

/**
 * Générateur de 5gen51 « Angles en radians sur le cercle ». Tout le hasard passe par `Math.random`
 * (`genererAvecCode` : QR code d'une feuille → même exercice).
 * - grand : θ = réduit + 2t·π, t ∈ {1, 2, 3} (θ ≥ 2π, jusqu'à ≈ 8π) ;
 * - negatif : θ = réduit − 2t·π, t ∈ {1, 2} (θ < 0).
 * L'angle réduit est tiré uniformément parmi les 16 angles remarquables de [0 ; 2π[ : quadrant I
 * (3/16), II, III, IV (3/16 chacun), sur un axe (4/16).
 */

export const CATALOGUE_VARIANTES: { id: VarianteAnglesRadians; label: string }[] = [
  { id: "grand", label: "θ > 2π : retirer des tours" },
  { id: "negatif", label: "θ < 0 : ajouter des tours" },
];

export function genererAnglesRadians(variante: VarianteAnglesRadians): ExerciceAnglesRadians {
  const reduit = choisir(ANGLES_REMARQUABLES);
  const tours = variante === "grand" ? entier(1, 3) : -entier(1, 2);
  return { variante, reduit, tours };
}

export function construireAvecVariante(id: string): ExerciceAnglesRadians {
  if (!CATALOGUE_VARIANTES.some((v) => v.id === id)) return genererExerciceAnglesRadians();
  return genererAnglesRadians(id as VarianteAnglesRadians);
}

export function genererExerciceAnglesRadians(): ExerciceAnglesRadians {
  return genererAnglesRadians(choisir(CATALOGUE_VARIANTES).id);
}
