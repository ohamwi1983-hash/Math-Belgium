import type { Composantes, Point } from "./vecteur.types";

/**
 * Les bonnes réponses (`labelsCorrects`) sont calculées à partir des COMPOSANTES réelles de chaque
 * vecteur affiché (audit chapitre 6) : même norme pour « longueur » (y compris un vecteur d'une
 * autre direction), produit en croix nul pour « direction », produit en croix nul et produit
 * scalaire positif pour « sens ». Les vecteurs de base sont deux à deux non colinéaires : seuls les
 * vecteurs issus de la base 0 sont colinéaires à la référence, ce qui garantit un coefficient entier
 * pour l'étape « égalité » (`cibleEgalite`, toujours choisi parmi les bonnes réponses colinéaires).
 */
export type ProprieteComparaison = "longueur" | "direction" | "sens";

export interface VecteurFigureCompare {
  label: string;
  origine: Point;
  composantes: Composantes;
  /** Index (dans l'ordre de tirage) du vecteur de base dont celui-ci est une transformation. */
  indexBase: number;
  /** `composantes = coefficientBase * vecteurs[baseCorrespondante].composantes` — 1 pour les
   * vecteurs de base eux-mêmes. */
  coefficientBase: number;
}

export interface ExerciceComparaisonVecteurs {
  vecteurs: VecteurFigureCompare[];
  labelReference: string;
  propriete: ProprieteComparaison;
  /** Labels (hors la référence elle-même) satisfaisant la propriété par rapport à la référence. */
  labelsCorrects: string[];
  /** Un label de `labelsCorrects`, choisi pour l'étape "égalité". */
  cibleEgalite: string;
  /** `vecteurs[cibleEgalite].composantes = coefficientEgalite * vecteurs[labelReference].composantes`. */
  coefficientEgalite: number;
}

export type GenerateurExerciceComparaisonVecteurs = () => ExerciceComparaisonVecteurs;
