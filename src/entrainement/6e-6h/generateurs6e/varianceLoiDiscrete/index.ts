import type { Exercice110, Variante110 } from "../../core6e/varianceLoiDiscrete";
import { tirer110 } from "../../core6e/varianceLoiDiscrete";

/**
 * Couche A — générateur de `6gen110` « Variance et écart-type d'une loi discrète ». `Math.random()`
 * seul (le `?code=` rejoue le tirage). Deux variantes : `calcul` (E, E(X²), V par König, σ décimal
 * exact) et `risque` (deux jeux de même espérance : lequel est le plus risqué ? verdict tiré à parts
 * égales avant les lois).
 */

export const CATALOGUE_110: { id: Variante110; label: string }[] = [
  { id: "calcul", label: "Calcul : E(X), E(X²), V(X) par König, σ(X)" },
  { id: "risque", label: "Deux jeux de même espérance : lequel est le plus risqué ?" },
];

export function construireAvecVariante110(id: string): Exercice110 {
  const v = CATALOGUE_110.find((x) => x.id === id);
  return tirer110(v ? v.id : Math.random() < 0.5 ? "calcul" : "risque");
}

export function genererExercice110(): Exercice110 {
  return tirer110(Math.random() < 0.5 ? "calcul" : "risque");
}
