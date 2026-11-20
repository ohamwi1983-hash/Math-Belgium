/**
 * Couche core — `6gen154` « Graphe de la réciproque » (6e ch. 1, § 1, processus 2 APPLIQUER).
 * Le graphe complet d'une fonction f strictement monotone est donné sur un quadrillage d'une unité,
 * MÊME échelle en x et en y (la droite y = x est à 45°) : ses extrémités et le point A sont sur des
 * nœuds, la tangente en A passe par des nœuds (pente lisible p/q). Quatre écrans :
 * 1. le point A′ de la courbe de f⁻¹ qui correspond à A (deux champs) ;
 * 2. domaine et image de f⁻¹ (deux champs « intervalle ») ;
 * 3. le graphe de f⁻¹ parmi quatre (choix fermé, une tentative) ;
 * 4. pente de la tangente à f en A (lue), puis pente de la tangente à f⁻¹ en A′ (deux champs).
 */

export type VarianteGrapheReciproque = "croissante" | "decroissante";

export interface ExerciceGrapheReciproque {
  variante: VarianteGrapheReciproque;
  /** Trois nœuds de la courbe : extrémité gauche, A, extrémité droite (coordonnées entières). */
  noeuds: [number, number][];
  /** Pente de la tangente en A : p/q (q > 0). */
  p: number;
  q: number;
  /** Pentes aux extrémités (secantes des deux arcs). */
  pentesBords: [number, number];
  /** Extrémité gauche / droite exclue (rond vide) ? */
  ouvert: [boolean, boolean];
  /** Ordre d'affichage des quatre graphes candidats (A, B, C, D). */
  candidats: CandidatReciproque[];
}

/** Graphe candidat : le bon (symétrie par rapport à y = x) ou un distracteur. */
export type CandidatReciproque = "reciproque" | "antidiagonale" | "axeX" | "axeY";
