import type { ClasseR, Pt } from "./stat2vLotH1";

/**
 * Modèle de `5gen38` « Covariance et coefficient de corrélation » (5e ch. 6, § 5, Appliquer) :
 * - `main` : petite série (5 ou 6 points, x̄ et ȳ entiers) — covariance par la formule des écarts, puis par
 *   la seconde formule (1/n)Σxᵢyᵢ − x̄ȳ (valeurs exactes), σx et σy (division par n, au centième), r (au
 *   centième), sens et intensité (choix fermés, tableau du cours) ;
 * - `calculatrice` : série réaliste à la TI-30XB — σx et σy (pas Sx, Sy !), r (au millième), covariance
 *   r·σx·σy (au centième), sens et intensité.
 * Classe de r (et sens pour `main`) tirée à parts égales AVANT les nombres.
 */

export type VarianteCorrelation = "main" | "calculatrice";

export interface ExerciceCorrelation {
  variante: VarianteCorrelation;
  contexteId: string;
  points: Pt[];
  dx: number;
  dy: number;
  G: Pt;
  cov: number;
  /** (1/n)·Σ xᵢyᵢ */
  moyProduits: number;
  sx: number;
  sy: number;
  r: number;
  classe: ClasseR;
  positif: boolean;
  /** Décimales demandées : σ, r, covariance (`main` : covariance exacte). */
  ds: number;
  dr: number;
  dc: number;
}
