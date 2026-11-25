import type { Exercice133, Variante133 } from "../../core6e/representerConique";
import { tirer133 } from "../../core6e/representerConique";

/**
 * Couche A — générateur de `6gen133` « Représenter une conique ». `Math.random()` seul (le `?code=`
 * rejoue le tirage). La nature se lit sur l'équation donnée : ce n'est pas un verdict, elle peut nommer
 * la variante.
 */

export const CATALOGUE_133: { id: Variante133; label: string }[] = [
  { id: "ellipse", label: "Représenter une ellipse (centre, sommets, foyers)" },
  { id: "hyperbole", label: "Représenter une hyperbole (centre, sommets, foyers, asymptotes)" },
  { id: "parabole", label: "Représenter une parabole (sommet, foyer, directrice)" },
];

const auHasard = (): Variante133 => CATALOGUE_133[Math.floor(Math.random() * CATALOGUE_133.length)]!.id;

export function construireAvecVariante133(id: string): Exercice133 {
  const v = CATALOGUE_133.find((x) => x.id === id);
  return tirer133(v ? v.id : auHasard());
}

export function genererExercice133(): Exercice133 {
  return tirer133(auHasard());
}
