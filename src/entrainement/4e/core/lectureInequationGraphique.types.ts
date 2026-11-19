/**
 * Couche core — « Lire une inéquation sur un graphique » (gen117, 4e, chapitre 2, sections
 * `signe-trinome` et `contexte`, processus 1 CONNAÎTRE). Une parabole 𝒫 (y = f(x)) et une droite d
 * (l'axe des x, y = k ou y = mx + p) sont tracées sur un quadrillage d'une unité ; l'élève résout
 * graphiquement f(x) ◇ g(x) en trois écrans :
 * 1. les abscisses des points d'intersection, lues sur la grille (champ libre, 3 tentatives) ;
 * 2. la position : où la parabole est au-dessus / en dessous de la droite (4 lectures, une seule
 *    juste, une tentative) ;
 * 3. l'ensemble-solution S, avec les crochets (saisie guidée, 3 tentatives).
 *
 * Toutes les intersections ont des coordonnées ENTIÈRES (sur les lignes de la grille, exigence des
 * graphiques papier à lire). VARIANTE = la droite (axe, horizontale, oblique). Le nombre de points
 * d'intersection (2, 1 contact, 0) et le symbole sont des issues tirées au hasard (jamais `forme`).
 */

export type VarianteLectureInequation = "axe" | "horizontale" | "oblique";

export type SymboleLecture = "<" | ">" | "≤" | "≥";

/** Lectures de l'écran 2 : position demandée × zone où elle est réalisée. */
export type IdLecture = "dessusEntre" | "dessusExterieur" | "dessousEntre" | "dessousExterieur";

export interface FenetreGraphique {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

export interface ExerciceLectureInequation {
  variante: VarianteLectureInequation;
  symbole: SymboleLecture;
  /** Nombre de points d'intersection : 2, 1 (contact) ou 0. */
  issue: 0 | 1 | 2;
  /** f(x) − g(x) = alpha·(x − x1)(x − x2) ; alpha·(x − x1)² (contact, x2 = x1) ; alpha·((x − x1)² + d) (aucun point). */
  alpha: number;
  x1: number;
  x2: number;
  /** Décalage d > 0 (issue 0 seulement), sinon 0. */
  d: number;
  /** Droite y = m x + p (axe : m = p = 0 ; horizontale : m = 0). */
  m: number;
  p: number;
  fenetre: FenetreGraphique;
  /** Ordre d'affichage des 4 lectures de l'écran 2 (tiré à la génération). */
  lectures: IdLecture[];
}
