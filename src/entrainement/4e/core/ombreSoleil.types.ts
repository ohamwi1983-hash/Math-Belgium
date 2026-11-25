import type { Point3D, Solide3D } from "./geometrieEspace.types";

/**
 * Contrat — "Ombre au soleil" (41e générateur, chapitre "Géométrie dans l'espace"). Projection
 * parallèle : une direction de lumière fixe (`direction`, JAMAIS montrée numériquement à l'élève)
 * projette le sommet d'un bâton vertical vers le sol (z=0) ou vers le PREMIER solide-obstacle
 * réellement rencontré le long du rayon — vérité terrain calculée une seule fois à la génération,
 * jamais recalculée différemment en cours d'exercice.
 *
 * **Modèle délibéré pour les variantes `simple`/`obstacle`** : l'objet dont on cherche l'ombre est
 * un bâton vertical isolé (jamais un sommet d'un solide gabarit du chapitre). Le croquis est
 * entièrement construit en `pointsExtra`/`segmentsExtra` de `Solide3DSketch` (sol, obstacles,
 * bâtons), le solide passé au composant ne servant qu'au cadrage (sommets virtuels, aucune face).
 *
 * **Variante `directionInconnue`** : projette réellement les sommets du campanile
 * (`generateurs/solide3D/gabarits.ts`), translaté horizontalement. La pyramide a été retirée
 * (audit du chapitre 8, décision H5a) : son unique sommet hors sol était déjà le sommet donné, il ne
 * restait rien à projeter.
 */

export type VarianteOmbreSoleil = "simple" | "obstacle" | "directionInconnue" | "solidePose";

export interface Piquet {
  id: string;
  base: Point3D; // toujours z=0
  hauteur: number; // sommet implicite = base + (0,0,hauteur)
}

/** Direction candidate pour les écrans "direction" — `id` interne, jamais montré tel quel à l'élève
 * (libellés "Candidat k" dérivés côté présentation, dans un ordre mélangé). */
export interface DirectionCandidate {
  id: string;
  vecteur: Point3D;
  /** Extrémité de l'aperçu tracé depuis le sommet concerné — longueur choisie pour que les 4
   * aperçus aient la même longueur À L'ÉCRAN (seul l'angle doit les départager). */
  extremiteApercu: Point3D;
}

/** Cadrage du croquis, figé à la génération pour rester identique d'un écran à l'autre : le
 * rectangle du sol dessiné, et tous les points 3D qui doivent tenir dans le cadre (sommets, ombres,
 * candidats, aperçus, obstacles). */
export interface CadrageScene {
  sol: [Point3D, Point3D, Point3D, Point3D];
  points: Point3D[];
}

/** Point candidat pour les écrans "point" — construit par la Couche A INDÉPENDAMMENT des directions
 * candidates (audit du chapitre 8, point 38 : les 4 points ne sont plus les 4 projections des 4
 * directions de l'écran précédent). Chaque distracteur incarne une erreur de construction précise
 * (`erreur`, jamais affichée à l'élève : sert aux corrections et aux contrôles). */
export type ErreurPointOmbre =
  | "aucune"
  | "traceTropCourte"
  | "traceTropLongue"
  | "surRayonSansTrace"
  | "sensOppose"
  | "composantesPermutees"
  | "traverseObstacle"
  | "obstacleSuivant"
  | "surObstacleSurvole"
  | "surObstacleMauvaiseFace"
  /** Variante `solidePose` : trace au sol partie du pied d'un AUTRE sommet (un autre coin de la base,
   * ou un coin au lieu du centre O de la base pour l'apex de la pyramide). */
  | "piedVoisin";

export interface PointCandidat {
  id: string;
  position: Point3D;
  erreur: ErreurPointOmbre;
}

/** Un bâton (ou un sommet du campanile) à projeter, avec sa vérité terrain et ses 4 points
 * candidats (le vrai compris). */
export interface PiquetAResoudre {
  piquet: Piquet;
  ombre: Point3D;
  pointsCandidats: PointCandidat[];
}

export interface ExerciceOmbreSoleilSimple {
  variante: "simple";
  direction: Point3D;
  piquetExemple: Piquet;
  ombreExemple: Point3D;
  piquet: PiquetAResoudre;
  cadrage: CadrageScene;
}

/** Boîte alignée sur les axes — brique de collision. Une caisse = 1 boîte ; l'escalier = 1 boîte
 * par colonne de marche (union de colonnes), ce qui prend en compte ses faces de profil (audit,
 * point 33), jamais réductibles à un rectangle unique. */
export interface Boite3D {
  min: Point3D;
  max: Point3D;
}

export type TypeObstacleOmbreSoleil = "caisse" | "escalier";

export interface ObstacleOmbreSoleil {
  type: TypeObstacleOmbreSoleil;
  /** Solide affiché (faces réelles, escalier compris). */
  solide: Solide3D;
  /** Géométrie de collision (union de boîtes). */
  boites: Boite3D[];
}

/**
 * Variante B — UNE seule question par scène (décision H4a) : où l'ombre du bâton s'arrête-t-elle
 * réellement ? Sur le PREMIER obstacle rencontré le long du rayon (t minimal), ou sur le sol si le
 * rayon passe à côté ou au-dessus de tous les obstacles (`indexObstacleTouche === null`, cas
 * désormais réellement tiré — audit, point 35).
 */
export interface ExerciceOmbreSoleilObstacle {
  variante: "obstacle";
  direction: Point3D;
  directionsCandidates: DirectionCandidate[];
  piquetExemple: Piquet;
  ombreExemple: Point3D;
  baton: Piquet;
  obstacles: ObstacleOmbreSoleil[];
  indexObstacleTouche: number | null;
  /** Point d'ombre final réel (sur l'obstacle touché, ou au sol). */
  ombre: Point3D;
  /** Où le rayon atteindrait le sol s'il n'y avait aucun obstacle. */
  ombreSansObstacle: Point3D;
  pointsCandidats: PointCandidat[];
  cadrage: CadrageScene;
}

/** Ombre d'un sommet du campanile que l'élève ne projette pas lui-même — montrée dans la
 * conclusion, "par le même procédé". */
export interface OmbreSommet {
  id: string;
  sommet: Point3D;
  ombre: Point3D;
}

export interface ExerciceOmbreSoleilDirectionInconnue {
  variante: "directionInconnue";
  direction: Point3D;
  directionsCandidates: DirectionCandidate[];
  /** Le campanile tiré, translaté horizontalement. */
  solide: Solide3D;
  /** Un sommet hors sol du campanile, donné avec son ombre. */
  piquetConnu: Piquet;
  ombreConnue: Point3D;
  /** Sommets hors sol que l'élève projette (1 à 3 écrans) — toujours des sommets dont l'ombre tombe
   * hors de l'emprise au sol du campanile (sinon elle serait cachée sous le bâtiment). */
  piquets: PiquetAResoudre[];
  /** Ombres des autres sommets hors sol, montrées dans la conclusion. */
  ombresAutres: OmbreSommet[];
  /** Contour de l'ombre portée au sol : enveloppe convexe de la base et des ombres des sommets
   * hors sol, dans l'ordre du tracé. */
  contourOmbre: Point3D[];
  cadrage: CadrageScene;
}

/** Forme du solide de la variante `solidePose` (le profil d'évaluation la lit comme `forme`). */
export type FormeSolidePose = "cube" | "pave" | "pyramide";

/** Segment candidat de l'écran « contour » : l'ombre d'une arête du solide (une arête de la base est
 * sa propre ombre). `extremites` : noms des deux points du sol (« A », « F′ »…). */
export interface SegmentContourOmbre {
  id: string;
  extremites: [string, string];
  /** Le segment est un côté du contour de l'ombre (enveloppe convexe). */
  surContour: boolean;
}

/**
 * Variante D — ombre d'un solide posé au sol (manuel, ex. 3 b 2ᵉ partie, 3 d, 3 e, 9) : un cube, un
 * pavé (caisse) ou une pyramide régulière à base carrée. Donnée : l'ombre d'UNE arête verticale du
 * cube / du pavé (son sommet du haut, son ombre), ou celle du sommet P d'un piquet vertical planté à un
 * coin de la base de la pyramide, de même hauteur qu'elle (ex. 9). L'élève projette les sommets du
 * haut (un écran « point » par élément de `piquets` ; le pied d'un sommet est le coin de la base juste
 * en dessous, ou le centre O de la base pour l'apex), puis choisit les côtés du contour parmi les
 * ombres de toutes les arêtes (sélection multiple, 3 tentatives).
 */
export interface ExerciceOmbreSoleilSolidePose {
  variante: "solidePose";
  forme: FormeSolidePose;
  direction: Point3D;
  /** Le solide réel, translaté (base ABCD au sol ; EFGH au-dessus de ABCD, ou apex S). */
  solide: Solide3D;
  /** Donnée : l'arête verticale connue (id = son sommet du haut) ou le piquet P de la pyramide. */
  piquetConnu: Piquet;
  /** Nom du pied du piquet connu (toujours un coin de la base). */
  piedConnu: string;
  ombreConnue: Point3D;
  /** Sommets du haut que l'élève projette (un écran chacun), avec leurs 4 points candidats. */
  piquets: PiquetAResoudre[];
  /** Nom du pied de chaque sommet projeté (« B » ; « O » pour l'apex de la pyramide). */
  piedsPiquets: string[];
  /** Ombres des autres sommets du haut (ni connu, ni projeté), construites « par le même procédé ». */
  ombresAutres: OmbreSommet[];
  /** Contour de l'ombre portée (enveloppe convexe de la base et des ombres), ordre du tracé. */
  contourOmbre: Point3D[];
  nomsContour: string[];
  /** Candidats de l'écran « contour » (ombres de TOUTES les arêtes), dans un ordre fixe. */
  segmentsCandidats: SegmentContourOmbre[];
  cadrage: CadrageScene;
}

export type ExerciceOmbreSoleil = ExerciceOmbreSoleilSimple | ExerciceOmbreSoleilObstacle | ExerciceOmbreSoleilDirectionInconnue | ExerciceOmbreSoleilSolidePose;

export type GenerateurExerciceOmbreSoleil = () => ExerciceOmbreSoleil;
