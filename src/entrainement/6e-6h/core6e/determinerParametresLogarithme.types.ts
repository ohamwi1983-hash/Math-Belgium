/**
 * Couche core (6e) — contrat pour `6gen18` ("Paramètres depuis des conditions graphiques",
 * chapitre 3 — "Fonctions logarithmes"). Refonte complète (audit chapitre 3 de 6e, décision K5) :
 * le générateur suit désormais la section 6 du cours et sa carte — f(x) = a + b·ln(x), dont les
 * paramètres se lisent sur un VRAI graphique (Mafs), jamais ln(mx+n)/ln(px²+qx+r) sans figure.
 *
 * Décomposition du raisonnement (même méthode que les autres générateurs) :
 * 1. reconnaître que f(1) = a (car ln(1) = 0) et lire a sur le graphique ;
 * 2. traduire la seconde information du graphique par une équation d'inconnue b — c'est là que
 *    se loge le piège du cours : un point en x = e donne f(e) = a + b (ln(e) = 1), pas a ;
 * 3. résoudre et écrire f(x).
 *
 * **Variantes** (la seconde information lue sur le graphique) :
 * - `pente` — la tangente en x = 1 est tracée : f'(1) = b (car f'(x) = b/x) ;
 * - `pointE` — un point de la courbe d'abscisse e est marqué : f(e) = a + b ;
 * - `pointE2` — un point de la courbe d'abscisse e² est marqué : f(e²) = a + 2b (prolongement du
 *   même piège : ln(e²) = 2).
 *
 * a et b sont ENTIERS (lecture sur un quadrillage d'unité 1), b ≠ 0. Les points marqués portent des
 * lettres (P, Q) tirées au hasard, jamais une lettre qui trahirait leur rôle.
 */

export type VarianteParametresLogarithme = "pente" | "pointE" | "pointE2";

export interface ExerciceDeterminerParametresLogarithme {
  variante: VarianteParametresLogarithme;
  a: number;
  b: number;
  /** Lettre du point d'abscisse 1 et lettre de la seconde marque (point en e ou e², ou point de
   * contact de la tangente pour `pente`, qui n'a alors qu'un seul point nommé). */
  lettrePoint1: "P" | "Q";
  lettrePoint2: "P" | "Q";
}

export type GenerateurExerciceDeterminerParametresLogarithme = () => ExerciceDeterminerParametresLogarithme;
