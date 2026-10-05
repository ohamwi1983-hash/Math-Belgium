/**
 * Géométrie pure du croquis SVG schématique de "Réduction d'une somme de vecteurs (Chasles)" —
 * contrairement aux 4 graphes Mafs du projet (courbes/vecteurs à l'échelle réelle avec zoom/pan),
 * ce croquis est une figure STATIQUE (coordonnées toujours fixes, voir `figures.ts`) : un simple
 * viewBox calculé une fois, jamais de zoom/grille adaptative — même famille que `TriangleSketch`/
 * `CercleTrigSketch`, généralisée ici à un nombre variable de points/arêtes.
 */
import type { Point } from "../core/vecteur.types";

export interface PointFigureAffiche {
  nom: string;
  x: number;
  y: number;
}

export interface AreteFigureAffichee {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface GeometrieFigureReduction {
  viewBox: string;
  points: PointFigureAffiche[];
  aretes: AreteFigureAffichee[];
  rayonPoint: number;
}

const MARGE = 0.8;

/** Repère mathématique (y vers le haut) → repère SVG (y vers le bas) : simple inversion du signe
 * de y, aucune autre transformation nécessaire (les coordonnées des figures sont déjà à une
 * échelle raisonnable pour un viewBox direct en unités réelles). */
export function calculerGeometrieFigureReduction(points: Record<string, Point>, aretes: [string, string][]): GeometrieFigureReduction {
  const noms = Object.keys(points);
  const xs = noms.map((n) => points[n].x);
  const ys = noms.map((n) => points[n].y);

  const xMin = Math.min(...xs) - MARGE;
  const xMax = Math.max(...xs) + MARGE;
  const yMin = -Math.max(...ys) - MARGE;
  const yMax = -Math.min(...ys) + MARGE;

  const largeur = xMax - xMin;
  const hauteur = yMax - yMin;

  const pointsAffiches: PointFigureAffiche[] = noms.map((n) => ({ nom: n, x: points[n].x, y: -points[n].y }));
  const aretesAffichees: AreteFigureAffichee[] = aretes.map(([a, b]) => ({
    x1: points[a].x,
    y1: -points[a].y,
    x2: points[b].x,
    y2: -points[b].y,
  }));

  return {
    viewBox: `${xMin} ${yMin} ${largeur} ${hauteur}`,
    points: pointsAffiches,
    aretes: aretesAffichees,
    rayonPoint: Math.max(largeur, hauteur) * 0.025,
  };
}
