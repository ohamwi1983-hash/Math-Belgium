/**
 * Couche core — « Domaine et ensemble image après transformations » (gen72, 4e, chapitre 3,
 * section « transformer », processus 3 TRANSFÉRER).
 *
 * On ne connaît de f que son domaine et son ensemble image (aucune expression, aucune courbe). Son
 * graphique subit successivement 2 à 5 transformations ; l'élève détermine le domaine et l'ensemble
 * image de la fonction g obtenue. Chaque transformation agit sur les POINTS du graphique, dans
 * l'ordre donné :
 * - TH a : (x ; y) → (x + a ; y)        - TV b : (x ; y) → (x ; y + b)
 * - SOY  : (x ; y) → (−x ; y)           - SOX  : (x ; y) → (x ; −y)
 * - EH k : (x ; y) → (k·x ; y)          - EV k : (x ; y) → (x ; k·y)
 * - CH k : (x ; y) → (x / k ; y)        - CV k : (x ; y) → (x ; y / k)
 * Cohérent avec la formule du cours f(x) = SOX·(EV/CV)·g(SOY·(CH/EH)·(x − TH)) + TV : CH = 2 donne
 * g(2x), compression (abscisses divisées par 2).
 */

export type TypeTransformation = "TH" | "TV" | "SOX" | "SOY" | "EH" | "CH" | "EV" | "CV";

/** Horizontale (agit sur les abscisses, donc sur le domaine) ou verticale (ordonnées, ensemble image). */
export type Axe = "H" | "V";

/** Nature d'une transformation, pour l'équilibre des séries : translation, symétrie, dilatation. */
export type NatureTransformation = "T" | "S" | "D";

export interface Transformation {
  type: TypeTransformation;
  /** Translation : décalage (entier non nul) ; étirement / compression : facteur (2, 3 ou 4) ;
   * symétrie : 0 (sans objet). */
  valeur: number;
}

/** Intervalle de ℝ ; une borne infinie vaut ±Infinity, son crochet est toujours ouvert. */
export interface Intervalle {
  gauche: number;
  gaucheFerme: boolean;
  droite: number;
  droiteFerme: boolean;
}

/** 1 : translations et symétries ; 2 : en plus, étirements et compressions. */
export type NiveauTransformations = 1 | 2;

export interface ExerciceTransformationsEnsembles {
  niveau: NiveauTransformations;
  domaine: Intervalle;
  image: Intervalle;
  transformations: Transformation[];
}
