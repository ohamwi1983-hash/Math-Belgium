import type { Exercice137, Variante137 } from "../../core6e/hyperboleEquilatere";
import { tirer137 } from "../../core6e/hyperboleEquilatere";

/** Couche A — générateur de `6gen137` « Hyperbole équilatère et xy = k ». `Math.random()` seul (le
 * `?code=` rejoue le tirage). */

export const CATALOGUE_137: { id: Variante137; label: string }[] = [
  { id: "versXY", label: "De x² − y² = a² à XY = k (repère des asymptotes)" },
  { id: "versX2Y2", label: "De xy = k à X² − Y² = a² : sommets et foyers" },
];

const auHasard = (): Variante137 => CATALOGUE_137[Math.floor(Math.random() * CATALOGUE_137.length)]!.id;

export function construireAvecVariante137(id: string): Exercice137 {
  const v = CATALOGUE_137.find((x) => x.id === id);
  return tirer137(v ? v.id : auHasard());
}

export function genererExercice137(): Exercice137 {
  return tirer137(auHasard());
}
