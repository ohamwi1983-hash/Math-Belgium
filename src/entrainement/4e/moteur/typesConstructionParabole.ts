/**
 * Couche B — types de session pour "Construction graphique de la parabole" (position 53).
 * 2 phases : `construction` (répétée 3 fois, `NOMBRE_ITERATIONS_CONSTRUCTION_PARABOLE` dans
 * `sessionConstructionParabole.ts`) → `trace` (une fois, toujours terminale).
 */
import type { ExerciceConstructionParabole, GenerateurExerciceConstructionParabole } from "../core/constructionParabole.types";
import type { ReglagesSession } from "../core/session.types";
import type { EtatEtapeTentatives } from "./etapeTentatives";

export type PhaseConstructionParabole = "construction" | "trace";

export interface ResultatIterationConstructionParabole {
  r: number;
  scoreConstruction: number;
  constructionRevele: boolean;
  /** Aide utilisée sur cette itération, capturée au moment PRÉCIS de sa clôture (jamais après
   * coup) — récapitulatif final `LigneRecap`/`statutRecap`. */
  constructionAideUtilisee: boolean;
}

export interface ResultatExerciceConstructionParabole {
  iterations: ResultatIterationConstructionParabole[];
  scoreTrace: number;
  traceRevele: boolean;
}

export interface EtatSessionConstructionParabole {
  reglages: ReglagesSession;
  generateur: GenerateurExerciceConstructionParabole;
  indexExercice: number;
  exerciceCourant: ExerciceConstructionParabole;
  phase: PhaseConstructionParabole;
  /** 0..2 pendant "construction" ; reste à 3 (NOMBRE_ITERATIONS_CONSTRUCTION_PARABOLE) une fois
   * passé en phase "trace". */
  iterationCourante: number;
  etapeCourante: EtatEtapeTentatives;
  niveauAideConstruction: number;
  iterationsCompletes: ResultatIterationConstructionParabole[];
  resultats: ResultatExerciceConstructionParabole[];
  terminee: boolean;
}
