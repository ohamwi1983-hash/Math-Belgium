import type { ExerciceComplexesAvances } from "../core6e/complexesAvances.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

/**
 * Couche B (6e) — types de session pour `6gen42`. Contrairement à `typesFormeTrigonometrique.ts`
 * (6gen37) et `typesTransformationsPlan.ts` (6gen40), le NOMBRE D'ÉCRANS dépend ici du SOUS-TYPE
 * (famille B : 2 écrans pour les 5 sous-types simples, 3 pour "intersection" ; famille D : 2 pour
 * "ratio"/"coef"/"modules", 3 pour "reelles") — chaque nom de phase est déjà spécifique au
 * sous-type (`bEcran1` vs `bInterEcran1`, `dRatioEcran1` vs `dReellesEcran1`...), donc `phaseApres`
 * reste une simple table SANS avoir besoin du paramètre `exercice` (aucune ambiguïté : un nom de
 * phase détermine à lui seul la phase suivante).
 */

export type PhaseComplexesAvances =
  | "aEcran1"
  | "aEcran2"
  | "aEcran3"
  | "bEcran1"
  | "bEcran2"
  | "bInterEcran1"
  | "bInterEcran2"
  | "bInterEcran3"
  | "cEcran1"
  | "cEcran2"
  | "cEcran3"
  | "dRatioEcran1"
  | "dRatioEcran2"
  | "dReellesEcran1"
  | "dReellesEcran2"
  | "dReellesEcran3"
  | "dCoefEcran1"
  | "dCoefEcran2"
  | "dModulesEcran1"
  | "dModulesEcran2"
  | "eEcran1"
  | "eEcran2"
  | "eEcran3";

export function phaseInitiale(exercice: ExerciceComplexesAvances): PhaseComplexesAvances {
  switch (exercice.famille) {
    case "A":
      return "aEcran1";
    case "B":
      return exercice.sousType === "intersection" ? "bInterEcran1" : "bEcran1";
    case "C":
      return "cEcran1";
    case "D":
      switch (exercice.sousType) {
        case "ratio":
          return "dRatioEcran1";
        case "reelles":
          return "dReellesEcran1";
        case "coef":
          return "dCoefEcran1";
        case "modules":
          return "dModulesEcran1";
      }
      break;
    case "E":
      return "eEcran1";
  }
}

const TABLE_PHASE_APRES: Record<PhaseComplexesAvances, PhaseComplexesAvances | "termine"> = {
  aEcran1: "aEcran2",
  aEcran2: "aEcran3",
  aEcran3: "termine",
  bEcran1: "bEcran2",
  bEcran2: "termine",
  bInterEcran1: "bInterEcran2",
  bInterEcran2: "bInterEcran3",
  bInterEcran3: "termine",
  cEcran1: "cEcran2",
  cEcran2: "cEcran3",
  cEcran3: "termine",
  dRatioEcran1: "dRatioEcran2",
  dRatioEcran2: "termine",
  dReellesEcran1: "dReellesEcran2",
  dReellesEcran2: "dReellesEcran3",
  dReellesEcran3: "termine",
  dCoefEcran1: "dCoefEcran2",
  dCoefEcran2: "termine",
  dModulesEcran1: "dModulesEcran2",
  dModulesEcran2: "termine",
  eEcran1: "eEcran2",
  eEcran2: "eEcran3",
  eEcran3: "termine",
};

export function phaseApres(phase: PhaseComplexesAvances): PhaseComplexesAvances | "termine" {
  return TABLE_PHASE_APRES[phase];
}

/** Liste ORDONNÉE des phases réellement traversées par CET exercice précis — mirroir 6gen37/6gen40. */
export function phasesPourExercice(exercice: ExerciceComplexesAvances): PhaseComplexesAvances[] {
  const phases: PhaseComplexesAvances[] = [];
  let phase: PhaseComplexesAvances | "termine" = phaseInitiale(exercice);
  while (phase !== "termine") {
    phases.push(phase);
    phase = phaseApres(phase);
  }
  return phases;
}

export interface ResultatExerciceComplexesAvances {
  exercice: ExerciceComplexesAvances;
  scores: Partial<Record<PhaseComplexesAvances, number>>;
}

export interface EtatSessionComplexesAvances {
  reglages: ReglagesSession6e;
  generateur: () => ExerciceComplexesAvances;
  exerciceCourant: ExerciceComplexesAvances;
  phase: PhaseComplexesAvances;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  scoresPartiels: Partial<Record<PhaseComplexesAvances, number>>;
  indexExercice: number;
  resultats: ResultatExerciceComplexesAvances[];
  terminee: boolean;
  derniereTransitionRevelee: boolean;
}
