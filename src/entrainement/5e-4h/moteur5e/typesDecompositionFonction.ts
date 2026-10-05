import type { ExerciceDecompositionFonction, GenerateurExerciceDecompositionFonction } from "../core5e/decompositionFonction.types";
import type { ReglagesSession5e } from "../core5e/session5e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

export interface ResultatExerciceDecompositionFonction {
  exercice: ExerciceDecompositionFonction;
  score: number;
  revele: boolean;
}

export interface EtatSessionDecompositionFonction {
  reglages: ReglagesSession5e;
  generateur: GenerateurExerciceDecompositionFonction;
  exerciceCourant: ExerciceDecompositionFonction;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  indexExercice: number;
  resultats: ResultatExerciceDecompositionFonction[];
  terminee: boolean;
}
