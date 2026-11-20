/**
 * Couche core — « Puissances à exposant réel : calculer et comparer sans calculatrice » (6gen146,
 * 6e ch. 2 « Fonctions exponentielles », § 1, processus 1 CONNAÎTRE). Décision de l'utilisateur :
 * puissances EXACTES uniquement, jamais de logarithme (le ch. 2 n'emploie ln qu'à la calculatrice).
 *
 * Trois variantes :
 * - `simplifier` : un produit, un quotient ou une puissance de puissances à exposants irrationnels
 *   (√k) écrit comme UNE puissance de a (règles (1), (2), (4) du cours, et base a² réécrite), puis sa
 *   valeur exacte ;
 * - `comparer` : a^u et a^v (même base, u irrationnel, v décimal, ou deux écritures d'un même nombre)
 *   rangés sans calculatrice — ordre des exposants, sens de variation de x ↦ aˣ, conclusion
 *   (trois choix fermés, une tentative chacun ; la conclusion <, =, > est tirée AVANT le reste) ;
 * - `inverse` : (1/a)^{…}, (0,5)ˣ, c^x avec c = a^j… écrits comme une puissance de a dont
 *   l'exposant est affine en x, puis la valeur en x₀.
 */

export type VariantePuissances = "simplifier" | "comparer" | "inverse";

/** Règle mise en jeu dans `simplifier` : produit (1), quotient (2), puissance de puissance (4),
 * base a² réécrite puis produit. */
export type SousTypeSimplifier = "produit" | "quotient" | "puissance" | "base";

export interface ExerciceSimplifier {
  variante: "simplifier";
  sousType: SousTypeSimplifier;
  a: number;
  /** Radicande des exposants irrationnels. */
  k: number;
  /** Coefficient de √k (produit, quotient, base) ou facteur m de (a^{√k})^{m√k} (puissance). */
  r: number;
  /** Parties entières des deux exposants (produit : p + r√k et s − r√k ; quotient : p + r√k et s + r√k ;
   * base : exposant de a égal à s − 2r√k). */
  p: number;
  s: number;
  /** Exposant final (entier). */
  n: number;
}

export type Relation = "<" | "=" | ">";

export interface BaseComparer {
  latex: string;
  valeur: number;
}

export interface ExposantComparer {
  latex: string;
  valeur: number;
  /** Écriture sans radical (carré) pour la justification, ex. « 2 » pour √2, « 1{,}96 » pour 1,4. */
  carreLatex: string | null;
}

export interface ExerciceComparer {
  variante: "comparer";
  base: BaseComparer;
  gauche: ExposantComparer;
  droite: ExposantComparer;
  /** Nature de la comparaison des exposants : carrés comparés, π ≈ 3,1416, ou deux écritures d'un
   * même nombre (√(m²k) = m√k). */
  genre: "carres" | "pi" | "egaux";
  /** Pour `egaux` : √(m²k) = m√k. */
  m?: number;
  k?: number;
  relationExposants: Relation;
  croissante: boolean;
  relation: Relation;
}

export type SousTypeInverse = "inverse" | "produit" | "quotient" | "decimale";

export interface ExerciceInverse {
  variante: "inverse";
  sousType: SousTypeInverse;
  a: number;
  /** Paramètres entiers (noms propres au sous-type, voir le générateur). */
  i: number;
  j: number;
  p: number;
  /** Exposant final m·x + c. */
  m: number;
  c: number;
  x0: number;
}

export type ExercicePuissances = ExerciceSimplifier | ExerciceComparer | ExerciceInverse;
