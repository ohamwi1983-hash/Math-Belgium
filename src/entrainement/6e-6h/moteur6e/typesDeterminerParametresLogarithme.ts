/**
 * Couche B (6e) — types pour `6gen18` (f(x) = a + b·ln(x) depuis un graphique). Séquence UNIQUE de
 * 3 écrans pour les 3 variantes : lire a → équation en b → f(x). Voir
 * `core6e/determinerParametresLogarithme.types.ts` pour la décomposition.
 */
import type { ExerciceDeterminerParametresLogarithme } from "../core6e/determinerParametresLogarithme.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

export type PhaseDeterminerParametresLogarithme = "lireA" | "equationB" | "fonction";

export const SEQUENCE_PHASES: PhaseDeterminerParametresLogarithme[] = ["lireA", "equationB", "fonction"];

export function phaseInitiale(): PhaseDeterminerParametresLogarithme {
  return "lireA";
}

export function phaseApres(phase: PhaseDeterminerParametresLogarithme): PhaseDeterminerParametresLogarithme | "termine" {
  switch (phase) {
    case "lireA":
      return "equationB";
    case "equationB":
      return "fonction";
    case "fonction":
      return "termine";
  }
}

export interface ResultatExerciceDeterminerParametresLogarithme {
  exercice: ExerciceDeterminerParametresLogarithme;
  scores: Partial<Record<PhaseDeterminerParametresLogarithme, number>>;
}

export interface EtatSessionDeterminerParametresLogarithme {
  reglages: ReglagesSession6e;
  generateur: () => ExerciceDeterminerParametresLogarithme;
  exerciceCourant: ExerciceDeterminerParametresLogarithme;
  phase: PhaseDeterminerParametresLogarithme;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  scoresPartiels: Partial<Record<PhaseDeterminerParametresLogarithme, number>>;
  /** Vrai signal "révélé" par phase (jamais déduit du score) — même index que `scoresPartiels`. */
  revelesPartiels: Partial<Record<PhaseDeterminerParametresLogarithme, boolean>>;
  /** Niveau d'aide atteint sur chaque écran déjà clos (puce jaune). */
  aidesPartielles: Partial<Record<PhaseDeterminerParametresLogarithme, number>>;
  indexExercice: number;
  resultats: ResultatExerciceDeterminerParametresLogarithme[];
  terminee: boolean;
  /** Vrai UNIQUEMENT juste après l'appel qui a clos un écran par épuisement des tentatives —
   * `etapeCourante.revelee` est remis à `false` dans le même appel qui fait avancer `phase`. */
  derniereTransitionRevelee: boolean;
}
