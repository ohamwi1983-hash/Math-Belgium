import type { ExerciceLirePlacer } from "../core6e/lirePlacerPlanComplexe.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

/**
 * Couche B (6e) — types de session de `6gen95` « Lire et placer dans le plan complexe ». Chaîne
 * FIXE de 5 écrans pour toutes les variantes :
 * 1. `lire` — affixe z de A (et w de B) lue sur la figure (champs libres, 3 tentatives) ;
 * 2. `placer1` — placer P, image de A par la 1re opération (clic/glisser sur le quadrillage) ;
 * 3. `placer2` — placer Q, image par la 2e opération ;
 * 4. `associer` — transformation de chaque opération (choix fermé, UNE tentative) ;
 * 5. `moduleArgument` — |z_C| exact et un argument de z_C (radians, à 2kπ près).
 */

export type PhaseLirePlacer = "lire" | "placer1" | "placer2" | "associer" | "moduleArgument";

export const PHASES_LIRE_PLACER: PhaseLirePlacer[] = ["lire", "placer1", "placer2", "associer", "moduleArgument"];

export function phaseApres(phase: PhaseLirePlacer): PhaseLirePlacer | "termine" {
  const i = PHASES_LIRE_PLACER.indexOf(phase);
  return i < PHASES_LIRE_PLACER.length - 1 ? PHASES_LIRE_PLACER[i + 1] : "termine";
}

export function estPhaseChoix(phase: PhaseLirePlacer): boolean {
  return phase === "associer";
}

export function estPhasePlacement(phase: PhaseLirePlacer): boolean {
  return phase === "placer1" || phase === "placer2";
}

export interface EtatSessionLirePlacer {
  reglages: ReglagesSession6e;
  generateur: () => ExerciceLirePlacer;
  exerciceCourant: ExerciceLirePlacer;
  phase: PhaseLirePlacer;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  revelesPartiels: Partial<Record<PhaseLirePlacer, boolean>>;
  aidePartiels: Partial<Record<PhaseLirePlacer, boolean>>;
  derniereTransitionRevelee: boolean;
  indexExercice: number;
  terminee: boolean;
}
