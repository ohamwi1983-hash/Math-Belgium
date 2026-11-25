import type { Exercice135, Variante135 } from "../../core6e/foyerDirectrice";
import { tirer135 } from "../../core6e/foyerDirectrice";

/**
 * Couche A — générateur de `6gen135` « Équation depuis foyer, directrice et excentricité ».
 * `Math.random()` seul (le `?code=` rejoue le tirage). La nature (e < 1, e = 1, e > 1) est tirée au tiers
 * dans chaque variante, avant les nombres ; la variante dit seulement la direction de la directrice.
 */

export const CATALOGUE_135: { id: Variante135; label: string }[] = [
  { id: "verticale", label: "Foyer, directrice verticale x = k, excentricité" },
  { id: "horizontale", label: "Foyer, directrice horizontale y = k, excentricité" },
];

const auHasard = (): Variante135 => CATALOGUE_135[Math.floor(Math.random() * CATALOGUE_135.length)]!.id;

export function construireAvecVariante135(id: string): Exercice135 {
  const v = CATALOGUE_135.find((x) => x.id === id);
  return tirer135(v ? v.id : auHasard());
}

export function genererExercice135(): Exercice135 {
  return tirer135(auHasard());
}
