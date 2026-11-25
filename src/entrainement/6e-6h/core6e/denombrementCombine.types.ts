/**
 * Couche A (6e) — types de `6gen44` « Dénombrement combiné et sélections contraintes » (6e ch. 7,
 * § 2). Refonte de l'audit du chapitre (lots B et C) : multinomiale calculable (n ≤ 15 : plus de
 * nombre de 29 chiffres à saisir), contextes en prose qui ne nomment pas la structure, Γ pour p ≥ 2,
 * comparaison discernables / indiscernables à verdict tiré, variante « anagrammes » (Mississippi).
 */

export interface ExerciceDenombCombA {
  famille: "A";
  n: number;
  k: number;
  noms: string[];
  tailles: number[];
  /** Ce que l'on répartit (« élèves », « joueurs »…). */
  objets: string;
  resultat: number;
}

export type SousTypeDenombCombB = "roleDistingue" | "poolsSepares" | "memeContrainte" | "partitionComplementaire";

export interface ExerciceDenombCombB {
  famille: "B";
  sousType: SousTypeDenombCombB;
  /** Contexte (formules entre `$…$`). */
  contexte: string;
  n: number;
  k: number;
  n1: number;
  k1: number;
  n2: number;
  k2: number;
  resultat: number;
}

export interface ExerciceDenombCombC {
  famille: "C";
  sousType: "repetition" | "comparaison";
  /** Comparaison : objets discernables (B = nᵖ) ou indiscernables (Γ). */
  discernables: boolean;
  contexte: string;
  n: number;
  p: number;
  resultat: number;
}

export type SousTypeDenombCombD = "exclusionPaire" | "coupleIndissociable" | "contrainteRiche";
export type TypeContrainteD = "exclusion" | "indissociable";

export interface ExerciceDenombCombD {
  famille: "D";
  sousType: SousTypeDenombCombD;
  typeContrainte: TypeContrainteD;
  contexte: string;
  n: number;
  k: number;
  terme1: number;
  terme2: number;
  resultatFinal: number;
}

export interface ExerciceDenombCombE {
  famille: "E";
  mot: string;
  /** Lettres répétées et leur nombre d'apparitions (≥ 2), dans l'ordre d'apparition. */
  repetitions: { lettre: string; fois: number }[];
  n: number;
  nombreMots: number;
}

export type ExerciceDenombrementCombine = ExerciceDenombCombA | ExerciceDenombCombB | ExerciceDenombCombC | ExerciceDenombCombD | ExerciceDenombCombE;

export type FamilleDenombrementCombine = ExerciceDenombrementCombine["famille"];
