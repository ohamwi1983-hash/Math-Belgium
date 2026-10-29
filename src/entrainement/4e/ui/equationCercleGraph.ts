/**
 * Géométrie pure du graphe Mafs de "Équation d'un cercle (non développée) à partir d'un graphe" —
 * cadrage dérivé des 4 points cardinaux du cercle (centre±rayon sur chaque axe), jamais un domaine
 * fixe indépendant du cercle réellement tracé. X et Y sont homogènes pour un
 * cercle (les deux représentent la même échelle spatiale), jamais besoin de
 * `preserveAspectRatio={false}` (contrairement à la classe de bug documentée pour le chapitre
 * "Statistiques", où X et Y sont deux grandeurs sans rapport).
 */
import type { ExerciceEquationCercle } from "../core/equationCercle.types";
import type { Point } from "../core/vecteur.types";
import { ajusterAuRatio } from "./mafsTransformation";
import type { ViewBoxTransformation } from "./mafsTransformation";

/** Les 4 points cardinaux du cercle (centre±rayon sur chaque axe) — jamais stockés sur le contrat,
 * une pure dérivation présentationnelle pour le cadrage du graphe. */
export function pointsCardinauxCercle(exercice: ExerciceEquationCercle): Point[] {
  const { centre, rayon } = exercice;
  return [
    { x: centre.x + rayon, y: centre.y },
    { x: centre.x - rayon, y: centre.y },
    { x: centre.x, y: centre.y + rayon },
    { x: centre.x, y: centre.y - rayon },
  ];
}

/** Rapport largeur/hauteur du graphe de gen49 — plus carré que `RATIO_GRAPHE` (3/2) : un cercle
 * dans un cadre très allongé laisse de grandes bandes vides et rétrécit chaque unité. Partagé par
 * l'écran (`EquationCercleGraph.tsx`) et l'export (`exportEvaluation.ts`). */
export const RATIO_GRAPHE_CERCLE = 5 / 4;

/** Marge (unités) autour du cercle et du point marqué. */
const MARGE_CADRAGE = 1;

/** Cadrage du graphe — couvre le cercle entier (4 points cardinaux) ET le point marqué, avec une
 * marge d'une unité, bornes arrondies à l'entier, puis ajusté au rapport du cadre. Jamais
 * `etendreViewBoxPourEtiquettes` (audit chapitre 7, point 41) : il étend la fenêtre jusqu'aux
 * multiples d'un pas « rond » (souvent 5) et triplait parfois la largeur, d'où un quadrillage
 * illisible au pas 1. */
export function viewBoxEquationCercle(exercice: ExerciceEquationCercle): ViewBoxTransformation {
  const points = [...pointsCardinauxCercle(exercice), exercice.pointMarque];
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const x: [number, number] = [Math.floor(Math.min(...xs) - MARGE_CADRAGE), Math.ceil(Math.max(...xs) + MARGE_CADRAGE)];
  const y: [number, number] = [Math.floor(Math.min(...ys) - MARGE_CADRAGE), Math.ceil(Math.max(...ys) + MARGE_CADRAGE)];
  return ajusterAuRatio(x, y, RATIO_GRAPHE_CERCLE);
}
