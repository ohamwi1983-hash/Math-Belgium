import type { ExerciceOptimiserLog } from "../core6e/optimiserModeleLog.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

/**
 * Couche B (6e) — types de session de `6gen91` « Optimiser un modèle logarithmique ». Chaîne FIXE
 * de 5 écrans pour toutes les variantes :
 * 1. `domaine` — domaine du modèle DANS LE CONTEXTE (crochets + bornes) ;
 * 2. `derivee` — expression de la dérivée ;
 * 3. `zero` — valeur EXACTE qui annule la dérivée (fraction, e, eᵏ…) ;
 * 4. `nature` — choix fermé (UNE tentative) : signe de la dérivée de part et d'autre, maximum ou
 *    minimum ;
 * 5. `valeur` — optimum et valeur optimale traduits dans les unités du contexte (précision annoncée).
 */

export type PhaseOptimiserLog = "domaine" | "derivee" | "zero" | "nature" | "valeur";

export const PHASES_OPTIMISER_LOG: PhaseOptimiserLog[] = ["domaine", "derivee", "zero", "nature", "valeur"];

export function phaseApres(phase: PhaseOptimiserLog): PhaseOptimiserLog | "termine" {
  const i = PHASES_OPTIMISER_LOG.indexOf(phase);
  return i < PHASES_OPTIMISER_LOG.length - 1 ? PHASES_OPTIMISER_LOG[i + 1] : "termine";
}

/** Seul écran à choix fermé (une seule tentative). */
export function estPhaseChoix(phase: PhaseOptimiserLog): boolean {
  return phase === "nature";
}

export interface EtatSessionOptimiserLog {
  reglages: ReglagesSession6e;
  generateur: () => ExerciceOptimiserLog;
  exerciceCourant: ExerciceOptimiserLog;
  phase: PhaseOptimiserLog;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  revelesPartiels: Partial<Record<PhaseOptimiserLog, boolean>>;
  aidePartiels: Partial<Record<PhaseOptimiserLog, boolean>>;
  derniereTransitionRevelee: boolean;
  indexExercice: number;
  terminee: boolean;
}
