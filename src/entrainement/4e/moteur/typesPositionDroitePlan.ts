import type {
  ConclusionPositionDroitePlan,
  ExercicePositionDroitePlan,
  GenerateurExercicePositionDroitePlan,
} from "../core/positionDroitePlan.types";
import type { ReglagesSession } from "../core/session.types";
import type { EtatEtapeTentatives } from "./etapeTentatives";

/** 2 phases fixes, toujours dans le même ordre — "justification" n'apparaît qu'une fois
 * "classification" close (correcte ou révélée), jamais affichées simultanément. */
export type PhasePositionDroitePlan = "classification" | "justification";

export interface ResultatExercicePositionDroitePlan {
  classification: ConclusionPositionDroitePlan;
  scoreClassification: number;
  classificationRevele: boolean;
  niveauAideClassification: number;
  scoreJustification: number;
  justificationRevele: boolean;
  niveauAideJustification: number;
}

export interface EtatSessionPositionDroitePlan {
  reglages: ReglagesSession;
  generateur: GenerateurExercicePositionDroitePlan;
  indexExercice: number;
  exerciceCourant: ExercicePositionDroitePlan;
  phase: PhasePositionDroitePlan;
  etapeCourante: EtatEtapeTentatives;
  /** Aide PROGRESSIVE par écran (même mécanique que "Triangle quelconque"/"Colinéarité"/
   * "Orthogonalité") — 2 niveaux sur "classification" (rappel des 3 critères, puis appartenance des
   * 2 points au plan), 1 seul niveau sur "justification" (rappel de la propriété générale liée à la
   * catégorie trouvée). Pénalité ADDITIVE (-20 points par niveau atteint), appliquée au moment
   * précis où l'écran se clôt, jamais rétroactivement. */
  niveauAideClassification: number;
  niveauAideJustification: number;
  scoreClassificationExercice: number | null;
  classificationRevele: boolean;
  resultats: ResultatExercicePositionDroitePlan[];
  terminee: boolean;
}
