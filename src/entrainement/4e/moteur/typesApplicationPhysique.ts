import type { ExerciceApplicationPhysique, GenerateurExerciceApplicationPhysique } from "../core/applicationPhysique.types";
import type { ReglagesSession } from "../core/session.types";
import type { EtatEtapeTentatives } from "./etapeTentatives";

/** 4 phases fixes, toujours dans le même ordre, aucun saut conditionnel — la variante
 * (angleDroit/angleQuelconque) ne change que la narration/l'étiquetage, jamais la séquence :
 * les deux variantes se résolvent par le même calcul (`resoudreSAS`, voir Couche A). Pas d'écran
 * "énoncé" séparé (même leçon déjà établie ailleurs dans le projet) : le contexte narratif et le
 * schéma sont affichés dès l'écran "modelisation", qui porte aussi la question. */
export type PhaseApplicationPhysique = "modelisation" | "norme" | "deviation" | "interpretation";

/** `xxxRevele`/`normeAideUtilisee` capturés au moment précis où chaque écran se clôt (jamais après
 * coup) — convention transversale CLAUDE.md, "Récapitulatif final" : une tentative ratée sans aide
 * reste verte, seule une réponse révélée après épuisement des tentatives (ou une aide utilisée sur
 * l'écran "norme", seul écran de ce générateur qui en a une) colore la ligne correspondante. */
export interface ResultatExerciceApplicationPhysique {
  scoreModelisation: number;
  modelisationRevele: boolean;
  scoreNorme: number;
  normeRevele: boolean;
  normeAideUtilisee: boolean;
  scoreDeviation: number;
  deviationRevele: boolean;
  scoreInterpretation: number;
  interpretationRevele: boolean;
}

export interface EtatSessionApplicationPhysique {
  reglages: ReglagesSession;
  generateur: GenerateurExerciceApplicationPhysique;
  indexExercice: number;
  exerciceCourant: ExerciceApplicationPhysique;
  phase: PhaseApplicationPhysique;
  etapeCourante: EtatEtapeTentatives;
  /** Aide progressive (2 niveaux, pénalité additive -20 pts/niveau) — uniquement sur l'écran
   * "norme" (`promptgen29modificationscompletes.md`, point 4.3), seul écran de ce générateur à en
   * avoir une. Remis à 0 à chaque nouvel exercice, jamais rétroactif sur un exercice déjà clos. */
  niveauAideNorme: number;
  /** `null` tant que la phase correspondante n'est pas encore close pour l'exercice courant —
   * jamais un score sautable ici (les 4 phases ont toujours lieu), seulement transitoire. */
  scoreModelisationExercice: number | null;
  modelisationReveleExercice: boolean;
  scoreNormeExercice: number | null;
  normeReveleExercice: boolean;
  /** Capturé au moment précis où l'écran "norme" se clôt (`etat.niveauAideNorme > 0` à cet instant),
   * jamais recalculé après coup depuis `niveauAideNorme` (déjà remis à 0 dès l'exercice suivant). */
  normeAideUtiliseeExercice: boolean;
  scoreDeviationExercice: number | null;
  deviationReveleExercice: boolean;
  resultats: ResultatExerciceApplicationPhysique[];
  terminee: boolean;
}
