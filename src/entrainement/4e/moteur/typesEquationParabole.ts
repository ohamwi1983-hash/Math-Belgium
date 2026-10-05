import type { ExerciceEquationParabole, GenerateurExerciceEquationParabole, OrientationParabole } from "../core/equationParabole.types";
import type { ReglagesSession } from "../core/session.types";
import type { EtatEtapeTentatives } from "./etapeTentatives";

/** 2 phases FIXES, toujours dans le même ordre — aucun saut conditionnel : les deux variantes
 * traversent exactement la même séquence (même principe que "Équation d'un cercle... à partir d'un
 * graphe"). */
export type PhaseEquationParabole = "sommetFoyer" | "equation";

export interface ResultatExerciceEquationParabole {
  variante: OrientationParabole;
  scoreSommetFoyer: number;
  sommetFoyerRevele: boolean;
  /** Aide utilisée sur l'écran "Sommet et foyer", capturée au moment PRÉCIS de la clôture de
   * l'écran (jamais après coup) — récapitulatif final `LigneRecap`/`statutRecap`. */
  sommetFoyerAideUtilisee: boolean;
  scoreEquation: number;
  equationRevele: boolean;
  /** Même principe que `sommetFoyerAideUtilisee`, capturée à la clôture de l'écran "Équation". */
  equationAideUtilisee: boolean;
}

export interface EtatSessionEquationParabole {
  reglages: ReglagesSession;
  generateur: GenerateurExerciceEquationParabole;
  indexExercice: number;
  exerciceCourant: ExerciceEquationParabole;
  phase: PhaseEquationParabole;
  etapeCourante: EtatEtapeTentatives;
  niveauAideSommetFoyer: number;
  niveauAideEquation: number;
  /** Score de l'écran déjà clos de cet exercice, conservé jusqu'à la clôture de l'exercice entier
   * (même principe que `EtatSessionEquationCercle`). */
  scoreSommetFoyerExercice: number | null;
  sommetFoyerRevele: boolean;
  sommetFoyerAideUtilisee: boolean;
  resultats: ResultatExerciceEquationParabole[];
  terminee: boolean;
}
