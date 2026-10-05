import type { ExerciceTriangleLies, GenerateurExerciceTriangleLies, VarianteTriangleLies } from "../core/triangleLies.types";
import type { ReglagesSession } from "../core/session.types";
import type { EtatEtapeTentatives } from "./etapeTentatives";

/**
 * Séquence dépendant de la variante (aiguillage `etat.phase` combiné à `exercice.variante`, même
 * principe que "Problèmes d'optimisation", `typesOptimisation.ts`) — SÉQUENCES DISJOINTES :
 * - `cotePartage` (3 écrans) : `pont → cible → interpretation` (terminale) — pas d'écran "angles",
 *   les 2 angles qui ferment le triangle cible sont déjà donnés dans l'énoncé.
 * - `anglePartage` (4 écrans) : `pont → angles → cible → interpretation` (terminale).
 * - `sommetPartage` (4 écrans) : `pont → soustraction → cible → interpretation` (terminale) — écran
 *   "soustraction" propre à cette configuration (2 côtés du triangle cible obtenus en soustrayant
 *   la distance déjà parcourue aux 2 côtés du pont issus du sommet commun), jamais "angles".
 */
export type PhaseTriangleLies = "pont" | "angles" | "soustraction" | "cible" | "interpretation";

export interface ResultatExerciceTriangleLies {
  /** Nécessaire pour que le résumé de session sache quels écrans ont eu lieu pour cet exercice
   * (même principe que `variante` dans `ResultatExerciceOptimisation`). */
  variante: VarianteTriangleLies;
  scorePont: number;
  pontRevele: boolean;
  niveauAidePont: number;
  /** `null` pour `cotePartage`/`sommetPartage` (écran absent de leur séquence). */
  scoreAngles: number | null;
  anglesRevele: boolean;
  niveauAideAngles: number;
  /** `null` pour `cotePartage`/`anglePartage` (écran absent de leur séquence). */
  scoreSoustraction: number | null;
  soustractionRevele: boolean;
  niveauAideSoustraction: number;
  scoreCible: number;
  cibleRevele: boolean;
  niveauAideCible: number;
  scoreInterpretation: number;
  interpretationRevele: boolean;
  niveauAideInterpretation: number;
}

export interface EtatSessionTriangleLies {
  reglages: ReglagesSession;
  generateur: GenerateurExerciceTriangleLies;
  indexExercice: number;
  exerciceCourant: ExerciceTriangleLies;
  phase: PhaseTriangleLies;
  etapeCourante: EtatEtapeTentatives;
  /** Aide PROGRESSIVE par écran (pénalité ADDITIVE -20 points par niveau atteint, appliquée au
   * niveau atteint au moment précis où l'écran se clôt — jamais rétroactivement). */
  niveauAidePont: number;
  niveauAideAngles: number;
  niveauAideSoustraction: number;
  niveauAideCible: number;
  niveauAideInterpretation: number;
  /** Scores/révélations des écrans déjà clos, conservés jusqu'à la clôture finale de l'exercice. */
  scorePontExercice: number | null;
  pontRevele: boolean;
  scoreAnglesExercice: number | null;
  anglesRevele: boolean;
  scoreSoustractionExercice: number | null;
  soustractionRevele: boolean;
  scoreCibleExercice: number | null;
  cibleRevele: boolean;
  resultats: ResultatExerciceTriangleLies[];
  terminee: boolean;
}
