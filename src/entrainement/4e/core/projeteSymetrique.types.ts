import type { D, P } from "../ui/outilsAnalytiqueLotG";

/**
 * gen96 « Projeté orthogonal, symétrique et réflexion » (4e, ch. 7, § 6 « Distance »).
 * - `symetrique` : point A et droite d → perpendiculaire p à d par A, projeté H = p ∩ d, symétrique
 *   A′ (H milieu de [AA′]).
 * - `reflexion` : contexte (billard, miroir, ballon contre un mur) : A et B du même côté de d →
 *   symétrique A′ de A, droite (A′B), point d'impact I = (A′B) ∩ d, longueur du trajet AI + IB = A′B.
 * Tout est construit à rebours (H, A, A′, I, B entiers).
 */

export type VarianteProjeteSymetrique = "symetrique" | "reflexion";
export type ContexteReflexion = "billard" | "miroir" | "mur";

export interface ExerciceProjeteSymetrique {
  variante: VarianteProjeteSymetrique;
  contexte: ContexteReflexion | null;
  /** d : a·x + b·y + c = 0 (coefficients entiers premiers entre eux, a > 0). */
  d: D;
  /** Vecteur directeur de d, (−b ; a). */
  u: P;
  /** Vecteur normal de d, (a ; b) : directeur de la perpendiculaire. */
  nrm: P;
  A: P;
  /** A = H + k·nrm. */
  k: number;
  H: P;
  Ap: P;
  /** Réflexion seulement. */
  B: P | null;
  I: P | null;
}
