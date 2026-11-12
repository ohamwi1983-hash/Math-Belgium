import type { ExerciceParadoxesProbabilites } from "../core6e/paradoxesProbabilites.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

/**
 * Couche B (6e) — types de session de `6gen76` « Quand l'intuition se trompe ». Chaîne FIXE de
 * 4 écrans pour les trois familles (fiche P3) :
 * 1. `prediction` — choix fermé, NON noté, une seule tentative (confronter l'intuition) ;
 * 2. `modeliser` — événement contraire / arbre de ce que sait l'animateur / univers restreint ;
 * 3. `calculer` ;
 * 4. `conclure` — choix fermé, une seule tentative.
 */

export type PhaseParadoxe = "prediction" | "modeliser" | "calculer" | "conclure";

export const PHASES_PARADOXE: PhaseParadoxe[] = ["prediction", "modeliser", "calculer", "conclure"];

export function phaseApres(phase: PhaseParadoxe): PhaseParadoxe | "termine" {
  const i = PHASES_PARADOXE.indexOf(phase);
  return i < PHASES_PARADOXE.length - 1 ? PHASES_PARADOXE[i + 1] : "termine";
}

/** Écrans à choix fermé (une seule tentative) — les autres sont des champs libres. */
export function estPhaseChoix(phase: PhaseParadoxe): boolean {
  return phase === "prediction" || phase === "conclure";
}

export interface EtatSessionParadoxes {
  reglages: ReglagesSession6e;
  generateur: () => ExerciceParadoxesProbabilites;
  exerciceCourant: ExerciceParadoxesProbabilites;
  phase: PhaseParadoxe;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  /** Identifiant de l'option choisie à l'écran de prédiction (rappelé dans le récapitulatif). */
  prediction: string | null;
  revelesPartiels: Partial<Record<PhaseParadoxe, boolean>>;
  derniereTransitionRevelee: boolean;
  indexExercice: number;
  terminee: boolean;
}
