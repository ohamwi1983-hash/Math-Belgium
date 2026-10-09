import type { ExercicePointsDroitesRemarquablesTriangle } from "../core6e/pointsDroitesRemarquablesTriangle.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

/**
 * Couche B (6e) — types de session pour `6gen54`. Longueur de chaîne d'écrans FIXE par famille
 * (A=2, B=3, C=3, D=4, E=2, F=3, G=3 quel que soit le sous-type, H=2) — mirroir du patron
 * `typesDenombrementFondamental.ts` (6gen43).
 */

export type PhasePointsDroitesRemarquablesTriangle =
  | "aEcran1"
  | "aEcran2"
  | "bEcran1"
  | "bEcran2"
  | "bEcran3"
  | "cEcran1"
  | "cEcran2"
  | "cEcran3"
  | "dEcran1"
  | "dEcran2"
  | "dEcran3"
  | "dEcran4"
  | "eEcran1"
  | "eEcran2"
  | "fEcran1"
  | "fEcran2"
  | "fEcran3"
  | "gEcran1"
  | "gEcran2"
  | "gEcran3"
  | "hEcran1"
  | "hEcran2";

export function phaseInitiale(exercice: ExercicePointsDroitesRemarquablesTriangle): PhasePointsDroitesRemarquablesTriangle {
  switch (exercice.famille) {
    case "A":
      return "aEcran1";
    case "B":
      return "bEcran1";
    case "C":
      return "cEcran1";
    case "D":
      return "dEcran1";
    case "E":
      return "eEcran1";
    case "F":
      return "fEcran1";
    case "G":
      return "gEcran1";
    case "H":
      return "hEcran1";
  }
}

export function phaseApres(phase: PhasePointsDroitesRemarquablesTriangle): PhasePointsDroitesRemarquablesTriangle | "termine" {
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
    case "dEcran1":
      return "dEcran2";
    case "dEcran2":
      return "dEcran3";
    case "dEcran3":
      return "dEcran4";
    case "dEcran4":
      return "termine";
    case "eEcran1":
      return "eEcran2";
    case "eEcran2":
      return "termine";
    case "fEcran1":
      return "fEcran2";
    case "fEcran2":
      return "fEcran3";
    case "fEcran3":
      return "termine";
    case "gEcran1":
      return "gEcran2";
    case "gEcran2":
      return "gEcran3";
    case "gEcran3":
      return "termine";
    case "hEcran1":
      return "hEcran2";
    case "hEcran2":
      return "termine";
  }
}

/** Liste ORDONNÉE des phases réellement traversées par CET exercice précis — mirroir 6gen43. */
export function phasesPourExercice(exercice: ExercicePointsDroitesRemarquablesTriangle): PhasePointsDroitesRemarquablesTriangle[] {
  const phases: PhasePointsDroitesRemarquablesTriangle[] = [];
  let phase: PhasePointsDroitesRemarquablesTriangle | "termine" = phaseInitiale(exercice);
  while (phase !== "termine") {
    phases.push(phase);
    phase = phaseApres(phase);
  }
  return phases;
}

export interface ResultatExercicePointsDroitesRemarquablesTriangle {
  exercice: ExercicePointsDroitesRemarquablesTriangle;
  scores: Partial<Record<PhasePointsDroitesRemarquablesTriangle, number>>;
}

export interface EtatSessionPointsDroitesRemarquablesTriangle {
  reglages: ReglagesSession6e;
  generateur: () => ExercicePointsDroitesRemarquablesTriangle;
  exerciceCourant: ExercicePointsDroitesRemarquablesTriangle;
  phase: PhasePointsDroitesRemarquablesTriangle;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  scoresPartiels: Partial<Record<PhasePointsDroitesRemarquablesTriangle, number>>;
  indexExercice: number;
  resultats: ResultatExercicePointsDroitesRemarquablesTriangle[];
  terminee: boolean;
  derniereTransitionRevelee: boolean;
}
