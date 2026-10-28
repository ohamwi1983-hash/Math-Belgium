import type { ExerciceIntersectionsConiques } from "../core6e/intersectionsConiques.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

/**
 * Couche B (6e) — types de session pour `6gen61`. Longueur de chaîne d'écrans VARIABLE pour la
 * famille A (écran 1 SAUTÉ si `coniqueDirecte`, voir mission) — `phaseApres` prend donc l'exercice
 * en second paramètre, même patron que `typesIdentificationConiques.ts` (6gen58).
 *
 * - A (`coniqueDirecte=false`) : aEcran1 → aEcran2 → aEcran3 → aEcran4.
 * - A (`coniqueDirecte=true`) : aEcran2 → aEcran3 → aEcran4 (aEcran1 sauté).
 * - B : bEcran1 → bEcran2 → bEcran3 (toujours les 3, jamais de cas dégénéré pour cette famille).
 */

export type PhaseIntersectionsConiques = "aEcran1" | "aEcran2" | "aEcran3" | "aEcran4" | "bEcran1" | "bEcran2" | "bEcran3";

export function phaseInitiale(exercice: ExerciceIntersectionsConiques): PhaseIntersectionsConiques {
  if (exercice.famille === "A") return exercice.coniqueDirecte ? "aEcran2" : "aEcran1";
  return "bEcran1";
}

const SUITE: Partial<Record<PhaseIntersectionsConiques, PhaseIntersectionsConiques>> = {
  aEcran1: "aEcran2",
  aEcran2: "aEcran3",
  aEcran3: "aEcran4",
  bEcran1: "bEcran2",
  bEcran2: "bEcran3",
};

export function phaseApres(phase: PhaseIntersectionsConiques): PhaseIntersectionsConiques | "termine" {
  return SUITE[phase] ?? "termine";
}

/** Liste ORDONNÉE des phases réellement traversées par CET exercice précis. */
export function phasesPourExercice(exercice: ExerciceIntersectionsConiques): PhaseIntersectionsConiques[] {
  const phases: PhaseIntersectionsConiques[] = [];
  let phase: PhaseIntersectionsConiques | "termine" = phaseInitiale(exercice);
  while (phase !== "termine") {
    phases.push(phase);
    phase = phaseApres(phase);
  }
  return phases;
}

export interface ResultatExerciceIntersectionsConiques {
  exercice: ExerciceIntersectionsConiques;
  scores: Partial<Record<PhaseIntersectionsConiques, number>>;
}

export interface EtatSessionIntersectionsConiques {
  reglages: ReglagesSession6e;
  generateur: () => ExerciceIntersectionsConiques;
  exerciceCourant: ExerciceIntersectionsConiques;
  phase: PhaseIntersectionsConiques;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  scoresPartiels: Partial<Record<PhaseIntersectionsConiques, number>>;
  /** Vrai signal "révélé" par phase déjà close, peuplé depuis `etapeCourante.revelee` à la clôture
   * — jusqu'au 2025-10, le récapitulatif le déduisait de `scoresPartiels[phase] === 0`, non fiable
   * ici : l'ancienne pénalité d'aide (supprimée) était soustraite APRÈS le score (`Math.max(0, score -
   * niveauAide*PENALITE)`), donc une RÉUSSITE fortement aidée pouvait tomber à 0 et s'afficher à
   * tort comme "révélée". Champ explicite ajouté pendant le balayage générique (point A). */
  revelesPartiels: Partial<Record<PhaseIntersectionsConiques, boolean>>;
  indexExercice: number;
  resultats: ResultatExerciceIntersectionsConiques[];
  terminee: boolean;
  /** Vrai UNIQUEMENT juste après l'appel qui a clos un écran par épuisement des tentatives — piège
   * "revele stale" documenté CLAUDE.md. */
  derniereTransitionRevelee: boolean;
}
