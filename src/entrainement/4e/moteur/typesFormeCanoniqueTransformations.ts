import type {
  ExerciceFormeCanoniqueTransformation,
  GenerateurExerciceFormeCanoniqueTransformation,
} from "../core/formeCanoniqueTransformations.types";
import type { ReglagesSession } from "../core/session.types";
import type { EtatEtapeTentatives } from "./etapeTentatives";

/**
 * 4 phases fixes, toujours dans le même ordre (canonique → th → evCvSox → tv) — même principe que
 * sessionInequation.ts (racines → signe_a → intervalle) : aucun saut conditionnel, contrairement à
 * l'exercice 1 ou "Analyse d'une fonction".
 */
export type PhaseFormeCanoniqueTransformation = "canonique" | "th" | "evCvSox" | "tv";

export interface ResultatExerciceFormeCanoniqueTransformation {
  scoreCanonique: number;
  canoniqueRevele: boolean;
  scoreTh: number;
  thRevele: boolean;
  scoreEvCvSox: number;
  evCvSoxRevele: boolean;
  scoreTv: number;
  tvRevele: boolean;
}

export interface EtatSessionFormeCanoniqueTransformation {
  reglages: ReglagesSession;
  generateur: GenerateurExerciceFormeCanoniqueTransformation;
  /** nombre d'exercices déjà clôturés (0 au début) */
  indexExercice: number;
  exerciceCourant: ExerciceFormeCanoniqueTransformation;
  phase: PhaseFormeCanoniqueTransformation;
  etapeCourante: EtatEtapeTentatives;
  scoreCanoniqueExercice: number | null;
  canoniqueRevele: boolean;
  scoreThExercice: number | null;
  thRevele: boolean;
  scoreEvCvSoxExercice: number | null;
  evCvSoxRevele: boolean;
  resultats: ResultatExerciceFormeCanoniqueTransformation[];
  terminee: boolean;
}
