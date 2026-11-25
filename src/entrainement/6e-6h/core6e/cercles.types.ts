import type { Droite, Pt, Q } from "../moteur6e/algebreLieux";

/**
 * `6gen55` — Cercles (6e ch. 9, § 2 ; audit du chapitre, lots B et C). Valeurs EXACTES partout
 * (rationnels, rayons en racine simplifiée) ; droites en ax + by + c = 0, verticales comprises.
 */

export interface ExerciceCerclesA {
  famille: "A";
  A: Pt;
  B: Pt;
  C: Pt;
  D: number;
  E: number;
  F: number;
  centre: Pt;
  r2: Q;
}

/** B — par deux points, rayon donné : 0, 1 ou 2 cercles (verdict tiré AVANT les points). */
export interface ExerciceCerclesB {
  famille: "B";
  verdict: 0 | 1 | 2;
  A: Pt;
  B: Pt;
  r2: Q;
  mediatrice: Droite;
  centres: Pt[];
}

export interface ExerciceCerclesC {
  famille: "C";
  A: Pt;
  B: Pt;
  d: Droite;
  mediatrice: Droite;
  centre: Pt;
  r2: Q;
}

/** D — tangent à un axe en T, passant par A ; centre Ω de coordonnée inconnue k (signée). */
export interface ExerciceCerclesD {
  famille: "D";
  axe: "abscisses" | "ordonnees";
  A: Pt;
  T: Pt;
  k: Q;
  centre: Pt;
  r2: Q;
}

export interface DonneesTriangle {
  A: Pt;
  B: Pt;
  C: Pt;
  /** a = BC, b = CA, c = AB (entiers). */
  a: number;
  b: number;
  c: number;
  aire: Q;
}

export interface ExerciceCerclesE {
  famille: "E";
  triangle: DonneesTriangle;
  centre: Pt;
  r: Q;
}

export interface ExerciceCerclesF {
  famille: "F";
  centre: Pt;
  d: Droite;
  L: number;
  dist2: Q;
  r2: Q;
  /** Extrémités de la corde (figure). */
  corde: [{ x: number; y: number }, { x: number; y: number }];
}

/** G — un des quatre cercles tangents à trois droites : l'inscrit, ou l'exinscrit dans l'angle d'un sommet. */
export interface ExerciceCerclesG {
  famille: "G";
  mode: "inscrit" | "exinscrit";
  /** Sommet dont l'angle contient le cercle exinscrit. */
  sommet: "A" | "B" | "C";
  triangle: DonneesTriangle;
  AB: Droite;
  BC: Droite;
  CA: Droite;
  centre: Pt;
  r: Q;
}

export type FamilleCercles = "A" | "B" | "C" | "D" | "E" | "F" | "G";
export type ExerciceCercles = ExerciceCerclesA | ExerciceCerclesB | ExerciceCerclesC | ExerciceCerclesD | ExerciceCerclesE | ExerciceCerclesF | ExerciceCerclesG;
