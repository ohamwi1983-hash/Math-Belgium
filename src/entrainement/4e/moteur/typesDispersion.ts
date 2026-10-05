import type { ExerciceDispersion, GenerateurExerciceDispersion } from "../core/dispersion.types";
import type { ReglagesSession } from "../core/session.types";
import type { EtatEtapeTentatives } from "./etapeTentatives";

/** 2 phases FIXES, toujours dans le même ordre — aucune variante, aucun saut conditionnel (contrat
 * n'a qu'un seul mécanisme, voir `core/dispersion.types.ts`) : `tableau → varianceEcartType`,
 * `varianceEcartType` toujours terminale. */
export type PhaseDispersion = "tableau" | "varianceEcartType";

export interface ResultatExerciceDispersion {
  scoreTableau: number;
  tableauRevele: boolean;
  niveauAideTableau: number;
  scoreVarianceEcartType: number;
  varianceEcartTypeRevele: boolean;
  niveauAideVarianceEcartType: number;
}

export interface EtatSessionDispersion {
  reglages: ReglagesSession;
  generateur: GenerateurExerciceDispersion;
  indexExercice: number;
  exerciceCourant: ExerciceDispersion;
  phase: PhaseDispersion;
  etapeCourante: EtatEtapeTentatives;
  /** Aide PROGRESSIVE par écran (comme "Moyenne pondérée"/"Tableau de fréquences"...) — 2 niveaux
   * sur chacun des 2 écrans (spec). Pénalité ADDITIVE (-20 points par niveau atteint) appliquée au
   * niveau atteint au moment précis où l'écran se clôt — jamais rétroactivement. */
  niveauAideTableau: number;
  niveauAideVarianceEcartType: number;
  /** Score/révélation de l'écran "tableau", conservés jusqu'à la clôture finale de l'exercice
   * (qui construit le `ResultatExerciceDispersion` complet) — même principe que le reste du projet. */
  scoreTableauExercice: number | null;
  tableauRevele: boolean;
  resultats: ResultatExerciceDispersion[];
  terminee: boolean;
}
