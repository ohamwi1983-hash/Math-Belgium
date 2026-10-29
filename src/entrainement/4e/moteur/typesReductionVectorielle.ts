import type { ExerciceReductionVectorielle, GenerateurExerciceReductionVectorielle } from "../core/reductionVectorielle.types";
import type { ReglagesSession } from "../core/session.types";
import type { EtatEtapeTentatives } from "./etapeTentatives";

/** Une seule phase notée — pas d'écran "énoncé" séparé : la figure et l'expression à réduire sont
 * affichées en permanence sur l'unique écran de l'exercice (même principe que "Point à partir
 * d'une relation vectorielle", premier générateur de ce chapitre). */
export type PhaseReductionVectorielle = "reduction";

/** 2 niveaux d'aide (audit chapitre 6, F4) : rappel de la relation de Chasles, puis repérage dans
 * l'expression affichée (paires qui s'annulent, vecteurs « à l'envers », un premier enchaînement) —
 * jamais le vecteur réduit lui-même. Aucune pénalité : le compteur ne sert qu'à l'affichage. */
export const NIVEAU_AIDE_MAX_REDUCTION = 2;

export interface ResultatExerciceReductionVectorielle {
  scoreReduction: number;
  reductionRevele: boolean;
  niveauAideReduction: number;
}

export interface EtatSessionReductionVectorielle {
  reglages: ReglagesSession;
  generateur: GenerateurExerciceReductionVectorielle;
  indexExercice: number;
  exerciceCourant: ExerciceReductionVectorielle;
  phase: PhaseReductionVectorielle;
  etapeCourante: EtatEtapeTentatives;
  /** Niveau d'aide atteint sur l'écran en cours (0 à `NIVEAU_AIDE_MAX_REDUCTION`), remis à 0 à
   * chaque nouvel exercice. */
  niveauAide: number;
  resultats: ResultatExerciceReductionVectorielle[];
  terminee: boolean;
}
