/**
 * Couche core — « Décomposer un vecteur selon deux directions » (gen82, 4e, chapitre 6, section
 * « decompositionGeometrique », processus 2 APPLIQUER).
 *
 * Deux familles :
 * - GRAPHIQUE : sur une figure (réseau de parallélogrammes, parallélogramme découpé, hexagone
 *   régulier, quadrillage), écrire \vec{u} = \vec{PQ} sous la forme a·\vec{v} + b·\vec{w}. Méthode du
 *   cours (parallélogramme en sens inverse) : M est sur la parallèle à \vec{v} menée par P et sur la
 *   parallèle à \vec{w} menée par Q ; alors \vec{PM} = a·\vec{v} et \vec{MQ} = b·\vec{w}.
 * - COMPOSANTES : \vec{u}, \vec{v}, \vec{w} donnés par leurs composantes ; a et b solutions d'un
 *   système 2 × 2 (section 10 du cours). Variante « possible » : décider d'abord si la décomposition
 *   existe (\vec{v} et \vec{w} non colinéaires) — un VERDICT, jamais figé entre séries.
 *
 * Coordonnées des figures : entiers dans la base de dessin (e1, e2) de la figure (réseau carré,
 * oblique ou triangulaire), converties en cartésien seulement au dessin.
 */

export interface Vec2 {
  x: number;
  y: number;
}

export type FigureDecomposition = "reseau" | "parallelogramme" | "hexagone" | "quadrillage";

export type FamilleDecomposition = FigureDecomposition | "composantes" | "possible";

export interface PointNomme {
  nom: string;
  /** Coordonnées dans la base de dessin (e1, e2) de la figure. */
  i: number;
  j: number;
}

export interface ExerciceGraphique {
  type: "graphique";
  famille: FigureDecomposition;
  /** Base de dessin (cartésien, unité arbitraire) : un point (i ; j) est dessiné en i·e1 + j·e2. */
  e1: Vec2;
  e2: Vec2;
  /** Réseau / quadrillage : fenêtre des nœuds dessinés, i ∈ [0 ; iMax], j ∈ [0 ; jMax]. */
  iMax: number;
  jMax: number;
  /** Points nommés de la figure (sommets, ou nœuds marqués d'une lettre). */
  points: PointNomme[];
  /** \vec{v} et \vec{w} dans la base de dessin. */
  v: Vec2;
  w: Vec2;
  /** Parallélogramme, hexagone : \vec{v} = \vec{XY} et \vec{w} = \vec{ZT} sur la figure.
   * Réseau, quadrillage : absent — \vec{v} et \vec{w} sont dessinés à part, depuis `origineVW`. */
  nomsV?: [string, string];
  nomsW?: [string, string];
  origineVW?: { i: number; j: number };
  /** \vec{u} = \vec{PQ}. */
  origine: string;
  extremite: string;
  a: number;
  b: number;
  /** Point de construction : \vec{PM} = a·\vec{v}, \vec{MQ} = b·\vec{w}. */
  pointM: string;
  /** Lettres proposées à l'écran 1, dans l'ordre d'affichage (tirées une fois, reproductibles). */
  options: string[];
}

export type SystemeOption = "correct" | "transpose" | "inverse" | "composantes";

export interface ExerciceComposantes {
  type: "composantes";
  famille: "composantes" | "possible";
  u: Vec2;
  v: Vec2;
  w: Vec2;
  /** Décomposition possible (\vec{v} et \vec{w} non colinéaires). Toujours vrai pour « composantes ». */
  possible: boolean;
  /** Coefficients (null si impossible). */
  a: number | null;
  b: number | null;
  /** Impossible : \vec{w} = k·\vec{v}. */
  k: number | null;
  /** « composantes » : systèmes proposés à l'écran 1, dans l'ordre d'affichage. */
  ordreSystemes: SystemeOption[];
}

export type ExerciceDecompositionVecteur = ExerciceGraphique | ExerciceComposantes;
