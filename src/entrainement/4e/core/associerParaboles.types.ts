/**
 * Couche core — « Associer paraboles et équations » (gen128, 4e, chapitre 1 « La fonction du second
 * degré », section `transformer`, processus 2 APPLIQUER). Quatre équations (forme canonique,
 * factorisée ou développée) et leurs quatre paraboles dans le désordre ; un écran par courbe (choix
 * fermé, UNE tentative). Lecture inverse de gen8 : les équations d'une variante ne diffèrent que par
 * le paramètre PIÈGE de la variante.
 *
 * - `signesSommet` : même a, sommets (±x_S ; ±y_S) — le signe dans la parenthèse et celui de y_S ;
 * - `coefficientA` : même sommet, a ∈ {m, −m, 1/m, −1/m} (m = 2 ou 3) — a et −a, a et 1/a ;
 * - `factorisee` : a(x − x₁)(x − x₂), zéros opposés et a opposé — signe des zéros, signe de a ;
 * - `troisEcritures` : une parabole en forme factorisée, sa symétrique par rapport à l'axe des y
 *   (canonique), sa retournée (développée) et sa translatée verticale (canonique).
 * Sommets, zéros et ordonnées à l'origine sont ENTIERS (sur les lignes du quadrillage, même échelle
 * en x et en y).
 */

export type VarianteAssocierParaboles = "signesSommet" | "coefficientA" | "factorisee" | "troisEcritures";

export type Ecriture = "canonique" | "factorisee" | "developpee";

export interface ParaboleDonnee {
  /** f(x) = a(x − h)² + k ; a peut valoir ±1/2 ou ±1/3 (variante `coefficientA`). */
  a: number;
  h: number;
  k: number;
  ecriture: Ecriture;
}

export interface ExerciceAssocierParaboles {
  variante: VarianteAssocierParaboles;
  /** Les quatre équations, dans l'ordre f, g, h, p. */
  paraboles: ParaboleDonnee[];
  /** ordre[n] = indice de l'équation tracée comme courbe n + 1. */
  ordre: number[];
}
