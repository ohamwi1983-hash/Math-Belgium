/**
 * Couche core — « Lire une parabole sur un graphique » (gen123, 4e, chapitre 1, § 1 `etudier`,
 * processus 1 CONNAÎTRE). La parabole y = f(x) = a(x − x_S)² + y_S = ax² + bx + c est tracée sur un
 * quadrillage d'une unité à échelle unique (`ui/figureParaboleGrille.ts`) ; sommet, zéros et
 * ordonnée à l'origine tombent sur des nœuds. Quatre écrans (méthode du cours « trois lectures ») :
 * 1. les signes de a, b et c (choix fermé, 4 combinaisons, une tentative) ;
 * 2. le sommet et l'axe de symétrie (champs, 3 tentatives) ;
 * 3. les zéros et l'ordonnée à l'origine (champs) ;
 * 4. l'image de f (choix fermé, une tentative).
 *
 * VARIANTE = nombre de zéros (deux, un, aucun) : c'est la réponse de l'écran 3, donc un VERDICT —
 * groupe à verdict `groupe_zeros` dans le panneau d'évaluation.
 */

export type VarianteLectureParabole = "deuxZeros" | "unZero" | "aucunZero";

export type Signe = -1 | 0 | 1;

/** Triple (signe de a, signe de b, signe de c). */
export type TripleSignes = [Signe, Signe, Signe];

/** Raison d'être d'une option de l'écran 1 (message ciblé si elle est choisie). */
export type IdOptionSignes = "juste" | "bSeul" | "cSommet" | "ouverture";

/** Options de l'écran 4 : image juste, sens inversé, borne lue sur le mauvais axe (x_S ou c),
 * crochet ouvert au sommet, domaine ℝ. */
export type IdOptionImage = "juste" | "sens" | "abscisse" | "origine" | "ouvert" | "reels";

export interface FenetreParabole {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

export interface ExerciceLectureParabole {
  variante: VarianteLectureParabole;
  a: number;
  xS: number;
  yS: number;
  /** Zéros rangés (0, 1 ou 2). */
  zeros: number[];
  fenetre: FenetreParabole;
  /** Ordre d'affichage des 4 combinaisons de signes (tiré à la génération). */
  optionsSignes: { id: IdOptionSignes; signes: TripleSignes }[];
  /** Ordre d'affichage des 4 images proposées. */
  optionsImage: IdOptionImage[];
}
