import type { Point3D, Solide3D } from "./geometrieEspace.types";

/**
 * Contrat de gen133 « Lire un solide en perspective : vocabulaire et positions » (4e, chapitre 8,
 * § 1 à § 4, processus 1 CONNAÎTRE). Écrans de pure lecture sur un solide en perspective cavalière.
 */

export type VarianteLectureSolide = "dessin" | "appartenance" | "positions";
export type GenreSolideLecture = "cube" | "pave" | "prisme" | "tetraedre";

export interface PointNommeLecture {
  nom: string;
  position: Point3D;
  /** Milieu de l'arête [a b]. */
  milieuDe: [string, string];
}

export interface FaceLue {
  /** Sommets dans l'ordre du contour. */
  sommets: string[];
  vraieGrandeur: boolean;
  /** Position dans le solide (« avant », « dessous »…), pour le corrigé. */
  role: string;
}

export interface AreteLue {
  sommets: [string, string];
  cachee: boolean;
}

export interface LongueurLue {
  arete: [string, string];
  fuyante: boolean;
  /** Longueur sur le dessin à l'échelle 1 (cm). */
  dessinee: number;
  vraie: number;
  /** Options du choix : une longueur (cm) ou `null` = « on ne peut pas la connaître ». */
  options: (number | null)[];
  bonne: number;
}

export interface PlanLu {
  noms: [string, string, string];
  type: "face" | "diagonal" | "milieu";
  /** Points proposés (tous les points nommés sauf les trois qui nomment le plan). */
  candidats: string[];
  /** Ceux qui appartiennent au plan. */
  dans: string[];
  /** Justification de chaque point du plan (dans l'ordre de `dans`). */
  raisons: Record<string, string>;
  /** Nom de la face si le plan en est une. */
  face: string | null;
}

export type PositionDeuxDroites = "secantes" | "paralleles" | "gauches";

export interface PaireLue {
  d1: [string, string];
  d2: [string, string];
  position: PositionDeuxDroites;
  /** Les deux droites se croisent sur le dessin (dans le cadre) alors qu'elles sont gauches. */
  croisementDessin: boolean;
  /** Justification (corrigé) : plan commun, droite témoin ou absence de plan commun. */
  raison: string;
}

export interface ExerciceLectureSolide {
  variante: VarianteLectureSolide;
  genre: GenreSolideLecture;
  solide: Solide3D;
  /** Dimensions réelles (cm) : largeur (x), profondeur (y), hauteur (z). */
  dims: { l: number; p: number; h: number };
  points: PointNommeLecture[];
  faces: FaceLue[];
  aretes: AreteLue[];
  longueur: LongueurLue;
  plans: PlanLu[];
  paires: PaireLue[];
}
