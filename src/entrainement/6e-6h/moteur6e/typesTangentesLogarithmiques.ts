import type { ExerciceTangentesLog } from "../core6e/tangentesLogarithmiques.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

/**
 * Couche B (6e) — types de session de `6gen87` « Tangentes aux courbes logarithmiques ». Chaîne
 * d'écrans selon la variante (tous des champs libres : 3 tentatives, une saisie illisible ne
 * consomme jamais de tentative) :
 * - `point` : `derivee` → `valeurs` (f(x₀) et f′(x₀)) → `equation` ;
 * - `parallele` : `derivee` → `solutions` (liste des abscisses de contact) → `equations` (une par
 *   solution) ;
 * - `origine` : `tangenteA` (équation en fonction de a) → `valeurA` → `equation`.
 */

export type PhaseTangentesLog = "derivee" | "valeurs" | "equation" | "solutions" | "equations" | "tangenteA" | "valeurA";

export function phasesExercice(e: ExerciceTangentesLog): PhaseTangentesLog[] {
  switch (e.variante) {
    case "point":
      return ["derivee", "valeurs", "equation"];
    case "parallele":
      return ["derivee", "solutions", "equations"];
    case "origine":
      return ["tangenteA", "valeurA", "equation"];
  }
}

/** Écran « liste » (nombre de valeurs libre) : seulement les abscisses des points de contact. */
export function estPhaseListe(phase: PhaseTangentesLog): boolean {
  return phase === "solutions";
}

export interface EtatSessionTangentesLog {
  reglages: ReglagesSession6e;
  generateur: () => ExerciceTangentesLog;
  exerciceCourant: ExerciceTangentesLog;
  phase: PhaseTangentesLog;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  revelesPartiels: Partial<Record<PhaseTangentesLog, boolean>>;
  derniereTransitionRevelee: boolean;
  indexExercice: number;
  terminee: boolean;
}
