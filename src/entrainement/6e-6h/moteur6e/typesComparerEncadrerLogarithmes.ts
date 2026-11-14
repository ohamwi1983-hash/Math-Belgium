import type { ExerciceComparerEncadrerLog } from "../core6e/comparerEncadrerLogarithmes.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

/**
 * Couche B (6e) — types de session de `6gen86` « Comparer et encadrer des logarithmes sans
 * calculatrice ». La chaîne d'écrans dépend de la variante :
 * - `encadrer` : `puissances` (aᵏ et aᵏ⁺¹) → `encadrement` (k et k + 1) ;
 * - `comparer` : `encadrerA` → `encadrerB` → `verdict` (A < B, A > B ou A = B) ;
 * - `ranger` : `situer` (entier n de chaque logarithme) → `ordre` (ordre croissant au doigt) ;
 * - `changementBase` : `formule` (changement de base) → `valeurs` (log N, log a) → `quotient`.
 * Les écrans `verdict`, `ordre` et `formule` sont à choix fermé (UNE tentative) ; les autres, des
 * champs libres (3 tentatives, saisie illisible jamais décomptée).
 */

export type PhaseComparerEncadrerLog = "puissances" | "encadrement" | "encadrerA" | "encadrerB" | "verdict" | "situer" | "ordre" | "formule" | "valeurs" | "quotient";

export type PhaseChoixComparerEncadrerLog = "verdict" | "ordre" | "formule";
export type PhaseChampsComparerEncadrerLog = Exclude<PhaseComparerEncadrerLog, PhaseChoixComparerEncadrerLog>;

export function phasesExercice(e: ExerciceComparerEncadrerLog): PhaseComparerEncadrerLog[] {
  switch (e.variante) {
    case "encadrer":
      return ["puissances", "encadrement"];
    case "comparer":
      return ["encadrerA", "encadrerB", "verdict"];
    case "ranger":
      return ["situer", "ordre"];
    case "changementBase":
      return ["formule", "valeurs", "quotient"];
  }
}

const PHASES_CHOIX: PhaseComparerEncadrerLog[] = ["verdict", "ordre", "formule"];

/** Écrans à choix fermé (une seule tentative) — les autres sont des champs libres. */
export function estPhaseChoix(phase: PhaseComparerEncadrerLog): phase is PhaseChoixComparerEncadrerLog {
  return PHASES_CHOIX.includes(phase);
}

export interface EtatSessionComparerEncadrerLog {
  reglages: ReglagesSession6e;
  generateur: () => ExerciceComparerEncadrerLog;
  exerciceCourant: ExerciceComparerEncadrerLog;
  phase: PhaseComparerEncadrerLog;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  revelesPartiels: Partial<Record<PhaseComparerEncadrerLog, boolean>>;
  derniereTransitionRevelee: boolean;
  indexExercice: number;
  terminee: boolean;
}
