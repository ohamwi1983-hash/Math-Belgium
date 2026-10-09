import type { ExerciceProbabiliteHypergeometrique } from "../core6e/probabiliteHypergeometrique.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

/**
 * Couche B (6e) — types de session pour `6gen47`. Longueur de chaîne d'écrans FIXE par famille
 * (contrairement à 6gen43 où elle variait aussi par sous-type) : A=2 écrans (quel que soit le
 * sous-type aucun/tous/exactement — même formule, seul `k` change), B=3 écrans, C=3 écrans.
 */

export type PhaseProbabiliteHypergeometrique = "aEcran1" | "aEcran2" | "bEcran1" | "bEcran2" | "bEcran3" | "cEcran1" | "cEcran2" | "cEcran3";

export function phaseInitiale(exercice: ExerciceProbabiliteHypergeometrique): PhaseProbabiliteHypergeometrique {
  switch (exercice.famille) {
    case "A":
      return "aEcran1";
    case "B":
      return "bEcran1";
    case "C":
      return "cEcran1";
  }
}

export function phaseApres(phase: PhaseProbabiliteHypergeometrique): PhaseProbabiliteHypergeometrique | "termine" {
  switch (phase) {
    case "aEcran1":
      return "aEcran2";
    case "aEcran2":
      return "termine";
    case "bEcran1":
      return "bEcran2";
    case "bEcran2":
      return "bEcran3";
    case "bEcran3":
      return "termine";
    case "cEcran1":
      return "cEcran2";
    case "cEcran2":
      return "cEcran3";
    case "cEcran3":
      return "termine";
  }
}

/** Liste ORDONNÉE des phases réellement traversées par CET exercice précis — mirroir 6gen43. */
export function phasesPourExercice(exercice: ExerciceProbabiliteHypergeometrique): PhaseProbabiliteHypergeometrique[] {
  const phases: PhaseProbabiliteHypergeometrique[] = [];
  let phase: PhaseProbabiliteHypergeometrique | "termine" = phaseInitiale(exercice);
  while (phase !== "termine") {
    phases.push(phase);
    phase = phaseApres(phase);
  }
  return phases;
}

export interface ResultatExerciceProbabiliteHypergeometrique {
  exercice: ExerciceProbabiliteHypergeometrique;
  scores: Partial<Record<PhaseProbabiliteHypergeometrique, number>>;
}

export interface EtatSessionProbabiliteHypergeometrique {
  reglages: ReglagesSession6e;
  generateur: () => ExerciceProbabiliteHypergeometrique;
  exerciceCourant: ExerciceProbabiliteHypergeometrique;
  phase: PhaseProbabiliteHypergeometrique;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  scoresPartiels: Partial<Record<PhaseProbabiliteHypergeometrique, number>>;
  indexExercice: number;
  resultats: ResultatExerciceProbabiliteHypergeometrique[];
  terminee: boolean;
  derniereTransitionRevelee: boolean;
}
