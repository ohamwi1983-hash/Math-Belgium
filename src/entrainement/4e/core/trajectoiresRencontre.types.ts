import type { P } from "../ui/outilsAnalytiqueLotG";

/**
 * gen97 « Trajectoires et rencontre » (4e, ch. 7, § 5 « Intersection »). Deux mobiles de positions
 * M₁(t) = P₁ + t·v₁ et M₂(t) = P₂ + t·v₂ (t en heures ou en secondes). Verdict (tiré AVANT la
 * construction, 1/3 chacun) : collision (même point au même instant), croisement sans rencontre
 * (les trajectoires se coupent en K, mais à des instants t₁ ≠ t₂), trajectoires parallèles.
 */

export type VerdictTrajectoires = "collision" | "croisement" | "paralleles";
export type ContexteTrajectoires = "bateaux" | "drones" | "joueurs";

export interface ExerciceTrajectoires {
  contexte: ContexteTrajectoires;
  verdict: VerdictTrajectoires;
  P1: P;
  v1: P;
  P2: P;
  v2: P;
  /** Point commun des trajectoires et instants de passage (null si parallèles). */
  K: P | null;
  t1: number | null;
  t2: number | null;
}
