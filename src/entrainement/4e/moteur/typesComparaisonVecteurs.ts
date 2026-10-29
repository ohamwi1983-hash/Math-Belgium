import type { ExerciceComparaisonVecteurs, GenerateurExerciceComparaisonVecteurs } from "../core/comparaisonVecteurs.types";
import type { ReglagesSession } from "../core/session.types";
import type { EtatEtapeTentatives } from "./etapeTentatives";

/** 2 phases fixes, toujours dans le même ordre — pas d'écran "énoncé" séparé (la figure reste
 * affichée en permanence sur les 2 écrans). */
export type PhaseComparaisonVecteurs = "selection" | "egalite";

/** 2 niveaux d'aide par écran (audit chapitre 6, F4) : définition du cours, puis lecture des
 * composantes — jamais les vecteurs à sélectionner ni le coefficient de l'égalité. Aucune
 * pénalité : le compteur ne sert qu'à l'affichage et à la puce jaune. */
export const NIVEAU_AIDE_MAX_COMPARAISON: Record<PhaseComparaisonVecteurs, number> = { selection: 2, egalite: 2 };

export interface ResultatExerciceComparaisonVecteurs {
  scoreSelection: number;
  selectionRevele: boolean;
  scoreEgalite: number;
  egaliteRevele: boolean;
  niveauAideSelection: number;
  niveauAideEgalite: number;
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
  /** Niveau d'aide atteint sur l'écran en cours, remis à 0 à chaque changement d'écran. */
  niveauAide: number;
  /** Niveau d'aide atteint sur l'écran « sélection » une fois clos (puce jaune, résultat). */
  niveauAideSelection: number;
  resultats: ResultatExerciceComparaisonVecteurs[];
  terminee: boolean;
}
