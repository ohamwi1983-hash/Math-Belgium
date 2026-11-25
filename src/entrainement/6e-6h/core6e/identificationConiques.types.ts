import type { Axe, Conique } from "../moteur6e/algebreConiques";
import type { Droite, Pt } from "../moteur6e/algebreLieux";

/**
 * `6gen58` — Identifier une conique et ses éléments (6e ch. 10, § 1–2 ; audit, lots B et C). Valeurs
 * EXACTES (rationnels, racines simplifiées), parabole en convention du cours y² = 2px (décision 1),
 * cas dégénérés (point, ensemble vide, deux droites) enseignés au cours (décision 4). La nature est un
 * VERDICT tiré avant les coefficients, à parts égales dans chaque famille.
 */

export type NatureCentree = "ellipse" | "cercle" | "hyperbole" | "point" | "vide" | "droitesSecantes";
export type OrientationParabole = "droite" | "gauche" | "haut" | "bas";

/** Ensemble décrit par l'équation (null : ensemble vide). */
export interface EnsembleIdentifie {
  conique: Conique | null;
  point: Pt | null;
  droites: Droite[];
}

/** A1 — Ax² + By² + F = 0 (centrée, sans terme du premier degré). */
export interface ExerciceIdA1 extends EnsembleIdentifie {
  famille: "A1";
  nature: NatureCentree;
  A: number;
  B: number;
  F: number;
}

/** A2 — un seul carré : parabole (v² = ±2p·w) ou deux droites parallèles (v² + m·v = 0). */
export interface ExerciceIdA2 extends EnsembleIdentifie {
  famille: "A2";
  nature: "parabole" | "droitesParalleles";
  orientation: OrientationParabole | null;
  /** Coefficients de Ax² + By² + Dx + Ey = 0. */
  A: number;
  B: number;
  D: number;
  E: number;
}

/** B — Ax² + By² + Dx + Ey + F = 0, décentrée ; complétion A(x − h)² + B(y − k)² = M. */
export interface ExerciceIdB extends EnsembleIdentifie {
  famille: "B";
  nature: NatureCentree;
  A: number;
  B: number;
  D: number;
  E: number;
  F: number;
  centre: Pt;
  M: number;
}

/** C — v_isolée = k ± m√(a₂v² + a₁v + a₀) : seulement une MOITIÉ d'ellipse ou une partie d'hyperbole. */
export interface ExerciceIdC extends EnsembleIdentifie {
  famille: "C";
  nature: "ellipse" | "hyperbole";
  variableRacine: Axe;
  variableIsolee: Axe;
  k: number;
  h: number;
  mNum: number;
  mDen: number;
  /** Signe devant la racine dans l'énoncé (+1 : partie v_isolée ≥ k). */
  signeRacine: 1 | -1;
  a2: number;
  a1: number;
  a0: number;
  r: number;
}

export type ExerciceIdentificationConiques = ExerciceIdA1 | ExerciceIdA2 | ExerciceIdB | ExerciceIdC;
