import type { ExerciceRegions } from "../core6e/regionsPlanComplexe.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

/**
 * Couche B (6e) — types de session de `6gen98` « Régions du plan complexe ». Chaîne FIXE de 4
 * écrans pour toutes les variantes (une intersection pose chaque question pour ses DEUX
 * conditions sur le même écran) :
 * 1. `nature` — nature de la frontière (choix fermé, UNE tentative) ;
 * 2. `elements` — ses éléments : centre et rayon, équation x = k / y = k, points A et B, sommet et
 *    angle entre les demi-droites (champs libres, 3 tentatives) ;
 * 3. `bord` — bord inclus ou exclu (choix fermé, UNE tentative) ;
 * 4. `region` — la région, parmi quatre figures (choix fermé, UNE tentative).
 */

export type PhaseRegions = "nature" | "elements" | "bord" | "region";

export const PHASES_REGIONS: PhaseRegions[] = ["nature", "elements", "bord", "region"];

export function phaseApres(phase: PhaseRegions): PhaseRegions | "termine" {
  const i = PHASES_REGIONS.indexOf(phase);
  return i < PHASES_REGIONS.length - 1 ? PHASES_REGIONS[i + 1] : "termine";
}

export function estPhaseChoix(phase: PhaseRegions): boolean {
  return phase !== "elements";
}

export interface EtatSessionRegions {
  reglages: ReglagesSession6e;
  generateur: () => ExerciceRegions;
  exerciceCourant: ExerciceRegions;
  phase: PhaseRegions;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  revelesPartiels: Partial<Record<PhaseRegions, boolean>>;
  aidePartiels: Partial<Record<PhaseRegions, boolean>>;
  derniereTransitionRevelee: boolean;
  indexExercice: number;
  terminee: boolean;
}
