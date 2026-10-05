import type { ExerciceComposeeGraphique, GenerateurExerciceComposeeGraphique, QuestionComposeeGraphique } from "../core5e/composeeGraphique.types";
import type { ReglagesSession5e } from "../core5e/session5e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

export interface ResultatQuestionComposeeGraphique {
  question: QuestionComposeeGraphique;
  score: number;
  revele: boolean;
}

export interface ResultatExerciceComposeeGraphique {
  exercice: ExerciceComposeeGraphique;
  resultatsQuestions: ResultatQuestionComposeeGraphique[];
}

export interface EtatSessionComposeeGraphique {
  reglages: ReglagesSession5e;
  generateur: GenerateurExerciceComposeeGraphique;
  exerciceCourant: ExerciceComposeeGraphique;
  indexQuestion: number;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  resultatsQuestionsExercice: ResultatQuestionComposeeGraphique[];
  indexExercice: number;
  resultats: ResultatExerciceComposeeGraphique[];
  terminee: boolean;
}
