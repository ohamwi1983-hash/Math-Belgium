import type { ExerciceComparaisonVecteurs, GenerateurExerciceComparaisonVecteurs } from "../core/comparaisonVecteurs.types";
import type { ReglagesSession } from "../core/session.types";
import type { EtatEtapeTentatives } from "./etapeTentatives";

/** 2 phases fixes, toujours dans le même ordre — pas d'écran "énoncé" séparé (la figure reste
 * affichée en permanence sur les 2 écrans). */
export type PhaseComparaisonVecteurs = "selection" | "egalite";

export interface ResultatExerciceComparaisonVecteurs {
  scoreSelection: number;
  selectionRevele: boolean;
  scoreEgalite: number;
  egaliteRevele: boolean;
}

export interface EtatSessionComparaisonVecteurs {
  reglages: ReglagesSession;
  generateur: GenerateurExerciceComparaisonVecteurs;
  indexExercice: number;
  exerciceCourant: ExerciceComparaisonVecteurs;
  phase: PhaseComparaisonVecteurs;
  etapeCourante: EtatEtapeTentatives;
  scoreSelectionExercice: number | null;
  selectionRevele: boolean;
  resultats: ResultatExerciceComparaisonVecteurs[];
  terminee: boolean;
}
