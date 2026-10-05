import type { ExerciceEquationCercle, GenerateurExerciceEquationCercle, VarianteEquationCercle } from "../core/equationCercle.types";
import type { ReglagesSession } from "../core/session.types";
import type { EtatEtapeTentatives } from "./etapeTentatives";

/** 3 phases FIXES, toujours dans le même ordre — aucun saut conditionnel : les deux variantes
 * traversent exactement la même séquence, seule la donnée graphique visible sur l'écran "rayon"
 * diffère (lecture directe vs distance). */
export type PhaseEquationCercle = "centre" | "rayon" | "equation";

export interface ResultatExerciceEquationCercle {
  variante: VarianteEquationCercle;
  scoreCentre: number;
  centreRevele: boolean;
  /** Capturé au moment précis où l'écran "centre" se ferme (récapitulatif final `LigneRecap`,
   * jamais dérivé du score a posteriori) — une tentative ratée sans aide reste donc verte. */
  centreAideUtilisee: boolean;
  scoreRayon: number;
  rayonRevele: boolean;
  /** Écran "rayon" — capturé à la clôture, voir `centreAideUtilisee`. */
  rayonAideUtilisee: boolean;
  scoreEquation: number;
  equationRevele: boolean;
  /** Écran "équation" — capturé à la clôture, voir `centreAideUtilisee`. */
  equationAideUtilisee: boolean;
}

export interface EtatSessionEquationCercle {
  reglages: ReglagesSession;
  generateur: GenerateurExerciceEquationCercle;
  indexExercice: number;
  exerciceCourant: ExerciceEquationCercle;
  phase: PhaseEquationCercle;
  etapeCourante: EtatEtapeTentatives;
  niveauAideCentre: number;
  niveauAideRayon: number;
  niveauAideEquation: number;
  /** Scores des écrans déjà clos de cet exercice, conservés jusqu'à la clôture de l'exercice
   * entier (même principe que `scoreExtractionExercice`/`scoreConstructionExercice`,
   * `typesRelationsDroites.ts`). */
  scoreCentreExercice: number | null;
  centreRevele: boolean;
  centreAideUtilisee: boolean;
  scoreRayonExercice: number | null;
  rayonRevele: boolean;
  rayonAideUtilisee: boolean;
  resultats: ResultatExerciceEquationCercle[];
  terminee: boolean;
}
