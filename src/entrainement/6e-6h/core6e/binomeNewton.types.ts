/**
 * Couche A (6e) — types de `6gen45` « Binôme de Newton » (6e ch. 7, § 3). Refonte de l'audit du
 * chapitre (lots B et C) : terme de rang r = T₍ₖ₊₁₎ comme dans le cours (avant : « rang k »), vraie
 * variante « approximation » (1 + ε)ⁿ ≈ 1 + nε, variante « triangle de Pascal ».
 */

export interface TermeBinome {
  k: number;
  coefficientBinomial: number;
  exposantX: number;
  coefficientFinal: number;
}

export interface ExerciceBinomeA {
  famille: "A";
  a: number;
  b: number;
  n: number;
  termes: TermeBinome[];
}

export type SousTypeBinomeB = "rang" | "puissance";

export interface ExerciceBinomeB {
  famille: "B";
  sousType: SousTypeBinomeB;
  a: number;
  b: number;
  n: number;
  /** Rang r = k + 1 (sous-type « rang ») ou puissance p = n − k de x (« puissance »). */
  rang: number;
  p: number;
  k: number;
  coefficientBinomial: number;
  aPuissance: number;
  bPuissance: number;
  coefficientFinal: number;
}

export interface ExerciceBinomeC {
  famille: "C";
  /** ε en centièmes (−3 … 5) : ε = epsilonCentiemes / 100. */
  epsilonCentiemes: number;
  n: number;
}

export interface ExerciceBinomeD {
  famille: "D";
  /** Ligne n donnée (n + 1 nombres) ; on complète la ligne n + 1. */
  n: number;
  ligne: number[];
  /** Positions k demandées dans la ligne n + 1 (1 ≤ k ≤ n). */
  positions: number[];
}

export type ExerciceBinomeNewton = ExerciceBinomeA | ExerciceBinomeB | ExerciceBinomeC | ExerciceBinomeD;

export type FamilleBinomeNewton = ExerciceBinomeNewton["famille"];
