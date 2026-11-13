import type { ExerciceComposantes, ExerciceDecompositionVecteur, ExerciceGraphique, PointNomme, SystemeOption, Vec2 } from "../core/decompositionVecteur.types";

/**
 * Modèle de gen82 (« Décomposer un vecteur selon deux directions ») : géométrie des figures,
 * résolution, écrans. Aucune dépendance d'affichage.
 */

export function det(p: Vec2, q: Vec2): number {
  return p.x * q.y - p.y * q.x;
}

/** (a ; b) tels que d = a·v + b·w (v, w non colinéaires). */
export function resoudre(d: Vec2, v: Vec2, w: Vec2): { a: number; b: number } {
  const D = det(v, w);
  return { a: nettoyer(det(d, w) / D), b: nettoyer(det(v, d) / D) };
}

/** Supprime le bruit flottant et le « −0 ». */
export function nettoyer(x: number): number {
  const r = Math.round(x * 1e9) / 1e9;
  return r === 0 ? 0 : r;
}

export function estDemiEntier(x: number): boolean {
  return !Number.isInteger(x) && Number.isInteger(nettoyer(2 * x));
}

// ---------------------------------------------------------------------------------------------
// Figures
// ---------------------------------------------------------------------------------------------

export function pointDe(e: ExerciceGraphique, nom: string): PointNomme {
  const p = e.points.find((q) => q.nom === nom);
  if (!p) throw new Error(`Point inconnu : ${nom}`);
  return p;
}

/** Position cartésienne (dessin) d'un point de coordonnées (i ; j) dans la base de la figure. */
export function cartesien(e: ExerciceGraphique, i: number, j: number): Vec2 {
  return { x: i * e.e1.x + j * e.e2.x, y: i * e.e1.y + j * e.e2.y };
}

export function vecteurEntre(p: PointNomme, q: PointNomme): Vec2 {
  return { x: q.i - p.i, y: q.j - p.j };
}

export function vecteurU(e: ExerciceGraphique): Vec2 {
  return vecteurEntre(pointDe(e, e.origine), pointDe(e, e.extremite));
}

/** Réseau, quadrillage : \vec{v} et \vec{w} sont dessinés à part (pas de nom de points). */
export function vecteursLibres(e: ExerciceGraphique): boolean {
  return !e.nomsV;
}

// ---------------------------------------------------------------------------------------------
// Écrans
// ---------------------------------------------------------------------------------------------

/**
 * Graphique : 0. le point M (choix fermé) ; 1. a ; 2. b (la combinaison complète s'affiche à la
 * validation). Composantes : 0. le système (choix fermé) ; 1. a et b ; 2. vérification (a·v et b·w).
 * Possible : 0. verdict (choix fermé) ; 1. a et b si possible, sinon k tel que w = k·v.
 */
export function nombreEcrans(e: ExerciceDecompositionVecteur): number {
  if (e.type === "graphique") return 3;
  return e.famille === "composantes" ? 3 : 2;
}

export function combinaison(e: ExerciceComposantes): { av: Vec2; bw: Vec2 } {
  const a = e.a ?? 0;
  const b = e.b ?? 0;
  return {
    av: { x: nettoyer(a * e.v.x), y: nettoyer(a * e.v.y) },
    bw: { x: nettoyer(b * e.w.x), y: nettoyer(b * e.w.y) },
  };
}

/** Coefficients (a ; b) d'une instance décomposable. */
export function coefficients(e: ExerciceDecompositionVecteur): { a: number; b: number } | null {
  if (e.type === "graphique") return { a: e.a, b: e.b };
  if (e.a === null || e.b === null) return null;
  return { a: e.a, b: e.b };
}

// ---------------------------------------------------------------------------------------------
// Systèmes proposés (famille « composantes »)
// ---------------------------------------------------------------------------------------------

export const SYSTEMES_DISTRACTEURS: SystemeOption[] = ["transpose", "inverse", "composantes"];

/** Coefficients des deux équations proposées (a, b, second membre). */
export function lignesSysteme(e: ExerciceComposantes, option: SystemeOption): [number, number, number][] {
  const { u, v, w } = e;
  switch (option) {
    case "correct":
      return [
        [v.x, w.x, u.x],
        [v.y, w.y, u.y],
      ];
    case "transpose":
      return [
        [v.x, v.y, u.x],
        [w.x, w.y, u.y],
      ];
    case "inverse":
      return [
        [w.x, v.x, u.x],
        [w.y, v.y, u.y],
      ];
    case "composantes":
      return [
        [v.x, w.x, u.y],
        [v.y, w.y, u.x],
      ];
  }
}

