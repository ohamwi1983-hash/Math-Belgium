import type { ExerciceDefinirSuite } from "../core5e/definirSuite";
import type { ReglagesSession5e } from "../core5e/session5e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

/**
 * Couche B (5e) — types de session de `5gen44` « Définir et reconnaître une suite ». Chaîne
 * d'écrans propre à chaque variante (toujours trois écrans : le nombre de puces ne trahit jamais
 * le verdict) :
 * - notations : `suivant` (uₙ₊₁) → `autre` (u₂ₙ ou uₙ₋₁) → `terme` (uₚ) ;
 * - recurrence : `terme2` → `terme3` → `terme4` ;
 * - nature-formule, nature-recurrence : `difference` → `quotient` → `verdict` (choix fermé) ;
 * - nature-termes : `ecarts` → `rapports` → `verdict` (choix fermé).
 */

export type PhaseDefinirSuite = "suivant" | "autre" | "terme" | "terme2" | "terme3" | "terme4" | "difference" | "quotient" | "ecarts" | "rapports" | "verdict";

export function phasesPourExercice(e: ExerciceDefinirSuite): PhaseDefinirSuite[] {
  switch (e.variante) {
    case "notations":
      return ["suivant", "autre", "terme"];
    case "recurrence":
      return ["terme2", "terme3", "terme4"];
    case "nature-formule":
    case "nature-recurrence":
      return ["difference", "quotient", "verdict"];
    case "nature-termes":
      return ["ecarts", "rapports", "verdict"];
  }
}

export function phaseApres(e: ExerciceDefinirSuite, phase: PhaseDefinirSuite): PhaseDefinirSuite | "termine" {
  const phases = phasesPourExercice(e);
  const i = phases.indexOf(phase);
  return i < phases.length - 1 ? phases[i + 1] : "termine";
}

/** Seul écran à choix fermé : une seule tentative (règle permanente du site). */
export function estPhaseChoix(phase: PhaseDefinirSuite): boolean {
  return phase === "verdict";
}

export interface EtatSessionDefinirSuite {
  reglages: ReglagesSession5e;
  generateur: () => ExerciceDefinirSuite;
  exerciceCourant: ExerciceDefinirSuite;
  phase: PhaseDefinirSuite;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  revelesPartiels: Partial<Record<PhaseDefinirSuite, boolean>>;
  derniereTransitionRevelee: boolean;
  indexExercice: number;
  terminee: boolean;
}
