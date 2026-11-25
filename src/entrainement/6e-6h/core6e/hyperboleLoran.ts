import type { Pt } from "../ui6e/outilsConiquesLotH2";

/**
 * Couche core — `6gen142` « Hyperbole de navigation : LORAN » (6e ch. 10, § 6, processus 3 TRANSFÉRER).
 * Deux émetteurs A(−c ; 0) et B(c ; 0) émettent au même instant (simplification) ; un navire reçoit le
 * signal de l'un Δt microsecondes avant celui de l'autre : |PA − PB| = v·Δt = 2a (v = 0,3 km/µs). Le navire
 * est sur la BRANCHE de l'hyperbole de foyers A et B située du côté de l'émetteur reçu en premier (verdict
 * tiré à parts égales AVANT les nombres). Quatre écrans : la différence de distances, la branche (choix
 * fermé), l'équation de l'hyperbole, la ou les positions du navire sur sa route :
 * - `parallele` : route y = h, parallèle à (AB) : deux points de l'hyperbole, un seul sur la bonne branche ;
 * - `perpendiculaire` : route x = k, du côté de la branche : deux points de la MÊME branche, deux positions
 *   possibles (l'ambiguïté du LORAN, levée par une seconde paire d'émetteurs).
 */

export type VarianteLO = "parallele" | "perpendiculaire";
export type PhaseLO = "difference" | "branche" | "equation" | "position";
export type BrancheLO = "A" | "B" | "deux";
export const PHASES_LO: PhaseLO[] = ["difference", "branche", "equation", "position"];

export interface ExerciceLO {
  variante: VarianteLO;
  a: number;
  b: number;
  c: number;
  /** Émetteur dont le signal arrive en premier (le navire en est plus proche). */
  premier: "A" | "B";
  /** Route : y = h (parallèle) ou x = k (perpendiculaire). */
  route: number;
}

/** Vitesse des ondes radio : 300 000 km/s = 0,3 km par microseconde. */
export const VITESSE_KM_US = 0.3;
export const deltaT = (e: ExerciceLO): number => Math.round((2 * e.a) / VITESSE_KM_US);
export const signeBranche = (e: ExerciceLO): number => (e.premier === "B" ? 1 : -1);

/** Points de l'hyperbole complète sur la route. */
export function intersectionsRoute(e: ExerciceLO): Pt[] {
  if (e.variante === "parallele") {
    const x0 = e.a * Math.sqrt(1 + (e.route * e.route) / (e.b * e.b));
    return [{ x: -x0, y: e.route }, { x: x0, y: e.route }];
  }
  const y0 = e.b * Math.sqrt((e.route * e.route) / (e.a * e.a) - 1);
  return [{ x: e.route, y: -y0 }, { x: e.route, y: y0 }];
}

/** Positions possibles du navire (points de la bonne branche). */
export function positions(e: ExerciceLO): Pt[] {
  const s = signeBranche(e);
  return intersectionsRoute(e).filter((p) => p.x * s > 0);
}
