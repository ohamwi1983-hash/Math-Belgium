import type { Point3D } from "./geometrieEspace.types";
import type { CadrageScene, ObstacleOmbreSoleil, Piquet } from "./ombreSoleil.types";

/**
 * Contrat — gen106 « Ombre à la lampe : projection centrale » (4e, chapitre 8 « Géométrie dans
 * l'espace », section `ombre`, prolongement de gen41). La source de lumière est PONCTUELLE : une
 * lampe L posée au sommet d'un lampadaire vertical dont le pied est L₀ (le point du sol à la
 * verticale de L). Tous les rayons partent de L ; la trace au sol du rayon qui passe par le sommet
 * d'un objet vertical passe par L₀ et par le pied de l'objet. Aucune coordonnée n'est jamais montrée.
 *
 * Chaque exercice a DEUX écrans de choix fermé (UNE tentative chacun) puis une conclusion :
 * - `poteau` : la demi-droite du sol qui porte l'ombre du poteau A, puis l'ombre A′ de son sommet
 *   (un poteau E et son ombre sont donnés : ils servent de leurre « rayons parallèles ») ;
 * - `cube` : les ombres de deux sommets du haut d'un cube ou d'un pavé (puis le contour, montré) ;
 * - `mur` : le point M où l'ombre au sol atteint le pied d'un mur, puis l'ombre A′ du sommet sur le mur ;
 * - `lampe` : retrouver le pied L₀ de la lampe à partir des ombres de deux poteaux, puis la lampe L.
 */

export type VarianteOmbreLampe = "poteau" | "cube" | "mur" | "lampe";

/** Erreur de construction incarnée par un candidat (jamais affichée telle quelle : sert aux
 * explications après un échec, aux mesures et aux contrôles). `aucune` = la bonne réponse. */
export type ErreurOmbreLampe =
  | "aucune"
  // demi-droite du sol (écran 1 de `poteau`)
  | "paralleleExemple"
  | "versLampe"
  | "depuisLampe"
  | "depuisPiedExemple"
  | "versAutrePoteau"
  | "verticaleDessin"
  // points au sol
  | "traceTropCourte"
  | "traceTropLongue"
  | "surRayonSansTrace"
  | "rayonParallele"
  | "mauvaisPied"
  | "ombreCoteLampe"
  // pied du mur (écran 1 de `mur`)
  | "perpendiculaire"
  | "traceParSommet"
  | "depuisLampeMur"
  | "coteOppose"
  | "rayonAuPiedMur"
  | "traceTropOblique"
  // ombre sur le mur (écran 2 de `mur`)
  | "tropBas"
  | "tropHaut"
  | "hauteurPoteau"
  | "surRayonHorsVerticale"
  | "derriereMemeHauteur"
  // retrouver la lampe
  | "imageLampe"
  | "surUneTraceSeulement"
  | "rayonPourTrace"
  | "ombresEchangees"
  | "verticaleTropBas"
  | "verticaleTropHaut"
  | "surUnRayonSeulement";

export interface CandidatLampe {
  id: string;
  /** Point candidat — ou, pour un écran `direction`, l'extrémité de la demi-droite dessinée. */
  position: Point3D;
  erreur: ErreurOmbreLampe;
}

export interface EcranChoixLampe {
  type: "point" | "direction";
  /** Écran `direction` : origine commune des demi-droites candidates (le pied du poteau). */
  origine?: Point3D;
  candidats: CandidatLampe[];
}

export interface Mur {
  /** Le mur est vertical, dans le plan y = `y` (face au spectateur), pour x de `xMin` à `xMax`. */
  y: number;
  xMin: number;
  xMax: number;
  hauteur: number;
}

/** Sommet du haut d'une boîte projeté par l'élève (ou montré dans la conclusion). */
export interface SommetBoite {
  id: string;
  sommet: Point3D;
  /** Nom du sommet du bas situé juste en dessous (son pied). */
  idPied: string;
  ombre: Point3D;
}

interface Commun {
  /** La lampe (sommet du lampadaire). */
  lampe: Point3D;
  /** Pied de la lampe (z = 0), à la verticale de `lampe`. */
  piedLampe: Point3D;
  ecrans: [EcranChoixLampe, EcranChoixLampe];
  cadrage: CadrageScene;
}

export interface ExerciceOmbreLampePoteau extends Commun {
  variante: "poteau";
  exemple: Piquet;
  ombreExemple: Point3D;
  poteau: Piquet;
  ombre: Point3D;
}

export interface ExerciceOmbreLampeCube extends Commun {
  variante: "cube";
  boite: ObstacleOmbreSoleil;
  /** `true` si les trois dimensions sont égales (« cube »), sinon « pavé ». */
  estCube: boolean;
  /** Les deux sommets que l'élève projette (un écran chacun), dans l'ordre. */
  projetes: [SommetBoite, SommetBoite];
  /** Ombres des deux autres sommets du haut, montrées dans la conclusion. */
  autres: SommetBoite[];
  /** Contour de l'ombre portée (enveloppe convexe de la base et des ombres), dans l'ordre. */
  contour: Point3D[];
}

export interface ExerciceOmbreLampeMur extends Commun {
  variante: "mur";
  poteau: Piquet;
  mur: Mur;
  /** Point où l'ombre au sol atteint le pied du mur. */
  piedMur: Point3D;
  /** Ombre du sommet du poteau, sur le mur (à la verticale de `piedMur`). */
  ombre: Point3D;
}

export interface ExerciceOmbreLampeLampe extends Commun {
  variante: "lampe";
  poteaux: [Piquet, Piquet];
  ombres: [Point3D, Point3D];
}

export type ExerciceOmbreLampe = ExerciceOmbreLampePoteau | ExerciceOmbreLampeCube | ExerciceOmbreLampeMur | ExerciceOmbreLampeLampe;
