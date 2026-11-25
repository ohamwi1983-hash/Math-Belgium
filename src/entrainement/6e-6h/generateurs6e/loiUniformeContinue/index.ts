import type { Exercice115, Variante115 } from "../../core6e/loiUniformeContinue";
import { tirer115 } from "../../core6e/loiUniformeContinue";

/**
 * Couche A — générateur de `6gen115` « Loi uniforme continue » (reprend l'ancienne famille E de
 * 6gen52, enrichie : a ≠ 0, intervalle qui déborde, E, V, σ, et le sens inverse). `Math.random()` seul
 * (le `?code=` rejoue le tirage).
 */

export const CATALOGUE_115: { id: Variante115; label: string }[] = [
  { id: "direct", label: "Densité, probabilité (intervalle qui peut déborder), E, V, σ" },
  { id: "inverse", label: "Retrouver a et b à partir de E et V, puis une probabilité" },
];

export function construireAvecVariante115(id: string): Exercice115 {
  const v = CATALOGUE_115.find((x) => x.id === id);
  return tirer115(v ? v.id : Math.random() < 0.5 ? "direct" : "inverse");
}

export function genererExercice115(): Exercice115 {
  return tirer115(Math.random() < 0.5 ? "direct" : "inverse");
}
