/**
 * Couche présentation (5e) — géométrie du graphe Mafs à 5 courbes de 5gen5, scénario C
 * (CF, CV, CP, CT, CA). Plus de séries que le graphe du scénario A (voir `scenarioAGraph.ts`) —
 * attention particulière portée à la lisibilité (spec explicite), vérifiée par balayage complet des
 * plages de coefficients dans `scenarioCGraph.test.ts`.
 */
import type { ExerciceScenarioC } from "../core5e/problemesContexte.types";
import { chiffreAffaires, coutTotal } from "../generateurs5e/problemesContexte/scenarioC";

export interface DomaineGrapheScenarioC {
  xMin: number;
  xMax: number;
  yMax: number;
}

/** yMax couvre la plus grande des 2 courbes "extrêmes" (CA, toujours la plus pentue puisque
 * p>m ; CT) à x=xMax, avec une marge de 15%. */
export function domaineGrapheScenarioC(exercice: ExerciceScenarioC): DomaineGrapheScenarioC {
  const { formeCV, formeCA, cf, k, m, p, xMax } = exercice;
  const ct = coutTotal(cf, formeCV, k, m, xMax);
  const ca = chiffreAffaires(formeCA, p, xMax);
  const yMax = Math.max(ct, ca) * 1.15;
  return { xMin: 0, xMax, yMax };
}
