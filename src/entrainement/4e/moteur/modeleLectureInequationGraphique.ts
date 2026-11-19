import type { ExerciceLectureInequation, IdLecture, SymboleLecture } from "../core/lectureInequationGraphique.types";
import { ENSEMBLE_REELS, ENSEMBLE_VIDE, ensemblePoints, intervalleReel, normaliserEnsemble, reelsSauf, type EnsembleReel } from "../ui/ensembleSolutionTrinome";

/**
 * Modèle de gen117 « Lire une inéquation sur un graphique » : f, g, intersections, position et
 * ensemble-solution. Une seule source pour l'écran, le papier et le corrigé.
 */

type E = ExerciceLectureInequation;

export function g(e: E, x: number): number {
  return e.m * x + e.p;
}

/** f(x) − g(x). */
export function ecart(e: E, x: number): number {
  if (e.issue === 2) return e.alpha * (x - e.x1) * (x - e.x2);
  if (e.issue === 1) return e.alpha * (x - e.x1) ** 2;
  return e.alpha * ((x - e.x1) ** 2 + e.d);
}

export function f(e: E, x: number): number {
  return g(e, x) + ecart(e, x);
}

/** Coefficients de f(x) = A x² + B x + C. */
export function coefficientsF(e: E): [number, number, number] {
  const a = e.alpha;
  if (e.issue === 2) return [a, -a * (e.x1 + e.x2) + e.m, a * e.x1 * e.x2 + e.p];
  if (e.issue === 1) return [a, -2 * a * e.x1 + e.m, a * e.x1 * e.x1 + e.p];
  return [a, -2 * a * e.x1 + e.m, a * (e.x1 * e.x1 + e.d) + e.p];
}

/** Abscisses des points d'intersection (rangées). */
export function abscisses(e: E): number[] {
  if (e.issue === 2) return [e.x1, e.x2];
  if (e.issue === 1) return [e.x1];
  return [];
}

/** La parabole doit-elle être AU-DESSUS de la droite ? (> et ≥) */
export function veutDessus(s: SymboleLecture): boolean {
  return s === ">" || s === "≥";
}

export function estLarge(s: SymboleLecture): boolean {
  return s === "≤" || s === "≥";
}

/** La parabole est au-dessus de la droite à l'EXTÉRIEUR des abscisses (alpha > 0). */
function dessusExterieur(e: E): boolean {
  return e.alpha > 0;
}

/** Lecture juste de l'écran 2. */
export function lectureJuste(e: E): IdLecture {
  const dessus = veutDessus(e.symbole);
  const exterieur = dessus === dessusExterieur(e);
  return dessus ? (exterieur ? "dessusExterieur" : "dessusEntre") : exterieur ? "dessousExterieur" : "dessousEntre";
}

export function solution(e: E): EnsembleReel {
  const large = estLarge(e.symbole);
  const dessus = veutDessus(e.symbole);
  const exterieur = dessus === dessusExterieur(e);
  if (e.issue === 2) {
    return exterieur ? normaliserEnsemble([intervalleReel(null, false, e.x1, large), intervalleReel(e.x2, large, null, false)]) : [intervalleReel(e.x1, large, e.x2, large)];
  }
  if (e.issue === 1) {
    // « extérieur » = partout sauf au contact ; « entre » = seulement au contact.
    if (exterieur) return large ? ENSEMBLE_REELS : reelsSauf([e.x1]);
    return large ? ensemblePoints([e.x1]) : ENSEMBLE_VIDE;
  }
  return exterieur ? ENSEMBLE_REELS : ENSEMBLE_VIDE;
}
