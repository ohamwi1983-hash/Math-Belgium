/**
 * Couche B (6e) — types pour `6gen20`. Séquence FIXE, indépendante de la famille : "selection"
 * (choisir le graphique de f' en lisant celui de f) → "derivee" (calculer f'(x), qui confirme le
 * choix) — voir `core6e/graphiqueDeriveeLogarithme.types.ts`.
 */
import type { ExerciceGraphiqueDeriveeLogarithme } from "../core6e/graphiqueDeriveeLogarithme.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

export type PhaseGraphiqueDeriveeLogarithme = "selection" | "derivee";

export function phaseInitiale(): PhaseGraphiqueDeriveeLogarithme {
  return "selection";
}

export function phaseApres(phase: PhaseGraphiqueDeriveeLogarithme): PhaseGraphiqueDeriveeLogarithme | "termine" {
  return phase === "selection" ? "derivee" : "termine";
}

/** Une seule tentative pour le choix graphique (4 options : il se gagnait sinon par élimination) ;
 * la saisie libre de f'(x) garde le réglage de session. */
export function tentativesMaxPhase(phase: PhaseGraphiqueDeriveeLogarithme, tentativesSession: number): number {
  return phase === "selection" ? 1 : tentativesSession;
}

export interface ResultatExerciceGraphiqueDeriveeLogarithme {
  exercice: ExerciceGraphiqueDeriveeLogarithme;
  scoreSelection: number;
  scoreDerivee: number;
}

export interface EtatSessionGraphiqueDeriveeLogarithme {
  reglages: ReglagesSession6e;
  generateur: () => ExerciceGraphiqueDeriveeLogarithme;
  exerciceCourant: ExerciceGraphiqueDeriveeLogarithme;
  phase: PhaseGraphiqueDeriveeLogarithme;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  /** Score de l'écran "selection" (1er écran), conservé jusqu'à la clôture de "derivee" — `null`
   * tant que "selection" n'est pas terminé. */
  scoreSelectionPartiel: number | null;
  /** true si l'écran "selection" a dû être révélé — lisible tant que "derivee" est affiché
   * (contrairement à `derniereTransitionRevelee`, écrasé à la transition suivante). */
  selectionRevele: boolean;
  /** `niveauAide` AU MOMENT de la clôture de "selection" (avant sa remise à zéro) — pilote la
   * puce jaune "correcte avec aide". `null` tant que "selection" n'est pas clos. */
  selectionNiveauAide: number | null;
  indexExercice: number;
  resultats: ResultatExerciceGraphiqueDeriveeLogarithme[];
  terminee: boolean;
  /** Vrai UNIQUEMENT juste après l'appel qui a clos un écran par épuisement des tentatives —
   * `etapeCourante` étant réinitialisé dans le MÊME appel, `App6gen20.tsx` lit CE champ sur l'état
   * retourné (voir `docs/historique-6e.md`, 6gen8/6gen16, même piège). */
  derniereTransitionRevelee: boolean;
}
