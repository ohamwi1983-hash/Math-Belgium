/**
 * Couche core — « Le détective d'erreurs : exponentielles » (6gen144, 6e ch. 2 « Fonctions
 * exponentielles », § 1 à 7, processus 3 TRANSFÉRER). Même mécanique que 6gen88 (logarithmes) :
 * la résolution d'un élève fictif (4 ou 5 lignes) contient UNE ligne fausse, la suite en découle.
 * Trois écrans : 1. quelle ligne ? (choix fermé, une tentative) ; 2. quelle erreur ? (quatre
 * descriptions, une tentative) ; 3. corriger (valeurs exactes, trois tentatives).
 *
 * Huit types d'erreur (= variantes), tirés des défauts relevés par l'audit du chapitre :
 * - `lnA`        : facteur ln a oublié dans la dérivée de a^{u} (scénario L) ;
 * - `signe`      : signe de e^{−kx} perdu en dérivant (S) ;
 * - `sens`       : base entre 0 et 1, sens de l'inégalité conservé (I) ;
 * - `racine`     : racine t < 0 gardée après la substitution t = aˣ (R) ;
 * - `regles`     : règles des puissances (P1 : (a²)^u = a^{2+u} ; P2 : aˣ·a^{x+p} = a^{x(x+p)}) ;
 * - `dominance`  : xⁿ « l'emporte » sur aˣ (D1 : xⁿ/aˣ ; D2 : aˣ − xⁿ) ;
 * - `croissance` : baisse de p % modélisée avec r = 1 + p (C) ;
 * - `rapport`    : facteur a d'un modèle exponentiel pris comme une différence (T).
 */

export type VarianteDetectiveExp = "lnA" | "signe" | "sens" | "racine" | "regles" | "dominance" | "croissance" | "rapport";

export type ScenarioDetectiveExp = "L" | "S" | "I" | "R" | "P1" | "P2" | "D1" | "D2" | "C" | "T";

export interface ExerciceDetectiveExp {
  variante: VarianteDetectiveExp;
  scenario: ScenarioDetectiveExp;
  /** Paramètres entiers du scénario (noms propres à chaque scénario, voir le modèle). */
  donnees: Record<string, number>;
  /** Les quatre descriptions de l'écran 2, dans l'ordre d'affichage (tiré à la génération). */
  options: string[];
}
