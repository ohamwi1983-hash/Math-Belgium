import type { ExerciceFrequenceProbabilite } from "../core6e/frequenceProbabilite.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

/**
 * Couche B (6e) — phases de `6gen75`. Les trois familles traversent les MÊMES quatre écrans :
 * 1. probabilité a priori (champ ; en C, choix fermé « impossible a priori ») ;
 * 2. fréquence observée (champ) ;
 * 3. comparer et conclure (choix fermé, une seule tentative) ;
 * 4. effectif attendu sur N nouveaux essais (champ, à l'unité près).
 */
export type PhaseFrequenceProbabilite = "ecran1" | "ecran2" | "ecran3" | "ecran4";

export const PHASES_FREQUENCE_PROBABILITE: PhaseFrequenceProbabilite[] = ["ecran1", "ecran2", "ecran3", "ecran4"];

export function phaseInitiale(): PhaseFrequenceProbabilite {
  return "ecran1";
}

export function phaseApres(phase: PhaseFrequenceProbabilite): PhaseFrequenceProbabilite | "termine" {
  const i = PHASES_FREQUENCE_PROBABILITE.indexOf(phase);
  return i + 1 < PHASES_FREQUENCE_PROBABILITE.length ? PHASES_FREQUENCE_PROBABILITE[i + 1] : "termine";
}

export function phasesPourExercice(_exercice: ExerciceFrequenceProbabilite): PhaseFrequenceProbabilite[] {
  return [...PHASES_FREQUENCE_PROBABILITE];
}

/** Écrans à choix fermé (une seule tentative) : l'écran 3 partout, l'écran 1 en famille C. */
export function estPhaseChoix(exercice: ExerciceFrequenceProbabilite, phase: PhaseFrequenceProbabilite): boolean {
  return phase === "ecran3" || (phase === "ecran1" && exercice.famille === "C");
}

export interface ResultatExerciceFrequenceProbabilite {
  exercice: ExerciceFrequenceProbabilite;
  scores: Partial<Record<PhaseFrequenceProbabilite, number>>;
  revelesPartiels: Partial<Record<PhaseFrequenceProbabilite, boolean>>;
}

export interface EtatSessionFrequenceProbabilite {
  reglages: ReglagesSession6e;
  generateur: () => ExerciceFrequenceProbabilite;
  exerciceCourant: ExerciceFrequenceProbabilite;
  phase: PhaseFrequenceProbabilite;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  scoresPartiels: Partial<Record<PhaseFrequenceProbabilite, number>>;
  revelesPartiels: Partial<Record<PhaseFrequenceProbabilite, boolean>>;
  indexExercice: number;
  resultats: ResultatExerciceFrequenceProbabilite[];
  terminee: boolean;
  /** Vrai si la DERNIÈRE transition d'écran s'est faite par révélation (tentatives épuisées). */
  derniereTransitionRevelee: boolean;
}
