/**
 * Couche core — « Retrouver l'équation d'une parabole » (gen125, 4e, chapitre 1, § 2 `transformer`,
 * processus 2 APPLIQUER). Trois écrans :
 * 1. la forme de départ (choix fermé, une tentative) : canonique a(x − x_S)² + y_S avec le sommet,
 *    factorisée a(x − x₁)(x − x₂) avec les zéros, développée ax² + bx + c avec trois points dont
 *    (0 ; c) — les trois options fausses sont des erreurs typiques (signe dans la parenthèse, point
 *    pris pour le sommet, a oublié, c pris sur un autre point) ;
 * 2. a grâce au point P (champ, 3 tentatives) — ou a et b par un système (trois points) ;
 * 3. l'équation développée (champ « f(x) = », toute écriture équivalente acceptée).
 *
 * VARIANTE = les données : sommet + point, deux zéros + point, lue sur un graphique (le sommet OU les
 * zéros tombent sur des nœuds — l'élève doit voir lesquels), trois points (système). Aucun groupe à
 * verdict : la forme de départ découle des données imprimées, le nom de la variante n'apprend rien
 * de plus (sauf « graphique », où ce qui se lit est tiré 50/50 dans la variante).
 */

export type VarianteEquationParabole = "sommet" | "zeros" | "graphique" | "troisPoints";

/** Ce qui se lit sur le graphique : le sommet (aucun zéro) ou les zéros (sommet entre deux lignes). */
export type LectureGraphique = "sommet" | "zeros";

export type IdForme = "juste" | "signe" | "pointSommet" | "sansA" | "cAutre";

export interface PointEntier {
  x: number;
  y: number;
}

export interface FenetreEquationParabole {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

export interface ExerciceEquationParabolePoints {
  variante: VarianteEquationParabole;
  /** Données réellement utilisées : le sommet (canonique), les zéros (factorisée) ou trois points. */
  donnees: "sommet" | "zeros" | "troisPoints";
  /** f(x) = A x² + B x + C. */
  coefficients: [number, number, number];
  sommet: PointEntier;
  /** Zéros rangés (deux, entiers) quand `donnees` = « zeros ». */
  zeros: number[];
  /** Point P qui donne a (sommet, zéros, graphique). */
  point: PointEntier;
  /** Trois points : (0 ; c), puis B et C (x = 1 et x₂). */
  points: PointEntier[];
  fenetre?: FenetreEquationParabole;
  /** Options de l'écran 1, dans l'ordre d'affichage (tiré à la génération). */
  optionsForme: { id: IdForme; latex: string }[];
}
