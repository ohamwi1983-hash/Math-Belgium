import type { D, Poly, Pt } from "../ui6e/outilsLieuxLotH2";
import { intersection, normaliserDroite, normaliserPoly, polyDiametre } from "../ui6e/outilsLieuxLotH2";

/**
 * Couche core — `6gen130` « Lieux en contexte : un point qui bouge » (6e ch. 9, § 5, processus 3
 * TRANSFÉRER). Un point bouge dans une situation concrète ; le CONTEXTE impose la restriction du lieu.
 * Quatre écrans pour toutes les situations : le point mobile en fonction du paramètre (coordonnées, ou
 * équation de la seconde génératrice), l'équation cartésienne du lieu complet (élimination du
 * paramètre), la nature de la partie réellement décrite (choix fermé, cinq options communes) et ses
 * extrémités (ou le point exclu).
 *
 * Situations (variantes) :
 * - `echelle` : une échelle de longueur L glisse entre le sol et le mur ; son milieu décrit le QUART de
 *   cercle x² + y² = L²/4, x ≥ 0, y ≥ 0 (extrémités comprises : échelle verticale, puis au sol) ;
 * - `radars` : deux radars A(−d ; 0), B(d ; 0) ; les faisceaux tournent au même rythme (angle constant
 *   φ = 90°, 45° ou 135° entre eux) au-dessus de la côte : le croisement décrit l'ARC CAPABLE au-dessus
 *   de (AB), privé de A et de B ;
 * - `gravite` : triangle ABC, C sur un rail (segment, t ∈ [0 ; 1]) ou sur toute une droite d qui coupe
 *   (AB) en K : le centre de gravité décrit un SEGMENT, ou une DROITE privée du point obtenu pour C = K ;
 * - `pied` : une barre pivote d'un quart de tour autour de O (de l'horizontale à la verticale) ; le pied
 *   H de la perpendiculaire issue de P décrit un DEMI-CERCLE du cercle de diamètre [OP] (l'angle au
 *   centre double l'angle de la barre).
 */

export type VarianteLC = "echelle" | "radars" | "gravite" | "pied";
export type NatureLC = "quart" | "demi" | "arcOuvert" | "segment" | "droitePrivee";
export type PhaseLC = "parametre" | "equation" | "nature" | "extremites";

export interface ExerciceLC {
  variante: VarianteLC;
  /** Échelle : longueur L (m). */
  L: number;
  /** Radars : demi-écart d (km) et angle φ entre les faisceaux. */
  d: number;
  phi: 90 | 45 | 135;
  /** Centre de gravité : sommets fixes A, B ; C(t) = C0 + t·u ; `rail` : t ∈ [0 ; 1], sinon t ∈ ℝ. */
  A: Pt;
  B: Pt;
  C0: Pt;
  u: Pt;
  rail: boolean;
  /** Pied : centre de rotation O, point P. */
  O: Pt;
  P: Pt;
}

export const PHASES: PhaseLC[] = ["parametre", "equation", "nature", "extremites"];

export function nature(e: ExerciceLC): NatureLC {
  return { echelle: "quart", radars: "arcOuvert", pied: "demi", gravite: e.rail ? "segment" : "droitePrivee" }[e.variante] as NatureLC;
}

/** Lettre du paramètre. */
export const parametre = (e: ExerciceLC): string => (e.variante === "echelle" ? "a" : e.variante === "gravite" ? "t" : "m");
/** Nom du point mobile. */
export const mobile = (e: ExerciceLC): string => ({ echelle: "M", radars: "P", gravite: "G", pied: "H" })[e.variante];

/** Écran 1 à deux champs (coordonnées) ou à une équation de droite (génératrice). */
export const ecranCoordonnees = (e: ExerciceLC): boolean => e.variante === "echelle" || e.variante === "gravite";

/** Coordonnées du point mobile (échelle, centre de gravité). */
export function coordonnees(e: ExerciceLC, s: number): Pt {
  if (e.variante === "echelle") return { x: s / 2, y: Math.sqrt(Math.max(0, e.L * e.L - s * s)) / 2 };
  const C = { x: e.C0.x + s * e.u.x, y: e.C0.y + s * e.u.y };
  return { x: (e.A.x + e.B.x + C.x) / 3, y: (e.A.y + e.B.y + C.y) / 3 };
}

/** Seconde génératrice, pour une valeur m du paramètre (radars : faisceau de B ; pied : perpendiculaire
 * à la barre passant par P). */
export function generatrice(e: ExerciceLC, m: number): D {
  if (e.variante === "pied") return { a: 1, b: m, c: -e.P.x - m * e.P.y };
  const d = e.d;
  if (e.phi === 90) return { a: 1, b: m, c: -d };
  if (e.phi === 45) return { a: m + 1, b: -(1 - m), c: -(m + 1) * d };
  return { a: m - 1, b: -(1 + m), c: -(m - 1) * d };
}
/** Première génératrice (donnée) : faisceau de A, ou la barre. */
export function generatriceDonnee(e: ExerciceLC, m: number): D {
  if (e.variante === "pied") return { a: m, b: -1, c: e.O.y - m * e.O.x };
  return { a: m, b: -1, c: m * e.d };
}

/** Somme A + B + C0 (centre de gravité). */
const somme = (e: ExerciceLC): Pt => ({ x: e.A.x + e.B.x + e.C0.x, y: e.A.y + e.B.y + e.C0.y });

/** Équation du lieu complet. */
export function polyLieu(e: ExerciceLC): Poly {
  switch (e.variante) {
    case "echelle":
      return { x2: 4, y2: 4, "1": -e.L * e.L };
    case "radars":
      return e.phi === 90 ? { x2: 1, y2: 1, "1": -e.d * e.d } : { x2: 1, y2: 1, y: e.phi === 45 ? -2 * e.d : 2 * e.d, "1": -e.d * e.d };
    case "pied":
      return polyDiametre(e.O, e.P);
    case "gravite": {
      const s = somme(e);
      return normaliserPoly({ x: 3 * e.u.y, y: -3 * e.u.x, "1": e.u.x * s.y - e.u.y * s.x });
    }
  }
}

export function droiteGravite(e: ExerciceLC): D {
  const p = polyLieu(e);
  return normaliserDroite({ a: p.x ?? 0, b: p.y ?? 0, c: p["1"] ?? 0 });
}

/** Centre et rayon² du cercle du lieu complet (échelle, radars, pied). */
export function cercleLieu(e: ExerciceLC): { c: Pt; r2: number } {
  if (e.variante === "echelle") return { c: { x: 0, y: 0 }, r2: (e.L * e.L) / 4 };
  if (e.variante === "radars") return e.phi === 90 ? { c: { x: 0, y: 0 }, r2: e.d * e.d } : { c: { x: 0, y: e.phi === 45 ? e.d : -e.d }, r2: 2 * e.d * e.d };
  return { c: { x: (e.O.x + e.P.x) / 2, y: (e.O.y + e.P.y) / 2 }, r2: ((e.P.x - e.O.x) ** 2 + (e.P.y - e.O.y) ** 2) / 4 };
}

/** Droite (AB) et point K = d ∩ (AB) (centre de gravité). */
export function pointK(e: ExerciceLC): Pt | null {
  const ab: D = { a: e.B.y - e.A.y, b: e.A.x - e.B.x, c: -(e.B.y - e.A.y) * e.A.x - (e.A.x - e.B.x) * e.A.y };
  const d: D = { a: e.u.y, b: -e.u.x, c: -e.u.y * e.C0.x + e.u.x * e.C0.y };
  return intersection(ab, d);
}

/** Extrémités de la partie décrite (ou point exclu). */
export function extremites(e: ExerciceLC): Pt[] {
  switch (e.variante) {
    case "echelle":
      return [{ x: e.L / 2, y: 0 }, { x: 0, y: e.L / 2 }];
    case "radars":
      return [{ x: -e.d, y: 0 }, { x: e.d, y: 0 }];
    case "pied":
      return [{ x: e.P.x, y: e.O.y }, { x: e.O.x, y: e.P.y }];
    case "gravite": {
      if (e.rail) return [coordonnees(e, 0), coordonnees(e, 1)];
      const K = pointK(e)!;
      return [{ x: (e.A.x + e.B.x + K.x) / 3, y: (e.A.y + e.B.y + K.y) / 3 }];
    }
  }
}
