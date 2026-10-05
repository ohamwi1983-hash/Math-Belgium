import type { ExercicePointVectoriel, GenerateurExercicePointVectoriel } from "../core/pointVectoriel.types";
import type { ReglagesSession } from "../core/session.types";
import type { EtatEtapeTentatives } from "./etapeTentatives";

/** Une seule phase notée pour ce générateur — pas d'écran "énoncé" séparé (même leçon déjà
 * établie par les générateurs du chapitre "Cercle trigonométrique") : les coordonnées du point
 * cherché sont la seule question posée, sur l'unique écran de l'exercice. */
export type PhasePointVectoriel = "coordonnees";

export interface ResultatExercicePointVectoriel {
  scoreCoordonnees: number;
  coordonneesRevele: boolean;
}

export interface EtatSessionPointVectoriel {
  reglages: ReglagesSession;
  generateur: GenerateurExercicePointVectoriel;
  indexExercice: number;
  exerciceCourant: ExercicePointVectoriel;
  phase: PhasePointVectoriel;
  etapeCourante: EtatEtapeTentatives;
  resultats: ResultatExercicePointVectoriel[];
  terminee: boolean;
}
