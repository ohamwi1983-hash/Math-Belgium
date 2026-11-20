/**
 * Couche core — « Trois écritures d'une parabole » (gen126, 4e, chapitre 1 « La fonction du second
 * degré », section `transformer`, processus 2 APPLIQUER). Une fonction du second degré
 * f(x) = a(x − x_S)² + y_S est donnée sous UNE de ses trois écritures (cours, § 2 : développée,
 * canonique, factorisée) ; l'élève passe aux autres, écran par écran.
 *
 * VARIANTE = écriture de départ :
 * - `depuisCanonique` : développer, chercher les zéros sur la forme canonique (isoler le carré),
 *   puis écrire la forme factorisée — ou conclure qu'il n'y en a pas (verdict tiré DANS la variante,
 *   un tiers des tirages : y_S et a de même signe) ;
 * - `depuisDeveloppee` (a ≠ 1) : mettre a en évidence, compléter le carré, lire le sommet ;
 * - `depuisFactorisee` : développer, sommet par le milieu des zéros, forme canonique.
 * Aucun « Δ » ni « discriminant » (chapitre 1) : les zéros viennent de la forme canonique ou de la
 * forme factorisée. Nombres entiers, x_S ≠ 0, y_S ≠ 0 (les trois écritures restent distinctes).
 */

export type VarianteTroisEcritures = "depuisCanonique" | "depuisDeveloppee" | "depuisFactorisee";

export interface ExerciceTroisEcritures {
  variante: VarianteTroisEcritures;
  /** Coefficient de x² (entier non nul ; ≠ 1 pour `depuisDeveloppee`). */
  a: number;
  /** Abscisse du sommet x_S (entier non nul). */
  h: number;
  /** Ordonnée du sommet y_S (entier non nul). */
  k: number;
  /** Demi-écart entre les zéros (zéros h − d et h + d), `null` si f n'a pas de zéro. */
  d: number | null;
}
