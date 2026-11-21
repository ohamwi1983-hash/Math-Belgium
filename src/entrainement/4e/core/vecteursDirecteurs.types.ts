/**
 * Couche core — « Vecteurs directeurs d'une droite » (gen129, 4e, chapitre 6 « Calcul vectoriel »,
 * § 15, processus 1 CONNAÎTRE).
 *
 * Trois écrans : (a) la droite d est tracée sur un quadrillage, l'élève écrit un vecteur directeur
 * (tout multiple non nul est accepté) ; (b) parmi cinq vecteurs, il coche tous les vecteurs
 * directeurs de d (choix multiple, une tentative) ; (c) depuis l'équation d'une AUTRE droite g, il
 * écrit un vecteur directeur de g.
 */

export type VarianteVecteursDirecteurs = "deux-points" | "horizontale-verticale" | "parallele";

export interface Pt {
  x: number;
  y: number;
}

/** Nature d'un vecteur proposé à l'écran (b) — les quatre premières sont des vecteurs directeurs. */
export type NatureOption = "oppose" | "multiple" | "reduit" | "fraction" | "echangees" | "normal" | "signe" | "decale";

export interface OptionVecteur {
  v: Pt;
  nature: NatureOption;
  juste: boolean;
}

/** Droite g de l'écran (c) : y = (num/den)·x + p, ou y = k (horizontale), ou x = k (verticale). */
export type EquationG = { type: "affine"; num: number; den: number; p: number } | { type: "horizontale"; k: number } | { type: "verticale"; k: number };

export interface ExerciceVecteursDirecteurs {
  variante: VarianteVecteursDirecteurs;
  /** Deux points du quadrillage qui donnent la direction : A, B sur d (deux-points,
   * horizontale-verticale) ou E, F sur la droite parallèle (EF) (parallele). */
  P1: Pt;
  P2: Pt;
  /** Noms de ces deux points (« A », « B » ou « E », « F »). */
  noms: [string, string];
  /** Point C de d (parallele seulement) : d passe par C et est parallèle à (EF). */
  C: Pt | null;
  /** Composantes de P1P2 : un vecteur directeur de d. */
  u: Pt;
  /** Les cinq vecteurs de l'écran (b), dans l'ordre affiché (u₁ … u₅). */
  options: OptionVecteur[];
  /** Droite g de l'écran (c). */
  g: EquationG;
}
