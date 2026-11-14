/**
 * Couche B (6e) — types de `6gen85` « Lire une courbe logarithmique ». Variante `lecture` : quatre
 * écrans à saisie (asymptote, domaine, base, expression) ; variante `associer` : un écran à choix
 * fermé par courbe (une seule tentative). Voir `core6e/lireCourbeLogarithmique.types.ts`.
 */
import type { ExerciceLireCourbeLogarithmique } from "../core6e/lireCourbeLogarithmique.types";
import type { EnsembleReelGuide } from "../core6e/ensembleReel.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

export type PhaseLectureCourbeLog = "asymptote" | "domaine" | "base" | "expression";
export type PhaseAssocierCourbesLog = "courbe1" | "courbe2" | "courbe3" | "courbe4";
export type PhaseLireCourbeLogarithmique = PhaseLectureCourbeLog | PhaseAssocierCourbesLog;

export const PHASES_LECTURE: PhaseLectureCourbeLog[] = ["asymptote", "domaine", "base", "expression"];
export const PHASES_ASSOCIER: PhaseAssocierCourbesLog[] = ["courbe1", "courbe2", "courbe3", "courbe4"];

export function phasesExercice(e: ExerciceLireCourbeLogarithmique): PhaseLireCourbeLogarithmique[] {
  return e.variante === "lecture" ? PHASES_LECTURE : PHASES_ASSOCIER;
}

export function estPhaseChoix(phase: PhaseLireCourbeLogarithmique): phase is PhaseAssocierCourbesLog {
  return phase.startsWith("courbe");
}

/** Numéro (0…3) de la courbe d'un écran `associer`. */
export function indiceCourbe(phase: PhaseAssocierCourbesLog): number {
  return Number(phase.slice(-1)) - 1;
}

/** Réponse d'un écran : texte libre, ensemble construit (domaine) ou indice d'expression choisi. */
export type ReponseLireCourbeLog = { type: "texte"; texte: string } | { type: "ensemble"; ensemble: EnsembleReelGuide } | { type: "choix"; indice: number };

export interface EtatSessionLireCourbeLogarithmique {
  reglages: ReglagesSession6e;
  generateur: () => ExerciceLireCourbeLogarithmique;
  exerciceCourant: ExerciceLireCourbeLogarithmique;
  phase: PhaseLireCourbeLogarithmique;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  revelesPartiels: Partial<Record<PhaseLireCourbeLogarithmique, boolean>>;
  indexExercice: number;
  terminee: boolean;
  derniereTransitionRevelee: boolean;
}
