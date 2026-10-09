import type { ExerciceCercles } from "../core6e/cercles.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

/**
 * Couche B (6e) — types de session pour `6gen55`. Longueur de chaîne d'écrans FIXE par famille : 3
 * écrans pour A à F, 4 écrans pour G (mirroir du patron `typesIntegralesProblemes.ts`/
 * `typesDenombrementFondamental.ts` — pas de sous-type ici, contrairement à `6gen43`, donc pas de
 * branchement supplémentaire).
 */

export type PhaseCercles =
  | "aEcran1"
  | "aEcran2"
  | "aEcran3"
  | "bEcran1"
  | "bEcran2"
  | "bEcran3"
  | "cEcran1"
  | "cEcran2"
  | "cEcran3"
  | "dEcran1"
  | "dEcran2"
  | "dEcran3"
  | "eEcran1"
  | "eEcran2"
  | "eEcran3"
  | "fEcran1"
  | "fEcran2"
  | "fEcran3"
  | "gEcran1"
  | "gEcran2"
  | "gEcran3"
  | "gEcran4";

export function phaseInitiale(exercice: ExerciceCercles): PhaseCercles {
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
  }
}

export function phaseApres(phase: PhaseCercles): PhaseCercles | "termine" {
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
      return "termine";
    case "eEcran1":
      return "eEcran2";
    case "eEcran2":
      return "eEcran3";
    case "eEcran3":
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
      return "gEcran4";
    case "gEcran4":
      return "termine";
  }
}

/** Liste ORDONNÉE des phases réellement traversées par CET exercice précis. */
export function phasesPourExercice(exercice: ExerciceCercles): PhaseCercles[] {
  const phases: PhaseCercles[] = [];
  let phase: PhaseCercles | "termine" = phaseInitiale(exercice);
  while (phase !== "termine") {
    phases.push(phase);
    phase = phaseApres(phase);
  }
  return phases;
}

export interface ResultatExerciceCercles {
  exercice: ExerciceCercles;
  scores: Partial<Record<PhaseCercles, number>>;
}

export interface EtatSessionCercles {
  reglages: ReglagesSession6e;
  generateur: () => ExerciceCercles;
  exerciceCourant: ExerciceCercles;
  phase: PhaseCercles;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  scoresPartiels: Partial<Record<PhaseCercles, number>>;
  indexExercice: number;
  resultats: ResultatExerciceCercles[];
  terminee: boolean;
  derniereTransitionRevelee: boolean;
}
