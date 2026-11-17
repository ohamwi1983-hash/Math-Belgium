import type { Point3D, Solide3D } from "./geometrieEspace.types";

/**
 * Contrat de gen100 — « Positions de deux droites et plan déterminé » (4e, chapitre 8 « Géométrie
 * dans l'espace », section « deux-droites »). Deux familles (variantes) sur un solide dessiné en
 * perspective cavalière, SANS coordonnées (les coordonnées 3D restent internes) :
 * - `positions` : deux droites désignées par leurs points. a) plan commun (choix fermé), b) position
 *   (sécantes / parallèles / gauches), c) justification (point commun, plan commun + direction, ou
 *   point de percée qui prouve l'absence de plan commun) ;
 * - `plan` : trois points, une droite et un point, ou deux droites. a) déterminent-elles un plan, et
 *   un seul ? b) si oui, le nommer (saisie libre, tout triplet valable accepté) ; sinon, la raison.
 *
 * Tout ce que l'élève doit DÉCIDER (position, oui/non, raison) est tiré AVANT le reste, à parts
 * égales, et n'entre jamais dans `forme` (profil des évaluations).
 */

export type VarianteDeuxDroitesPlan = "positions" | "plan";
export type PositionDeuxDroites = "secantes" | "paralleles" | "gauches";
export type TypeDonneesPlan = "troisPoints" | "droitePoint" | "deuxDroites";

/** Point nommé qui n'est pas un sommet (milieu d'une arête, centre d'une face) — dessiné et défini
 * dans l'énoncé (« I est le milieu de [AB] »). */
export interface PointNommeEspace {
  nom: string;
  position: Point3D;
  /** « le milieu de [AB] », « le centre de la face ABCD ». */
  definition: string;
}

export type DroiteNommee = [string, string];
export type NomPlan = [string, string, string];

export type OptionPlanCommun = { type: "plan"; nom: NomPlan } | { type: "aucun" };

/** Où se trouve le point commun de deux droites sécantes (corrigé, aides). */
export type LieuPointCommun =
  | { type: "nomme"; nom: string }
  | { type: "arete"; arete: [string, string] }
  | { type: "face"; face: string[]; centre: boolean }
  | { type: "interieur"; centre: boolean }
  | { type: "hors" };

export type OptionPointCommun = { type: "point"; nom: string } | { type: "surSolide" } | { type: "hors" };

export interface JustificationSecantes {
  type: "secantes";
  position: Point3D;
  lieu: LieuPointCommun;
  options: OptionPointCommun[];
  bonne: number;
}

export interface JustificationParalleles {
  type: "paralleles";
  /** Droites du solide (deux sommets) proposées ; une seule est parallèle aux deux droites. */
  options: DroiteNommee[];
  bonne: number;
}

export interface JustificationGauches {
  type: "gauches";
  /** Plan (Q) qui contient la droite `contenue` et un seul point de l'autre. */
  plan: NomPlan;
  contenue: 1 | 2;
  /** Point de l'autre droite situé dans (Q) : la droite perce (Q) en ce point. */
  point: string;
  options: string[];
  bonne: number;
}

export type JustificationDeuxDroites = JustificationSecantes | JustificationParalleles | JustificationGauches;

export interface ExerciceDeuxDroites {
  variante: "positions";
  solide: Solide3D;
  pointsNommes: PointNommeEspace[];
  d1: DroiteNommee;
  d2: DroiteNommee;
  position: PositionDeuxDroites;
  /** Les deux droites se croisent sur le DESSIN (projections), qu'elles soient sécantes ou non. */
  croisementApparent: boolean;
  /** Plan commun (sécantes, parallèles), sous le nom employé dans les options ; `null` si gauches. */
  planCommun: NomPlan | null;
  optionsPlan: OptionPlanCommun[];
  bonPlan: number;
  /** Ordre (mélangé) des trois positions proposées à l'écran b. */
  ordrePositions: PositionDeuxDroites[];
  justification: JustificationDeuxDroites;
}

/** Ce qu'il faut pour rédiger la justification de la position de deux droites. */
export type DeuxDroitesJustifiees = Pick<ExerciceDeuxDroites, "d1" | "d2" | "planCommun" | "justification">;

export type IdRaisonPlan = "vraie" | "consequence" | "regle";

export interface ExercicePlanDetermine {
  variante: "plan";
  type: TypeDonneesPlan;
  solide: Solide3D;
  pointsNommes: PointNommeEspace[];
  /** troisPoints : [P, Q, R] ; droitePoint : [P, Q, R] = droite (PQ) et point R ; deuxDroites :
   * [P, Q, R, S] = droites (PQ) et (RS). */
  points: string[];
  determine: boolean;
  /** deuxDroites seulement. */
  positionDroites: PositionDeuxDroites | null;
  /** Points nommés (sommets et points définis) du plan déterminé ; vide sinon. */
  pointsDuPlan: string[];
  /** Un nom valable du plan (corrigé) ; `null` si les données ne déterminent pas un plan. */
  nomPlan: NomPlan | null;
  /** deuxDroites seulement : la preuve de la position (point commun, droite parallèle aux deux, ou
   * point de percée qui prouve l'absence de plan commun) — corrigé. */
  justificationDroites: JustificationDeuxDroites | null;
  /** Ordre (mélangé) des deux réponses de l'écran a (`true` = « oui, un seul plan »). */
  ordreVerdict: boolean[];
  /** Raisons proposées si les données ne déterminent pas un plan (ordre mélangé). */
  optionsRaison: IdRaisonPlan[];
  bonneRaison: number;
}

export type ExerciceDeuxDroitesPlan = ExerciceDeuxDroites | ExercicePlanDetermine;
