import type { ExerciceDispersion, GenerateurExerciceDispersion } from "../core/dispersion.types";
import type { ReglagesSession } from "../core/session.types";
import type { EtatEtapeTentatives } from "./etapeTentatives";

/** Phases dans un ordre FIXE par famille, aucun saut conditionnel :
 * - famille "valeurs" (historique) : `tableau → varianceEcartType` ;
 * - famille "classes" : `centresMoyenne → tableau → varianceEcartType` (écran supplémentaire : les
 *   centres de classes et x̄ à calculer soi-même).
 * `varianceEcartType` est toujours terminale. */
export type PhaseDispersion = "centresMoyenne" | "tableau" | "varianceEcartType";

export interface ResultatExerciceDispersion {
  scoreTableau: number;
  tableauRevele: boolean;
  niveauAideTableau: number;
  scoreVarianceEcartType: number;
  varianceEcartTypeRevele: boolean;
  niveauAideVarianceEcartType: number;
  /** Famille "classes" seulement (absents sinon). */
  scoreCentresMoyenne?: number;
  centresMoyenneRevele?: boolean;
  niveauAideCentresMoyenne?: number;
}

export interface EtatSessionDispersion {
  reglages: ReglagesSession;
  generateur: GenerateurExerciceDispersion;
  indexExercice: number;
  exerciceCourant: ExerciceDispersion;
  phase: PhaseDispersion;
  etapeCourante: EtatEtapeTentatives;
  /** Aide PROGRESSIVE par écran (comme "Moyenne pondérée"/"Tableau de fréquences"...) — 2 niveaux
   * sur chacun des écrans (spec). */
  niveauAideCentresMoyenne: number;
  niveauAideTableau: number;
  niveauAideVarianceEcartType: number;
  /** Score/révélation de l'écran "centresMoyenne" (famille "classes"), conservés jusqu'à la
   * clôture finale de l'exercice. */
  scoreCentresMoyenneExercice: number | null;
  centresMoyenneRevele: boolean;
  /** Score/révélation de l'écran "tableau", conservés jusqu'à la clôture finale de l'exercice
   * (qui construit le `ResultatExerciceDispersion` complet) — même principe que le reste du projet. */
  scoreTableauExercice: number | null;
  tableauRevele: boolean;
  resultats: ResultatExerciceDispersion[];
  terminee: boolean;
}
