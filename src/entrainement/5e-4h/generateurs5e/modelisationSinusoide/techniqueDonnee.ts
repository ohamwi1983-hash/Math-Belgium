/**
 * Couche A (5e) — technique "donnée directement" de 5gen13 : Phase 1 sautée entièrement, f(t) est
 * directement fournie (A/ω/φ/b tous NUMÉRIQUEMENT connus dès le départ — contrairement à B1, la
 * Phase 2 peut donc toujours être tirée pour cette technique).
 */
import type { DonneesDonnee } from "../../core5e/modelisationSinusoide.types";

const A_MIN = 2;
const A_MAX = 15;
const PERIODE_MIN = 4;
const PERIODE_MAX = 60;
const B_MIN = -20;
const B_MAX = 20;

function entierAleatoire(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function reelAleatoire(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export function genererDonneesDonnee(): DonneesDonnee {
  const A = entierAleatoire(A_MIN, A_MAX);
  const periode = entierAleatoire(PERIODE_MIN, PERIODE_MAX);
  const omega = (2 * Math.PI) / periode;
  const phi = reelAleatoire(-Math.PI, Math.PI);
  const b = entierAleatoire(B_MIN, B_MAX);

  return { technique: "donnee", fonction: { A, omega, phi, b } };
}
