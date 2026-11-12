/**
 * Couche présentation (5e) — construction de la courbe/viewBox pour l'écran "graphique" de 5gen31
 * ("Étudier une fonction"). PAS de réutilisation directe de 5gen22/5gen30 — investigation faite :
 * `construireSegments*`/`calculerViewBox*` de ces générateurs sont câblés en dur sur des exercices à
 * dimensions QUALITATIVES (jamais une vraie formule algébrique derrière), sans point d'injection
 * pour une fonction réelle arbitraire. Nouveau module, léger, générique sur `(x:number)=>number`.
 */
import type { ExerciceEtudierFonction } from "../core5e/etudierFonction.types";
import { decalageVertical, exclusionsCE, pointsClesEtudierFonction, typeAsymptotique, valeurF } from "../moteur5e/verificationEtudierFonction";

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

export function construireEvaluateurEtudierFonction(exercice: ExerciceEtudierFonction): (x: number) => number {
  return (x: number) => valeurF(exercice, x);
}

/** ViewBox — bornée par les points remarquables (extremums, inflexions, point d'abscisse 0) et les
 * asymptotes verticales, avec une marge : tous les points à placer sont dans la fenêtre (audit 5e
 * ch. 5 : des inflexions sortaient de l'ancienne fenêtre, et une fenêtre y de près de 700 unités
 * écrasait la courbe). Repère NON isotrope (`preserveAspectRatio={false}` dans le graphe). */
export function calculerViewBoxEtudierFonction(exercice: ExerciceEtudierFonction): { x: [number, number]; y: [number, number] } {
  const exclusions = exclusionsCE(exercice);
  const points = pointsClesEtudierFonction(exercice);
  const xs = [...points.map((p) => p.x), ...exclusions];
  let xMin = Math.min(...xs) - 2;
  let xMax = Math.max(...xs) + 2;
  if (xMax - xMin < 8) {
    const c = (xMin + xMax) / 2;
    xMin = c - 4;
    xMax = c + 4;
  }
  const ys = points.map((p) => p.y).filter((y) => Number.isFinite(y));
  if (typeAsymptotique(exercice) === "horizontale") ys.push(decalageVertical(exercice));
  let yMin = Math.min(...ys);
  let yMax = Math.max(...ys);
  const marge = Math.max(1.5, (yMax - yMin) * 0.2);
  yMin -= marge;
  yMax += marge;
  if (yMax - yMin < 6) {
    const c = (yMin + yMax) / 2;
    yMin = c - 3;
    yMax = c + 3;
  }
  return { x: [Math.floor(xMin), Math.ceil(xMax)], y: [Math.floor(yMin), Math.ceil(yMax)] };
}

export function construireSegmentsEtudierFonction(exercice: ExerciceEtudierFonction): SegmentCourbeFonctionReelle[] {
  const { x } = calculerViewBoxEtudierFonction(exercice);
  return construireSegmentsFonctionReelle(construireEvaluateurEtudierFonction(exercice), exclusionsCE(exercice), x[0], x[1]);
}
