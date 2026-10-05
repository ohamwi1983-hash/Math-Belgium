/**
 * Couche présentation (5e) — géométrie du diagramme SVG de 5gen7 (cercle + n sommets étiquetés).
 * SVG sur mesure (jamais Mafs — principe déjà établi sur gen58, 4e, voir CLAUDE.md "Choix du rendu
 * graphique — Mafs vs SVG sur mesure") : aucune coordonnée n'est jamais lue par l'élève, r est
 * donné en toutes lettres ailleurs à l'écran — le rayon PIXEL du cercle est donc FIXE (schématique),
 * seule la répartition ANGULAIRE des n sommets doit rester exacte (l'élève doit pouvoir compter les
 * crans correctement).
 */
import type { SegmentMultiPas } from "../core5e/polygonesArcsSecteurs.types";

export const RAYON_PIXEL = 100;
export const CENTRE = { x: 130, y: 130 };
export const TAILLE_CADRE = 260;
const RAYON_LABEL = RAYON_PIXEL + 20;

export interface PointSVG {
  x: number;
  y: number;
}

export type TypeSurlignage = "arc" | "secteur";
export interface Surlignage {
  type: TypeSurlignage;
  segment: SegmentMultiPas;
}

/** Angle en radians pour le sommet `index` (sens de parcours FIXE : depuis le haut du cercle,
 * dans le sens horaire — visuellement, en coordonnées SVG y-vers-le-bas). */
function angleSommet(index: number, n: number): number {
  return -Math.PI / 2 + (2 * Math.PI * index) / n;
}

export function positionSommet(index: number, n: number): PointSVG {
  const angle = angleSommet(index, n);
  return { x: CENTRE.x + RAYON_PIXEL * Math.cos(angle), y: CENTRE.y + RAYON_PIXEL * Math.sin(angle) };
}

export function positionLabelSommet(index: number, n: number): PointSVG {
  const angle = angleSommet(index, n);
  return { x: CENTRE.x + RAYON_LABEL * Math.cos(angle), y: CENTRE.y + RAYON_LABEL * Math.sin(angle) };
}

/** Chemin SVG de l'ARC (sur le cercle) entre 2 sommets, dans le sens de parcours FIXE (de
 * `indexDepart` à `indexDepart+k`) — toujours le plus court arc par construction (k≤n/2, voir
 * `core5e/polygonesArcsSecteurs.types.ts`). */
export function cheminArc(segment: SegmentMultiPas, n: number): string {
  const depart = positionSommet(segment.indexDepart, n);
  const arrivee = positionSommet(segment.indexArrivee, n);
  return `M ${depart.x} ${depart.y} A ${RAYON_PIXEL} ${RAYON_PIXEL} 0 0 1 ${arrivee.x} ${arrivee.y}`;
}

/** Chemin SVG du SECTEUR (rempli) entre 2 sommets, depuis le centre. */
export function cheminSecteur(segment: SegmentMultiPas, n: number): string {
  const depart = positionSommet(segment.indexDepart, n);
  const arrivee = positionSommet(segment.indexArrivee, n);
  return `M ${CENTRE.x} ${CENTRE.y} L ${depart.x} ${depart.y} A ${RAYON_PIXEL} ${RAYON_PIXEL} 0 0 1 ${arrivee.x} ${arrivee.y} Z`;
}
