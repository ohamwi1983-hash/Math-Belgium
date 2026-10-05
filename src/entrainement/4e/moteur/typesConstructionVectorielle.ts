import type { ExerciceConstructionVectorielle, GenerateurExerciceConstructionVectorielle } from "../core/constructionVectorielle.types";
import type { ReglagesSession } from "../core/session.types";
import type { EtatEtapeTentatives } from "./etapeTentatives";

/** Une seule phase notée — pas d'écran "énoncé" séparé (même leçon déjà établie par plusieurs
 * générateurs du projet) : la construction elle-même, sur l'unique écran de l'exercice. */
export type PhaseConstructionVectorielle = "construction";

export interface ResultatExerciceConstructionVectorielle {
  scoreConstruction: number;
  constructionRevele: boolean;
}

export interface EtatSessionConstructionVectorielle {
  reglages: ReglagesSession;
  generateur: GenerateurExerciceConstructionVectorielle;
  indexExercice: number;
  exerciceCourant: ExerciceConstructionVectorielle;
  phase: PhaseConstructionVectorielle;
  etapeCourante: EtatEtapeTentatives;
  resultats: ResultatExerciceConstructionVectorielle[];
  terminee: boolean;
}
