import type { D, P } from "../ui/outilsAnalytiqueLotG";

/**
 * gen98 « Intersection de deux cercles » (4e, ch. 7, § 10 « Lieux : intersection de deux courbes »).
 * - `cercle-cercle` : deux équations développées x² + y² + Dx + Ey + F = 0 → soustraction → droite
 *   (équation du premier degré qui contient les points communs) → substitution → 0, 1 ou 2 points.
 * - `cercle-parabole` : un cercle centré sur l'axe d'une parabole (x − x_S)² = 2p(y − y_S) (ou
 *   d'axe horizontal) → le carré remplacé dans l'équation du cercle → équation du second degré →
 *   solutions à garder ou à rejeter (un carré n'est jamais négatif).
 * Le NOMBRE de points communs est le verdict : tiré avant la construction, 1/3 chacun.
 */

export type VarianteIntersectionCercles = "cercle-cercle" | "cercle-parabole";

/** Cercle (x − a)² + (y − b)² = R (R = rayon au carré). */
export interface Cercle {
  centre: P;
  R: number;
}

export interface ExerciceIntersectionCercles {
  variante: VarianteIntersectionCercles;
  nbPoints: 0 | 1 | 2;
  /** Cercle-cercle : les deux cercles ; cercle-parabole : le cercle seul (c1). */
  c1: Cercle;
  c2: Cercle | null;
  /** Cercle-parabole : axe, sommet, k = 2p (signé). */
  axe: "vertical" | "horizontal" | null;
  S: P | null;
  k: number | null;
  /** Ordre (mélangé) des trois options de l'écran « substitution » (cercle-parabole). */
  ordreOptions: number[];
  /** Points communs. */
  points: P[];
  /** Droite obtenue par soustraction (cercle-cercle). */
  radicale: D | null;
}
