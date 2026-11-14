import type { ExerciceModeliserSuite } from "../core5e/modeliserSuite";
import type { ReglagesSession5e } from "../core5e/session5e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

/**
 * Couche B (5e) — types de session de `5gen47` « Modéliser une situation par une suite ». Toujours
 * cinq écrans (le nombre de puces ne trahit ni la nature ni la question) :
 * `nature` (choix fermé, une tentative) → `premierTerme` (u₁) → `raison` (r ou q) → puis, selon la
 * question :
 * - terme : `rang` (l'année demandée → son rang) → `terme` (uₙ) ;
 * - somme : `nombreTermes` (N, de l'année de rang 1 à la dernière année) → `somme` (S_N) ;
 * - seuil : `tableau` (quatre termes consécutifs autour du franchissement) → `annee` (la première
 *   année où le seuil est franchi).
 */

export type PhaseModeliserSuite = "nature" | "premierTerme" | "raison" | "rang" | "terme" | "nombreTermes" | "somme" | "tableau" | "annee";

export function phasesPourExercice(e: ExerciceModeliserSuite): PhaseModeliserSuite[] {
  switch (e.variante) {
    case "terme":
      return ["nature", "premierTerme", "raison", "rang", "terme"];
    case "somme":
      return ["nature", "premierTerme", "raison", "nombreTermes", "somme"];
    case "seuil":
      return ["nature", "premierTerme", "raison", "tableau", "annee"];
  }
}

export function phaseApres(e: ExerciceModeliserSuite, phase: PhaseModeliserSuite): PhaseModeliserSuite | "termine" {
  const phases = phasesPourExercice(e);
  const i = phases.indexOf(phase);
  return i < phases.length - 1 ? phases[i + 1] : "termine";
}

/** Seul écran à choix fermé : une seule tentative (règle permanente du site). */
export function estPhaseChoix(phase: PhaseModeliserSuite): boolean {
  return phase === "nature";
}

export interface EtatSessionModeliserSuite {
  reglages: ReglagesSession5e;
  generateur: () => ExerciceModeliserSuite;
  exerciceCourant: ExerciceModeliserSuite;
  phase: PhaseModeliserSuite;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  revelesPartiels: Partial<Record<PhaseModeliserSuite, boolean>>;
  derniereTransitionRevelee: boolean;
  indexExercice: number;
  terminee: boolean;
}
