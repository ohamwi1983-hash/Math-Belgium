import type { ExerciceLinearisation } from "../core6e/linearisationEuler";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

/**
 * Couche B (6e) — types de session de `6gen93` « Linéariser avec les formules d'Euler ».
 * - degré 2, 3 ou 4 : `euler` (facteur K) → `developper` (coefficients du binôme) → `regrouper`
 *   (coefficients de cos(kx) ou sin(kx)) → `lineaire` (forme linéarisée, expression libre) ;
 * - application : `lineaire` → `primitive` → `integrale` (valeur exacte).
 * Tous les écrans sont des champs libres (trois tentatives) : aucun choix fermé.
 */

export type PhaseLinearisation = "euler" | "developper" | "regrouper" | "lineaire" | "primitive" | "integrale";

export function phasesPourExercice(e: ExerciceLinearisation): PhaseLinearisation[] {
  return e.variante === "application" ? ["lineaire", "primitive", "integrale"] : ["euler", "developper", "regrouper", "lineaire"];
}

export function phaseApres(e: ExerciceLinearisation, phase: PhaseLinearisation): PhaseLinearisation | "termine" {
  const phases = phasesPourExercice(e);
  const i = phases.indexOf(phase);
  return i < phases.length - 1 ? phases[i + 1] : "termine";
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
