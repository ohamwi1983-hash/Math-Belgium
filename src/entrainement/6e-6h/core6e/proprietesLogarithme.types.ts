import type { Noeud } from "./decompositionLogarithme";

/**
 * Couche core (6e) — contrat pour `6gen13` ("Propriétés du logarithme", chapitre 3 — "Fonctions
 * logarithmes"), REFONTE TOTALE : 5 caractéristiques (produit, quotient, puissance, racine,
 * changement de base) combinées de 1 à 4 à la fois — voir `core6e/decompositionLogarithme.ts` pour
 * le moteur de construction/décomposition (arbre `Noeud`, variables libres m/n/q/r/c).
 *
 * `m = log_a(M)` (toujours présent), `n = log_a(N)` (présent si produit ou quotient fait partie de
 * la combinaison), `q = log_a(P)` (présent seulement si produit ET quotient sont TOUS LES DEUX dans
 * la combinaison — la 2e opération binaire a besoin d'une 3e variable, voir `decompositionLogarithme.ts`)
 * — décimaux arrondis à 3 décimales, tirés dans [1,000 ; 9,999]. `M`/`N`/`P` sont des entiers
 * d'AFFICHAGE (2 à 999) — leur valeur réelle est SANS AUCUNE incidence sur la correction, seule leur
 * présence symbolique dans l'expression affichée compte. `b`/`c` (nom de la nouvelle base / valeur
 * connue de log_b(a)) sont présents UNIQUEMENT si "changementBase" fait partie de la combinaison.
 */

export interface ExerciceProprieteLogarithme {
  arbre: Noeud;
  avecChangementBase: boolean;
  m: number;
  n: number | null;
  q: number | null;
  M: number;
  N: number | null;
  P: number | null;
  /** Nom symbolique de la nouvelle base (toujours "b" en pratique, jamais numériquement résolue —
   * même convention que la base "a" elle-même) — `null` si "changementBase" absent de la combinaison. */
  b: string | null;
  /** c = log_b(a), constante DONNÉE (comme m/n/q) — `null` si "changementBase" absent. */
  c: number | null;
}

export type GenerateurExerciceProprietesLogarithme = () => ExerciceProprieteLogarithme;
