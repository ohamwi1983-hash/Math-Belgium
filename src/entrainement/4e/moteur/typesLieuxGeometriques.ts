import type { ExerciceLieuxGeometriques, GenerateurExerciceLieuxGeometriques, NombrePointsIntersection, PaireLieux } from "../core/lieuxGeometriques.types";
import type { ReglagesSession } from "../core/session.types";
import type { EtatEtapeTentatives } from "./etapeTentatives";

/** 3 phases FIXES, toujours dans le même ordre — aucun saut conditionnel, contrairement à
 * l'architecture précédente (`diagnostic`/`resolution` avec saut si `nombrePoints===0`) : l'écran
 * "resolution" reste désormais TOUJOURS atteint, y compris pour le sous-cas 0 point (choix "Aucun",
 * simplement aucun champ de point à saisir) — même principe que "Équation d'un cercle depuis un
 * graphe" (`typesEquationCercle.ts`). */
export type PhaseLieuxGeometriques = "identification" | "equations" | "resolution";

export interface ResultatExerciceLieuxGeometriques {
  paire: PaireLieux;
  nombrePoints: NombrePointsIntersection;
  scoreIdentification: number;
  identificationRevele: boolean;
  niveauAideIdentification: number;
  scoreEquations: number;
  equationsRevele: boolean;
  niveauAideEquations: number;
  scoreResolution: number;
  resolutionRevele: boolean;
  niveauAideResolution: number;
}

export interface EtatSessionLieuxGeometriques {
  reglages: ReglagesSession;
  generateur: GenerateurExerciceLieuxGeometriques;
  indexExercice: number;
  exerciceCourant: ExerciceLieuxGeometriques;
  phase: PhaseLieuxGeometriques;
  etapeCourante: EtatEtapeTentatives;
  /** Aide PROGRESSIVE par écran — pénalité ADDITIVE, appliquée au moment précis où l'écran se
   * clôt, jamais rétroactivement (même mécanique que le reste de la plateforme). */
  niveauAideIdentification: number;
  niveauAideEquations: number;
  niveauAideResolution: number;
  /** Scores des écrans déjà clos de cet exercice, conservés jusqu'à la clôture de l'exercice entier
   * (même principe que `scoreCentreExercice`/`scoreRayonExercice`, `typesEquationCercle.ts`). */
  scoreIdentificationExercice: number | null;
  identificationRevele: boolean;
  scoreEquationsExercice: number | null;
  equationsRevele: boolean;
  resultats: ResultatExerciceLieuxGeometriques[];
  terminee: boolean;
}
