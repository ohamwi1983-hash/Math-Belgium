/**
 * Couche core — « Traduire un lieu géométrique en équation » (gen131, 4e, chapitre 7 « Géométrie
 * analytique plane », § 7, processus 2 APPLIQUER).
 *
 * Un lieu est donné par une phrase ; l'élève reconnaît sa nature et construit son équation :
 * - médiatrice : M équidistant de A et B (MA² = MB², développer, la droite obtenue, puis la nature) ;
 * - distance-droite : M à la distance r d'une droite d (horizontale, verticale ou de vecteur normal
 *   3-4-5) — la réunion de DEUX parallèles ;
 * - deux-paralleles : M équidistant de deux droites parallèles — la parallèle médiane (c moyen) ;
 * - parabole : M équidistant d'un point F et d'une droite d (foyer, directrice, p signé) ;
 * - cercle : M à la distance r d'un point C.
 */

export type VarianteTraduireLieu = "mediatrice" | "distance-droite" | "deux-paralleles" | "parabole" | "cercle";

export interface Pt {
  x: number;
  y: number;
}

/** Droite a·x + b·y + c = 0 (coefficients entiers). */
export interface Droite {
  a: number;
  b: number;
  c: number;
}

interface Base {
  /** Ordre d'affichage des quatre options de l'écran « nature » (indice 0 = la bonne). */
  ordreNature: number[];
}

export interface LieuMediatrice extends Base {
  variante: "mediatrice";
  A: Pt;
  B: Pt;
  /** Ordre d'affichage des quatre traductions de MA = MB (indice 0 = la bonne). */
  ordreTraduction: number[];
}

export interface LieuDistanceDroite extends Base {
  variante: "distance-droite";
  /** Type de la droite d : parallèle à un axe (raccourci du § 6) ou de vecteur normal 3-4-5. */
  type: "horizontale" | "verticale" | "oblique";
  d: Droite;
  r: number;
  /** Point de d (donné à l'écran pour la droite oblique). */
  A: Pt;
  /** Vecteur normal de d, tel qu'il est lu dans son équation. */
  n: Pt;
}

export interface LieuDeuxParalleles extends Base {
  variante: "deux-paralleles";
  /** Vecteur normal commun (a ; b), premier coefficient non nul positif. */
  a: number;
  b: number;
  c1: number;
  c2: number;
  /** d₂ est écrite multipliée par k (k = 1 : mêmes coefficients que d₁). */
  k: number;
}

export interface LieuParabole extends Base {
  variante: "parabole";
  F: Pt;
  /** Axe vertical : directrice y = k ; axe horizontal : directrice x = k. */
  axe: "vertical" | "horizontal";
  k: number;
}

export interface LieuCercle extends Base {
  variante: "cercle";
  C: Pt;
  r: number;
}

export type ExerciceTraduireLieu = LieuMediatrice | LieuDistanceDroite | LieuDeuxParalleles | LieuParabole | LieuCercle;
