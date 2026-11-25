/**
 * Types de `6gen51` « Loi normale » (6e ch. 8, § 6) — refonte de l'audit (lot C) : la table de Φ est
 * CONSULTABLE à l'écran (`TablePhi`) et la référence est calée sur elle (z au centième, Φ à 4
 * décimales ; la valeur de la calculatrice est acceptée aussi) ; le sens inverse a ses cas « symétrie »
 * (cible négative) ; une courbe de Gauss montre l'aire cherchée, hachurée.
 *
 * Notation du chapitre : 𝒩(μ ; σ), le second paramètre est l'ÉCART-TYPE.
 */

/** Écriture d'une probabilité à l'aide de Φ (entrées positives de la table). */
export type FormePhi = "phi" | "unMoinsPhi" | "phiMoinsDemi" | "diff" | "sommeMoinsUn" | "diffInverse";

export interface ContexteNormal {
  id: string;
  /** Phrase d'introduction (« La taille des adultes d'une région, en cm, »). */
  sujet: string;
  unite: string;
  /** Ce que désigne la population (« adultes »). */
  individus: string;
}

export interface ExerciceLoiNormaleA {
  famille: "A";
  sousType: "inferieur" | "superieur" | "intervalle";
  /** Bornes en z (au centième) : `z1` seule pour une borne, `z1 < z2` pour l'intervalle. */
  z1: number;
  z2: number | null;
  /** Ordre des formes proposées à l'écran du choix. */
  options: FormePhi[];
}

export interface ExerciceLoiNormaleB {
  famille: "B";
  sousType: "inferieur" | "superieur" | "intervalle";
  contexte: ContexteNormal;
  mu: number;
  sigma: number;
  x1: number;
  x2: number | null;
  /** Taille de la population (effectif à estimer), ou null. */
  population: number | null;
  options: FormePhi[];
}

/** Sens inverse : forme de la donnée. */
export type FormeInverse = "inferieur" | "superieur" | "centre" | "depuisZero";

/** Équation de table proposée au choix (Φ(t) = valeur, ou Φ(−t) = valeur). */
export interface EquationTable {
  id: string;
  /** true : Φ(−t) = valeur (la cible est négative). */
  oppose: boolean;
  valeur: number;
  /** Écriture de la valeur à partir de p (« 1-p », « \\dfrac{1+p}{2} »…), pour l'explication. */
  calcul: string;
}

export interface ExerciceLoiNormaleC {
  famille: "C";
  sousType: FormeInverse;
  /** Probabilité donnée (4 décimales). */
  p: number;
  /** Valeur de t (au centième) qui a servi à construire p. */
  t: number;
  equations: EquationTable[];
  bonne: string;
}

export interface ExerciceLoiNormaleD {
  famille: "D";
  sousType: FormeInverse;
  contexte: ContexteNormal;
  mu: number;
  sigma: number;
  p: number;
  /** z (au centième) qui a servi à construire p ; a = μ + zσ. */
  z: number;
  equations: EquationTable[];
  bonne: string;
}

export interface ExerciceLoiNormaleE {
  famille: "E";
  contexte: ContexteNormal;
  mu: number;
  sigma: number;
  k: 1 | 2 | 3;
  unCote: boolean;
  coteDemande: "superieur" | "inferieur";
  population: number | null;
}

export type ExerciceLoiNormale = ExerciceLoiNormaleA | ExerciceLoiNormaleB | ExerciceLoiNormaleC | ExerciceLoiNormaleD | ExerciceLoiNormaleE;

export type FamilleLoiNormale = ExerciceLoiNormale["famille"];
