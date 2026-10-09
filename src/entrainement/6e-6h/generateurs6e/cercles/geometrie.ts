/**
 * Couche A (6e) — petite algèbre de points/droites/cercles FRAÎCHE, propre à `6gen55` ("Cercles",
 * chapitre "Lieux géométriques"). Aucune infrastructure droite/cercle 6e préexistante à réutiliser
 * (voir `docs/historique-6e.md`) — ce fichier est le seul point d'entrée géométrique pour
 * `familleA.ts` à `familleG.ts` de ce dossier, jamais importé par un autre générateur.
 *
 * Convention DÉLIBÉRÉE de ce générateur : toute droite est représentée sous forme affine
 * `y = m·x + p` (jamais la forme générale `ax+by=c`, jamais de droite verticale) — chaque
 * construction de famille choisit ses points/pentes pour garantir qu'aucune droite nécessaire
 * (médiatrice, droite donnée) n'est verticale (voir en-tête de chaque `familleX.ts`). Documenté
 * comme simplification assumée dans `docs/historique-6e.md`.
 */

import type { DroiteAffine, Point } from "../../core6e/cercles.types";

export type { DroiteAffine, Point };

export function distance(a: Point, b: Point): number {
  return Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2);
}

export function milieu(a: Point, b: Point): Point {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

export function pente(a: Point, b: Point): number {
  return (b.y - a.y) / (b.x - a.x);
}

/** Droite affine passant par 2 points — lève si `a.x===b.x` (verticale, jamais censé arriver ici
 * par construction). */
export function droiteParDeuxPoints(a: Point, b: Point): DroiteAffine {
  if (a.x === b.x) throw new Error("droiteParDeuxPoints : droite verticale non supportée");
  const m = pente(a, b);
  return { m, p: a.y - m * a.x };
}

/** Médiatrice de [AB] — passe par le milieu, pente perpendiculaire à (AB). Lève si (AB) est
 * horizontale (pente 0 : la médiatrice serait alors verticale, non supportée ici). */
export function mediatrice(a: Point, b: Point): DroiteAffine {
  const pAB = pente(a, b);
  if (pAB === 0) throw new Error("mediatrice : (AB) horizontale, médiatrice verticale non supportée");
  const m = -1 / pAB;
  const mil = milieu(a, b);
  return { m, p: mil.y - m * mil.x };
}

export function ordonnee(d: DroiteAffine, x: number): number {
  return d.m * x + d.p;
}

export function distancePointDroite(pt: Point, d: DroiteAffine): number {
  // d : m·x - y + p = 0
  return Math.abs(d.m * pt.x - pt.y + d.p) / Math.sqrt(d.m * d.m + 1);
}

export function intersectionDroites(d1: DroiteAffine, d2: DroiteAffine): Point | null {
  if (Math.abs(d1.m - d2.m) < 1e-12) return null;
  const x = (d2.p - d1.p) / (d1.m - d2.m);
  const y = d1.m * x + d1.p;
  return { x, y };
}

export function sontAlignes(a: Point, b: Point, c: Point): boolean {
  return Math.abs((b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x)) < 1e-9;
}

/** Aire d'un triangle (formule du lacet), toujours positive. */
export function aireTriangle(a: Point, b: Point, c: Point): number {
  return Math.abs((b.x - a.x) * (c.y - a.y) - (c.x - a.x) * (b.y - a.y)) / 2;
}

export interface RacinesQuadratique {
  x1: number;
  x2: number;
}

/** Résout ax²+bx+c=0. Renvoie `null` si discriminant < 0 (jamais censé arriver par construction —
 * chaque famille garantit géométriquement un discriminant positif) ; toujours `x1<x2`. */
export function resoudreQuadratique(a: number, b: number, c: number): RacinesQuadratique | null {
  const delta = b * b - 4 * a * c;
  if (delta < 0) return null;
  const racineDelta = Math.sqrt(delta);
  const x1 = (-b - racineDelta) / (2 * a);
  const x2 = (-b + racineDelta) / (2 * a);
  return { x1, x2 };
}

/** Résout un système linéaire 3x3 M·[D,E,F]ᵀ = second (méthode de Cramer) — utilisé par la famille
 * A pour retrouver D,E,F depuis les 3 équations de cercle substituées. `null` si le déterminant est
 * quasi nul (jamais censé arriver ici — 3 points non alignés donnent toujours un système de
 * Cramer). */
export function resoudreSysteme3x3(matrice: [number, number, number][], second: [number, number, number]): { D: number; E: number; F: number } | null {
  const det3 = (m: number[][]) => m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) - m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) + m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
  const detPrincipal = det3(matrice);
  if (Math.abs(detPrincipal) < 1e-9) return null;
  const remplacerColonne = (col: number): number[][] =>
    matrice.map((ligne, i) => ligne.map((v, j) => (j === col ? second[i] : v)));
  const D = det3(remplacerColonne(0)) / detPrincipal;
  const E = det3(remplacerColonne(1)) / detPrincipal;
  const F = det3(remplacerColonne(2)) / detPrincipal;
  return { D, E, F };
}

// ============================================================================
// Tirage aléatoire — helpers locaux, jamais importés d'un autre générateur (mirroir du patron
// `denombrementFondamental/aleatoire.ts`).
// ============================================================================

export function tirerEntier(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function tirerParmi<T>(candidats: readonly T[]): T {
  return candidats[Math.floor(Math.random() * candidats.length)];
}
