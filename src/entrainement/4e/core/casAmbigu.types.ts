/**
 * Couche core — « Cas ambigu : 0, 1 ou 2 triangles ? » (gen74, 4e, chapitre 5, section
 * « triangle », processus 2 APPLIQUER).
 *
 * Données SSA : deux côtés a = BC et b = AC, et l'angle Â, opposé à a — donc NON compris entre les
 * deux côtés donnés. Le point B est à placer sur la demi-droite [Ax) qui porte le côté c = AB.
 * Notation du cours : côté minuscule opposé au sommet de même lettre majuscule. Angles en degrés.
 *
 * Le calcul (sin B̂, candidats, nombre de triangles, côtés) vit dans un module PUR et réutilisable,
 * `moteur/modeleCasAmbigu.ts` — jamais recalculé ailleurs (écran, aides, corrigé papier).
 */

export type UniteCasAmbigu = "cm" | "dm" | "m";

export interface ExerciceCasAmbigu {
  /** Angle Â en degrés (entier, aigu). */
  angleA: number;
  /** b = AC, côté adjacent à Â (entier ou une décimale). */
  b: number;
  /** a = BC, côté opposé à Â (entier ou une décimale). */
  a: number;
  unite: UniteCasAmbigu;
}
