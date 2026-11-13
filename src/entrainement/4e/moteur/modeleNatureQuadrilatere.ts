import type { ExerciceNatureQuadrilatere, NatureQuadrilatere } from "../core/natureQuadrilatere.types";
import type { Composantes, Point } from "../core/vecteur.types";

/**
 * Modèle de gen84 : une seule source pour l'écran, les aides, la vérification, la figure et
 * l'adaptateur de feuilles. Tout est entier (coordonnées entières) : comparaisons exactes.
 */

export function vecteur(origine: Point, extremite: Point): Composantes {
  return { x: extremite.x - origine.x, y: extremite.y - origine.y };
}

export const vecAB = (e: ExerciceNatureQuadrilatere) => vecteur(e.A, e.B);
export const vecBC = (e: ExerciceNatureQuadrilatere) => vecteur(e.B, e.C);
export const vecDC = (e: ExerciceNatureQuadrilatere) => vecteur(e.D, e.C);
export const vecCD = (e: ExerciceNatureQuadrilatere) => vecteur(e.C, e.D);

export function egaux(u: Composantes, v: Composantes): boolean {
  return u.x === v.x && u.y === v.y;
}

export function normeCarree(u: Composantes): number {
  return u.x * u.x + u.y * u.y;
}

/** Critère d'orthogonalité x·x′ + y·y′ (« produit scalaire » du cours). */
export function critere(u: Composantes, v: Composantes): number {
  return u.x * v.x + u.y * v.y;
}

export function determinant(u: Composantes, v: Composantes): number {
  return u.x * v.y - u.y * v.x;
}

export function estParallelogramme(e: ExerciceNatureQuadrilatere): boolean {
  return egaux(vecAB(e), vecDC(e));
}

export function cotesConsecutifsEgaux(e: ExerciceNatureQuadrilatere): boolean {
  return normeCarree(vecAB(e)) === normeCarree(vecBC(e));
}

export function critereABBC(e: ExerciceNatureQuadrilatere): number {
  return critere(vecAB(e), vecBC(e));
}

export function angleDroitEnB(e: ExerciceNatureQuadrilatere): boolean {
  return critereABBC(e) === 0;
}

/** Nature exacte (la plus précise). Un carré est aussi rectangle et losange : on rend « carre ». */
export function natureDe(e: ExerciceNatureQuadrilatere): NatureQuadrilatere {
  if (!estParallelogramme(e)) return "quelconque";
  const losange = cotesConsecutifsEgaux(e);
  const rectangle = angleDroitEnB(e);
  if (losange && rectangle) return "carre";
  if (losange) return "losange";
  if (rectangle) return "rectangle";
  return "parallelogramme";
}

/** D tel que AB = CD (erreur d'ordre des sommets) : D = C + AB. */
export function quatriemeSommetFaux(e: ExerciceNatureQuadrilatere): Point {
  const ab = vecAB(e);
  return { x: e.C.x + ab.x, y: e.C.y + ab.y };
}

export function sommets(e: ExerciceNatureQuadrilatere): Point[] {
  return [e.A, e.B, e.C, e.D];
}

/** Côtés dans l'ordre AB, BC, CD, DA. */
export function cotes(e: ExerciceNatureQuadrilatere): Composantes[] {
  const s = sommets(e);
  return s.map((p, i) => vecteur(p, s[(i + 1) % 4]!));
}

/** ABCD convexe et non aplati (A, B, C, D dans cet ordre, aucun angle plat ni rentrant). */
export function estConvexe(e: ExerciceNatureQuadrilatere): boolean {
  const c = cotes(e);
  const dets = c.map((u, i) => determinant(u, c[(i + 1) % 4]!));
  return dets.every((d) => d > 0) || dets.every((d) => d < 0);
}
