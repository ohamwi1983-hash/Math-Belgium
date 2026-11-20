import type { Q } from "../ui6e/nombresExp";

/**
 * Couche core — `6gen153` « Identités trig∘arc et arc∘trig » (6e ch. 1, § 2, processus 2
 * APPLIQUER). Trois variantes, deux écrans chacune :
 * - `arcTrig`  : arcf(f(θ)), θ = nπ/d remarquable — 1. θ est-il dans l'image de l'arcfonction ?
 *                (choix fermé, verdict tiré 50/50) ; 2. valeur exacte (θ ramené dans l'image) ;
 * - `trigArc`  : g(arcf(a)), a rationnel, g ≠ f — 1. signe du résultat (choix fermé, verdict
 *                positif / négatif tiré 50/50) ; 2. valeur exacte par l'identité (cos² + sin² = 1,
 *                1 + tan² = 1/cos²) ;
 * - `litteral` : g(arcf(kx)) — 1. domaine de l'expression (quatre intervalles) ; 2. expression
 *                simplifiée en x (√(1 − k²x²)…).
 */

export type VarianteIdentites = "arcTrig" | "trigArc" | "litteral";
export type Trig = "sin" | "cos" | "tan";

/** Couple « fonction extérieure ∘ arcfonction » des identités trig∘arc (fonctions différentes). */
export type CoupleIdentite = "cos_arcsin" | "sin_arccos" | "tan_arcsin" | "tan_arccos" | "sin_arctan" | "cos_arctan";

export interface ExerciceArcTrig {
  variante: "arcTrig";
  fn: Trig;
  /** θ = n·π/d (fraction réduite). */
  n: number;
  d: number;
}

export interface ExerciceTrigArc {
  variante: "trigArc";
  couple: CoupleIdentite;
  a: Q;
}

export interface ExerciceLitteral {
  variante: "litteral";
  couple: CoupleIdentite;
  k: number;
  /** Ordre d'affichage des quatre domaines (identifiants, voir le modèle). */
  options: string[];
}

export type ExerciceIdentites = ExerciceArcTrig | ExerciceTrigArc | ExerciceLitteral;
