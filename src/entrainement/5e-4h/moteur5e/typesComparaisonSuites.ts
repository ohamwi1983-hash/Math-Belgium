/**
 * Couche B (5e) — types pour 5gen18 ("Comparaison numérique de deux suites"). Séquence FIXE à 2
 * écrans (`tableau → conclusion`), identique pour les 3 familles — jamais de saut conditionnel,
 * contrairement à la plupart des moteurs récents du chantier.
 */
import type { ExerciceComparaisonSuites } from "../core5e/comparaisonSuites.types";
import type { ReglagesSession5e } from "../core5e/session5e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

export type PhaseComparaisonSuites = "tableau" | "conclusion";

export function phaseInitiale(): PhaseComparaisonSuites {
  return "tableau";
}

export function phaseApres(phase: PhaseComparaisonSuites): PhaseComparaisonSuites | "termine" {
  return phase === "tableau" ? "conclusion" : "termine";
}

export interface ResultatExerciceComparaisonSuites {
  exercice: ExerciceComparaisonSuites;
  scoreTableau: number;
  scoreConclusion: number;
}

export interface EtatSessionComparaisonSuites {
  reglages: ReglagesSession5e;
  generateur: () => ExerciceComparaisonSuites;
  indexExercice: number;
  exerciceCourant: ExerciceComparaisonSuites;
  phase: PhaseComparaisonSuites;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  scoreTableauPartiel: number | null;
  resultats: ResultatExerciceComparaisonSuites[];
  terminee: boolean;
  /** POST-soumission — reflète la révélation de la DERNIÈRE phase venant de se clôturer (fermeture
   * d'exercice ou passage à la phase suivante). À distinguer de `etapeCourante.revelee`, qui décrit
   * l'écran PRÉ-soumission en cours et est donc structurellement toujours `false` juste après un
   * `soumettreReponseTableau`/`soumettreReponseConclusion` réussi (voir `sessionComparaisonSuites.ts`). */
  derniereEtapeRevelee: boolean;
}
