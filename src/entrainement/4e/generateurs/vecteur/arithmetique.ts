/**
 * Couche A — arithmétique vectorielle pure, partagée par les 8 générateurs du chapitre "Calcul
 * vectoriel" — même principe que `generateurs/triangle/resoudreTriangle.ts` pour le chapitre
 * "Cercle trigonométrique et triangles quelconques" : un module frère plutôt qu'une réimplémentation
 * par générateur. Aucune notion de produit scalaire ici — hors programme, jamais implémentée.
 */
import type { Composantes, Point } from "../../core/vecteur.types";

export function additionner(a: Composantes, b: Composantes): Composantes {
  return { x: a.x + b.x, y: a.y + b.y };
}

export function soustraire(a: Composantes, b: Composantes): Composantes {
  return { x: a.x - b.x, y: a.y - b.y };
}

export function multiplier(k: number, v: Composantes): Composantes {
  return { x: k * v.x, y: k * v.y };
}

export function vecteurDepuisPoints(depart: Point, arrivee: Point): Composantes {
  return { x: arrivee.x - depart.x, y: arrivee.y - depart.y };
}

export function pointDepuisVecteur(origine: Point, v: Composantes): Point {
  return { x: origine.x + v.x, y: origine.y + v.y };
}

export function milieu(a: Point, b: Point): Point {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

/** Déterminant (produit en croix) — deux vecteurs colinéaires ⟺ déterminant nul. */
export function determinant(a: Composantes, b: Composantes): number {
  return a.x * b.y - a.y * b.x;
}

/** Produit scalaire canonique — utilisé UNIQUEMENT pour tester l'orthogonalité (deux vecteurs
 * orthogonaux ⟺ produit scalaire nul) ; jamais exposé comme notion "produit scalaire" à l'élève,
 * hors programme de 4e pour ce chapitre — voir CLAUDE.md. */
export function produitPourOrthogonalite(a: Composantes, b: Composantes): number {
  return a.x * b.x + a.y * b.y;
}

export function normeCarree(v: Composantes): number {
  return v.x * v.x + v.y * v.y;
}
