import type { Rat } from "../ui6e/nombresExpoLotG";
import { rat, ratMul, ratPow, ratVal } from "../ui6e/nombresExpoLotG";

/**
 * Couche core — `6gen148` « Lire une courbe exponentielle y = k·aˣ + c » (6e ch. 2, § 1 et § 6,
 * processus 2 APPLIQUER ; lot G de l'audit). Pendant de 6gen85 (6e ch. 3) pour l'exponentielle.
 *
 * Décomposition du raisonnement (un écran par étape) :
 * 1. l'asymptote horizontale : aˣ → 0 d'un côté, donc f(x) → c : droite y = c (pointillés) ;
 * 2. k : a⁰ = 1, donc f(0) = k + c ; on lit f(0) sur l'axe des ordonnées et on retire c ;
 * 3. a : l'ÉCART à l'asymptote f(x) − c = k·aˣ est multiplié par a quand x augmente de 1 (le
 *    rapport ne dépend que de l'écart, cours § 7) — rapport des écarts, jamais des ordonnées ;
 * 4. l'expression : assemblage k·aˣ + c (k multiplie aˣ, il n'entre pas dans la base).
 *
 * Graphique à LIRE : k, c entiers, a ∈ {2, 3, 4, 1/2, 1/3, 1/4} ; les deux points marqués (abscisses 0
 * et 1, ou −1 et 0 selon la variante) ont des coordonnées ENTIÈRES (intersections du quadrillage d'une
 * unité) et l'asymptote est une ligne de la grille.
 */

/** `droite` : points d'abscisses 0 et 1 ; `gauche` : points d'abscisses −1 et 0. */
export type VarianteLireCourbeExpo = "droite" | "gauche";

export interface ExerciceLireCourbeExpo {
  variante: VarianteLireCourbeExpo;
  k: number;
  base: Rat;
  c: number;
  /** Abscisse du second point marqué (1 ou −1). */
  xAutre: 1 | -1;
  /** Lettres neutres : point d'abscisse 0, second point (tirées au hasard). */
  lettreZero: "P" | "Q";
  lettreAutre: "P" | "Q";
  cleCollecteur: string;
}

export const estCroissanteBase = (b: Rat): boolean => b.num > b.den;

/** f(x) exacte en un entier x (rationnel). */
export function valeurExacte(e: ExerciceLireCourbeExpo, x: number): Rat {
  const p = ratMul(rat(e.k), ratPow(e.base, x));
  return rat(p.num + e.c * p.den, p.den);
}

export function evaluer(e: ExerciceLireCourbeExpo, x: number): number {
  return e.k * Math.pow(ratVal(e.base), x) + e.c;
}

export const fZero = (e: ExerciceLireCourbeExpo): number => e.k + e.c;
export const fAutre = (e: ExerciceLireCourbeExpo): number => ratVal(valeurExacte(e, e.xAutre));
