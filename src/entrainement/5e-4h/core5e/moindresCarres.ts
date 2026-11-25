import type { Pt } from "./stat2vLotH1";

/**
 * Modèle de `5gen37` « Droite des moindres carrés » (5e ch. 6, § 4, Appliquer) :
 * - `main` : petite série (5 ou 6 points, x̄ et ȳ entiers, a décimal court) — G, tableau des écarts
 *   (Σ XᵢYᵢ, Σ Xᵢ²), a, b et équation, prévision (valeurs exactes) ;
 * - `calculatrice` : série réaliste (7 à 10 points) à la TI-30XB — a et b arrondis, prévision de y pour x
 *   donné, de x pour y donné.
 */

export type VarianteMoindresCarres = "main" | "calculatrice";

export interface ExerciceMoindresCarres {
  variante: VarianteMoindresCarres;
  /** Contexte (petit pour `main`, réel pour `calculatrice`). */
  contexteId: string;
  points: Pt[];
  dx: number;
  dy: number;
  G: Pt;
  a: number;
  b: number;
  sXY: number;
  sX2: number;
  /** Décimales demandées (a, b, prévision de y, prévision de x) — `main` : exactes. */
  da: number;
  db: number;
  dp: number;
  dpx: number;
  x0: number;
  /** `calculatrice` : ordonnée donnée pour la prévision inverse. */
  y0?: number;
}
