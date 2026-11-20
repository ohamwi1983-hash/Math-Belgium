import type { Q } from "../ui6e/nombresExp";

/**
 * Couche core — « Reconnaître et construire un modèle exponentiel à partir d'un tableau » (6gen147,
 * 6e ch. 2 « Fonctions exponentielles », § 7, processus 2 APPLIQUER). Un tableau de quatre mesures
 * prises à intervalles égaux (pas h = 1 ou 2), en contexte. Quatre écrans :
 * 1. les trois rapports successifs (exacts, ou arrondis au centième) ;
 * 2. le verdict : modèle exponentiel (rapports égaux) ou linéaire (différences égales) — choix fermé,
 *    une tentative, tiré 50/50 AVANT les nombres (jamais déduit du nom de la variante) ;
 * 3. les paramètres : b et a de f(t) = b·aᵗ (a par unité de t : avec h = 2, le rapport vaut a²), ou
 *    p et m de f(t) = m·t + p ;
 * 4. la prévision f(T), arrondie au centième (à l'unité pour un effectif).
 */

export type VarianteModeleTableau = "pas1" | "pas2";
export type GenreModele = "exponentiel" | "lineaire";

export interface ContexteModele {
  /** Sujet de la phrase (« La masse de médicament dans le sang »). */
  sujet: string;
  /** Lettre de la grandeur (« M »). */
  lettre: string;
  /** Unité de la grandeur (« mg »). */
  unite: string;
  /** Unité de temps au pluriel (« heures »). */
  temps: string;
  sens: "croissance" | "decroissance";
  /** Effectif : valeurs entières, prévision arrondie à l'unité. */
  entier: boolean;
  /** Nombre maximal de décimales des mesures (2 pour des euros). */
  decimales: number;
}

export interface ExerciceModeleTableau {
  variante: VarianteModeleTableau;
  genre: GenreModele;
  contexte: number;
  h: 1 | 2;
  /** Valeur en t = 0 (b ou p). */
  b: Q;
  /** Facteur par unité de t (exponentiel). */
  a: Q;
  /** Pente par unité de t (linéaire). */
  m: Q;
  /** Instant de la prévision. */
  T: number;
}
