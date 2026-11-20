import type { ExerciceLectureParabole, IdOptionImage, Signe, TripleSignes } from "../core/lectureParabole.types";
import type { Intervalle } from "./algebreTransfertSecondDegre";

/**
 * Modèle de gen123 « Lire une parabole sur un graphique » : coefficients, signes, image. Une seule
 * source pour l'écran, le papier, le corrigé et le test du moteur.
 */

type E = ExerciceLectureParabole;

export function f(e: E, x: number): number {
  return e.a * (x - e.xS) ** 2 + e.yS;
}

export function coefB(e: E): number {
  return -2 * e.a * e.xS + 0;
}

export function coefC(e: E): number {
  return e.a * e.xS * e.xS + e.yS;
}

export function signe(v: number): Signe {
  return Math.abs(v) < 1e-12 ? 0 : v > 0 ? 1 : -1;
}

export function signesJustes(e: E): TripleSignes {
  return [signe(e.a), signe(coefB(e)), signe(coefC(e))];
}

/** Intervalle image de chaque option de l'écran 4. */
export function intervalleImage(e: E, id: IdOptionImage): Intervalle {
  const haut = e.a > 0;
  const borne = id === "abscisse" ? e.xS : id === "origine" ? coefC(e) : e.yS;
  if (id === "reels") return { g: -Infinity, gFerme: false, d: Infinity, dFerme: false };
  const versHaut = id === "sens" ? !haut : haut;
  const ferme = id !== "ouvert";
  return versHaut ? { g: borne, gFerme: ferme, d: Infinity, dFerme: false } : { g: -Infinity, gFerme: false, d: borne, dFerme: ferme };
}
