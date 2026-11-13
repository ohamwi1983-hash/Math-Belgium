/**
 * Couche core — « Chantier et terrains : alignement, équerre, parallélisme, milieu » (gen88, 4e,
 * chapitre 6 « Calcul vectoriel », section « applications », processus 3 TRANSFÉRER).
 *
 * Un plan de terrain repéré en mètres ; une question posée avec les mots du chantier (« alignés »,
 * « d'équerre », « parallèles », « à mi-chemin », « parallélogramme »…). L'élève reconnaît l'outil
 * vectoriel caché derrière ces mots, calcule les vecteurs utiles, applique le critère du cours
 * (déterminant `x_u·y_v − y_u·x_v`, produit scalaire `x_u·x_v + y_u·y_v`, milieu, égalité de
 * vecteurs) puis répond dans le contexte.
 */

/** Situation = variante du catalogue. */
export type SituationChantier = "alignement" | "equerre" | "paralleles" | "milieu" | "enclos" | "piquet";

/** Outil vectoriel proposé à l'écran 1 (choix fermé). */
export type OutilVectoriel = "colinearite" | "orthogonalite" | "distance" | "milieu" | "egalite";

export interface PointPlan {
  nom: string;
  x: number;
  y: number;
}

/** Composante affine en l'inconnue du piquet (`coef·t + cst`) ; `coef = 0` pour un nombre. */
export interface Affine {
  coef: number;
  cst: number;
}

export interface ExerciceChantierTerrains {
  situation: SituationChantier;
  /** Indice du contexte (mots, objets dessinés) dans `CONTEXTES[situation]`. */
  contexte: number;
  /** Points DONNÉS par l'énoncé (A, B, C, éventuellement D), dans l'ordre. */
  points: PointPlan[];
  /** Alignement, équerre, parallélisme : la réponse oui/non (tirée à 50/50). `null` sinon. */
  verdict: boolean | null;
  /** Milieu, enclos, piquet : le point cherché (M ou L, D, P). */
  cherche: PointPlan | null;
  /** Piquet : la ligne imposée (points d'abscisse `valeur` si `axe = "x"`, d'ordonnée `valeur` si `"y"`). */
  ligne: { axe: "x" | "y"; valeur: number } | null;
  /** Alignement : C entre A et B (`"entre"`) ou au-delà (`"dehors"`) — ne trahit pas le verdict. */
  position: "entre" | "dehors" | null;
  /** Ordre d'affichage des options des choix fermés de l'exercice (conclusion, égalité). */
  ordreOptions: number[];
}
