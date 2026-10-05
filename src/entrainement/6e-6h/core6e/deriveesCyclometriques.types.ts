import type { Arcfonction } from "./cyclometrique.types";

/**
 * Couche core (6e) — contrat pour `6gen4` ("Dérivées de fonctions cyclométriques"). 7 familles
 * STRUCTURELLEMENT DISJOINTES (union discriminée par `famille`), chacune avec son propre nombre
 * d'écrans (2 à 4) et ses propres champs de coefficients — jamais un type unique à champs
 * optionnels. Chaque exercice porte `pointsEchantillonnage: number[]` — les abscisses x RÉELLES où
 * TOUTE la chaîne de formules de cette instance (u/v, arcfonction, dénominateurs) reste finie,
 * choisies à la génération (Couche A, `generateurs6e/deriveesCyclometriques/pointsEchantillon.ts`)
 * et réutilisées telles quelles par la vérification (Couche B) — jamais recalculées côté moteur,
 * qui n'a pas accès à la logique de recherche de points (`src/moteur6e/` n'importe jamais
 * `src/generateurs6e/`).
 */

export type UTypeFamilleA = "affine" | "puissance" | "racine" | "reciproque";

export interface ExerciceDeriveeA {
  famille: "A";
  arcfonction: Arcfonction;
  uType: UTypeFamilleA;
  a: number; // affine: coefficient de x ; racine: coefficient sous la racine ; sans objet pour puissance/reciproque
  b: number; // affine uniquement
  n: number; // puissance uniquement (2 ou 3)
  kPrime: number; // reciproque uniquement (u = kPrime/x)
  c: number; // constante additive de f
  k: number; // coefficient multiplicatif de arcfonction(u)
  pointsEchantillonnage: number[];
}

export type VTypeFamilleB = "simple" | "quadratique";

export interface ExerciceDeriveeB {
  famille: "B";
  arcfonction: Arcfonction;
  m: number; // u(x) = m*x
  vType: VTypeFamilleB;
  a: number; // quadratique uniquement : v = a*x^2 + b
  b: number; // quadratique uniquement
  pointsEchantillonnage: number[];
}

export interface ExerciceDeriveeC {
  famille: "C";
  arcfonction: "arcsin" | "arccos";
  k: number;
  a: number;
  pointsEchantillonnage: number[];
}

export type OrientationFamilleD = "sinSurCos" | "cosSurSin";

export interface ExerciceDeriveeD {
  famille: "D";
  orientation: OrientationFamilleD;
  a: number;
  b: number;
  pointsEchantillonnage: number[];
}

export type GTypeFamilleE = "racine" | "carre";

export interface ExerciceDeriveeE {
  famille: "E";
  arcfonction: Arcfonction;
  gType: GTypeFamilleE;
  a: number; // v(x) = a*x
  pointsEchantillonnage: number[];
}

export type TrigFamilleF = "sin" | "cos";

export interface ExerciceDeriveeF {
  famille: "F";
  trig: TrigFamilleF;
  arcfonction: "arcsin" | "arccos";
  a: number; // v(x) = a*x
  pointsEchantillonnage: number[];
}

export type SousCasFamilleG = "h" | "i";

export interface ExerciceDeriveeG {
  famille: "G";
  sousCas: SousCasFamilleG;
  arcfonction: Arcfonction;
  k: number;
  c: number;
  pointsEchantillonnage: number[];
}

export type ExerciceDeriveesCyclometriques =
  | ExerciceDeriveeA
  | ExerciceDeriveeB
  | ExerciceDeriveeC
  | ExerciceDeriveeD
  | ExerciceDeriveeE
  | ExerciceDeriveeF
  | ExerciceDeriveeG;

export type FamilleDeriveesCyclometriques = ExerciceDeriveesCyclometriques["famille"];
