import type { ExerciceImpedances } from "../core6e/impedancesComplexes";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

/**
 * Couche B (6e) — types de session de `6gen96` « Électricité : impédances complexes ». Cinq
 * écrans : `composants` (impédance complexe de chaque composant réactif) → `totale` (Re Z, Im Z)
 * → `polaire` (|Z| et déphasage φ en degrés) → `intensite` (I = U/|Z|) — champs libres, trois
 * tentatives — puis `nature` (inductif / capacitif / résistif) — choix fermé, UNE tentative.
 */

export type PhaseImpedances = "composants" | "totale" | "polaire" | "intensite" | "nature";

export const PHASES_IMPEDANCES: PhaseImpedances[] = ["composants", "totale", "polaire", "intensite", "nature"];

export function estPhaseChoix(phase: PhaseImpedances): boolean {
  return phase === "nature";
}

export function phaseApres(phase: PhaseImpedances): PhaseImpedances | "termine" {
  const i = PHASES_IMPEDANCES.indexOf(phase);
  return i < PHASES_IMPEDANCES.length - 1 ? PHASES_IMPEDANCES[i + 1] : "termine";
}

export interface EtatSessionImpedances {
  reglages: ReglagesSession6e;
  generateur: () => ExerciceImpedances;
  exerciceCourant: ExerciceImpedances;
  phase: PhaseImpedances;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  revelesPartiels: Partial<Record<PhaseImpedances, boolean>>;
  derniereTransitionRevelee: boolean;
  indexExercice: number;
  terminee: boolean;
}
