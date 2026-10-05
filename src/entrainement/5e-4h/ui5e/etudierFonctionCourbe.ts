/**
 * Couche présentation (5e) — construction de la courbe/viewBox pour l'écran "graphique" de 5gen31
 * ("Étudier une fonction"). PAS de réutilisation directe de 5gen22/5gen30 — investigation faite :
 * `construireSegments*`/`calculerViewBox*` de ces générateurs sont câblés en dur sur des exercices à
 * dimensions QUALITATIVES (jamais une vraie formule algébrique derrière), sans point d'injection
 * pour une fonction réelle arbitraire. Nouveau module, léger, générique sur `(x:number)=>number`.
 */
import type { ExerciceEtudierFonction } from "../core5e/etudierFonction.types";
import { exclusionsCE, pointsClesEtudierFonction, valeurF } from "../moteur5e/verificationEtudierFonction";

/** Même valeur que `BUFFER_VA` (5gen22/5gen30, `ui5e/lectureGraphiqueLimitesCourbe.ts`) — jamais
 * échantillonner le pôle lui-même. */
export const BUFFER_VA_ETUDIER_FONCTION = 0.35;

export interface SegmentCourbeFonctionReelle {
  domaine: [number, number];
  evaluer: (x: number) => number;
}

/** Un morceau par intervalle entre 2 exclusions consécutives (ou un seul morceau si `exclusions`
 * est vide) — buffer `BUFFER_VA_ETUDIER_FONCTION` exclu de chaque côté d'une exclusion, jamais aux
 * bords `xMin`/`xMax` (bords du viewBox, pas des pôles). */
export function construireSegmentsFonctionReelle(evaluer: (x: number) => number, exclusions: number[], xMin: number, xMax: number): SegmentCourbeFonctionReelle[] {
  const triees = [...exclusions].sort((a, b) => a - b);
  const segments: SegmentCourbeFonctionReelle[] = [];
  let precedent = xMin;
  for (const excl of triees) {
    segments.push({ domaine: [precedent, excl - BUFFER_VA_ETUDIER_FONCTION], evaluer });
    precedent = excl + BUFFER_VA_ETUDIER_FONCTION;
  }
  segments.push({ domaine: [precedent, xMax], evaluer });
  return segments;
}

const MARGE_X = 4;
const DEMI_LARGEUR_X_MIN = 5;
const DEMI_HAUTEUR_Y_DEFAUT = 6;

export function calculerBornesX(exclusions: number[]): [number, number] {
  const positions = exclusions.length > 0 ? exclusions : [0];
  const xEtendueMin = Math.min(0, ...positions) - MARGE_X;
  const xEtendueMax = Math.max(0, ...positions) + MARGE_X;
  const demiLargeur = Math.max(DEMI_LARGEUR_X_MIN, (xEtendueMax - xEtendueMin) / 2);
  const centreX = (xEtendueMin + xEtendueMax) / 2;
  return [centreX - demiLargeur, centreX + demiLargeur];
}

export function construireEvaluateurEtudierFonction(exercice: ExerciceEtudierFonction): (x: number) => number {
  return (x: number) => valeurF(exercice, x);
}

/** ViewBox — X centré sur les exclusions (`calculerBornesX`), Y étendu pour englober tous les
 * points clés (extremums/PI/f(0)) plus 2 échantillons "sûrs" (loin de toute exclusion) pour capter
 * l'allure générale des branches. */
export function calculerViewBoxEtudierFonction(exercice: ExerciceEtudierFonction): { x: [number, number]; y: [number, number] } {
  const exclusions = exclusionsCE(exercice);
  const [xMin, xMax] = calculerBornesX(exclusions);
  const f = construireEvaluateurEtudierFonction(exercice);

  const valeursNotables: number[] = pointsClesEtudierFonction(exercice).map((p) => p.y);
  for (const x of [xMin + 1, xMax - 1]) {
    if (exclusions.every((e) => Math.abs(x - e) > BUFFER_VA_ETUDIER_FONCTION)) {
      const y = f(x);
      if (Number.isFinite(y)) valeursNotables.push(y);
    }
  }

  let yMax = DEMI_HAUTEUR_Y_DEFAUT;
  let yMin = -DEMI_HAUTEUR_Y_DEFAUT;
  for (const v of valeursNotables) {
    if (!Number.isFinite(v)) continue;
    yMax = Math.max(yMax, v + 2);
    yMin = Math.min(yMin, v - 2);
  }
  return { x: [xMin, xMax], y: [yMin, yMax] };
}

export function construireSegmentsEtudierFonction(exercice: ExerciceEtudierFonction): SegmentCourbeFonctionReelle[] {
  const { x } = calculerViewBoxEtudierFonction(exercice);
  return construireSegmentsFonctionReelle(construireEvaluateurEtudierFonction(exercice), exclusionsCE(exercice), x[0], x[1]);
}
