import type { ExerciceUnSansLautre, FonctionConnue, GenerateurExerciceUnSansLautre } from "../core/unSansLautre.types";
import type { ReglagesSession } from "../core/session.types";
import type { EtatEtapeTentatives } from "./etapeTentatives";

/** 3 phases fixes, toujours dans le même ordre, aucun saut conditionnel — même principe que les
 * deux générateurs précédents du chapitre. */
export type PhaseUnSansLautre = "carre" | "valeurSignee" | "tangente";

export interface ResultatExerciceUnSansLautre {
  fonctionConnue: FonctionConnue;
  scoreCarre: number;
  carreRevele: boolean;
  aideCarreUtilisee: boolean;
  simplificationCarreAppliquee: boolean;
  scoreValeurSignee: number;
  valeurSigneeRevele: boolean;
  aideValeurSigneeUtilisee: boolean;
  simplificationValeurSigneeAppliquee: boolean;
  scoreTangente: number;
  tangenteRevele: boolean;
  aideTangenteUtilisee: boolean;
  simplificationTangenteAppliquee: boolean;
}

export interface EtatSessionUnSansLautre {
  reglages: ReglagesSession;
  generateur: GenerateurExerciceUnSansLautre;
  indexExercice: number;
  exerciceCourant: ExerciceUnSansLautre;
  phase: PhaseUnSansLautre;
  etapeCourante: EtatEtapeTentatives;
  /**
   * Bouton "Aide" — un par écran, révélation à sens unique, strictement indépendants entre eux
   * (même principe que les deux générateurs précédents du chapitre) — mais la pénalité elle-même
   * est ADDITIVE (-20% du total de la question) plutôt que multiplicative (×0,5 ailleurs dans le
   * projet), et se cumule indépendamment avec la pénalité de simplification (voir
   * sessionUnSansLautre.ts).
   */
  aideCarreUtilisee: boolean;
  aideValeurSigneeUtilisee: boolean;
  aideTangenteUtilisee: boolean;
  scoreCarreExercice: number | null;
  carreRevele: boolean;
  simplificationCarreAppliqueeExercice: boolean;
  scoreValeurSigneeExercice: number | null;
  valeurSigneeRevele: boolean;
  simplificationValeurSigneeAppliqueeExercice: boolean;
  resultats: ResultatExerciceUnSansLautre[];
  terminee: boolean;
}
