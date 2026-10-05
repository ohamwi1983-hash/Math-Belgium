/**
 * Couche core — "Centre et rayon d'un cercle depuis l'équation développée". Complète
 * `equationCercle.types.ts` (qui va du graphe vers l'équation non développée) dans l'autre sens :
 * partir d'une équation développée `kx²+ky²+bx·x+by·y=c` et en retrouver centre + rayon, en
 * passant explicitement par le regroupement/factorisation puis la complétion du carré.
 *
 * Réutilise directement `Point` (`core/vecteur.types.ts`), jamais un type dupliqué — même
 * convention que `equationCercle.types.ts`.
 */
import type { Point } from "./vecteur.types";

/**
 * `"rationnel"` — le terme constant final (une fois divisé par le coefficient commun) est un
 * carré parfait de fraction : r est rationnel.
 * `"irrationnel"` — ce terme constant n'est PAS un carré parfait : r reste sous forme de racine.
 */
export type VarianteEquationCercleDeveloppee = "rationnel" | "irrationnel";

export interface ExerciceEquationCercleDeveloppee {
  variante: VarianteEquationCercleDeveloppee;
  /** Coefficient commun devant x² ET y² dans l'équation développée — toujours un entier
   * strictement positif, IDENTIQUE sur les deux termes (condition nécessaire pour qu'une équation
   * quadratique à 2 variables représente un cercle plutôt qu'une ellipse). */
  k: number;
  /** Coefficient du terme linéaire en x de l'équation développée (kx²+ky²+bx·x+by·y=c). */
  bx: number;
  /** Coefficient du terme linéaire en y. */
  by: number;
  /** Constante du second membre de l'équation développée. */
  c: number;
  /** Centre (a,b) du cercle — coordonnées entières ou demi-entières, jamais recalculées
   * différemment côté vérification (toujours la SEULE vérité géométrique, comme `equationCercle.types.ts`). */
  centre: Point;
  /** r² exact — toujours un multiple de 1/4 par construction. */
  rayonCarre: number;
  /** Rayon exact — rationnel pour la variante `"rationnel"`, irrationnel (racine) pour
   * `"irrationnel"`. Jamais redérivé de `rayonCarre` différemment ailleurs. */
  rayon: number;
}

export type GenerateurExerciceEquationCercleDeveloppee = () => ExerciceEquationCercleDeveloppee;
