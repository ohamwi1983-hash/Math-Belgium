import type { ExerciceRacinesNiemes } from "../core6e/racinesNiemes.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

/**
 * Couche B (6e) — types de session pour `6gen39`. Longueur de chaîne d'écrans fixe PAR FAMILLE (3
 * pour A, 2 pour B, 3 pour C) — mirroir `typesFormeTrigonometrique.ts` (6gen37).
 */

export type PhaseRacinesNiemes = "aEcran1" | "aEcran2" | "aEcran3" | "bEcran1" | "bEcran2" | "cEcran1" | "cEcran2" | "cEcran3";

export function phaseInitiale(exercice: ExerciceRacinesNiemes): PhaseRacinesNiemes {
  switch (exercice.famille) {
    case "A":
      return "aEcran1";
    case "B":
      return "bEcran1";
    case "C":
      return "cEcran1";
  }
}

export function phaseApres(phase: PhaseRacinesNiemes): PhaseRacinesNiemes | "termine" {
  switch (phase) {
    case "aEcran1":
      return "aEcran2";
    case "aEcran2":
      return "aEcran3";
    case "aEcran3":
      return "termine";
    case "bEcran1":
      return "bEcran2";
    case "bEcran2":
      return "termine";
    case "cEcran1":
      return "cEcran2";
    case "cEcran2":
      return "cEcran3";
    case "cEcran3":
      return "termine";
  }
}

/** Liste ORDONNÉE des phases réellement traversées par CET exercice précis — mirroir 6gen37. */
export function phasesPourExercice(exercice: ExerciceRacinesNiemes): PhaseRacinesNiemes[] {
  const phases: PhaseRacinesNiemes[] = [];
  let phase: PhaseRacinesNiemes | "termine" = phaseInitiale(exercice);
  while (phase !== "termine") {
    phases.push(phase);
    phase = phaseApres(phase);
  }
  return phases;
}

export interface ResultatExerciceRacinesNiemes {
  exercice: ExerciceRacinesNiemes;
  scores: Partial<Record<PhaseRacinesNiemes, number>>;
}

export interface EtatSessionRacinesNiemes {
  reglages: ReglagesSession6e;
  generateur: () => ExerciceRacinesNiemes;
  exerciceCourant: ExerciceRacinesNiemes;
  phase: PhaseRacinesNiemes;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  scoresPartiels: Partial<Record<PhaseRacinesNiemes, number>>;
  indexExercice: number;
  resultats: ResultatExerciceRacinesNiemes[];
  terminee: boolean;
  derniereTransitionRevelee: boolean;
}
