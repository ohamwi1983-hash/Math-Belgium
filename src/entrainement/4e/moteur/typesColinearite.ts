import type { ExerciceColinearite, GenerateurExerciceColinearite, VarianteColinearite } from "../core/colinearite.types";
import type { ReglagesSession } from "../core/session.types";
import type { EtatEtapeTentatives } from "./etapeTentatives";

/**
 * 7 "types" d'écran, dont la SÉQUENCE dépend de la variante (jamais toutes présentes à la fois) —
 * voir `sessionColinearite.ts::phaseInitiale`. Depuis `promptcorrectionsgenerateur24complet.md`,
 * "reduction"/"resolution" restent EXCLUSIVES à "parametre" (V2) ; "pointsParametre" (V4) traverse
 * désormais ses PROPRES phases "reductionAvecX"/"resolutionAvecX" (jamais partagées) — même
 * principe déjà en place pour "constructionVecteurs" (V3) vs "constructionAvecX" (V4), et même
 * séparation totale des phases par variante que "Orthogonalité" (générateur 25) :
 * - `vecteurs`         : test
 * - `points`           : constructionVecteurs → test
 * - `parametre`        : reduction → resolution
 * - `pointsParametre`  : constructionAvecX → reductionAvecX → resolutionAvecX
 */
export type PhaseColinearite = "test" | "constructionVecteurs" | "constructionAvecX" | "reduction" | "resolution" | "reductionAvecX" | "resolutionAvecX";

export interface ResultatExerciceColinearite {
  variante: VarianteColinearite;
  scoreConstruction: number | null;
  constructionRevele: boolean;
  niveauAideConstruction: number;
  scoreReduction: number | null;
  reductionRevele: boolean;
  niveauAideReduction: number;
  scoreResolution: number | null;
  resolutionRevele: boolean;
  niveauAideResolution: number;
  scoreTest: number | null;
  testRevele: boolean;
  niveauAideTest: number;
}

export interface EtatSessionColinearite {
  reglages: ReglagesSession;
  generateur: GenerateurExerciceColinearite;
  indexExercice: number;
  exerciceCourant: ExerciceColinearite;
  phase: PhaseColinearite;
  etapeCourante: EtatEtapeTentatives;
  /** Aide PROGRESSIVE par écran (même principe que "Triangle quelconque"/"Calcul de composantes
   * de combinaisons linéaires") — 0 à `NIVEAU_AIDE_MAX_XXX` (`sessionColinearite.ts`), pénalité
   * ADDITIVE (-20 points/niveau) appliquée au moment précis où l'écran se clôt. */
  niveauAideConstruction: number;
  niveauAideReduction: number;
  niveauAideResolution: number;
  niveauAideTest: number;
  /** Scores des écrans déjà clos de cet exercice, conservés jusqu'à la clôture de l'exercice
   * entier (qui construit le `ResultatExerciceColinearite` complet) — `null` tant que l'écran
   * correspondant n'a pas encore eu lieu POUR CET EXERCICE (jamais "n'existe pas pour cette
   * variante", qui reste `null` dans le résultat final lui-même). */
  scoreConstructionExercice: number | null;
  constructionRevele: boolean;
  scoreReductionExercice: number | null;
  reductionRevele: boolean;
  resultats: ResultatExerciceColinearite[];
  terminee: boolean;
}
