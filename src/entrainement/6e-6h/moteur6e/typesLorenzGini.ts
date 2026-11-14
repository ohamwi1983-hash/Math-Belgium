import type { ExerciceLorenzGini } from "../core6e/lorenzGini";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

/**
 * Couche B (6e) — types de session de `6gen82` « Courbe de Lorenz et coefficient de Gini ».
 * Chaîne d'écrans propre à chaque variante :
 * - lecture : `valeur` (L(p)) → `interpretation` (choix fermé) → `aire` → `gini` ;
 * - comparaison : `aires` (deux champs) → `ginis` (deux champs) → `verdict` (choix fermé) ;
 * - paramètre : `aireA` (𝒜 en fonction de a) → `giniA` (G en fonction de a) → `valeurA`.
 */

export type PhaseLorenz = "valeur" | "interpretation" | "aire" | "gini" | "aires" | "ginis" | "verdict" | "aireA" | "giniA" | "valeurA";

export function phasesPourExercice(e: ExerciceLorenzGini): PhaseLorenz[] {
  switch (e.variante) {
    case "lecture":
      return ["valeur", "interpretation", "aire", "gini"];
    case "comparaison":
      return ["aires", "ginis", "verdict"];
    case "parametre":
      return ["aireA", "giniA", "valeurA"];
  }
}

export function phaseApres(e: ExerciceLorenzGini, phase: PhaseLorenz): PhaseLorenz | "termine" {
  const phases = phasesPourExercice(e);
  const i = phases.indexOf(phase);
  return i < phases.length - 1 ? phases[i + 1] : "termine";
}

/** Écrans à choix fermé : une seule tentative (règle permanente du site). */
export function estPhaseChoix(phase: PhaseLorenz): boolean {
  return phase === "interpretation" || phase === "verdict";
}

export interface EtatSessionLorenz {
  reglages: ReglagesSession6e;
  generateur: () => ExerciceLorenzGini;
  exerciceCourant: ExerciceLorenzGini;
  phase: PhaseLorenz;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  revelesPartiels: Partial<Record<PhaseLorenz, boolean>>;
  derniereTransitionRevelee: boolean;
  indexExercice: number;
  terminee: boolean;
}
