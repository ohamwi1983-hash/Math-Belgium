import type { Composantes, Point } from "./vecteur.types";

export type FigureReduction = "hexagone" | "etoile" | "trapeze" | "triangleMedianes";

/** Un terme signé `coefficient * \vec{origine,arrivee}` de l'expression à réduire — `origine`/
 * `arrivee` sont toujours des noms de points EXISTANTS dans `points` de l'exercice. */
export interface TermeReduction {
  origine: string;
  arrivee: string;
  coefficient: number;
}

export interface ExerciceReductionVectorielle {
  figure: FigureReduction;
  /** Tous les points nommés de la figure choisie, coordonnées FIXES (jamais aléatoires — seule
   * l'expression à réduire varie d'un exercice à l'autre au sein d'une même figure). */
  points: Record<string, Point>;
  /** L'expression à réduire, déjà mélangée (ordre d'affichage aléatoire). */
  termes: TermeReduction[];
  pointDepart: string;
  pointArrivee: string;
  /** = points[pointArrivee] - points[pointDepart] — la cible de la réduction. */
  reponse: Composantes;
}

export type GenerateurExerciceReductionVectorielle = () => ExerciceReductionVectorielle;
