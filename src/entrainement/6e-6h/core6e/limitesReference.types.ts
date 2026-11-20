/**
 * Couche core — « Limites de référence et croissances comparées » (6gen145, 6e ch. 2 « Fonctions
 * exponentielles », § 1 et § 2, processus 2 APPLIQUER). Trois écrans :
 * 1. la forme (0/0, ∞/∞, 0·∞, ∞ − ∞, ou pas une forme indéterminée) — choix fermé, une tentative ;
 * 2. la limite de référence qui permet de conclure — choix fermé, une tentative ;
 * 3. la valeur de la limite (exacte : fraction, k·ln a, ln(a/b), ±∞) — champ, trois tentatives.
 *
 * Limites de référence du cours : lim (eᵘ − 1)/u = 1 en 0 (§ 1), lim (aˣ − 1)/x = ln a en 0 (§ 2 :
 * ln a est par définition le nombre dérivé de aˣ en 0), xⁿ/aˣ → 0 en +∞ (dominance, § 1),
 * xⁿ·aˣ → 0 en −∞ pour a > 1 (§ 6). La règle de L'Hôpital est enseignée (décision de
 * l'utilisateur) mais ce générateur entraîne les limites de référence : le corrigé ne l'emploie pas.
 */

export type VarianteLimitesRef = "expo0" | "base0" | "plusInfini" | "moinsInfini" | "pasFI";

/** Identifiants des options de l'écran « forme ». */
export type FormeLimite = "0/0" | "inf/inf" | "0inf" | "inf-inf" | "aucune";

/** Identifiants des options de l'écran « référence ». */
export type ReferenceLimite = "R1" | "R2" | "R3" | "R4" | "R5";

export interface ExerciceLimitesRef {
  variante: VarianteLimitesRef;
  /** Forme de l'expression dans la variante (voir le générateur). */
  sousType: string;
  /** Point où l'on calcule la limite. */
  point: "0" | "+inf" | "-inf";
  /** Paramètres entiers (sens propre au sous-type ; base a = 0 signifie e). */
  k: number;
  m: number;
  j: number;
  a: number;
  b: number;
  n: number;
  c: number;
  d: number;
}
