import type { Droite, Pt } from "../ui/geometrieLotG";

/** gen95 — « Droites dépendant d'un paramètre » (4e, ch. 7, § 4). */
export type TypeQuestionParametre = "parallele" | "perpendiculaire" | "point" | "horizontale" | "verticale";

/** Polynôme en m, coefficients décroissants [c₂, c₁, c₀] (degré ≤ 2). */
export type PolyM = [number, number, number];

export interface ExerciceDroitesParametre {
  variante: TypeQuestionParametre;
  /** dₘ ≡ A(m)·x + B(m)·y + C(m) = 0. */
  A: PolyM;
  B: PolyM;
  C: PolyM;
  /** Droite de référence (parallèle, perpendiculaire). */
  d?: Droite;
  /** Point imposé (point). */
  p?: Pt;
  /** Condition Q(m) = 0 (critère, produit scalaire, coordonnées de P, coefficient). */
  q: PolyM;
  /** Degré de Q (1 ou 2). */
  degre: 1 | 2;
  /** Racines réelles de Q (triées), puis celles qui annulent A et B (à rejeter). */
  racines: number[];
  rejetees: number[];
  /** Valeurs de m retenues (le VERDICT : 0, 1 ou 2 valeurs). */
  valeurs: number[];
  /** Saisie juste de l'équation en m (parcours de test). */
  equationM: string;
}
