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
  scoreValeurSignee: number;
  valeurSigneeRevele: boolean;
  aideValeurSigneeUtilisee: boolean;
  scoreTangente: number;
  tangenteRevele: boolean;
  aideTangenteUtilisee: boolean;
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
   * (même principe que les deux générateurs précédents du chapitre).
   */
  aideCarreUtilisee: boolean;
  aideValeurSigneeUtilisee: boolean;
  aideTangenteUtilisee: boolean;
  scoreCarreExercice: number | null;
  carreRevele: boolean;
  scoreValeurSigneeExercice: number | null;
  valeurSigneeRevele: boolean;
  resultats: ResultatExerciceUnSansLautre[];
  terminee: boolean;
}
