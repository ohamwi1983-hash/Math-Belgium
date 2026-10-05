import type { ExerciceOrthogonalite, GenerateurExerciceOrthogonalite, VarianteOrthogonalite } from "../core/orthogonalite.types";
import type { ReglagesSession } from "../core/session.types";
import type { EtatEtapeTentatives } from "./etapeTentatives";

/**
 * 13 "écrans" possibles au total — chaque variante traverse une SÉQUENCE FIXE et DISJOINTE des
 * autres variantes (aucun nom de phase partagé entre 2 variantes, contrairement à "Colinéarité et
 * alignement de points") :
 * - `test`               : test (1 écran)
 * - `parametre`          : reductionParametre → resolutionParametre (2 écrans)
 * - `triangle`            : constructionTriangle → testSommetA → testSommetB → testSommetC → conclusionTriangle (5 écrans)
 * - `triangleParametre`   : constructionAvecX → reductionSommetA → reductionSommetB → reductionSommetC → identificationResolution (5 écrans)
 */
export type PhaseOrthogonalite =
  | "test"
  | "reductionParametre"
  | "resolutionParametre"
  | "constructionTriangle"
  | "testSommetA"
  | "testSommetB"
  | "testSommetC"
  | "conclusionTriangle"
  | "constructionAvecX"
  | "reductionSommetA"
  | "reductionSommetB"
  | "reductionSommetC"
  | "identificationResolution";

export const SEQUENCES: Record<VarianteOrthogonalite, PhaseOrthogonalite[]> = {
  test: ["test"],
  parametre: ["reductionParametre", "resolutionParametre"],
  triangle: ["constructionTriangle", "testSommetA", "testSommetB", "testSommetC", "conclusionTriangle"],
  triangleParametre: ["constructionAvecX", "reductionSommetA", "reductionSommetB", "reductionSommetC", "identificationResolution"],
};

/** Niveau d'aide maximal par écran (voir `promptcreationgenerateur25orthogonalitepythagore.md`,
 * section par variante, puis `promptcorrectionsgenerateur25complet.md`) — pénalité ADDITIVE
 * `-20 points/niveau`, même mécanique que "Colinéarité et alignement de points"/"Triangle
 * quelconque". `constructionAvecX` réduit de 2 à 1 niveau (point 2 : aide simplifiée à la formule
 * seule, plus de niveau 2 "exemple substitué" — même convention que le champ symbolique équivalent
 * de "Colinéarité", `NIVEAU_AIDE_MAX_CONSTRUCTION_AVEC_X`). `resolutionParametre` passe de 1 à 0
 * (`promptcorrectionsgenerateur25lot3.md`, point 1 — cette variante garantit toujours exactement une
 * solution, plus aucune aide générique de résolution nécessaire, même principe que "resolution"/
 * "resolutionAvecX" du générateur 24). `identificationResolution` passe à son tour de 1 à 0
 * (`promptcorrectionsgenerateur25lot3.md`, point 3, sous-point e — écran entièrement restructuré, la
 * seule aide qu'il portait — le rappel "contradiction" — est retirée avec le reste de l'aide) — un
 * écran à `max=0` n'affiche aucun bouton "Aide" côté composant, jamais un bouton perpétuellement
 * désactivé. */
export const NIVEAU_AIDE_MAX: Record<PhaseOrthogonalite, number> = {
  test: 2,
  reductionParametre: 2,
  resolutionParametre: 0,
  constructionTriangle: 1,
  testSommetA: 2,
  testSommetB: 2,
  testSommetC: 2,
  conclusionTriangle: 1,
  constructionAvecX: 1,
  reductionSommetA: 2,
  reductionSommetB: 2,
  reductionSommetC: 2,
  identificationResolution: 0,
};

export interface ResultatExerciceOrthogonalite {
  variante: VarianteOrthogonalite;
  scoreTest: number | null;
  testRevele: boolean;
  niveauAideTest: number;
  scoreReductionParametre: number | null;
  reductionParametreRevele: boolean;
  niveauAideReductionParametre: number;
  scoreResolutionParametre: number | null;
  resolutionParametreRevele: boolean;
  niveauAideResolutionParametre: number;
  scoreConstructionTriangle: number | null;
  constructionTriangleRevele: boolean;
  niveauAideConstructionTriangle: number;
  scoreTestSommetA: number | null;
  testSommetARevele: boolean;
  niveauAideTestSommetA: number;
  scoreTestSommetB: number | null;
  testSommetBRevele: boolean;
  niveauAideTestSommetB: number;
  scoreTestSommetC: number | null;
  testSommetCRevele: boolean;
  niveauAideTestSommetC: number;
  scoreConclusionTriangle: number | null;
  conclusionTriangleRevele: boolean;
  niveauAideConclusionTriangle: number;
  scoreConstructionAvecX: number | null;
  constructionAvecXRevele: boolean;
  niveauAideConstructionAvecX: number;
  scoreReductionSommetA: number | null;
  reductionSommetARevele: boolean;
  niveauAideReductionSommetA: number;
  scoreReductionSommetB: number | null;
  reductionSommetBRevele: boolean;
  niveauAideReductionSommetB: number;
  scoreReductionSommetC: number | null;
  reductionSommetCRevele: boolean;
  niveauAideReductionSommetC: number;
  scoreIdentificationResolution: number | null;
  identificationResolutionRevele: boolean;
  niveauAideIdentificationResolution: number;
}

export interface ScoreEcran {
  score: number;
  revele: boolean;
  niveauAide: number;
}

export interface EtatSessionOrthogonalite {
  reglages: ReglagesSession;
  generateur: GenerateurExerciceOrthogonalite;
  indexExercice: number;
  exerciceCourant: ExerciceOrthogonalite;
  phase: PhaseOrthogonalite;
  etapeCourante: EtatEtapeTentatives;
  /** Niveau d'aide de l'ÉCRAN COURANT uniquement — jamais accumulé entre écrans, réinitialisé à
   * chaque transition de phase (même principe que "Colinéarité et alignement de points"). */
  niveauAide: number;
  /** Écrans déjà clos de CET exercice, accumulés jusqu'à la clôture complète (qui construit le
   * `ResultatExerciceOrthogonalite` final via `construireResultat`, `sessionOrthogonalite.ts`). */
  scoresAccumules: Partial<Record<PhaseOrthogonalite, ScoreEcran>>;
  resultats: ResultatExerciceOrthogonalite[];
  terminee: boolean;
}
