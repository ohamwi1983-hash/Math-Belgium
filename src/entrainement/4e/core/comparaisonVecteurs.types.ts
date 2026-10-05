import type { Composantes, Point } from "./vecteur.types";

/**
 * Portée délibérément restreinte de "même longueur" (voir CLAUDE.md) : chaque vecteur affiché est
 * une transformation (translation ou multiple scalaire) d'un des 2-3 vecteurs de base, jamais
 * construit indépendamment — deux vecteurs issus de bases DIFFÉRENTES n'ont donc aucune garantie
 * de norme égale par construction. "même longueur" est donc testée UNIQUEMENT parmi les
 * transformations du MÊME vecteur de base que la référence, restreintes à un coefficient effectif
 * ±1 (translation ou opposé exact) — ce qui garantit que tout vecteur "de même longueur" trouvé
 * est aussi automatiquement colinéaire à la référence, rendant l'étape "égalité" (screen 3,
 * toujours une équation `cible = k·référence`) valide uniformément pour les 3 propriétés.
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
