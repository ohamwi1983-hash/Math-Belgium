/**
 * Couche A (6e) — types de `6gen86` « Comparer et encadrer des logarithmes sans calculatrice »
 * (chapitre 3, section `proprietes`, processus 2 appliquer). Tout se décide SANS calculatrice :
 * puissances connues, croissance (ou décroissance) de logₐ, changement de base. Quatre variantes :
 *
 * - `encadrer` : encadrer logₐ(N) entre deux entiers consécutifs (a ∈ {2, 3, 5, 10}, N entier non
 *   puissance de a), via aᵏ < N < aᵏ⁺¹.
 * - `comparer` : comparer A et B, deux logarithmes de bases différentes. Verdict (<, >, =) tiré
 *   AVANT la construction : bases sans lien dont les encadrements entiers se séparent (`separes`,
 *   verdict < ou >), ou bases liées c et cⁿ dont les encadrements coïncident (`lies`, verdict <, >
 *   ou =, tranché par le changement de base). `baseInf1` : toutes les bases sont < 1 (sens inversé).
 * - `ranger` : ranger 4 nombres (3 logarithmes de bases diverses + un entier ou une fraction).
 * - `changementBase` : log 2 ≈ 0,301 et log 3 ≈ 0,477 (ou ln 2, ln 3) donnés, valeur approchée
 *   de logₐ(N) par les propriétés (produit, quotient, puissance) et le changement de base.
 */

export type VarianteComparerEncadrerLog = "encadrer" | "comparer" | "ranger" | "changementBase";

/** Rationnel strictement positif num/den (fraction irréductible, den ≥ 1). */
export interface Rationnel {
  num: number;
  den: number;
}

/** Logarithme log_base(argument), base et argument rationnels positifs (base ≠ 1). */
export interface TermeLog {
  base: Rationnel;
  argument: Rationnel;
  /** Entier n tel que n < log_base(argument) < n + 1 (le logarithme n'est jamais entier). */
  plancher: number;
}

/** Aide ou ligne de justification : phrase (finie par « : » quand une formule suit) + formule. */
export interface TexteAvecLatex {
  texte: string;
  latex?: string;
}

export interface ExerciceEncadrerLog {
  variante: "encadrer";
  a: number;
  N: number;
  /** aᵏ < N < aᵏ⁺¹. */
  k: number;
}

export type VerdictComparaison = "<" | ">" | "=";

export interface ExerciceComparerLog {
  variante: "comparer";
  baseInf1: boolean;
  /** `separes` : encadrements disjoints ; `lies` : bases c et cⁿ (ou même base), encadrements égaux. */
  type: "separes" | "lies";
  A: TermeLog;
  B: TermeLog;
  verdict: VerdictComparaison;
  /** `lies` seulement : base commune c, exposant n (base de l'autre terme = cⁿ), y et x tels que
   * le terme de base cⁿ vaut log_{cⁿ}(x) et l'autre log_c(y) ; `termeCn` dit lequel (A ou B). */
  lien: { c: Rationnel; n: number; x: number; y: number; termeCn: "A" | "B" } | null;
}

/** Nombre à ranger : un logarithme non entier, ou un rationnel (entier ou fraction). */
export type NombreARanger = { type: "log"; terme: TermeLog } | { type: "rationnel"; valeur: Rationnel; negatif: boolean };

export interface ExerciceRangerLog {
  variante: "ranger";
  /** Ordre d'affichage (mélangé). */
  nombres: NombreARanger[];
  /** Indices de `nombres` rangés dans l'ordre croissant. */
  ordre: number[];
}

/** Décomposition 2^p · 3^q · 5^r (r ≠ 0 seulement avec les logarithmes décimaux : log 5 = 1 − log 2). */
export interface Decomposition {
  p: number;
  q: number;
  r: number;
}

export interface ExerciceChangementBaseLog {
  variante: "changementBase";
  /** Logarithmes donnés : décimaux (`log`) ou népériens (`ln`). */
  mode: "log" | "ln";
  a: Decomposition;
  N: Decomposition;
  /** Valeurs approchées, en millièmes, calculées à partir des valeurs DONNÉES (pas des vraies). */
  logNMilli: number;
  logAMilli: number;
  /** Résultat arrondi au centième, en centièmes. */
  resultatCentiemes: number;
  /** Ordre d'affichage des 4 options de l'écran « formule » (identifiants 0 = correcte). */
  ordreFormules: number[];
}

export type ExerciceComparerEncadrerLog = ExerciceEncadrerLog | ExerciceComparerLog | ExerciceRangerLog | ExerciceChangementBaseLog;
