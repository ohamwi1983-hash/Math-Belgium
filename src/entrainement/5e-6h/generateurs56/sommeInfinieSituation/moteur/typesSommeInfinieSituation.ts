// Copie 5e (6h) de `5e-4h/moteur5e/typesSommeInfinieSituation.ts` (56gen7 ← 5gen48, chantier D du 26/11/2026) — copiée pour que les deux années puissent diverger.
import type { ExerciceSommeInfinie } from "../core/sommeInfinieSituation.types";
import type { ReglagesSession5e } from "../../../../5e-4h/core5e/session5e.types";
import type { EtatEtapeTentatives } from "../../../../5e-4h/moteur/etapeTentatives";

/**
 * Couche B (5e) — types de session de `5gen48` « Somme infinie en situation ». Quatre écrans par
 * exercice, tous à champ libre (trois tentatives) :
 * `premierTerme` (u₁) → `raison` (q) → `sommeInfinie` (condition |q| < 1 demandée dans la consigne
 * et justifiée dans la réponse affichée, puis S∞ exacte) → `reponse` (réponse au problème : fraction
 * irréductible, distance, aire non coloriée).
 */

export type PhaseSommeInfinie = "premierTerme" | "raison" | "sommeInfinie" | "reponse";

export const PHASES: PhaseSommeInfinie[] = ["premierTerme", "raison", "sommeInfinie", "reponse"];

export function phaseApres(phase: PhaseSommeInfinie): PhaseSommeInfinie | "termine" {
  const i = PHASES.indexOf(phase);
  return i < PHASES.length - 1 ? PHASES[i + 1] : "termine";
}

export interface EtatSessionSommeInfinie {
  reglages: ReglagesSession5e;
  generateur: () => ExerciceSommeInfinie;
  exerciceCourant: ExerciceSommeInfinie;
  phase: PhaseSommeInfinie;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  revelesPartiels: Partial<Record<PhaseSommeInfinie, boolean>>;
  derniereTransitionRevelee: boolean;
  indexExercice: number;
  terminee: boolean;
}
