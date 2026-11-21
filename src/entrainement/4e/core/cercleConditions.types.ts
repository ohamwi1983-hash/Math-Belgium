import type { Droite, Pt } from "../ui/geometrieLotG";

/** gen93 — « Déterminer un cercle par des conditions » (4e, ch. 7, § 8). */
export type VarianteCercleConditions = "diametre" | "trois-points" | "centre-sur-droite";

export interface ExerciceCercleConditions {
  variante: VarianteCercleConditions;
  a: Pt;
  b: Pt;
  /** Troisième point (trois-points). */
  c?: Pt;
  /** Droite qui porte le centre (centre-sur-droite). */
  d?: Droite;
  /** Centre Ω et carré du rayon. */
  centre: Pt;
  r2: number;
  /** Médiatrices demandées (m1 = [AB], m2 = [BC]) — mêmes clés que les champs. */
  droites: Record<string, Droite>;
  /** Points demandés par les champs (O = le centre Ω). */
  points: Record<string, Pt>;
  /** Carrés des longueurs demandées (r). */
  longueurs: Record<string, number>;
}
