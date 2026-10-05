import type {
  ExerciceFormeCanoniqueFonctionReference,
  GenerateurExerciceFormeCanoniqueFonctionReference,
} from "../core/formeCanoniqueFonctionsReference.types";
import type { ReglagesSession } from "../core/session.types";
import type { EtatEtapeTentatives } from "./etapeTentatives";

/**
 * 6 phases fixes, toujours dans le même ordre (section 2 de la spec) : reconnaissance → canonique →
 * ehChSoy → th → evCvSox → tv — aucun saut conditionnel, même principe que
 * sessionFormeCanoniqueTransformations.ts (chapitre 1) étendu de 2 étapes (reconnaissance de
 * famille, EH/CH/SOY).
 */
export type PhaseFormeCanoniqueFonctionReference = "reconnaissance" | "canonique" | "ehChSoy" | "th" | "evCvSox" | "tv";

export interface ResultatExerciceFormeCanoniqueFonctionReference {
  scoreReconnaissance: number;
  reconnaissanceRevele: boolean;
  scoreCanonique: number;
  canoniqueRevele: boolean;
  scoreEhChSoy: number;
  ehChSoyRevele: boolean;
  scoreTh: number;
  thRevele: boolean;
  scoreEvCvSox: number;
  evCvSoxRevele: boolean;
  scoreTv: number;
  tvRevele: boolean;
}

export interface EtatSessionFormeCanoniqueFonctionReference {
  reglages: ReglagesSession;
  generateur: GenerateurExerciceFormeCanoniqueFonctionReference;
  indexExercice: number;
  exerciceCourant: ExerciceFormeCanoniqueFonctionReference;
  phase: PhaseFormeCanoniqueFonctionReference;
  etapeCourante: EtatEtapeTentatives;
  scoreReconnaissanceExercice: number | null;
  reconnaissanceRevele: boolean;
  scoreCanoniqueExercice: number | null;
  canoniqueRevele: boolean;
  scoreEhChSoyExercice: number | null;
  ehChSoyRevele: boolean;
  scoreThExercice: number | null;
  thRevele: boolean;
  scoreEvCvSoxExercice: number | null;
  evCvSoxRevele: boolean;
  resultats: ResultatExerciceFormeCanoniqueFonctionReference[];
  terminee: boolean;
}
