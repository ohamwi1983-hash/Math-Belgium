/**
 * Couche core — « Nature d'un quadrilatère » (gen84, 4e, chapitre 6 « Calcul vectoriel », section
 * `orthogonalite`, processus 2 APPLIQUER). Synthèse des sections norme (gen26), relation (gen20/21)
 * et orthogonalité (gen25) : quatre points en repère orthonormé, coordonnées entières.
 *
 * Démarche, toujours en 4 écrans quelle que soit la nature (la barre de progression ne trahit pas
 * l'issue) :
 * 1. parallélogramme ? composantes de AB et de DC (variante « quatrième sommet » : AB puis D) ;
 * 2. losange ? composantes de BC, normes de AB et de BC (deux côtés CONSÉCUTIFS) ;
 * 3. rectangle ? critère d'orthogonalité de AB et BC ;
 * 4. conclusion : choix fermé parmi les 5 natures.
 * Les écrans 2 et 3 se font même si ABCD n'est pas un parallélogramme : leurs résultats deviennent
 * alors des pièges (angle droit en B, côtés consécutifs égaux… sans parallélogramme, ce n'est ni un
 * rectangle ni un losange), et c'est l'écran 4 qui demande de les combiner correctement.
 */
import type { Point } from "./vecteur.types";

export type NatureQuadrilatere = "quelconque" | "parallelogramme" | "losange" | "rectangle" | "carre";

/** nature : 4 points donnés ; quatrieme : A, B, C donnés, trouver D (ABCD parallélogramme) ;
 * montrer : « Montre que ABCD est un rectangle / un losange », puis est-ce même un carré ? */
export type VarianteNatureQuadrilatere = "nature" | "quatrieme" | "montrer";

export type AffirmationQuadrilatere = "rectangle" | "losange";

export interface ExerciceNatureQuadrilatere {
  variante: VarianteNatureQuadrilatere;
  A: Point;
  B: Point;
  C: Point;
  D: Point;
  /** Variante « montrer » seulement (toujours vraie) ; `null` sinon. */
  affirmation: AffirmationQuadrilatere | null;
}
