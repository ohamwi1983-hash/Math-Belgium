import type { Droite, Pt } from "../ui/geometrieLotG";

/** gen92 — « Tangente et position relative d'une droite et d'un cercle » (4e, ch. 7, § 8). */
export type VarianteDroiteCercle = "tangente-point" | "position-relative" | "cercle-tangent";

/** Verdict de la variante « position-relative » (tiré AVANT les nombres, à parts égales). */
export type PositionDroiteCercle = "exterieure" | "tangente" | "secante";

export interface ExerciceTangentePoint {
  variante: "tangente-point";
  centre: Pt;
  r2: number;
  /** Point de contact (sur le cercle). */
  p: Pt;
  /** Vecteur CP (entier). */
  cp: Pt;
  /** Ordre d'affichage des trois options de l'écran « rôle de CP » (indices dans OPTIONS_ROLE). */
  ordreRole: number[];
  tangente: Droite;
}

export interface ExercicePositionRelative {
  variante: "position-relative";
  centre: Pt;
  r2: number;
  d: Droite;
  /** Pied de la perpendiculaire à d menée par le centre. */
  h: Pt;
  dist2: number;
  position: PositionDroiteCercle;
}

export interface ExerciceCercleTangent {
  variante: "cercle-tangent";
  centre: Pt;
  d: Droite;
  h: Pt;
  /** r² = CH². */
  r2: number;
}

export type ExerciceDroiteCercle = ExerciceTangentePoint | ExercicePositionRelative | ExerciceCercleTangent;
