/**
 * Couche core — « Premier ou second degré ? Différences secondes » (gen124, 4e, chapitre 1, § 1
 * `etudier`, processus 2 APPLIQUER). Un tableau de valeurs (x de 1 en 1, cinq valeurs, 0 compris) ;
 * l'élève calcule :
 * 1. les différences premières d₁…d₄ (champs, 3 tentatives) ;
 * 2. les différences secondes s₁…s₃ (champs) ;
 * 3. le verdict : premier degré, second degré, ni l'un ni l'autre (choix fermé, une tentative) ;
 * 4. l'expression : a, b, c (2a = s, c = f(0), f(1) = a + b + c) ou m, p (m = d, p = f(0)).
 * « Ni l'un ni l'autre » n'a pas d'écran 4 : la coquille garde quatre puces (`nombrePuces`) pour
 * que leur nombre ne trahisse pas le verdict.
 *
 * VARIANTE = le verdict (second degré, premier degré, ni l'un ni l'autre ; a demi-entier = issue tirée à
 * 40 % dans « second ») : groupe à verdict `groupe_degre` dans le panneau d'évaluation.
 */

export type VarianteDifferences = "second" | "premier" | "aucun";

export type Verdict = "premier" | "second" | "aucun";

/** Fonctions « ni l'un ni l'autre » : cubique, exponentielle k·2ˣ + r, trinôme dont UNE valeur a
 * été modifiée (le piège : toutes les différences secondes doivent être vérifiées). */
export type FamilleAucun = "cube" | "exponentielle" | "perturbee";

export interface ExerciceDifferences {
  variante: VarianteDifferences;
  /** Cinq abscisses consécutives, 0 compris. */
  xs: number[];
  valeurs: number[];
  /** Second degré : a, b, c ; premier degré : m, p ; sinon absent. */
  coefficients?: { a: number; b: number; c: number } | { m: number; p: number };
  famille?: FamilleAucun;
  /** Ordre d'affichage des trois verdicts (tiré à la génération). */
  ordreVerdicts: Verdict[];
}
