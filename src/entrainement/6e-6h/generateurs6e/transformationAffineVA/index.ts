import type { Exercice111, Famille111 } from "../../core6e/transformationAffineVA";
import { tirer111 } from "../../core6e/transformationAffineVA";

/**
 * Couche A — générateur de `6gen111` « Y = aX + b ». `Math.random()` seul (le `?code=` rejoue le
 * tirage). Trois familles de situations : conversions (devise, °C → °F), jeux (mise retranchée,
 * points convertis en euros), grandeurs qui diminuent quand X augmente (prime, carburant restant :
 * a < 0, piège de l'écart-type).
 */

export const CATALOGUE_111: { id: Famille111; label: string }[] = [
  { id: "conversion", label: "Conversion : devise, °C → °F" },
  { id: "jeu", label: "Jeu : mise retranchée, points convertis en euros" },
  { id: "decroissant", label: "a < 0 : prime qui diminue, carburant restant" },
];

const FAMILLES: Famille111[] = ["conversion", "jeu", "decroissant"];

export function construireAvecVariante111(id: string): Exercice111 {
  const v = CATALOGUE_111.find((x) => x.id === id);
  return tirer111(v ? v.id : FAMILLES[Math.floor(Math.random() * 3)]!);
}

export function genererExercice111(): Exercice111 {
  return tirer111(FAMILLES[Math.floor(Math.random() * 3)]!);
}
