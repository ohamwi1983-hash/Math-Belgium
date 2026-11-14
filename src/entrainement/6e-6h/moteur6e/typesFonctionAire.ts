import type { ExerciceFonctionAire, VarianteFonctionAire } from "../core6e/fonctionAire.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

/**
 * Couche B (6e) — types de session de `6gen78` « La fonction aire ». Chaîne d'écrans PAR VARIANTE :
 * - `valeurs` : `aires` (intégrales sur des intervalles) → `valeursA` ;
 * - `variations` : `sens` (choix fermé par intervalle) → `tableau` (valeurs du tableau) ;
 * - `extremums` : `nature` (choix fermé par abscisse candidate) → `valeursExt` ;
 * - `pente` : `pentes` (A′(p) = f(p)) → `tangente` (A(p) et équation) ;
 * - `graphique` : `choixGraphique` (un seul écran, choix fermé).
 */

export type PhaseFonctionAire = "aires" | "valeursA" | "sens" | "tableau" | "nature" | "valeursExt" | "pentes" | "tangente" | "choixGraphique";

export const PHASES_PAR_VARIANTE: Record<VarianteFonctionAire, PhaseFonctionAire[]> = {
  valeurs: ["aires", "valeursA"],
  variations: ["sens", "tableau"],
  extremums: ["nature", "valeursExt"],
  pente: ["pentes", "tangente"],
  graphique: ["choixGraphique"],
};

export function phasesPourExercice(e: ExerciceFonctionAire): PhaseFonctionAire[] {
  return PHASES_PAR_VARIANTE[e.variante];
}

export function phaseApres(e: ExerciceFonctionAire, phase: PhaseFonctionAire): PhaseFonctionAire | "termine" {
  const phases = phasesPourExercice(e);
  const i = phases.indexOf(phase);
  return i < phases.length - 1 ? phases[i + 1] : "termine";
}

/** Écrans à choix fermé (UNE seule tentative) — les autres sont des champs libres (3 tentatives). */
export function estPhaseChoix(phase: PhaseFonctionAire): boolean {
  return phase === "sens" || phase === "nature" || phase === "choixGraphique";
}

export interface EtatSessionFonctionAire {
  reglages: ReglagesSession6e;
  generateur: () => ExerciceFonctionAire;
  exerciceCourant: ExerciceFonctionAire;
  phase: PhaseFonctionAire;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  revelesPartiels: Partial<Record<PhaseFonctionAire, boolean>>;
  derniereTransitionRevelee: boolean;
  indexExercice: number;
  terminee: boolean;
}
