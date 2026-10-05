/**
 * Couche présentation (5e) — géométrie du graphe Mafs à 3 courbes de 5gen5, scénario A
 * (f=aire latérale, g=aire des bases, f+g). `src/ui5e/` peut dépendre de `src/generateurs5e/`
 * (seule `src/moteur5e/` ne le peut jamais) — réutilise directement les formules de Couche A,
 * aucune duplication nécessaire ici.
 */
import type { ExerciceScenarioAConteneur } from "../core5e/problemesContexte.types";
import { aireBasesCylindre, aireLateraleCylindre } from "../generateurs5e/problemesContexte/scenarioA";

export interface DomaineGrapheScenarioA {
  xMin: number;
  xMax: number;
  yMax: number;
}

function sommeAires(volumeCm3: number, x: number): number {
  return aireLateraleCylindre(volumeCm3, x) + aireBasesCylindre(x);
}

/**
 * Fenêtre choisie autour de xOptimal/xEgaliteAires (jamais depuis x=0, où f=2V/x diverge) —
 * yMax dérivé de 2.2× la somme au minimum, marge vérifiée empiriquement suffisante pour que la
 * zone [xOptimal, xEgaliteAires×1.8] reste entièrement visible sur toute la plage de V generée
 * (1000 à 3000 cm³, voir `scenarioAGraph.test.ts`).
 */
export function domaineGrapheScenarioA(exercice: ExerciceScenarioAConteneur): DomaineGrapheScenarioA {
  const { volumeCm3, xOptimal, xEgaliteAires } = exercice;
  const xMin = xOptimal * 0.3;
  const xMax = xEgaliteAires * 1.8;
  const yMax = sommeAires(volumeCm3, xOptimal) * 2.2;
  return { xMin, xMax, yMax };
}
