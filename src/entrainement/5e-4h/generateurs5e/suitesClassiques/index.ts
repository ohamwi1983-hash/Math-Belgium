import type { ExerciceSuiteClassique, ScenarioSuiteClassique } from "../../core5e/suitesClassiques.types";
import { construireCarresEmboites } from "./carresEmboites";
import { construireEchiquier } from "./echiquier";
import { construireFibonacci } from "./fibonacci";
import { construirePapyrusRhind } from "./papyrusRhind";
import { construireSuitesCombinees } from "./suitesCombinees";
import { construireTrianglesZigzag } from "./trianglesZigzag";
import { construireVitesse } from "./vitesse";

export const CATALOGUE_SCENARIOS: { id: ScenarioSuiteClassique; label: string }[] = [
  { id: "echiquier", label: "L'échiquier et les grains de blé" },
  { id: "papyrusRhind", label: "Le papyrus de Rhind" },
  { id: "suitesCombinees", label: "Suite arithmétique et géométrique combinées" },
  { id: "vitesse", label: "À toute allure" },
  { id: "fibonacci", label: "La suite de Fibonacci" },
  { id: "trianglesZigzag", label: "Triangles emboîtés et zigzag" },
  { id: "carresEmboites", label: "Des carrés emboîtés" },
];

export function construireAvecScenarioId(scenarioId: ScenarioSuiteClassique): ExerciceSuiteClassique {
  switch (scenarioId) {
    case "echiquier":
      return construireEchiquier();
    case "papyrusRhind":
      return construirePapyrusRhind();
    case "suitesCombinees":
      return construireSuitesCombinees();
    case "vitesse":
      return construireVitesse();
    case "fibonacci":
      return construireFibonacci();
    case "trianglesZigzag":
      return construireTrianglesZigzag();
    case "carresEmboites":
      return construireCarresEmboites();
  }
}

/** Instance FIXE par scénario (aucun paramètre aléatoire) — seul le SCÉNARIO tiré varie, uniformément
 * parmi les 7 (même principe que les 3 scénarios de 5gen5). */
export function genererExerciceSuiteClassique(): ExerciceSuiteClassique {
  const scenarios = CATALOGUE_SCENARIOS.map((s) => s.id);
  const id = scenarios[Math.floor(Math.random() * scenarios.length)];
  return construireAvecScenarioId(id);
}
