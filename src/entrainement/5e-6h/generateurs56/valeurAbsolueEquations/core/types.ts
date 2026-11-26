import type { EnsembleX } from "../../communReels/ensemblesExacts";
import type { Q } from "../../communReels/outilsReels";

/**
 * `56gen18` — « Équations et inéquations avec valeurs absolues » (5e (6h), « Nombres réels et suites »,
 * étape 4 « valeur-absolue », processus 2 APPLIQUER). Variantes : |ax + b| = c ; |ax + b| ⋚ c (signe de c
 * — négatif, nul, positif — tiré au tiers AVANT les nombres : c'est le verdict) ; |ax + b| = |cx + d| ;
 * |x² − k| ⋚ c. Réponse : l'ensemble des solutions, tapé librement ({−3 ; 7}, ]1 ; 4[ ∪ …, ℝ∖{2}, ∅).
 */

export type VarianteAbsolue = "equation" | "inequation" | "deuxAbsolues" | "carre";
export type SigneC = "negatif" | "nul" | "positif";
export type Symbole = "=" | "<" | "\\leq" | ">" | "\\geq";

export type SorteOption = "deux" | "une" | "zero" | "nonZero" | "aucune" | "tous" | "entre" | "dehors" | "seulDroite" | "oubliK";

export interface ExerciceAbsolue {
  variante: VarianteAbsolue;
  /** |a x + b| (équation, inéquation, deuxAbsolues) ; carre : k dans |x² − k|. */
  a: number;
  b: number;
  /** Second membre (equation, inequation, carre) ; deuxAbsolues : |c x + d|. */
  c: number;
  d: number;
  symbole: Symbole;
  signe: SigneC | null;
  /** Options du premier écran (choix), ordre canonique. */
  options: SorteOption[];
  bonne: SorteOption | null;
  /** deuxAbsolues : solutions de A = B et de A = −B. */
  x1: Q | null;
  x2: Q | null;
  solutions: EnsembleX;
}

export type PhaseAbsolue = "traduire" | "egaux" | "opposes" | "ensemble";
