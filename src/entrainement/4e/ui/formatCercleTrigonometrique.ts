import type { Quadrant, VarianteCercleTrigId } from "../core/cercleTrigonometrique.types";

export function formatAngleLatex(angle: number): string {
  return `${angle}^\\circ`;
}

/** Bloc "énoncé" fixe, affiché à l'identique sur tous les écrans de l'exercice. */
export function formatEnonceCercleTrigLatex(angleDepart: number): string {
  return `\\theta = ${formatAngleLatex(angleDepart)}`;
}

const LIBELLES_QUADRANT: Record<Quadrant, string> = {
  I: "Quadrant I",
  II: "Quadrant II",
  III: "Quadrant III",
  IV: "Quadrant IV",
  axeOx: "Sur l'axe Ox",
  axeOy: "Sur l'axe Oy",
};

export function libelleQuadrant(quadrant: Quadrant): string {
  return LIBELLES_QUADRANT[quadrant];
}

const LIBELLES_VARIANTE: Record<VarianteCercleTrigId, string> = {
  angle_negatif: "Angle négatif",
  angle_superieur_360: "Angle ≥ 360°",
  multiple_90: "Multiple de 90°",
};

export function libelleVariante(variante: VarianteCercleTrigId): string {
  return LIBELLES_VARIANTE[variante];
}
