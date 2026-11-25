import type { Droite, Point2 } from "./statistiqueLotH2";
import { moindresCarres, resume, sommeCarres } from "./statistiqueLotH2";

/**
 * Couche core — `5gen79` « Quel est le meilleur ajustement ? » (5e ch. 6, § 4, processus 3
 * TRANSFÉRER). Trois variantes :
 * - `deuxDroites` (exercice 10 du document) : deux élèves proposent chacun une droite (coefficients
 *   au dixième, données entières : écarts au dixième, carrés au centième) ; écart d'un point,
 *   S₁, S₂ (sommes des carrés des écarts verticaux), puis la meilleure. VERDICT (la première ou la
 *   seconde gagne) tiré à parts égales AVANT les nombres.
 * - `mayerMoindres` : six points, la droite de Mayer et celle des moindres carrés données SANS leur
 *   nom, dans un ordre tiré à parts égales (VERDICT : laquelle est celle des moindres carrés) ; G,
 *   S₁, S₂, verdict (« les deux passent par G » est un leurre). Coefficients exacts à deux décimales.
 * - `aberrant` (exercice 11 du document) : huit relevés réalistes, un point aberrant expliqué par le
 *   contexte (rang tiré uniformément) ; le repérer, r avec et sans lui, la droite sans lui, une
 *   prévision. Calculatrice indispensable.
 */

export type VarianteMeilleurAjustement = "deuxDroites" | "mayerMoindres" | "aberrant";

export interface ExerciceMeilleurAjustement {
  variante: VarianteMeilleurAjustement;
  /** Indice du contexte (textes de `ui5e/formatMeilleurAjustement.ts`). */
  contexte: number;
  points: Point2[];
  /** Les deux droites proposées (deuxDroites, mayerMoindres), dans l'ordre d₁, d₂. */
  droites: [Droite, Droite];
  /** Verdict : indice (0 ou 1) de la meilleure droite (deuxDroites) ou de celle des moindres carrés. */
  gagnante: 0 | 1;
  /** Point dont on demande l'écart (deuxDroites). */
  indiceEcart: number;
  /** aberrant : rang du point aberrant, candidats proposés (indices), abscisse de la prévision. */
  indiceAberrant: number;
  candidats: number[];
  x0: number;
  decY: number;
}

export const sommes = (e: ExerciceMeilleurAjustement): [number, number] => [sommeCarres(e.points, e.droites[0]), sommeCarres(e.points, e.droites[1])];
export const sansAberrant = (e: ExerciceMeilleurAjustement): Point2[] => e.points.filter((_, i) => i !== e.indiceAberrant);
export const resumeTous = (e: ExerciceMeilleurAjustement) => resume(e.points);
export const resumeSans = (e: ExerciceMeilleurAjustement) => resume(sansAberrant(e));
export const droiteSans = (e: ExerciceMeilleurAjustement): Droite => moindresCarres(sansAberrant(e));
export const previsionSans = (e: ExerciceMeilleurAjustement): number => {
  const d = droiteSans(e);
  return d.a * e.x0 + d.b;
};
