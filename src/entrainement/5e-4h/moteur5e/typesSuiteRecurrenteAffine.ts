/**
 * Couche B (5e) — types pour 5gen19 ("Suite récurrente affine et régime permanent"). Séquence FIXE
 * à 3 écrans (`poserRecurrence → regimePermanent → termesSuccessifs`), identique pour les 2 régimes
 * — le régime divergent ne saute jamais l'écran "regimePermanent", il y répond simplement
 * "n'existe pas" plutôt qu'un calcul (même principe que "Équation d'un cercle depuis un graphe",
 * séquence toujours complète).
 */
import type { ExerciceSuiteRecurrenteAffine } from "../core5e/suiteRecurrenteAffine.types";
import type { ReglagesSession5e } from "../core5e/session5e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

export type PhaseSuiteRecurrenteAffine = "poserRecurrence" | "regimePermanent" | "termesSuccessifs";

export function phaseInitiale(): PhaseSuiteRecurrenteAffine {
  return "poserRecurrence";
}

export function phaseApres(phase: PhaseSuiteRecurrenteAffine): PhaseSuiteRecurrenteAffine | "termine" {
  if (phase === "poserRecurrence") return "regimePermanent";
  if (phase === "regimePermanent") return "termesSuccessifs";
  return "termine";
}

export interface ResultatExerciceSuiteRecurrenteAffine {
  exercice: ExerciceSuiteRecurrenteAffine;
  scorePoserRecurrence: number;
  scoreRegimePermanent: number;
  scoreTermesSuccessifs: number;
}

export interface EtatSessionSuiteRecurrenteAffine {
  reglages: ReglagesSession5e;
  generateur: () => ExerciceSuiteRecurrenteAffine;
  indexExercice: number;
  exerciceCourant: ExerciceSuiteRecurrenteAffine;
  phase: PhaseSuiteRecurrenteAffine;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  scorePoserRecurrencePartiel: number | null;
  scoreRegimePermanentPartiel: number | null;
  resultats: ResultatExerciceSuiteRecurrenteAffine[];
  terminee: boolean;
  /** Capturé au moment précis où l'écran se ferme (post-soumission) — `etat.etapeCourante.revelee`
   * côté `App5gen19.tsx` est structurellement toujours `false` (l'écran vient de démarrer), ce qui
   * rendait le récap final systématiquement vert. */
  derniereEtapeRevelee: boolean;
}
