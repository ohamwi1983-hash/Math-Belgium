import type { Axe, Conique } from "../moteur6e/algebreConiques";
import type { Pt } from "../moteur6e/algebreLieux";

type Centree = Extract<Conique, { type: "ellipse" | "hyperbole" }>;

/**
 * `6gen59` — Équation d'une conique depuis ses caractéristiques (6e ch. 10, § 1–2 ; audit, lots B et C).
 * Conventions du cours : a = demi-grand axe (ellipse) ou demi-axe focal (hyperbole), parabole
 * y² = 2px avec p = dist(F ; d) > 0 (décision 1). Valeurs exactes.
 */

/** A — même axe : un sommet et un foyer sur l'axe focal, centre O ; nature (VERDICT) tirée d'abord. */
export interface ExerciceEqMemeAxe {
  famille: "A";
  sousType: "memeAxe";
  nature: "ellipse" | "hyperbole";
  conique: Centree;
  a: number;
  c: number;
  S: Pt;
  F: Pt;
}

/** A — un sommet de l'axe non focal (b) et un foyer (c) : ellipse, a² = b² + c². */
export interface ExerciceEqAxesPerp {
  famille: "A";
  sousType: "axesPerpendiculaires";
  axeFocal: Axe;
  conique: Centree;
  b: number;
  c: number;
  S: Pt;
  F: Pt;
}

/** A — deux sommets sur des axes perpendiculaires : a = le plus grand demi-axe. */
export interface ExerciceEqDeuxSommets {
  famille: "A";
  sousType: "deuxSommets";
  conique: Centree;
  a: number;
  b: number;
  S: Pt;
  Sp: Pt;
}

/** B — parabole : sommet + foyer, ou sommet + point de passage ET axe de symétrie donné. */
export interface ExerciceEqParabole {
  famille: "B";
  donnee: "foyer" | "point";
  conique: Extract<Conique, { type: "parabole" }>;
  S: Pt;
  F: Pt;
  P: Pt | null;
}

export type DonneeC = "deuxC" | "excentricite" | "distanceDirectrices" | "deuxA";

/** C — deux caractéristiques parmi 2c, e, distance des directrices, 2a ; axe focal donné. */
export interface ExerciceEqC {
  famille: "C";
  nature: "ellipse" | "hyperbole";
  donnees: [DonneeC, DonneeC];
  conique: Centree;
  a: number;
  c: number;
}

/** D — hyperbole depuis ses asymptotes et un sommet, un foyer ou la distance focale. */
export interface ExerciceEqD {
  famille: "D";
  donnee: "sommet" | "foyer" | "distanceFocale";
  conique: Extract<Conique, { type: "hyperbole" }>;
  a: number;
  b: number;
}

export type ExerciceEquationConiqueCaracteristiques = ExerciceEqMemeAxe | ExerciceEqAxesPerp | ExerciceEqDeuxSommets | ExerciceEqParabole | ExerciceEqC | ExerciceEqD;
