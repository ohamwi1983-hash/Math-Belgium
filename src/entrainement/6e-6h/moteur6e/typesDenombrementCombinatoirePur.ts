import type { ExerciceDenombrementCombinatoirePur } from "../core6e/denombrementCombinatoirePur.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

/**
 * Couche B (6e) — types de session pour `6gen46`. Longueur de chaîne d'écrans FIXE par famille
 * (contrairement à `6gen43` où elle variait aussi par sous-type) : A=3 (toujours, quel que soit le
 * sous-type poker), B=2, C=1 (écran unique), D=3.
 */

export type PhaseDenombrementCombinatoirePur = "aEcran1" | "aEcran2" | "aEcran3" | "bEcran1" | "bEcran2" | "cEcran1" | "dEcran1" | "dEcran2" | "dEcran3";

export function phaseInitiale(exercice: ExerciceDenombrementCombinatoirePur): PhaseDenombrementCombinatoirePur {
  switch (exercice.famille) {
    case "A":
      return "aEcran1";
    case "B":
      return "bEcran1";
    case "C":
      return "cEcran1";
    case "D":
      return "dEcran1";
  }
}

export function phaseApres(phase: PhaseDenombrementCombinatoirePur): PhaseDenombrementCombinatoirePur | "termine" {
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
      return "termine";
    case "dEcran1":
      return "dEcran2";
    case "dEcran2":
      return "dEcran3";
    case "dEcran3":
      return "termine";
  }
}

/** Liste ORDONNÉE des phases réellement traversées par CET exercice précis — mirroir 6gen43/6gen44. */
export function phasesPourExercice(exercice: ExerciceDenombrementCombinatoirePur): PhaseDenombrementCombinatoirePur[] {
  const phases: PhaseDenombrementCombinatoirePur[] = [];
  let phase: PhaseDenombrementCombinatoirePur | "termine" = phaseInitiale(exercice);
  while (phase !== "termine") {
    phases.push(phase);
    phase = phaseApres(phase);
  }
  return phases;
}

export interface ResultatExerciceDenombrementCombinatoirePur {
  exercice: ExerciceDenombrementCombinatoirePur;
  scores: Partial<Record<PhaseDenombrementCombinatoirePur, number>>;
}

export interface EtatSessionDenombrementCombinatoirePur {
  reglages: ReglagesSession6e;
  generateur: () => ExerciceDenombrementCombinatoirePur;
  exerciceCourant: ExerciceDenombrementCombinatoirePur;
  phase: PhaseDenombrementCombinatoirePur;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  scoresPartiels: Partial<Record<PhaseDenombrementCombinatoirePur, number>>;
  indexExercice: number;
  resultats: ResultatExerciceDenombrementCombinatoirePur[];
  terminee: boolean;
  derniereTransitionRevelee: boolean;
}
