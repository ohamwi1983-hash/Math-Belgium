import type { Conique } from "../moteur6e/algebreConiques";
import type { Droite, Pt, Q } from "../moteur6e/algebreLieux";

/**
 * `6gen61` — Intersection d'une conique et d'une droite (6e ch. 10, § 4 ; audit, lots B et C). Valeurs
 * EXACTES ; le nombre de points communs (0, 1, 2) est un VERDICT tiré avant les paramètres, pour les
 * trois coniques (l'hyperbole a enfin son issue « aucun point », audit G18).
 */

export type SousTypeDroite = "deuxPoints" | "mediatrice" | "hauteur";

export interface ExerciceIntersectionA {
  famille: "A";
  nature: "ellipse" | "hyperbole" | "cercle";
  verdict: 0 | 1 | 2;
  sousTypeDroite: SousTypeDroite;
  conique: Conique;
  /** Données de la conique : sommet et foyer (ellipse, hyperbole) ou un point du cercle. */
  S: Pt;
  F: Pt | null;
  /** Points qui définissent la droite (C : seulement pour la hauteur). */
  A: Pt;
  B: Pt;
  C: Pt | null;
  droite: Droite;
  /** y = m x + k. */
  m: Q;
  k: Q;
  /** Équation en x (coefficients entiers premiers entre eux, a > 0). */
  eq: [bigint, bigint, bigint];
  points: Pt[];
}

/** B — parabole C₁ et ellipse C₂ : leurs points communs sont sur un cercle λC₁ + μC₂. */
export interface ExerciceIntersectionB {
  famille: "B";
  b1: number;
  c1: number;
  A2: number;
  B2: number;
  D2: number;
  E2: number;
  F2: number;
  lambda: number;
  mu: number;
  centre: Pt;
  rayon: number;
}

export type ExerciceIntersectionsConiques = ExerciceIntersectionA | ExerciceIntersectionB;
