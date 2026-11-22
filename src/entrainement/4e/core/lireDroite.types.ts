/**
 * Couche core — « Lire une droite : associer droites et équations » (gen132, 4e, chapitre 7
 * « Géométrie analytique plane », § 1 à § 3, processus 1 CONNAÎTRE).
 *
 * Six écrans de lecture : (a)–(d) quatre droites tracées sur un quadrillage et quatre équations de
 * formes variées (implicite, explicite en y, explicite en x, paramétrique) — associer chaque droite à
 * son équation ; (e) lire la pente m et l'ordonnée à l'origine p d'une droite d « en escalier » ;
 * (f) quelle écriture est impossible pour une droite g horizontale ou verticale.
 */

export type VarianteLireDroite = "entiere" | "fractionnaire" | "axe";

export type FormeEquation = "implicite" | "explicite-y" | "explicite-x" | "parametrique";

export interface Pt {
  x: number;
  y: number;
}

/** Droite tracée : pente num/den (den > 0, irréductible) et ordonnée à l'origine p ; ou y = k ; ou x = k. */
export type DroiteTracee = { type: "oblique"; num: number; den: number; p: number } | { type: "horizontale"; k: number } | { type: "verticale"; k: number };

/** Rôle d'une droite dans la famille de l'écran d'association (pour le corrigé et les explications). */
export type RoleDroite = "base" | "pente-opposee" | "p-oppose" | "composantes-echangees" | "horizontale" | "verticale";

export interface EquationDonnee {
  droite: DroiteTracee;
  role: RoleDroite;
  forme: FormeEquation;
  /** Paramétrique : point de départ (t = 0) et vecteur directeur. */
  P0: Pt;
  dir: Pt;
}

export interface ExerciceLireDroite {
  variante: VarianteLireDroite;
  /** Les quatre équations, dans l'ordre des noms A, B, C, D. */
  equations: EquationDonnee[];
  /** `ordre[n]` = indice de l'équation de la droite tracée n° n + 1. */
  ordre: number[];
  /** Droite d de l'écran (e) : pente num/den et ordonnée à l'origine p. */
  lecture: { num: number; den: number; p: number };
  /** Droite g de l'écran (f). */
  impossible: { type: "horizontale" | "verticale"; k: number };
  /** Ordre d'affichage des cinq options de l'écran (f) (indices dans `OPTIONS_FORMES`). */
  ordreFormes: number[];
}
