/**
 * Couche core — « Lire sur le cercle trigonométrique » (gen122, 4e, chapitre 5, section
 * `remarquables`, processus 1 CONNAÎTRE). Un point M(θ) est placé sur le cercle trigonométrique,
 * dessiné dans un quadrillage dont les lignes passent par les valeurs remarquables
 * (0, ±1/2, ±√2/2, ±√3/2, ±1 : M tombe toujours à l'intersection de deux lignes) ; les graduations
 * ne sont écrites que sur les demi-axes positifs (le signe se lit au quadrant). Trois écrans :
 * 1. cos θ et sin θ lus (deux champs, 3 tentatives) ;
 * 2. θ dans [0° ; 360°[ (ou [0 ; 2π[) : deux candidats de même cosinus, tranchés par le quadrant ;
 * 3. tan θ lue sur la tangente verticale x = 1 (graduée en ±√3/3, ±1, ±√3), ou le verdict
 *    « tan θ n'est pas définie » quand (OM) est parallèle à cette tangente.
 *
 * VARIANTE = l'unité de la réponse de l'écran 2 (degrés ou radians). La position de M (quatre
 * quadrants, deux axes) est une issue tirée au hasard ; « tan θ n'est pas définie » est un verdict
 * (jamais un cas particulier).
 */

export type VarianteLectureCercle = "degres" | "radians";

/** Quadrant strict, ou axe sur lequel tombe M. */
export type PositionCercle = "I" | "II" | "III" | "IV" | "axe-horizontal" | "axe-vertical";

/** Valeur absolue d'une coordonnée ou d'une tangente remarquable. */
export type Grandeur = "0" | "1/2" | "r2/2" | "r3/2" | "1" | "r3/3" | "r3";

/** Valeur exacte signée : signe × grandeur (signe 0 seulement pour la grandeur « 0 »). */
export interface ValeurExacteSignee {
  signe: -1 | 0 | 1;
  grandeur: Grandeur;
}

export interface ExerciceLectureCercle {
  variante: VarianteLectureCercle;
  /** Mesure de θ en degrés, dans [0 ; 360[, multiple de 30° ou de 45° (16 angles remarquables). */
  angle: number;
}
