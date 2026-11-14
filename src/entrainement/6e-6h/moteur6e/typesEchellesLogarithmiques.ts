import type { ExerciceEchellesLogarithmiques } from "../core6e/echellesLogarithmiques.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

/**
 * Couche B (6e) — types de session de `6gen90` « Échelles logarithmiques ». Chaîne FIXE de 3 écrans
 * pour toutes les variantes :
 * 1. `traduire` — choix fermé (UNE tentative) : quelle relation traduit la situation (écart sur
 *    l'échelle ↔ rapport de la grandeur) ; pièges : multiplier le niveau, oublier le log, mauvais
 *    coefficient (1,5 ; 2,5 ; 0,4 ; 10), signe inversé ;
 * 2. `calcul` — l'écart sur l'échelle (type « facteur ») ou le logarithme du rapport (types
 *    « rapport » et « combien ») ;
 * 3. `reponse` — la réponse en contexte, à la précision annoncée : nouveau niveau, rapport, nombre
 *    minimal de sources.
 */

export type PhaseEchelles = "traduire" | "calcul" | "reponse";

export const PHASES_ECHELLES: PhaseEchelles[] = ["traduire", "calcul", "reponse"];

export function phaseApres(phase: PhaseEchelles): PhaseEchelles | "termine" {
  const i = PHASES_ECHELLES.indexOf(phase);
  return i < PHASES_ECHELLES.length - 1 ? PHASES_ECHELLES[i + 1] : "termine";
}

/** Seul écran à choix fermé (une seule tentative). */
export function estPhaseChoix(phase: PhaseEchelles): boolean {
  return phase === "traduire";
}

export interface EtatSessionEchelles {
  reglages: ReglagesSession6e;
  generateur: () => ExerciceEchellesLogarithmiques;
  exerciceCourant: ExerciceEchellesLogarithmiques;
  phase: PhaseEchelles;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  revelesPartiels: Partial<Record<PhaseEchelles, boolean>>;
  aidePartiels: Partial<Record<PhaseEchelles, boolean>>;
  derniereTransitionRevelee: boolean;
  indexExercice: number;
  terminee: boolean;
}
