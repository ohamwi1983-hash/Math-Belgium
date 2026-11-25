import type { Exercice113, Variante113 } from "../../core6e/densiteProbabilite";
import { tirer113 } from "../../core6e/densiteProbabilite";

/**
 * Couche A — générateur de `6gen113` « Densité de probabilité ». `Math.random()` seul (le `?code=`
 * rejoue le tirage). Deux variantes : densité tracée sur un quadrillage (aires) ou donnée par une
 * formule (primitives, espérance).
 */

export const CATALOGUE_113: { id: Variante113; label: string }[] = [
  { id: "trace", label: "Densité tracée : k, probabilités par des aires" },
  { id: "formule", label: "Densité f(x) = k·g(x) : k, P(a ≤ X ≤ b), E(X)" },
];

export function construireAvecVariante113(id: string): Exercice113 {
  const v = CATALOGUE_113.find((x) => x.id === id);
  return tirer113(v ? v.id : Math.random() < 0.5 ? "trace" : "formule");
}

export function genererExercice113(): Exercice113 {
  return tirer113(Math.random() < 0.5 ? "trace" : "formule");
}
