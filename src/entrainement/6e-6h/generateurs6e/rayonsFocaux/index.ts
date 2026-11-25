import type { Exercice136, Variante136 } from "../../core6e/rayonsFocaux";
import { tirer136 } from "../../core6e/rayonsFocaux";

/**
 * Couche A — générateur de `6gen136` « Rayons focaux et triangle focal ». `Math.random()` seul (le
 * `?code=` rejoue le tirage). Variante `aire` : l'existence du point P (verdict) est tirée à parts
 * égales avant l'ellipse et l'angle.
 */

export const CATALOGUE_136: { id: Variante136; label: string }[] = [
  { id: "rayons", label: "Rayons focaux d'un point : |PF| = a − ex, |PF′| = a + ex" },
  { id: "aire", label: "Triangle focal : existence du point, aire b²·tan(θ/2)" },
];

const auHasard = (): Variante136 => CATALOGUE_136[Math.floor(Math.random() * CATALOGUE_136.length)]!.id;

export function construireAvecVariante136(id: string): Exercice136 {
  const v = CATALOGUE_136.find((x) => x.id === id);
  return tirer136(v ? v.id : auHasard());
}

export function genererExercice136(): Exercice136 {
  return tirer136(auHasard());
}
