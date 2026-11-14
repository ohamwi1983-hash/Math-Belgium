import type { ExerciceIntegraleGraphique } from "../core6e/integraleGraphique.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

/**
 * Couche B (6e) — types de session de `6gen77` « L'intégrale lue sur un graphique ». Chaîne FIXE de
 * 3 écrans pour les trois variantes (le contenu de chaque écran dépend de la variante) :
 * - `calcul` : découpe (choix multiple) → intégrale de chaque morceau → somme ;
 * - `aireIntegrale` : changements de signe (choix multiple) → intégrale sur chaque intervalle de
 *   signe constant → l'intégrale ET l'aire ;
 * - `proprietes` : lecture de l'intégrale sur la partie connue → additivité → bornes inversées.
 */

export type PhaseIntegraleGraphique = "ecran1" | "ecran2" | "ecran3";

export const PHASES_INTEGRALE_GRAPHIQUE: PhaseIntegraleGraphique[] = ["ecran1", "ecran2", "ecran3"];

export function phaseApres(phase: PhaseIntegraleGraphique): PhaseIntegraleGraphique | "termine" {
  const i = PHASES_INTEGRALE_GRAPHIQUE.indexOf(phase);
  return i < PHASES_INTEGRALE_GRAPHIQUE.length - 1 ? PHASES_INTEGRALE_GRAPHIQUE[i + 1] : "termine";
}

/** Écran à choix fermé (sélection des abscisses de découpe) : une seule tentative. */
export function estPhaseChoix(e: ExerciceIntegraleGraphique, phase: PhaseIntegraleGraphique): boolean {
  return phase === "ecran1" && e.variante !== "proprietes";
}

export interface EtatSessionIntegraleGraphique {
  reglages: ReglagesSession6e;
  generateur: () => ExerciceIntegraleGraphique;
  exerciceCourant: ExerciceIntegraleGraphique;
  phase: PhaseIntegraleGraphique;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  revelesPartiels: Partial<Record<PhaseIntegraleGraphique, boolean>>;
  derniereTransitionRevelee: boolean;
  indexExercice: number;
  terminee: boolean;
}
