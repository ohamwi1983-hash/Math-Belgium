/**
 * Contrat — "Colinéarité et alignement de points" (chapitre "Calcul vectoriel"), réécriture
 * complète (`promptcreationgenerateur24colinearitealignement.md`) : 4 variantes plutôt que 2,
 * toutes fondées sur le même critère `a·d-b·c` (jamais le mot "déterminant", hors programme de
 * 4e — les matrices n'y sont pas encore vues).
 *
 * **`LinExpr`** (`coefX·x + constante`) généralise une composante qui PEUT dépendre de `x` —
 * `coefX=0` représente une composante purement numérique, sans distinction structurelle : les
 * variantes "vecteurs"/"points" (jamais de `x`) et "parametre"/"pointsParametre" (`x` dans au
 * moins une composante) partagent donc le même type `ComposantesLin`, seule la génération diffère
 * (voir `generateurs/colinearite/`).
 */
import type { Composantes, Point } from "./vecteur.types";

export type VarianteColinearite = "vecteurs" | "parametre" | "points" | "pointsParametre";

export interface LinExpr {
  coefX: number;
  constante: number;
}

export interface ComposantesLin {
  x: LinExpr;
  y: LinExpr;
}

/** 3 cas de la relation de colinéarité réduite à `coefX·x + coefConst = 0` — jamais un cas
 * quadratique, garanti par construction (voir la section dédiée du générateur). */
export type TypeSolutionColinearite = "unique" | "identite" | "contradiction";

/** Variante 1 — colinéarité de 2 vecteurs donnés (1 seul écran). */
export interface ExerciceColinearVecteurs {
  variante: "vecteurs";
  v1: Composantes;
  v1Nom: string;
  v2: Composantes;
  v2Nom: string;
  critere: number;
  colineaires: boolean;
}

/** Variante 2 — déterminer x pour la colinéarité (2 écrans : réduction, résolution). Les
 * composantes de `v1`/`v2` sont directement données dans l'énoncé (jamais construites à partir de
 * points, contrairement à `pointsParametre`) — certaines dépendent de `x` (`coefX≠0`), d'autres
 * non (`coefX=0`), jamais toutes les 4 à la fois côté même vecteur ET l'autre vecteur (la
 * construction garantit qu'un seul des deux vecteurs dépend de `x`, l'autre restant purement
 * numérique — condition suffisante, jamais nécessaire en théorie, pour que le critère réduit reste
 * toujours du 1er degré). */
export interface ExerciceColinearParametre {
  variante: "parametre";
  v1: ComposantesLin;
  v1Nom: string;
  v2: ComposantesLin;
  v2Nom: string;
  coefX: number;
  coefConst: number;
  typeSolution: TypeSolutionColinearite;
  solutionX: number | null;
}

/** Variante 3 — alignement de 3 points (2 écrans : construction des vecteurs AB/AC, puis test de
 * colinéarité sur ces deux vecteurs). */
export interface ExerciceColinearPoints {
  variante: "points";
  pointA: Point;
  labelA: string;
  pointB: Point;
  labelB: string;
  pointC: Point;
  labelC: string;
  vecteurAB: Composantes;
  vecteurAC: Composantes;
  critere: number;
  alignes: boolean;
}

/** Variante 4 — alignement avec x (3 écrans : construction, réduction, résolution). `pointA` est
 * toujours purement numérique (jamais de `x`) ; `pointB`/`pointC` peuvent en dépendre — mêmes
 * garanties de construction que `parametre` (un seul des deux vecteurs AB/AC dépend de `x`). */
export interface ExerciceColinearPointsParametre {
  variante: "pointsParametre";
  pointA: Point;
  labelA: string;
  pointB: ComposantesLin;
  labelB: string;
  pointC: ComposantesLin;
  labelC: string;
  vecteurAB: ComposantesLin;
  vecteurAC: ComposantesLin;
  coefX: number;
  coefConst: number;
  typeSolution: TypeSolutionColinearite;
  solutionX: number | null;
}

export type ExerciceColinearite = ExerciceColinearVecteurs | ExerciceColinearParametre | ExerciceColinearPoints | ExerciceColinearPointsParametre;

export type GenerateurExerciceColinearite = () => ExerciceColinearite;
