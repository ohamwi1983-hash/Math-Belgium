import type { ExerciceDeuxEcritures } from "../core6e/deuxEcrituresComplexe";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

/**
 * Couche B (6e) — types de session de `6gen94` « Valeurs exactes par deux écritures d'un même
 * complexe ». Quatre écrans, tous à champs libres (trois tentatives), aucun choix fermé :
 * `algebrique` (Re z, Im z) → `facteurs` (module et argument de chaque facteur) → `trigo` (module et
 * argument de z : sa forme trigonométrique) → `identification` (cos θ et sin θ exacts).
 */

export type PhaseDeuxEcritures = "algebrique" | "facteurs" | "trigo" | "identification";

export const PHASES_DEUX_ECRITURES: PhaseDeuxEcritures[] = ["algebrique", "facteurs", "trigo", "identification"];

export function phaseApres(phase: PhaseDeuxEcritures): PhaseDeuxEcritures | "termine" {
  const i = PHASES_DEUX_ECRITURES.indexOf(phase);
  return i < PHASES_DEUX_ECRITURES.length - 1 ? PHASES_DEUX_ECRITURES[i + 1] : "termine";
}

export interface EtatSessionDeuxEcritures {
  reglages: ReglagesSession6e;
  generateur: () => ExerciceDeuxEcritures;
  exerciceCourant: ExerciceDeuxEcritures;
  phase: PhaseDeuxEcritures;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  revelesPartiels: Partial<Record<PhaseDeuxEcritures, boolean>>;
  derniereTransitionRevelee: boolean;
  indexExercice: number;
  terminee: boolean;
}
