/**
 * Couche A (6e) — types de `6gen78` « La fonction aire » (chapitre 4 de 6e, section
 * `integralesdefinies`, sous-section « La fonction aire : pourquoi une primitive calcule une aire »).
 *
 * Données : le GRAPHIQUE de f seulement (affine par morceaux à sommets entiers, éventuellement un
 * demi-disque), et la borne a. On étudie la fonction aire du cours, A(x) = ∫ₐˣ f(t) dt (notation
 * du chapitre : A, « fonction aire », A(a) = 0, A′ = f).
 *
 * Variantes (une question par variante, 1 ou 2 écrans) :
 * - `valeurs` : aires signées sur des intervalles, puis valeurs de A en quelques points ;
 * - `variations` : sens de variation de A sur chaque intervalle (piège : f décroissante mais
 *   positive), puis valeurs du tableau de variations ;
 * - `extremums` : nature de A en des abscisses candidates (zéros de f avec ou sans changement de
 *   signe, extremums de f), puis valeurs des extremums ;
 * - `pente` : A′(p) = f(p) en deux points, puis A(p) et une équation de tangente ;
 * - `graphique` : reconnaître le graphique de A parmi 4 (A, f, f(a) + A, −A).
 */

/** Morceau de la courbe de f, contigus et rangés de gauche à droite. */
export type MorceauF =
  | { type: "segment"; x0: number; y0: number; x1: number; y1: number }
  /** Demi-cercle de centre (centre ; 0) et de rayon `rayon`, au-dessus (+1) ou en dessous (−1). */
  | { type: "demiDisque"; centre: number; rayon: 1 | 2; signe: 1 | -1 };

export type VarianteFonctionAire = "valeurs" | "variations" | "extremums" | "pente" | "graphique";

export interface ExerciceFonctionAire {
  variante: VarianteFonctionAire;
  morceaux: MorceauF[];
  /** Borne inférieure de la fonction aire (un sommet de la courbe de f). */
  a: number;
  /** `valeurs` : 3 abscisses (sommets ≠ a), croissantes. `pente` : [p₁, p₂] (p₁ ≠ a, f(p₁) ≠ 0).
   * Vide pour les autres variantes. */
  points: number[];
  /** `graphique` : ordre d'affichage des 4 graphiques candidats (indices canoniques : 0 = A, 1 = f,
   * 2 = f(a) + A, 3 = −A). Vide pour les autres variantes. */
  ordre: number[];
}
