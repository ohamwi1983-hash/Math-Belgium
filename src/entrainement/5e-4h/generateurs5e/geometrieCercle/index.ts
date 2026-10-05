/**
 * Couche A (5e) — point d'entrée de 5gen12 ("Problèmes de géométrie du cercle"). Catalogue
 * `{id,label}` + `construireAvecScenarioId` (convention "Catalogue de variantes" déjà établie sur
 * la plateforme) — tirage UNIFORME parmi les 3 scénarios survivants pour le générateur "brut" (A2
 * "terrain de jeu" et A4 "fragment de plat" supprimés).
 */
import type { ExerciceGeometrieCercle, ScenarioGeometrieCercle } from "../../core5e/geometrieCercle.types";
import { genererExerciceLentille } from "./lentille";
import { genererExerciceSecteurBalaye } from "./secteurBalaye";
import { genererExerciceSegmentCirculaire } from "./segmentCirculaire";

export const CATALOGUE_SCENARIOS: { id: ScenarioGeometrieCercle; label: string }[] = [
  { id: "secteurBalaye", label: "Secteur balayé (essuie-glace)" },
  { id: "segmentCirculaire", label: "Segment circulaire" },
  { id: "lentille", label: "Lentille (deux cercles sécants)" },
];

const CONSTRUCTEURS: Record<ScenarioGeometrieCercle, () => ExerciceGeometrieCercle> = {
  secteurBalaye: genererExerciceSecteurBalaye,
  segmentCirculaire: genererExerciceSegmentCirculaire,
  lentille: genererExerciceLentille,
};

export function construireAvecScenarioId(scenarioId: ScenarioGeometrieCercle): ExerciceGeometrieCercle {
  return CONSTRUCTEURS[scenarioId]();
}

export function genererExerciceGeometrieCercle(): ExerciceGeometrieCercle {
  const entree = CATALOGUE_SCENARIOS[Math.floor(Math.random() * CATALOGUE_SCENARIOS.length)];
  return construireAvecScenarioId(entree.id);
}
