import type {
  ConclusionIntersectionDroites,
  ExerciceIntersectionDroites,
  GenerateurExerciceIntersectionDroites,
  VarianteIntersectionDroites,
} from "../core/intersectionDroites.types";
import type { ReglagesSession } from "../core/session.types";
import type { EtatEtapeTentatives } from "./etapeTentatives";

/** 2 phases possibles, jamais toutes deux traversées pour un même exercice : "diagnostic" toujours
 * en premier, "point" UNIQUEMENT si `exerciceCourant.conclusion === "secantes"` — sinon l'exercice
 * se clôt directement à la fin de "diagnostic" (voir `sessionIntersectionDroites.ts`). */
export type PhaseIntersectionDroites = "diagnostic" | "point";

export interface ResultatExerciceIntersectionDroites {
  variante: VarianteIntersectionDroites;
  conclusion: ConclusionIntersectionDroites;
  scoreDiagnostic: number;
  diagnosticRevele: boolean;
  niveauAideDiagnostic: number;
  /** `null` ssi `conclusion !== "secantes"` — écran "point" jamais atteint pour cet exercice. */
  scorePoint: number | null;
  pointRevele: boolean;
  niveauAidePoint: number;
}

export interface EtatSessionIntersectionDroites {
  reglages: ReglagesSession;
  generateur: GenerateurExerciceIntersectionDroites;
  indexExercice: number;
  exerciceCourant: ExerciceIntersectionDroites;
  phase: PhaseIntersectionDroites;
  etapeCourante: EtatEtapeTentatives;
  /** Aide PROGRESSIVE par écran (même mécanique que "Position d'une droite par rapport à un
   * plan"/"Colinéarité"/"Orthogonalité") — pénalité ADDITIVE, appliquée au moment précis où l'écran
   * se clôt, jamais rétroactivement. */
  niveauAideDiagnostic: number;
  niveauAidePoint: number;
  scoreDiagnosticExercice: number | null;
  diagnosticRevele: boolean;
  resultats: ResultatExerciceIntersectionDroites[];
  terminee: boolean;
}
