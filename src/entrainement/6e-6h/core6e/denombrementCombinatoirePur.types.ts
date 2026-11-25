/**
 * Couche A (6e) — types de `6gen46` « Problèmes de dénombrement » (6e ch. 7, § 4, processus 3
 * TRANSFÉRER). Refonte de l'audit (lots B et C) : poker sur un jeu TIRÉ (h hauteurs × c couleurs —
 * avant, quatre mains constantes dont les réponses étaient imprimées dans le cours) ; famille B
 * transformée en « groupes non nommés » (décision de l'utilisateur : elle doublait 6gen44 A) ;
 * famille C sans la paire base / exposant indiscernable (2⁴ = 4²) ; famille D à verdict équilibré
 * (« également fréquentes » possible).
 */

export type SousTypeDenombCombPurA = "carre" | "brelan" | "paire" | "deuxPaires";

export interface ExerciceDenombCombPurA {
  famille: "A";
  sousType: SousTypeDenombCombPurA;
  hauteurs: number;
  couleurs: number;
  etape1: number;
  etape2: number;
  resultatFinal: number;
}

export interface ExerciceDenombCombPurB {
  famille: "B";
  /** n personnes en m groupes non nommés de t personnes. */
  n: number;
  m: number;
  t: number;
  contexte: string;
  nommes: number;
  resultat: number;
}

export interface ExerciceDenombCombPurC {
  famille: "C";
  /** k éléments, chacun réglé sur n positions : nᵏ. */
  n: number;
  k: number;
  contexte: string;
  resultat: number;
}

export interface DecompositionSommeDes {
  valeurs: [number, number, number];
  arrangements: number;
}

export interface ExerciceDenombCombPurD {
  famille: "D";
  n: number;
  f: number;
  s1: number;
  s2: number;
  decompositionsS1: DecompositionSommeDes[];
  decompositionsS2: DecompositionSommeDes[];
  totalS1: number;
  totalS2: number;
  comparaison: "s1" | "s2" | "egal";
}

export type ExerciceDenombrementCombinatoirePur = ExerciceDenombCombPurA | ExerciceDenombCombPurB | ExerciceDenombCombPurC | ExerciceDenombCombPurD;

export type FamilleDenombrementCombinatoirePur = ExerciceDenombrementCombinatoirePur["famille"];
