import type { Composantes, Point } from "./vecteur.types";

/**
 * Couche core — « Carte au trésor et randonnée : déplacements successifs » (gen86, 4e, chapitre 6
 * « Calcul vectoriel », section « norme », processus 3 TRANSFÉRER).
 *
 * Une suite d'instructions de déplacement (vers l'est, le nord, l'ouest, le sud, ou en diagonale
 * sur la carte au trésor) part d'un point D. Repère : origine en D, axe x vers l'est, axe y vers le
 * nord. L'élève traduit chaque instruction en vecteur, additionne (Chasles), calcule une distance à
 * vol d'oiseau (norme), puis répond à la question propre à la situation : vecteur de retour
 * (opposé), dernier déplacement vers une cible, ou nombre de répétitions d'un « grand pas » (k·w).
 */

export type SituationDeplacements = "tresor" | "randonnee" | "drone";

/** retour : revenir au départ en ligne droite ; dernier : rejoindre une cible C ; repetition :
 * répéter un grand pas w depuis le rocher R jusqu'au trésor T. */
export type QuestionDeplacements = "retour" | "dernier" | "repetition";

export type Direction = "E" | "N" | "O" | "S" | "NE" | "NO" | "SE" | "SO";

export interface Deplacement {
  direction: Direction;
  /** Nombre de pas (en diagonale : nombre de pas en diagonale), de km ou de m. */
  longueur: number;
}

/** Distance demandée en valeur exacte (racine) ou arrondie (précision propre à la situation). */
export type PrecisionDistance = "exacte" | "arrondi";

export interface ExerciceDeplacementsSuccessifs {
  situation: SituationDeplacements;
  question: QuestionDeplacements;
  deplacements: Deplacement[];
  precision: PrecisionDistance;
  /** Cible : C (dernier) ou trésor T (repetition), coordonnées dans le repère ; `null` sinon. */
  cible: Point | null;
  /** Grand pas w (repetition seulement). */
  pas: Composantes | null;
  /** Nombre de répétitions du grand pas (repetition seulement). */
  k: number | null;
}
