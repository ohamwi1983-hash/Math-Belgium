import type { Pt } from "./stat2vLotH1";

/**
 * Modèle de `5gen77` « Point moyen et valeurs manquantes » (5e ch. 6, § 1, Appliquer) :
 * - `pointMoyen` : G(x̄ ; ȳ) d'un tableau (petite série, moyennes exactes) ;
 * - `uneValeur` : une valeur effacée (x ou y) connaissant G → somme totale n·x̄ (ou n·ȳ), puis la valeur ;
 * - `deuxValeurs` : un x et un y effacés (colonnes différentes) connaissant G (exercice 1 du document) ;
 * - `mayerG1G2` : droite de Mayer depuis G₁ et G₂ donnés (exercice 3 du document) → pente, équation,
 *   prévision de y pour x donné, de x pour y donné (au centième).
 */

export type VariantePointMoyen = "pointMoyen" | "uneValeur" | "deuxValeurs" | "mayerG1G2";

export interface Manquant {
  /** Colonne (0 = première) et coordonnée effacée. */
  i: number;
  coord: "x" | "y";
}

export interface ExercicePointMoyen {
  variante: VariantePointMoyen;
  contexteId: string;
  /** Série complète (les valeurs effacées comprises). */
  points: Pt[];
  dx: number;
  dy: number;
  G: Pt;
  manquants: Manquant[];
  /** `mayerG1G2` */
  G1?: Pt;
  G2?: Pt;
  a?: number;
  b?: number;
  x0?: number;
  y0?: number;
}
