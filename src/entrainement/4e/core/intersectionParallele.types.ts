import type { Point3D, Solide3D } from "./geometrieEspace.types";

/**
 * Contrat de gen134 « Intersection de deux plans par parallélisme » (4e, chapitre 8, § 5 et § 8,
 * processus 2 APPLIQUER). Coordonnées internes jamais montrées.
 *
 * - `faces-paralleles` : un plan (PQR) coupe la face F0 suivant [PQ] (P, Q sur deux arêtes de F0) ;
 *   on construit son intersection avec la face opposée F1 par la parallèle à (PQ) menée par R
 *   (propriété 1 du § 5) ; elle rencontre une arête de F1 en S.
 * - `point-direction` : deux plans qui contiennent chacun une droite parallèle à `axe` ; un point
 *   commun K (rencontre de leurs traces dans F0), la direction (théorème du toit, § 8), puis la droite
 *   (KK′), K′ dans F1.
 */

export type VarianteIntersectionParallele = "faces-paralleles" | "point-direction";
export type AxeBoite = "x" | "y" | "z";

export interface PointNommeIntersection {
  nom: string;
  position: Point3D;
  /** Arête qui porte le point (« P est un point de [AB] ») ; `milieu` : c'en est le milieu. */
  arete: [string, string];
  milieu: boolean;
}

export interface DonneesFacesParalleles {
  /** Point de F1 qui n'est pas dans le plan (PQR) (leurre « dans la face, pas dans le plan »). */
  sommetLeurre: string;
  /** Point de F0 relié à R par la droite leurre (RQ) ou (RP). */
  pointLeurre: "P" | "Q";
  /** Arête de F1 non parallèle à (PQ) (leurre « parallèle à une arête »). */
  areteLeurre: [string, string];
  /** Point d'arrivée de la parallèle, sur l'arête `areteS` de F1. */
  S: Point3D;
  areteS: [string, string];
}

export interface DonneesPointDirection {
  /** Noms des deux plans (trois points chacun) et sommets de leurs sections (contour). */
  plans: [[string, string, string], [string, string, string]];
  sections: [string[], string[]];
  /** Traces dans F0 et dans F1, et un côté parallèle à `axe` de chaque section. */
  traces0: [[string, string], [string, string]];
  traces1: [[string, string], [string, string]];
  cotesAxe: [[string, string], [string, string]];
  K: Point3D;
  K2: Point3D;
  /** Arête du solide parallèle à `axe` (la direction attendue). */
  direction: [string, string];
  /** Arête d'une autre direction, dans aucun des deux plans (leurre). */
  directionLeurre: [string, string];
  /** Paire gauche qui se croise sur le dessin (leurre « croisement »), ou deux traces de faces opposées. */
  croisement: { d1: [string, string]; d2: [string, string]; dessin: boolean };
  /** Point qui nomme le premier plan sans être dans le second (leurre « un seul plan »). */
  pointSeul: string;
}

export interface ExerciceIntersectionParallele {
  variante: VarianteIntersectionParallele;
  genre: "cube" | "pave";
  solide: Solide3D;
  dims: { l: number; p: number; h: number };
  axe: AxeBoite;
  /** Face F0 (axe = 0) et face opposée F1, sommets dans l'ordre du contour. */
  face0: string[];
  face1: string[];
  points: PointNommeIntersection[];
  faces?: DonneesFacesParalleles;
  direction?: DonneesPointDirection;
  /** Ordres d'affichage des options des écrans 1 et 2 (tirés une fois : `?code=` reproductible). */
  ordre1: number[];
  ordre2: number[];
}
