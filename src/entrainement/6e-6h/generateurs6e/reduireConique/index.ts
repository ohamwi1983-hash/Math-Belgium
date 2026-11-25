import type { Exercice134, Variante134 } from "../../core6e/reduireConique";
import { tirer134 } from "../../core6e/reduireConique";

/**
 * Couche A — générateur de `6gen134` « Réduire par translation et donner tous les éléments ».
 * `Math.random()` seul (le `?code=` rejoue le tirage). Tirage libre : nature au tiers, avant les
 * nombres ; les trois variantes (une par nature) forment le groupe à verdict `groupe_nature` du panneau
 * d'évaluation (leur nom dit la réponse de l'écran « nature »).
 */

export const CATALOGUE_134: { id: Variante134; label: string }[] = [
  { id: "ellipse", label: "Ellipse à réduire (centre, sommets, foyers, directrices)" },
  { id: "hyperbole", label: "Hyperbole à réduire (centre, sommets, foyers, asymptotes)" },
  { id: "parabole", label: "Parabole à réduire (sommet, paramètre, foyer, directrice)" },
];

const auHasard = (): Variante134 => CATALOGUE_134[Math.floor(Math.random() * CATALOGUE_134.length)]!.id;

export function construireAvecVariante134(id: string): Exercice134 {
  const v = CATALOGUE_134.find((x) => x.id === id);
  return tirer134(v ? v.id : auHasard());
}

export function genererExercice134(): Exercice134 {
  return tirer134(auHasard());
}
