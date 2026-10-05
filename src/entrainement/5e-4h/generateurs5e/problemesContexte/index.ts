/**
 * Couche A (5e) — point d'entrée de 5gen5 : tirage UNIFORME parmi les 3 scénarios fixes A/B/C
 * (jamais une famille paramétrée abstraite unique — voir CLAUDE.md, section 5gen5).
 */
import type { ExerciceProblemeContexte } from "../../core5e/problemesContexte.types";
import { genererExerciceScenarioA } from "./scenarioA";
import { genererExerciceScenarioB } from "./scenarioB";
import { genererExerciceScenarioC } from "./scenarioC";

export { genererExerciceScenarioA } from "./scenarioA";
export { genererExerciceScenarioB } from "./scenarioB";
export { genererExerciceScenarioC } from "./scenarioC";

const GENERATEURS = [genererExerciceScenarioA, genererExerciceScenarioB, genererExerciceScenarioC];

export function genererExerciceProblemeContexte(): ExerciceProblemeContexte {
  const generateur = GENERATEURS[Math.floor(Math.random() * GENERATEURS.length)];
  return generateur();
}
