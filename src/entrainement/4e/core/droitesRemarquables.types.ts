import type { Droite, Pt } from "../ui/geometrieLotG";

/** gen94 — « Droites remarquables d'un triangle » (4e, ch. 7, § 6). */
export type VarianteDroitesRemarquables = "mediatrices" | "hauteurs" | "medianes" | "aire";

export interface ExerciceDroitesRemarquables {
  variante: VarianteDroitesRemarquables;
  a: Pt;
  b: Pt;
  c: Pt;
  /** Droites demandées par les champs : m1, m2 (médiatrices de [AB], [BC]) ; h1, h2 (hauteurs issues
   * de A, B) ; md1, md2 (médianes issues de A, B) ; BCd (droite (BC), variante « aire »). */
  droites: Record<string, Droite>;
  /** Points demandés : O (centre du cercle circonscrit), H (orthocentre, ou pied de la hauteur issue
   * de A pour « aire »), G (centre de gravité). */
  points: Record<string, Pt>;
  /** Carrés des longueurs demandées (BC, AH). */
  longueurs: Record<string, number>;
  /** Aire (variante « aire »). */
  aire?: number;
}
