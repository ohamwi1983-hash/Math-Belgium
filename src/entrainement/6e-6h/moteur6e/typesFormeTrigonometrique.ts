import type { ExerciceFormeTrigonometrique } from "../core6e/formeTrigonometrique.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

/**
 * Couche B (6e) — types de session pour `6gen37`. 5 familles, longueur de chaîne d'écrans fixe PAR
 * FAMILLE (2 pour A/B, 3 pour C/D/E) — mirroir `typesNombresComplexes.ts` (6gen34) : aucune branche
 * de `phaseApres` ne dépend du sous-type de l'exercice une fois la phase INITIALE déterminée (le
 * sous-type de la famille B ne change ni le nombre d'écrans ni leur enchaînement, seulement le
 * nombre de CHAMPS à l'écran 1 — voir `ui6e/formatFormeTrigonometrique.ts`), donc `phaseApres` n'a
 * pas besoin du paramètre `exercice`.
 */

export type PhaseFormeTrigonometrique = "aEcran1" | "aEcran2" | "bEcran1" | "bEcran2" | "cEcran1" | "cEcran2" | "cEcran3" | "dEcran1" | "dEcran2" | "dEcran3" | "eEcran1" | "eEcran2" | "eEcran3";

export function phaseInitiale(exercice: ExerciceFormeTrigonometrique): PhaseFormeTrigonometrique {
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
  }
}

export function phaseApres(phase: PhaseFormeTrigonometrique): PhaseFormeTrigonometrique | "termine" {
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
  }
}

/** Liste ORDONNÉE des phases réellement traversées par CET exercice précis — mirroir 6gen34. */
export function phasesPourExercice(exercice: ExerciceFormeTrigonometrique): PhaseFormeTrigonometrique[] {
  const phases: PhaseFormeTrigonometrique[] = [];
  let phase: PhaseFormeTrigonometrique | "termine" = phaseInitiale(exercice);
  while (phase !== "termine") {
    phases.push(phase);
    phase = phaseApres(phase);
  }
  return phases;
}

export interface ResultatExerciceFormeTrigonometrique {
  exercice: ExerciceFormeTrigonometrique;
  scores: Partial<Record<PhaseFormeTrigonometrique, number>>;
}

export interface EtatSessionFormeTrigonometrique {
  reglages: ReglagesSession6e;
  generateur: () => ExerciceFormeTrigonometrique;
  exerciceCourant: ExerciceFormeTrigonometrique;
  phase: PhaseFormeTrigonometrique;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  scoresPartiels: Partial<Record<PhaseFormeTrigonometrique, number>>;
  indexExercice: number;
  resultats: ResultatExerciceFormeTrigonometrique[];
  terminee: boolean;
  derniereTransitionRevelee: boolean;
}
