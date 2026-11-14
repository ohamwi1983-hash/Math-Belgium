/**
 * Couche A (6e) — types de `6gen77` « L'intégrale lue sur un graphique (aire signée) » (chapitre 4,
 * section `integralesdefinies`). Le sens de l'intégrale SANS primitive : la courbe d'une fonction
 * affine par morceaux (sommets à coordonnées entières), avec au plus une portion de disque
 * (demi-disque ou quart de disque de rayon entier, centre sur l'axe des abscisses), est donnée sur un
 * quadrillage ; l'intégrale se calcule par des aires de figures simples, comptées négativement sous
 * l'axe.
 *
 * Un `Morceau` est une figure simple d'un seul signe (jamais à cheval sur l'axe) : deux morceaux
 * consécutifs ne sont jamais dans le prolongement l'un de l'autre, SAUF quand ils se rejoignent sur
 * l'axe en changeant de signe (droite qui traverse l'axe, découpée au zéro). Les points de découpe
 * (changements de forme et zéros) sont donc exactement les bornes intérieures des morceaux.
 *
 * Variantes :
 * - `calcul` : découper [a ; b], intégrale signée de chaque morceau, somme ;
 * - `aireIntegrale` : zéros de f (changements de signe), intégrale sur chaque intervalle de signe
 *   constant, puis l'intégrale ET l'aire (somme des valeurs absolues) — deux nombres différents ;
 * - `proprietes` : la courbe n'est connue que sur [c ; d] ; une intégrale sur un intervalle plus grand
 *   est donnée ; lecture sur le graphique, additivité (Chasles), puis bornes inversées.
 */

export type VarianteIntegraleGraphique = "calcul" | "aireIntegrale" | "proprietes";

export type TypeDisque = "aucun" | "demi" | "quart";

export type Morceau =
  /** Segment de (x0 ; y0) à (x1 ; y1), coordonnées entières, y0 et y1 de même signe (ou l'un nul). */
  | { type: "segment"; x0: number; x1: number; y0: number; y1: number }
  /** Demi-disque de centre ((x0 + x1)/2 ; 0) et de rayon r = (x1 − x0)/2, au-dessus (signe 1) ou en
   * dessous (signe −1) de l'axe. */
  | { type: "demiDisque"; x0: number; x1: number; r: number; signe: 1 | -1 }
  /** Quart de disque de rayon r, centre sur l'axe : « montant » (de (x0 ; 0) à (x0 + r ; ±r), centre
   * (x1 ; 0)) ou « descendant » (de (x0 ; ±r) à (x0 + r ; 0), centre (x0 ; 0)). */
  | { type: "quartDisque"; x0: number; x1: number; r: number; signe: 1 | -1; sens: "montant" | "descendant" };

interface Base {
  /** Morceaux tracés, de gauche à droite (tout [a ; b], ou la partie connue [c ; d] en `proprietes`). */
  morceaux: Morceau[];
  disque: TypeDisque;
}

export interface ExerciceCalculIntegrale extends Base {
  variante: "calcul";
  a: number;
  b: number;
}

export interface ExerciceAireIntegrale extends Base {
  variante: "aireIntegrale";
  a: number;
  b: number;
}

export interface ExerciceProprietesIntegrale extends Base {
  variante: "proprietes";
  /** Partie connue (tracée) de la courbe. */
  c: number;
  d: number;
  /** Côté de la partie inconnue : [lointaine ; c] à gauche, [d ; lointaine] à droite. */
  cote: "gauche" | "droite";
  /** Borne de l'intégrale donnée hors de la partie tracée. */
  lointaine: number;
  /** Intégrale (entière, non nulle) de f sur la partie inconnue — la valeur donnée en découle. */
  inconnue: number;
}

export type ExerciceIntegraleGraphique = ExerciceCalculIntegrale | ExerciceAireIntegrale | ExerciceProprietesIntegrale;
