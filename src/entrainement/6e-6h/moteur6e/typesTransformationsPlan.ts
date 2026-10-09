import type { ExerciceTransformationsPlan } from "../core6e/transformationsPlan.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

/**
 * Couche B (6e) — types de session pour `6gen40`. 3 familles, longueur de chaîne d'écrans fixe PAR
 * FAMILLE (2 pour A/B, 3 pour C) — mirroir `typesFormeTrigonometrique.ts` (6gen37) : aucune branche
 * de `phaseApres` ne dépend du sous-type de l'exercice une fois la phase INITIALE déterminée (le
 * sous-type des familles A/B ne change ni le nombre d'écrans ni leur enchaînement, seulement le
 * contenu des champs — voir `ui6e/formatTransformationsPlan.ts`), donc `phaseApres` n'a pas besoin
 * du paramètre `exercice`.
 */

export type PhaseTransformationsPlan = "aEcran1" | "aEcran2" | "bEcran1" | "bEcran2" | "cEcran1" | "cEcran2" | "cEcran3";

export function phaseInitiale(exercice: ExerciceTransformationsPlan): PhaseTransformationsPlan {
  switch (exercice.famille) {
    case "A":
      return "aEcran1";
    case "B":
      return "bEcran1";
    case "C":
      return "cEcran1";
  }
}

export function phaseApres(phase: PhaseTransformationsPlan): PhaseTransformationsPlan | "termine" {
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
      return "cEcran3";
    case "cEcran3":
      return "termine";
  }
}

/** Liste ORDONNÉE des phases réellement traversées par CET exercice précis — mirroir 6gen37. */
export function phasesPourExercice(exercice: ExerciceTransformationsPlan): PhaseTransformationsPlan[] {
  const phases: PhaseTransformationsPlan[] = [];
  let phase: PhaseTransformationsPlan | "termine" = phaseInitiale(exercice);
  while (phase !== "termine") {
    phases.push(phase);
    phase = phaseApres(phase);
  }
  return phases;
}

export interface ResultatExerciceTransformationsPlan {
  exercice: ExerciceTransformationsPlan;
  scores: Partial<Record<PhaseTransformationsPlan, number>>;
}

export interface EtatSessionTransformationsPlan {
  reglages: ReglagesSession6e;
  generateur: () => ExerciceTransformationsPlan;
  exerciceCourant: ExerciceTransformationsPlan;
  phase: PhaseTransformationsPlan;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  scoresPartiels: Partial<Record<PhaseTransformationsPlan, number>>;
  indexExercice: number;
  resultats: ResultatExerciceTransformationsPlan[];
  terminee: boolean;
  derniereTransitionRevelee: boolean;
}
