/**
 * Couche présentation (5e) — géométrie + accesseurs f(x)/g(x) du graphe Mafs des combos réduits
 * (2-5) du scénario A (5gen5). `src/ui5e/` peut dépendre de `src/generateurs5e/` (seule
 * `src/moteur5e/` ne le peut jamais) — réutilise directement les formules de Couche A.
 */
import type { ExerciceScenarioA } from "../core5e/problemesContexte.types";
import { fIntensiteCable, fParabole, fRacineAffine, fStockCommande, gIntensiteCable, gRacineAffine, gStockCommande } from "../generateurs5e/problemesContexte/scenarioA";

export type ExerciceScenarioAReduit = Exclude<ExerciceScenarioA, { combo: "kInverseXAxCarre" }>;

export function fDeX(exercice: ExerciceScenarioAReduit, x: number): number {
  switch (exercice.combo) {
    case "stockCommande":
      return fStockCommande(exercice.a, exercice.b, x);
    case "racineAffine":
      return fRacineAffine(exercice.k, x);
    case "intensiteCable":
      return fIntensiteCable(exercice.k, x);
    case "deuxParaboles":
      return fParabole(exercice.a1, exercice.b1, exercice.c1, x);
  }
}

export function gDeX(exercice: ExerciceScenarioAReduit, x: number): number {
  switch (exercice.combo) {
    case "stockCommande":
      return gStockCommande(exercice.k, x);
    case "racineAffine":
      return gRacineAffine(exercice.a, exercice.b, x);
    case "intensiteCable":
      return gIntensiteCable(exercice.a, x);
    case "deuxParaboles":
      return fParabole(exercice.a2, exercice.b2, exercice.c2, x);
  }
}

/** true si f (ou g) diverge en x=0 (combos avec un terme en 1/x ou 1/x²) — le domaine affiché
 * doit alors démarrer nettement après 0. */
function divergeEnZero(exercice: ExerciceScenarioAReduit): boolean {
  return exercice.combo === "stockCommande" || exercice.combo === "intensiteCable";
}

export interface DomaineGrapheScenarioAReduit {
  xMin: number;
  xMax: number;
  yMax: number;
}

/**
 * `xMax` est TOUJOURS celui calculé à la génération (`exercice.xMax`, voir
 * `generateurs5e/problemesContexte/scenarioA.ts`) — jamais recalculé ici : pour le combo
 * `deuxParaboles` notamment, cette valeur garantit par construction qu'aucune 2e traversée
 * f(x)=g(x) n'apparaît dans la fenêtre affichée.
 */
export function domaineGrapheScenarioAReduit(exercice: ExerciceScenarioAReduit): DomaineGrapheScenarioAReduit {
  const { xMax } = exercice;
  const xMin = divergeEnZero(exercice) ? Math.min(exercice.xIntersection, exercice.xExtremum) * 0.25 : 0;
  let yMax = 0;
  for (let j = 0; j <= 40; j++) {
    const x = xMin + ((xMax - xMin) * j) / 40;
    const somme = fDeX(exercice, x) + gDeX(exercice, x);
    if (Number.isFinite(somme) && somme > yMax) yMax = somme;
  }
  return { xMin, xMax, yMax: yMax * 1.15 };
}
