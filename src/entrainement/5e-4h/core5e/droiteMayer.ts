import type { Mayer, Pt } from "./stat2vLotH1";

/**
 * Modèle de `5gen36` « Droite de Mayer » (5e ch. 6, § 3, Appliquer) : série réaliste (contexte du document,
 * nombres recalculés) de n = 6 à 10 points ; variantes `pair` et `impair` (données rangées), `desordre`
 * (données dans le désordre, n quelconque). Écrans : partage (effectif et dernière abscisse du premier
 * groupe), G₁ et G₂, pente (arrondie à 10⁻ᵈᵃ), équation (b au centième, calculé avec la pente NON arrondie),
 * point moyen G et vérification, prévision.
 */

export type VarianteDroiteMayer = "pair" | "impair" | "desordre";

export interface ExerciceDroiteMayer {
  variante: VarianteDroiteMayer;
  contexteId: string;
  /** Données dans l'ordre de l'énoncé. */
  points: Pt[];
  dx: number;
  dy: number;
  m: Mayer;
  G: Pt;
  /** Décimales demandées pour a, pour b, pour la prévision. */
  da: number;
  db: number;
  dp: number;
  x0: number;
}
