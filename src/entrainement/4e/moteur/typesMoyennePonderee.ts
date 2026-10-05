import type { ExerciceMoyennePonderee, GenerateurExerciceMoyennePonderee, VarianteMoyennePonderee } from "../core/moyennePonderee.types";
import type { ReglagesSession } from "../core/session.types";
import type { EtatEtapeTentatives } from "./etapeTentatives";

/** Séquence dépendant de la variante (aiguillage `etat.phase` combiné à `exercice.variante`, même
 * principe que "Regroupement en classes et histogramme"/"Colinéarité"/"Orthogonalité") :
 * variante "discrete" → `sommes → quotient` (2 phases, "quotient" terminale) ; variante "classes" →
 * `centres → sommes → quotient` (3 phases, "quotient" terminale) — même structure finale que
 * "discrete" depuis le retrait de l'écran "conceptuel" (`promptgen32modifications.md`, point 5). */
export type PhaseMoyennePonderee = "centres" | "sommes" | "quotient";

export interface ResultatExerciceMoyennePonderee {
  /** Nécessaire pour que le résumé de session sache si l'écran "centres" a eu lieu pour cet
   * exercice (le score `null` le dit déjà en soi, mais ce champ évite d'avoir à le redériver
   * indirectement — même principe que `variante` dans `ResultatExerciceHistogramme`). */
  variante: VarianteMoyennePonderee;
  /** `null` pour la variante "discrete" (écran sauté). */
  scoreCentres: number | null;
  centresRevele: boolean;
  niveauAideCentres: number;
  scoreSommes: number;
  sommesRevele: boolean;
  niveauAideSommes: number;
  scoreQuotient: number;
  quotientRevele: boolean;
  niveauAideQuotient: number;
}

export interface EtatSessionMoyennePonderee {
  reglages: ReglagesSession;
  generateur: GenerateurExerciceMoyennePonderee;
  indexExercice: number;
  exerciceCourant: ExerciceMoyennePonderee;
  phase: PhaseMoyennePonderee;
  etapeCourante: EtatEtapeTentatives;
  /**
   * Aide PROGRESSIVE par écran (comme "Tableau de fréquences"/"Regroupement en classes et
   * histogramme"/"Triangle quelconque"/"Colinéarité") — 2 niveaux sur "centres", 2 niveaux sur
   * "sommes", 1 seul niveau sur "quotient" (spec). Pénalité ADDITIVE (-20 points par niveau
   * atteint) appliquée au niveau atteint au moment précis où l'écran se clôt — jamais
   * rétroactivement.
   */
  niveauAideCentres: number;
  niveauAideSommes: number;
  niveauAideQuotient: number;
  /** Scores/révélations des écrans déjà clos, conservés jusqu'à la clôture finale (qui construit le
   * `ResultatExerciceMoyennePonderee` complet) — même principe que le reste du projet. */
  scoreCentresExercice: number | null;
  centresRevele: boolean;
  scoreSommesExercice: number | null;
  sommesRevele: boolean;
  scoreQuotientExercice: number | null;
  quotientRevele: boolean;
  resultats: ResultatExerciceMoyennePonderee[];
  terminee: boolean;
}
