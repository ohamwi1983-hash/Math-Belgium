import type { ExerciceLinearisation } from "../core6e/linearisationDonnees";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

/**
 * Couche B (6e) — types de session de `6gen89` « Linéariser des données ». Chaîne d'écrans :
 * - semi-log et log-log : `logs` (ln des deux lignes désignées) → `pente` → `ordonnee` → `modele`
 *   (k et a, ou k et n) → `prevision` ;
 * - choisir : `choix` (choix fermé, une tentative) → `pente` → `ordonnee` → `prevision` (même
 *   nombre d'écrans quelle que soit l'issue du choix).
 */

export type PhaseLinearisation = "logs" | "choix" | "pente" | "ordonnee" | "modele" | "prevision";

export function phasesPourExercice(e: ExerciceLinearisation): PhaseLinearisation[] {
  return e.variante === "choisir" ? ["choix", "pente", "ordonnee", "prevision"] : ["logs", "pente", "ordonnee", "modele", "prevision"];
}

export function phaseApres(e: ExerciceLinearisation, phase: PhaseLinearisation): PhaseLinearisation | "termine" {
  const phases = phasesPourExercice(e);
  const i = phases.indexOf(phase);
  return i < phases.length - 1 ? phases[i + 1] : "termine";
}

/** Écran à choix fermé : une seule tentative (règle permanente du site). */
export function estPhaseChoix(phase: PhaseLinearisation): boolean {
  return phase === "choix";
}

export interface EtatSessionLinearisation {
  reglages: ReglagesSession6e;
  generateur: () => ExerciceLinearisation;
  exerciceCourant: ExerciceLinearisation;
  phase: PhaseLinearisation;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  revelesPartiels: Partial<Record<PhaseLinearisation, boolean>>;
  derniereTransitionRevelee: boolean;
  indexExercice: number;
  terminee: boolean;
}
