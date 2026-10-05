import type { ExerciceNormeDistance, GenerateurExerciceNormeDistance, VarianteNormeDistance } from "../core/normeDistance.types";
import type { ReglagesSession } from "../core/session.types";
import type { EtatEtapeTentatives } from "./etapeTentatives";

/**
 * 11 "écrans" possibles au total (`promptgen26refontecomplete.md` : la variante `comparaison` — 1
 * écran — a été supprimée, et `pythagore` réduite de 4 à 3 écrans) — chaque variante traverse une
 * SÉQUENCE FIXE et DISJOINTE des autres variantes (aucun nom de phase partagé entre 2 variantes),
 * même principe que "Orthogonalité et théorème de Pythagore généralisé" (générateur 25) :
 * - `vecteur`      : normeVecteur (1 écran)
 * - `distance`     : constructionDistance → calculDistance (2 écrans)
 * - `isocele`      : constructionIsocele → calculIsocele → conclusionIsocele (3 écrans)
 * - `parametre`    : reductionParametreNorme → resolutionParametreNorme (2 écrans)
 * - `pythagore`    : constructionPythagore → calculPythagore → testPythagore (3 écrans — l'ancien
 *   4e écran `conclusionPythagore` a été supprimé, sa question catégorielle fusionnée dans
 *   `testPythagore`)
 */
export type PhaseNormeDistance =
  | "normeVecteur"
  | "constructionDistance"
  | "calculDistance"
  | "constructionIsocele"
  | "calculIsocele"
  | "conclusionIsocele"
  | "reductionParametreNorme"
  | "resolutionParametreNorme"
  | "constructionPythagore"
  | "calculPythagore"
  | "testPythagore";

export const SEQUENCES: Record<VarianteNormeDistance, PhaseNormeDistance[]> = {
  vecteur: ["normeVecteur"],
  distance: ["constructionDistance", "calculDistance"],
  isocele: ["constructionIsocele", "calculIsocele", "conclusionIsocele"],
  parametre: ["reductionParametreNorme", "resolutionParametreNorme"],
  pythagore: ["constructionPythagore", "calculPythagore", "testPythagore"],
};

/**
 * Niveau d'aide maximal par écran (voir `promptcreationgenerateur26normedistance.md` puis
 * `promptgen26refontecomplete.md`, section par variante) — pénalité ADDITIVE `-20 points/niveau`,
 * même mécanique que "Colinéarité"/"Orthogonalité"/"Triangle quelconque". Un écran à `max=0`
 * n'affiche AUCUN bouton "Aide" (jamais un bouton perpétuellement désactivé) — plus aucun écran de
 * ce générateur n'est dans ce cas depuis la refonte complète (chaque écran a désormais au moins une
 * aide prévue par la spec).
 */
export const NIVEAU_AIDE_MAX: Record<PhaseNormeDistance, number> = {
  normeVecteur: 2,
  constructionDistance: 2,
  calculDistance: 2,
  constructionIsocele: 2,
  calculIsocele: 2,
  conclusionIsocele: 1,
  reductionParametreNorme: 2,
  resolutionParametreNorme: 2,
  constructionPythagore: 2,
  calculPythagore: 2,
  testPythagore: 2,
};

export interface ResultatExerciceNormeDistance {
  variante: VarianteNormeDistance;
  scoreNormeVecteur: number | null;
  normeVecteurRevele: boolean;
  niveauAideNormeVecteur: number;
  scoreConstructionDistance: number | null;
  constructionDistanceRevele: boolean;
  niveauAideConstructionDistance: number;
  scoreCalculDistance: number | null;
  calculDistanceRevele: boolean;
  niveauAideCalculDistance: number;
  scoreConstructionIsocele: number | null;
  constructionIsoceleRevele: boolean;
  niveauAideConstructionIsocele: number;
  scoreCalculIsocele: number | null;
  calculIsoceleRevele: boolean;
  niveauAideCalculIsocele: number;
  scoreConclusionIsocele: number | null;
  conclusionIsoceleRevele: boolean;
  niveauAideConclusionIsocele: number;
  scoreReductionParametreNorme: number | null;
  reductionParametreNormeRevele: boolean;
  niveauAideReductionParametreNorme: number;
  scoreResolutionParametreNorme: number | null;
  resolutionParametreNormeRevele: boolean;
  niveauAideResolutionParametreNorme: number;
  scoreConstructionPythagore: number | null;
  constructionPythagoreRevele: boolean;
  niveauAideConstructionPythagore: number;
  scoreCalculPythagore: number | null;
  calculPythagoreRevele: boolean;
  niveauAideCalculPythagore: number;
  scoreTestPythagore: number | null;
  testPythagoreRevele: boolean;
  niveauAideTestPythagore: number;
}

export interface ScoreEcran {
  score: number;
  revele: boolean;
  niveauAide: number;
}

export interface EtatSessionNormeDistance {
  reglages: ReglagesSession;
  generateur: GenerateurExerciceNormeDistance;
  indexExercice: number;
  exerciceCourant: ExerciceNormeDistance;
  phase: PhaseNormeDistance;
  etapeCourante: EtatEtapeTentatives;
  /** Niveau d'aide de l'ÉCRAN COURANT uniquement — jamais accumulé entre écrans, réinitialisé à
   * chaque transition de phase (même principe que "Colinéarité"/"Orthogonalité"). */
  niveauAide: number;
  /** Écrans déjà clos de CET exercice, accumulés jusqu'à la clôture complète. */
  scoresAccumules: Partial<Record<PhaseNormeDistance, ScoreEcran>>;
  resultats: ResultatExerciceNormeDistance[];
  terminee: boolean;
}
