/**
 * Couche core — "Équation d'un cercle (non développée) à partir d'un graphe". Comble une
 * compétence absente ailleurs sur la plateforme : lire un cercle tracé sur un graphe (centre +
 * un point marqué sur le cercle) et en écrire l'équation `(x-x0)²+(y-y0)²=r²`, jamais développée.
 *
 * Réutilise directement `Point` (`core/vecteur.types.ts`), jamais un type dupliqué.
 *
 * `centre`/`rayon` restent la SEULE vérité géométrique du contrat — `pointMarque` est le point du
 * cercle affiché à l'élève pour qu'il retrouve `rayon` (directement par lecture sur la grille pour
 * `rayon_direct`, ou par la distance centre↔point pour `rayon_indirect`) ; toujours entier, jamais
 * approximatif, jamais recalculé différemment côté vérification (le rayon reste `exercice.rayon`,
 * jamais redérivé de `pointMarque`).
 */
import type { Point } from "./vecteur.types";

/**
 * `"rayon_direct"` — `pointMarque` aligné horizontalement ou verticalement avec `centre` : le
 * rayon se lit directement en comptant les carreaux, sans calcul.
 * `"rayon_indirect"` — `pointMarque` décalé en diagonale d'un triplet pythagoricien exact : le
 * rayon doit être retrouvé par la formule de distance (jamais lu directement sur la grille).
 */
export type VarianteEquationCercle = "rayon_direct" | "rayon_indirect";

export interface ExerciceEquationCercle {
  variante: VarianteEquationCercle;
  /** Centre du cercle, toujours à coordonnées entières. */
  centre: Point;
  /** Rayon exact du cercle, toujours un entier strictement positif. */
  rayon: number;
  /** Point marqué sur le cercle, toujours à coordonnées entières — donnée visible du graphe,
   * jamais une révélation gardée par un bouton "Aide". */
  pointMarque: Point;
}

export type GenerateurExerciceEquationCercle = () => ExerciceEquationCercle;
