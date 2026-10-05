import type { ExerciceReductionVectorielle, GenerateurExerciceReductionVectorielle } from "../core/reductionVectorielle.types";
import type { ReglagesSession } from "../core/session.types";
import type { EtatEtapeTentatives } from "./etapeTentatives";

/** Une seule phase notée — pas d'écran "énoncé" séparé : la figure et l'expression à réduire sont
 * affichées en permanence sur l'unique écran de l'exercice (même principe que "Point à partir
 * d'une relation vectorielle", premier générateur de ce chapitre). */
export type PhaseReductionVectorielle = "reduction";

export interface ResultatExerciceReductionVectorielle {
  scoreReduction: number;
  reductionRevele: boolean;
}

export interface EtatSessionReductionVectorielle {
  reglages: ReglagesSession;
  generateur: GenerateurExerciceReductionVectorielle;
  indexExercice: number;
  exerciceCourant: ExerciceReductionVectorielle;
  phase: PhaseReductionVectorielle;
  etapeCourante: EtatEtapeTentatives;
  resultats: ResultatExerciceReductionVectorielle[];
  terminee: boolean;
}
