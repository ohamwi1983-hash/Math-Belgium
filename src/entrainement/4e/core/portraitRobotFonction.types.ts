/**
 * Couche core — « Le portrait-robot d'une fonction » (gen71, 4e, chapitre 3, section « transformer »,
 * processus 3 TRANSFÉRER). Trois familles d'exercices :
 *
 * - `expression` (A, « retrouver l'expression ») : des caractéristiques (domaine, asymptote,
 *   extremum, centre de symétrie, points…) qui déterminent de façon UNIQUE une fonction de
 *   référence transformée f(x) = a·g(x − TH) + TV ;
 * - `deduction` (B, « raisonner sans expression ») : parité + monotonie sur [0 ; m] + une valeur ;
 *   on en déduit une image et des comparaisons — ou on conclut qu'on ne peut pas savoir ;
 * - `courbe` (C, « choisir la courbe ») : 4 courbes, une seule respecte les 3 conditions ; chaque
 *   courbe écartée en viole EXACTEMENT une.
 */
import type { FamilleReference } from "./fonctionsReference.types";

export type { FamilleReference };

/** f(x) = a·g(x − h) + k, g la fonction de référence de `famille` (a ≠ 0). TH = h, TV = k. */
export interface FonctionTransformee {
  famille: FamilleReference;
  a: number;
  h: number;
  k: number;
}

/** Sous-ensemble de ℝ utilisé comme domaine ou ensemble image. */
export type EnsemblePortrait =
  | { type: "R" }
  | { type: "Rprive"; valeur: number }
  /** [borne ; +∞[ (`vers: "plus"`) ou ]−∞ ; borne] (`vers: "moins"`). */
  | { type: "demi"; borne: number; vers: "plus" | "moins" };

export type SensVariation = "croissante" | "decroissante";

export type ConditionPortrait =
  | { type: "domaine"; ensemble: EnsemblePortrait }
  | { type: "image"; ensemble: EnsemblePortrait }
  | { type: "asymptoteH"; k: number }
  /** `forme: "valeur"` s'écrit « f(x) = y », `forme: "point"` « le graphique passe par (x ; y) ». */
  | { type: "point"; x: number; y: number; forme: "point" | "valeur" }
  /** Extremum de f : `en` = abscisse où il est atteint (`null` : non précisée, déduite de la parité). */
  | { type: "extremum"; nature: "minimum" | "maximum"; valeur: number; en: number | null }
  | { type: "centre"; x: number; y: number }
  | { type: "parite"; parite: "paire" | "impaire" }
  | { type: "monotonie"; sens: SensVariation; u: number; v: number };

export type TypeCondition = ConditionPortrait["type"];

/** Groupe de la famille A : la caractéristique qui trahit la fonction de référence. */
export type GroupeExpression = "asymptotes" | "racine" | "extremum" | "symetrie";

export interface ExerciceExpression {
  famille: "expression";
  groupe: GroupeExpression;
  cible: FonctionTransformee;
  conditions: ConditionPortrait[];
  /** Point de contrôle (écran 4) : abscisse nouvelle, ordonnée entière à calculer. */
  controle: { x: number; y: number };
}

export type VerdictComparaison = "inferieur" | "superieur" | "indetermine";

/** Pourquoi la comparaison se conclut (ou non) — sert aux aides et au corrigé. */
export type CasComparaison = "memeCote" | "deuxCotes" | "horsIntervalle";

export interface ComparaisonImages {
  x1: number;
  x2: number;
  cas: CasComparaison;
  verdict: VerdictComparaison;
}

export interface ComparaisonValeur {
  /** On compare f(x) et v = f(p). */
  x: number;
  cas: CasComparaison;
  verdict: VerdictComparaison;
}

export interface ExerciceDeduction {
  famille: "deduction";
  parite: "paire" | "impaire";
  /** Sens de variation STRICT de f sur [0 ; m]. */
  sens: SensVariation;
  m: number;
  /** f(p) = v, 0 < p < m. */
  p: number;
  v: number;
  comparaisonImages: ComparaisonImages;
  comparaisonValeur: ComparaisonValeur;
}

export interface ExerciceCourbe {
  famille: "courbe";
  cible: FonctionTransformee;
  /** Les 3 conditions, toutes respectées par la cible. */
  conditions: ConditionPortrait[];
  /** Les 4 courbes, dans l'ordre d'affichage A, B, C, D. */
  courbes: FonctionTransformee[];
  indexCorrect: number;
  /** Pour chaque courbe : indice (dans `conditions`) de l'UNIQUE condition violée, `null` pour la bonne. */
  violations: (number | null)[];
}

export type ExercicePortraitRobot = ExerciceExpression | ExerciceDeduction | ExerciceCourbe;
export type FamillePortrait = ExercicePortraitRobot["famille"];

// ---------------------------------------------------------------------------------------------
// Réponses saisies
// ---------------------------------------------------------------------------------------------

export interface ReponseTranslations {
  th: number;
  tv: number;
}
