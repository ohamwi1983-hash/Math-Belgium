/**
 * Couche core — « Équilibre de forces en composantes » (gen90, 4e, chapitre 6 « Calcul vectoriel »,
 * section « applications », processus 3 TRANSFÉRER). Complète gen29 (résultante par la loi des
 * cosinus) : ici tout se fait en COMPOSANTES, avec la condition d'équilibre
 * F₁ + F₂ + F₃ = 0, donc F₃ = −(F₁ + F₂).
 *
 * Toutes les composantes sont des multiples entiers d'une unité (`unite`, en N) : 10 N pour les
 * situations à composantes données, l'échelle du quadrillage (1 carreau = `unite` N) pour l'anneau.
 * Les vecteurs sont stockés en UNITÉS (entiers) ; `modeleEquilibreForces.ts` les convertit en N.
 */

/** Lustre suspendu (poids + deux câbles), tir à la corde à trois (vue du dessus), barque retenue
 * par deux amarres contre le courant (vue du dessus), anneau tiré par trois cordes (forces lues sur
 * un quadrillage). */
export type SituationEquilibre = "lustre" | "corde" | "barque" | "anneau";

/**
 * Nature de l'intensité de F₃ :
 * - `entier` : x² + y² est un carré parfait — valeur exacte entière ;
 * - `racine` : valeur exacte irrationnelle, demandée exacte (k√m) ;
 * - `arrondi` : valeur irrationnelle, demandée au dixième de newton (calculatrice) ;
 * - `axe` : F₃ horizontale ou verticale (une composante nulle) — l'intensité se lit directement :
 *   cas particulier des évaluations, jamais avec la question de direction.
 */
export type TypeIntensite = "entier" | "racine" | "arrondi" | "axe";

export interface Vecteur2 {
  x: number;
  y: number;
}

/** Les quatre égalités proposées à l'écran 1 (une seule est la condition d'équilibre). */
export type OptionCondition = "oppose" | "somme" | "difference12" | "difference21";

export interface ExerciceEquilibreForces {
  situation: SituationEquilibre;
  /** Valeur en N d'une unité de composante (10 N, ou l'échelle du quadrillage de l'anneau). */
  unite: number;
  /** F₁ et F₂ en unités (entiers) ; F₃ = −(F₁ + F₂) est calculée par le modèle. */
  f1: Vecteur2;
  f2: Vecteur2;
  intensite: TypeIntensite;
  /** Écran 5 présent : angle aigu entre F₃ et l'axe x (calculatrice, arc tangente). */
  direction: boolean;
  /** Ordre d'affichage des options de l'écran 1 (tiré à la génération : le QR code d'une feuille
   * rouvre exactement le même écran). */
  ordreConditions: OptionCondition[];
}
