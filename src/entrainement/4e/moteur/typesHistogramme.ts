import type { ExerciceHistogramme, GenerateurExerciceHistogramme, VarianteHistogramme } from "../core/histogramme.types";
import type { ReglagesSession } from "../core/session.types";
import type { EtatEtapeTentatives } from "./etapeTentatives";

/** Séquence dépendant de la variante (aiguillage `etat.phase` combiné à `exercice.variante`, même
 * principe que "Colinéarité"/"Orthogonalité"/"Norme d'un vecteur et distance entre 2 points") :
 * variante "effectif" → `classement → trace` (2 phases) ; variante "frequence" →
 * `classement → frequences → trace` (3 phases). "trace" est toujours la phase terminale. */
export type PhaseHistogramme = "classement" | "frequences" | "trace";

export interface ResultatExerciceHistogramme {
  /** Nécessaire pour que le résumé de session sache si l'écran "fréquences" a eu lieu pour cet
   * exercice (`scoreFrequences === null` le dit déjà en soi, mais ce champ évite d'avoir à le
   * redériver indirectement — même principe que `categorie`/`construction` ailleurs dans le projet). */
  variante: VarianteHistogramme;
  scoreClassement: number;
  classementRevele: boolean;
  niveauAideClassement: number;
  /** `null` pour la variante "effectif" (écran sauté). */
  scoreFrequences: number | null;
  frequencesRevele: boolean;
  niveauAideFrequences: number;
  scoreTrace: number;
  traceRevele: boolean;
  niveauAideTrace: number;
}

export interface EtatSessionHistogramme {
  reglages: ReglagesSession;
  generateur: GenerateurExerciceHistogramme;
  indexExercice: number;
  exerciceCourant: ExerciceHistogramme;
  phase: PhaseHistogramme;
  etapeCourante: EtatEtapeTentatives;
  /**
   * Aide PROGRESSIVE par écran (comme "Tableau de fréquences"/"Triangle quelconque"/"Colinéarité") —
   * 2 niveaux sur "classement", 2 niveaux sur "frequences", 1 seul niveau sur "trace" (spec).
   * Pénalité ADDITIVE (-20 points par niveau atteint) appliquée au niveau atteint au moment précis
   * où l'écran se clôt — jamais rétroactivement.
   */
  niveauAideClassement: number;
  niveauAideFrequences: number;
  niveauAideTrace: number;
  /** Scores/révélations des écrans déjà clos, conservés jusqu'à la clôture finale (qui construit le
   * `ResultatExerciceHistogramme` complet) — même principe que le reste du projet. */
  scoreClassementExercice: number | null;
  classementRevele: boolean;
  scoreFrequencesExercice: number | null;
  frequencesRevele: boolean;
  resultats: ResultatExerciceHistogramme[];
  terminee: boolean;
}
