/**
 * Couche B — géométrie PURE de `gen53`, dans le repère local (d : y = 0, F = (0 ; h), K = (0 ; 0),
 * S = (0 ; h/2), axe x = 0). Aucune dépendance React ni Mafs : partagée par l'appli, la vérification
 * et la figure papier.
 */
import type { ExerciceConstructionParabole } from "../core/constructionParabole.types";
import type { Point } from "../core/vecteur.types";

/** Tolérance d'arrêt de l'équerre (unités locales, h = 2). */
export const TOLERANCE_POSITION = 0.25;
/** Aimant de l'équerre : à moins de cette distance d'un point remarquable, elle s'y cale. */
export const RAYON_AIMANT = 0.35;
/** Écart d'ouverture toléré entre deux tracés censés garder « la même ouverture ». */
export const TOLERANCE_OUVERTURE = 0.12;
/** Marge exigée au-delà de la moitié d'une distance (deux cercles qui se coupent franchement). */
export const MARGE_COUPE = 0.15;
/** Écart minimal entre deux ouvertures de la méthode du cercle (nouveaux points bien distincts). */
export const ECART_OUVERTURES = 0.4;
export const OUVERTURE_MIN = 0.3;
export const OUVERTURE_MAX = 4.6;

export type NomPoint = "F" | "K" | "S" | "H1" | "H2" | "H3";

export function foyer(e: ExerciceConstructionParabole): Point {
  return { x: 0, y: e.h };
}

export function sommet(e: ExerciceConstructionParabole): Point {
  return { x: 0, y: e.h / 2 };
}

export const PIED_K: Point = { x: 0, y: 0 };

export function pointH(e: ExerciceConstructionParabole, indice: number): Point {
  return { x: e.abscissesH[indice] ?? 0, y: 0 };
}

export function yParabole(e: ExerciceConstructionParabole, x: number): number {
  return (x * x + e.h * e.h) / (2 * e.h);
}

/** Méthode du cercle : les deux points de la parabole obtenus avec l'ouverture r (r > h/2). */
export function pointsOuverture(e: ExerciceConstructionParabole, r: number): [Point, Point] {
  const s = Math.sqrt(Math.max(0, e.h * (2 * r - e.h)));
  return [
    { x: -s, y: r },
    { x: s, y: r },
  ];
}

/** Méthode de la médiatrice : le point de la parabole qui se projette en H sur d. */
export function pointDeH(e: ExerciceConstructionParabole, xH: number): Point {
  return { x: xH, y: yParabole(e, xH) };
}

export function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/** Points d'intersection de deux cercles (0, 1 ou 2). */
export function intersectionCercles(c1: Point, r1: number, c2: Point, r2: number): Point[] {
  const d = distance(c1, c2);
  if (d < 1e-9 || d > r1 + r2 + 1e-9 || d < Math.abs(r1 - r2) - 1e-9) return [];
  const a = (r1 * r1 - r2 * r2 + d * d) / (2 * d);
  const hauteur = Math.sqrt(Math.max(0, r1 * r1 - a * a));
  const ux = (c2.x - c1.x) / d;
  const uy = (c2.y - c1.y) / d;
  const mx = c1.x + a * ux;
  const my = c1.y + a * uy;
  return [
    { x: mx - hauteur * uy, y: my + hauteur * ux },
    { x: mx + hauteur * uy, y: my - hauteur * ux },
  ];
}

/** Coordonnées « écran » (avant mise à l'échelle) : rotation de `theta` autour de l'origine locale. */
export function tourner(p: Point, theta: number): Point {
  const c = Math.cos(theta);
  const s = Math.sin(theta);
  return { x: p.x * c - p.y * s, y: p.x * s + p.y * c };
}

/** Points qui doivent rester visibles dans le cadre (repère local). */
export function pointsCadre(e: ExerciceConstructionParabole): Point[] {
  return [
    { x: -4.2, y: -0.8 },
    { x: 4.2, y: -0.8 },
    { x: -4.2, y: 4.8 },
    { x: 4.2, y: 4.8 },
    { x: 0, y: e.h },
  ];
}

export interface CadreRotation {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

/** Cadre (coordonnées tournées) contenant `pointsCadre`, ajusté au rapport largeur/hauteur demandé. */
export function cadreTourne(e: ExerciceConstructionParabole, ratio: number): CadreRotation {
  const pts = pointsCadre(e).map((p) => tourner(p, e.theta));
  let xMin = Math.min(...pts.map((p) => p.x));
  let xMax = Math.max(...pts.map((p) => p.x));
  let yMin = Math.min(...pts.map((p) => p.y));
  let yMax = Math.max(...pts.map((p) => p.y));
  const largeur = xMax - xMin;
  const hauteur = yMax - yMin;
  if (largeur / hauteur < ratio) {
    const extra = (hauteur * ratio - largeur) / 2;
    xMin -= extra;
    xMax += extra;
  } else {
    const extra = (largeur / ratio - hauteur) / 2;
    yMin -= extra;
    yMax += extra;
  }
  return { xMin, xMax, yMin, yMax };
}
