import type { ExerciceEquationParaboleDeveloppee, GenerateurExerciceEquationParaboleDeveloppee } from "../core/equationParaboleDeveloppee.types";
import type { OrientationParabole } from "../core/equationParabole.types";
import type { ReglagesSession } from "../core/session.types";
import type { EtatEtapeTentatives } from "./etapeTentatives";

/** 3 phases FIXES, toujours dans le même ordre — aucun saut conditionnel : les deux variantes
 * traversent exactement la même séquence (même principe que "Centre et rayon d'un cercle depuis
 * l'équation développée"). "caracteristiques" combine S, F, p ET directrice dans un seul écran,
 * une seule étape de tentatives, un seul score. */
export type PhaseEquationParaboleDeveloppee = "regroupement" | "completion" | "caracteristiques";

export interface ReponseEcranCaracteristiques {
  sx: number;
  sy: number;
  fx: number;
  fy: number;
  p: number;
  directrice: string;
}

export interface ResultatExerciceEquationParaboleDeveloppee {
  variante: OrientationParabole;
  scoreRegroupement: number;
  regroupementRevele: boolean;
  /** Aide utilisée sur chaque écran, capturée au moment PRÉCIS de la clôture de l'écran (jamais
   * après coup) — récapitulatif final `LigneRecap`/`statutRecap`. */
  regroupementAideUtilisee: boolean;
  scoreCompletion: number;
  completionRevele: boolean;
  completionAideUtilisee: boolean;
  scoreCaracteristiques: number;
  caracteristiquesRevele: boolean;
  caracteristiquesAideUtilisee: boolean;
}

export interface EtatSessionEquationParaboleDeveloppee {
  reglages: ReglagesSession;
  generateur: GenerateurExerciceEquationParaboleDeveloppee;
  indexExercice: number;
  exerciceCourant: ExerciceEquationParaboleDeveloppee;
  phase: PhaseEquationParaboleDeveloppee;
  etapeCourante: EtatEtapeTentatives;
  niveauAideRegroupement: number;
  niveauAideCompletion: number;
  niveauAideCaracteristiques: number;
  /** Scores des écrans déjà clos de cet exercice, conservés jusqu'à la clôture de l'exercice
   * entier (même principe que `EtatSessionEquationCercleDeveloppee`). */
  scoreRegroupementExercice: number | null;
  regroupementRevele: boolean;
  regroupementAideUtilisee: boolean;
  scoreCompletionExercice: number | null;
  completionRevele: boolean;
  completionAideUtilisee: boolean;
  resultats: ResultatExerciceEquationParaboleDeveloppee[];
  terminee: boolean;
}
