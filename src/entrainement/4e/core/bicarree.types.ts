/**
 * gen116 — « Bicarrées et changement de variable » (4e, chapitre 2, § 1, « pour aller plus loin »,
 * processus 2 APPLIQUER). (E) : a·u² + b·u + c = 0 avec u = x² (variante `bicarree` : ax⁴ + bx² + c = 0)
 * ou u = x² + k (variante `changement`, comme (x² − 1)² − 5(x² − 1) + 4 = 0). On pose t = u, on
 * résout en t (racines entières t₁ < t₂), on rejette les t pour lesquels x² = t − k serait négatif,
 * puis on revient à x. Le nombre de valeurs de t gardées (2, 1 ou 0) est un VERDICT, tiré au hasard.
 */

export type VarianteBicarree = "bicarree" | "changement";

export interface ExerciceBicarree {
  variante: VarianteBicarree;
  a: number;
  /** u = x² + k (k = 0 en `bicarree`). */
  k: number;
  t1: number;
  t2: number;
}
