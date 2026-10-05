/**
 * Couche core — "Sommet, foyer, p et directrice d'une parabole depuis l'équation développée".
 * Symétrique en sens inverse de "Équation d'une parabole depuis un graphe" : partir d'une équation
 * développée à une seule variable au carré et retrouver sommet/foyer/p/directrice.
 *
 * Réutilise `OrientationParabole` (`equationParabole.types.ts`, générateur symétrique) — même
 * concept d'orientation d'axe, jamais un type dupliqué (voir sa section dédiée pour la
 * justification). Réutilise directement `Point` (`core/vecteur.types.ts`).
 */
import type { OrientationParabole } from "./equationParabole.types";
import type { Point } from "./vecteur.types";

export interface ExerciceEquationParaboleDeveloppee {
  variante: OrientationParabole;
  /** Coefficient devant le terme carré — toujours un entier strictement POSITIF (même principe
   * que `k` pour "Centre et rayon d'un cercle depuis l'équation développée" : le signe de
   * l'ouverture est déjà entièrement porté par `p`, jamais doublé par un `a` négatif). */
  a: number;
  /** Coefficient du terme linéaire de la MÊME variable que le carré (x si `variante="vertical"`,
   * y si `"horizontal"`). */
  bCarre: number;
  /** Coefficient du terme linéaire de l'AUTRE variable — jamais 0 (p≠0, sinon parabole dégénérée). */
  bAutre: number;
  /** Constante du second membre de l'équation développée (`a·[carré]+bCarre·[même var]+bAutre·[autre var]=c`). */
  c: number;
  /** Sommet S — toujours à coordonnées entières, la SEULE vérité géométrique du contrat. */
  sommet: Point;
  /** Foyer F — toujours à coordonnées entières, jamais recalculé différemment côté vérification. */
  foyer: Point;
  /** Paramètre p, composante SIGNÉE (jamais une distance non signée) — toujours un entier pair non
   * nul, même convention que `equationParabole.types.ts`. */
  p: number;
  /** Valeur de la droite directrice — droite horizontale `y=directrice` si `variante="vertical"`,
   * verticale `x=directrice` si `"horizontal"` ; symétrique de F par rapport à S le long de l'axe. */
  directrice: number;
}

export type GenerateurExerciceEquationParaboleDeveloppee = () => ExerciceEquationParaboleDeveloppee;
