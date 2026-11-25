import type { Point2, Resume2 } from "./statistiqueLotH2";

/**
 * Couche core — `5gen78` « Modéliser et prévoir en contexte » (5e ch. 6, § 6, processus 3 TRANSFÉRER,
 * calculatrice indispensable). Une série réaliste (contextes du document du professeur, nombres
 * nouveaux) : à la TI-30XB (« 2-Var Stats »), la droite des moindres carrés (a, b arrondis), r, la
 * fiabilité du modèle (|r| ≥ 0,80 : corrélation forte ou très forte), une prévision et sa nature
 * (interpolation ou extrapolation), puis un seuil (« quand atteindra-t-on 5 % ? »).
 *
 * VERDICTS tirés à parts égales AVANT les nombres : `fiable` (|r| dans [0,86 ; 0,995] contre
 * [0,45 ; 0,74], loin du seuil 0,80) et `interpolation` (x₀ strictement dans l'intervalle des
 * données, différent des valeurs du tableau, contre x₀ à l'extérieur). Jamais dans `forme`.
 */

export type ContexteModeliser = "dilatation" | "grue" | "defectueuses" | "ventes" | "population" | "consommation";

export interface ExerciceModeliserPrevoir {
  variante: ContexteModeliser;
  /** Verdicts tirés en premier. */
  fiable: boolean;
  interpolation: boolean;
  points: Point2[];
  /** Décimales des y du tableau. */
  decY: number;
  /** Précisions demandées : a, b, r (3), prévision, seuil. */
  da: number;
  db: number;
  dp: number;
  ds: number;
  /** Abscisse de la prévision. */
  x0: number;
  /** Seuil (dans l'unité de y) et, pour la dilatation, longueur de la barre (m). */
  seuil: number;
  longueurSeuil?: number;
  /** Année de départ (population : x = années depuis `annee0`). */
  annee0?: number;
  stats: Resume2;
}

/** Valeur de la prévision et du seuil avec les valeurs NON arrondies de a et b. */
export const prevision = (e: ExerciceModeliserPrevoir): number => e.stats.a * e.x0 + e.stats.b;
export const abscisseSeuil = (e: ExerciceModeliserPrevoir): number => (e.seuil - e.stats.b) / e.stats.a;
export const xMin = (e: ExerciceModeliserPrevoir): number => Math.min(...e.points.map((p) => p.x));
export const xMax = (e: ExerciceModeliserPrevoir): number => Math.max(...e.points.map((p) => p.x));
