import type { Exercice124, Variante124 } from "../../core6e/pointsRemarquablesEuler";
import { tirer124 } from "../../core6e/pointsRemarquablesEuler";

/**
 * Couche A — générateur de `6gen124` « Points remarquables et droite d'Euler ». `Math.random()` seul
 * (le `?code=` rejoue le tirage). Variantes = type du triangle, visible sur les données (H intérieur,
 * extérieur, ou sommet de l'angle droit).
 */

export const CATALOGUE_124: { id: Variante124; label: string }[] = [
  { id: "aigu", label: "Triangle acutangle (H à l'intérieur)" },
  { id: "obtus", label: "Triangle obtusangle (H à l'extérieur)" },
  { id: "rectangle", label: "Triangle rectangle" },
];

const auHasard = (): Variante124 => {
  const r = Math.random();
  return r < 0.4 ? "aigu" : r < 0.8 ? "obtus" : "rectangle";
};

export function construireAvecVariante124(id: string): Exercice124 {
  const v = CATALOGUE_124.find((x) => x.id === id);
  return tirer124(v ? v.id : auHasard());
}

export function genererExercice124(): Exercice124 {
  return tirer124(auHasard());
}
