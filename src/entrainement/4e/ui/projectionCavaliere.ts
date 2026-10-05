import type { Point3D } from "../core/geometrieEspace.types";

/**
 * Projection cavalière classique (chapitre 6, "Géométrie dans l'espace") — module pur, sans état,
 * partagé par les 3 générateurs du chapitre. Convention interne : `x` = horizontal (droite
 * positive), `z` = hauteur (haut positif), `y` = profondeur, projetée obliquement (axe qui "rentre
 * dans l'écran"). Angle et coefficient de réduction FIXES — aucune personnalisation par générateur,
 * pour que tous les rendus du chapitre partagent exactement la même perspective.
 */
export const ANGLE_CAVALIER = Math.PI / 4; // 45°
export const COEFFICIENT_REDUCTION = 0.5;

export interface Point2D {
  x: number;
  y: number;
}

/**
 * Projette un point 3D interne vers des coordonnées 2D EN UNITÉS (pas encore des pixels — voir
 * `solide3DSketch.ts` pour la mise à l'échelle/le viewBox). `y` grandit vers le haut ici (convention
 * mathématique) ; c'est `solide3DSketch.ts` qui inverse l'axe pour l'affichage SVG (y grandit vers
 * le bas en SVG).
 */
export function projeterPoint3D(p: Point3D): Point2D {
  const decalageOblique = p.y * Math.cos(ANGLE_CAVALIER) * COEFFICIENT_REDUCTION;
  const hauteurOblique = p.y * Math.sin(ANGLE_CAVALIER) * COEFFICIENT_REDUCTION;
  return {
    x: p.x + decalageOblique,
    y: p.z + hauteurOblique,
  };
}
