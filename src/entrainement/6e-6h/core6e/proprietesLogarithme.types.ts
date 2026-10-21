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
 * — décimaux arrondis à 3 décimales, tirés dans [1,000 ; 9,999]. `M`/`N`/`P` n'apparaissent QUE comme
 * noms symboliques dans l'arbre/l'expression affichée (voir `Noeud`/`NomVariable`) — aucune valeur
 * numérique ne leur est associée : elle ne serait d'aucune utilité pour résoudre l'exercice (seules
 * m/n/q/c comptent) et ne doit donc jamais être générée ni affichée comme donnée. `b`/`c` (nom de la
 * nouvelle base / valeur connue de log_b(a)) sont présents UNIQUEMENT si "changementBase" fait partie
 * de la combinaison.
 */

export interface ExerciceProprieteLogarithme {
  arbre: Noeud;
  avecChangementBase: boolean;
  m: number;
  n: number | null;
  q: number | null;
  /** Nom symbolique de la nouvelle base (toujours "b" en pratique, jamais numériquement résolue —
   * même convention que la base "a" elle-même) — `null` si "changementBase" absent de la combinaison. */
  b: string | null;
  /** c = log_b(a), constante DONNÉE (comme m/n/q) — `null` si "changementBase" absent. */
  c: number | null;
}

export type GenerateurExerciceProprietesLogarithme = () => ExerciceProprieteLogarithme;
