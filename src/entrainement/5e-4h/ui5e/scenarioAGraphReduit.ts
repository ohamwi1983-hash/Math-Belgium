/**
 * Couche présentation (5e) — géométrie + accesseurs f(x)/g(x) du graphe Mafs du combo réduit
 * `stockCommande` du scénario A (5gen5). `src/ui5e/` peut dépendre de `src/generateurs5e/` (seule
 * `src/moteur5e/` ne le peut jamais) — réutilise directement les formules de Couche A.
 */
import type { ExerciceScenarioA } from "../core5e/problemesContexte.types";
import { fStockCommande, gStockCommande } from "../generateurs5e/problemesContexte/scenarioA";

export type ExerciceScenarioAReduit = Exclude<ExerciceScenarioA, { combo: "kInverseXAxCarre" }>;

export function fDeX(exercice: ExerciceScenarioAReduit, x: number): number {
  return fStockCommande(exercice.a, exercice.b, x);
}

export function gDeX(exercice: ExerciceScenarioAReduit, x: number): number {
  return gStockCommande(exercice.k, x);
}

export interface DomaineGrapheScenarioAReduit {
  xMin: number;
  xMax: number;
  yMax: number;
}

/**
 * `xMax` est TOUJOURS celui calculé à la génération (`exercice.xMax`, voir
 * `generateurs5e/problemesContexte/scenarioA.ts`) — jamais recalculé ici.
 */
export function domaineGrapheScenarioAReduit(exercice: ExerciceScenarioAReduit): DomaineGrapheScenarioAReduit {
  const { xMax } = exercice;
  // g(x)=k/x diverge en 0 : le domaine affiché démarre nettement après 0.
  const xMin = Math.min(exercice.xIntersection, exercice.xExtremum) * 0.25;
  let yMax = 0;
  for (let j = 0; j <= 40; j++) {
    const x = xMin + ((xMax - xMin) * j) / 40;
    const somme = fDeX(exercice, x) + gDeX(exercice, x);
    if (Number.isFinite(somme) && somme > yMax) yMax = somme;
  }
  return { xMin, xMax, yMax: yMax * 1.15 };
}
