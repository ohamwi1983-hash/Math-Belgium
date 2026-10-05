import type { ExerciceTableauFrequences, GenerateurExerciceTableauFrequences } from "../core/tableauFrequences.types";
import type { ReglagesSession } from "../core/session.types";
import type { EtatEtapeTentatives } from "./etapeTentatives";

/** 4 phases fixes, toujours dans le même ordre — spec : "structure séquentielle à 4 écrans"
 * (`promptameliorationsgenerateur30.md`, point 5 — étend la structure d'origine à 3 écrans d'un
 * 4e, "Fréquences cumulées"), aucun saut conditionnel. Chaque écran affiche les valeurs CORRECTES
 * de l'écran précédent (jamais la saisie de l'élève, même si elle était fausse) — l'élève ne part
 * donc jamais d'une erreur en cascade. */
export type PhaseTableauFrequences = "identification" | "frequences" | "cumules" | "frequencesCumulees";

export interface ResultatExerciceTableauFrequences {
  scoreIdentification: number;
  identificationRevele: boolean;
  niveauAideIdentification: number;
  scoreFrequences: number;
  frequencesRevele: boolean;
  niveauAideFrequences: number;
  scoreCumules: number;
  cumulesRevele: boolean;
  niveauAideCumules: number;
  scoreFrequencesCumulees: number;
  frequencesCumuleesRevele: boolean;
  niveauAideFrequencesCumulees: number;
}

export interface EtatSessionTableauFrequences {
  reglages: ReglagesSession;
  generateur: GenerateurExerciceTableauFrequences;
  indexExercice: number;
  exerciceCourant: ExerciceTableauFrequences;
  phase: PhaseTableauFrequences;
  etapeCourante: EtatEtapeTentatives;
  /**
   * Aide PROGRESSIVE par écran (comme "Triangle quelconque"/"Colinéarité"/"Orthogonalité"/"Norme
   * d'un vecteur et distance entre 2 points") — 2 niveaux par écran (spec : "Aide 1"/"Aide 2"),
   * chacun révélant strictement plus que le précédent (`activerAideSuivante`,
   * `sessionTableauFrequences.ts`). Pénalité ADDITIVE (-20 points par niveau atteint) appliquée au
   * niveau atteint au moment précis où l'écran se clôt — jamais rétroactivement.
   */
  niveauAideIdentification: number;
  niveauAideFrequences: number;
  niveauAideCumules: number;
  niveauAideFrequencesCumulees: number;
  /** Scores/révélations des écrans déjà clos, conservés jusqu'à la clôture finale (qui construit le
   * `ResultatExerciceTableauFrequences` complet) — même principe que le reste du projet. */
  scoreIdentificationExercice: number | null;
  identificationRevele: boolean;
  scoreFrequencesExercice: number | null;
  frequencesRevele: boolean;
  /** `cumules` n'est plus la phase terminale depuis l'ajout de "Fréquences cumulées" — son score
   * doit donc désormais être conservé jusqu'à la clôture finale, comme les deux précédents. */
  scoreCumulesExercice: number | null;
  cumulesRevele: boolean;
  resultats: ResultatExerciceTableauFrequences[];
  terminee: boolean;
}
