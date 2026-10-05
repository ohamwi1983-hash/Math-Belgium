/**
 * Couche core — "Équation d'une parabole depuis un graphe". Lire sommet S et foyer F (tous deux à
 * coordonnées entières) sur un graphe Mafs, puis écrire l'équation de la parabole. 2 variantes
 * MÉLANGÉES dans le même générateur (jamais deux générateurs séparés) : axe vertical (directrice
 * horizontale, `(x-x_S)^2=2p(y-y_S)`) et axe horizontal (directrice verticale, `(y-y_S)^2=2p(x-x_S)`).
 *
 * `OrientationParabole` est réutilisé tel quel par `equationParaboleDeveloppee.types.ts`
 * (générateur symétrique en sens inverse) — même principe de partage qu'un type déjà présent dans
 * le contrat réutilisé par plusieurs exercices (ex. `Categorie`, 6 générateurs), jamais un type
 * dupliqué : les deux générateurs manipulent littéralement le même concept d'orientation d'axe.
 *
 * Réutilise directement `Point` (`core/vecteur.types.ts`), jamais un type dupliqué.
 */
import type { Point } from "./vecteur.types";

export type OrientationParabole = "vertical" | "horizontal";

export interface ExerciceEquationParabole {
  variante: OrientationParabole;
  /** Sommet S, toujours à coordonnées entières. */
  sommet: Point;
  /** Foyer F, toujours à coordonnées entières — donnée visible du graphe, jamais une révélation
   * gardée par un bouton "Aide". */
  foyer: Point;
  /** Paramètre p, composante SIGNÉE (jamais une distance non signée `|SF|`) : axe vertical →
   * `2(y_F-y_S)` ; axe horizontal → `2(x_F-x_S)`. Toujours un entier pair non nul (double d'une
   * différence d'entiers, S≠F garanti à la génération). */
  p: number;
}

export type GenerateurExerciceEquationParabole = () => ExerciceEquationParabole;
