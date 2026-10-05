// Contrat core — 5gen16 "Convergence et divergence des suites". 3 variantes STRUCTURELLEMENT
// DISJOINTES : "arithmetique" (réutilise le paramétrage u1/r de 5gen14), "geometrique" (réutilise
// u1/q de 5gen15), "quelconque" (nouvelle famille, suite rationnelle un=P(n)/Q(n)) — voir CLAUDE.md
// pour le détail complet de chaque classification.
import type { FractionQ } from "./suitesGeometriques.types";

export type ClassificationArithmetique = "convergeVersU1" | "divergePlusInfini" | "divergeMoinsInfini";

export interface ExerciceConvergenceArithmetique {
  variante: "arithmetique";
  u1: number;
  r: number;
  classification: ClassificationArithmetique;
}

/** 5 catégories de la spec ("q=1"/"|q|<1"/"q>1"/"q=-1"/"q<-1"), la catégorie "q>1" se scindant en
 * 2 classifications selon le signe de u1 — 6 valeurs au total. */
export type ClassificationGeometrique = "convergeVersU1" | "convergeVersZero" | "divergePlusInfini" | "divergeMoinsInfini" | "oscilleNeConvergePas" | "oscilleDivergeSansLimite";

export interface ExerciceConvergenceGeometrique {
  variante: "geometrique";
  u1: number;
  /** `FractionQ` (jamais `number`) — affiché en fraction irréductible, jamais en décimal
   * (`prompt5gen155gen16arithmetiqueexacte.md`). Jamais exponentié dans ce générateur (seule la
   * classification, déjà assignée directement par tranche à la génération, en dépend), donc pas
   * besoin d'arithmétique fractionnaire au-delà du simple stockage/affichage. */
  q: FractionQ;
  classification: ClassificationGeometrique;
}

/** `a=0` ⟺ polynôme de degré 1 (jamais un champ `degre` séparé désynchronisable). */
export interface PolynomeConvergence {
  a: number;
  b: number;
  c: number;
}

export type ClassificationQuelconque = "limiteZero" | "limiteValeur" | "divergePlusInfini" | "divergeMoinsInfini";

export interface ExerciceConvergenceQuelconque {
  variante: "quelconque";
  P: PolynomeConvergence;
  degP: 1 | 2;
  Q: PolynomeConvergence;
  degQ: 1 | 2;
  classification: ClassificationQuelconque;
  /** Non-null SSI `classification==="limiteValeur"` — le rapport des coefficients dominants. */
  limiteValeur: number | null;
}

export type VarianteConvergenceSuite = "arithmetique" | "geometrique" | "quelconque";

export type ExerciceConvergenceSuite = ExerciceConvergenceArithmetique | ExerciceConvergenceGeometrique | ExerciceConvergenceQuelconque;

export type GenerateurExerciceConvergenceSuite = () => ExerciceConvergenceSuite;
