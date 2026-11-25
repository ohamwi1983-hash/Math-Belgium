import type { Exercice114, Nature114 } from "../../core6e/discreteOuContinue";
import { tirer114 } from "../../core6e/discreteOuContinue";

/**
 * Couche A — générateur de `6gen114` « Discrète ou continue ? ». `Math.random()` seul (le `?code=`
 * rejoue le tirage). La nature (verdict) est tirée à parts égales AVANT la situation ; les deux
 * variantes portent le nom de la nature → un groupe à verdict les réunit dans le panneau d'évaluation.
 */

export const CATALOGUE_114: { id: Nature114; label: string }[] = [
  { id: "discrete", label: "Variable discrète (comptage, mesure arrondie, comptage sans maximum)" },
  { id: "continue", label: "Variable continue (temps, masse, distance, angle exacts)" },
];

export function construireAvecVariante114(id: string): Exercice114 {
  const v = CATALOGUE_114.find((x) => x.id === id);
  return tirer114(v ? v.id : Math.random() < 0.5 ? "discrete" : "continue");
}

export function genererExercice114(): Exercice114 {
  return tirer114(Math.random() < 0.5 ? "discrete" : "continue");
}
