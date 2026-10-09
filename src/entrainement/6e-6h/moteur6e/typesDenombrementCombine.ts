import type { ExerciceDenombrementCombine } from "../core6e/denombrementCombine.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

/**
 * Couche B (6e) — types de session pour `6gen44`. Nombre d'écrans CONSTANT par famille (A=2, B=2,
 * C=2, D=3) — contrairement à `6gen43` (famille A à 2 OU 3 écrans selon le sous-type), aucun
 * sous-type de `6gen44` ne fait varier le nombre d'écrans, seulement les CHAMPS affichés à chaque
 * écran (piloté par `ui6e/formatDenombrementCombine.ts`, jamais par ce fichier).
 */

export type PhaseDenombrementCombine = "aEcran1" | "aEcran2" | "bEcran1" | "bEcran2" | "cEcran1" | "cEcran2" | "dEcran1" | "dEcran2" | "dEcran3";

export function phaseInitiale(exercice: ExerciceDenombrementCombine): PhaseDenombrementCombine {
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

export function phaseApres(phase: PhaseDenombrementCombine): PhaseDenombrementCombine | "termine" {
  switch (phase) {
    case "aEcran1":
      return "aEcran2";
    case "aEcran2":
      return "termine";
    case "bEcran1":
      return "bEcran2";
    case "bEcran2":
      return "termine";
    case "cEcran1":
      return "cEcran2";
    case "cEcran2":
      return "termine";
    case "dEcran1":
      return "dEcran2";
    case "dEcran2":
      return "dEcran3";
    case "dEcran3":
      return "termine";
  }
}

/** Liste ORDONNÉE des phases réellement traversées par CET exercice précis — mirroir 6gen43. */
export function phasesPourExercice(exercice: ExerciceDenombrementCombine): PhaseDenombrementCombine[] {
  const phases: PhaseDenombrementCombine[] = [];
  let phase: PhaseDenombrementCombine | "termine" = phaseInitiale(exercice);
  while (phase !== "termine") {
    phases.push(phase);
    phase = phaseApres(phase);
  }
  return phases;
}

export interface ResultatExerciceDenombrementCombine {
  exercice: ExerciceDenombrementCombine;
  scores: Partial<Record<PhaseDenombrementCombine, number>>;
}

export interface EtatSessionDenombrementCombine {
  reglages: ReglagesSession6e;
  generateur: () => ExerciceDenombrementCombine;
  exerciceCourant: ExerciceDenombrementCombine;
  phase: PhaseDenombrementCombine;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  scoresPartiels: Partial<Record<PhaseDenombrementCombine, number>>;
  indexExercice: number;
  resultats: ResultatExerciceDenombrementCombine[];
  terminee: boolean;
  derniereTransitionRevelee: boolean;
}
