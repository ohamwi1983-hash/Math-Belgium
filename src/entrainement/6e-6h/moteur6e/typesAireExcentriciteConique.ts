import type { ExerciceAireExcentriciteConique } from "../core6e/aireExcentriciteConique.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

/**
 * Couche B (6e) — types de session pour `6gen60`. Longueur de la chaîne d'écrans purement fonction
 * de `famille` (3 écrans pour A, 2 pour B) — jamais d'une propriété numérique de l'exercice tiré,
 * mirroir `typesEquationConiqueCaracteristiques.ts` (6gen59).
 *
 * - Famille A : aEcran1 → aEcran2 → aEcran3.
 * - Famille B : bEcran1 → bEcran2.
 */

export type PhaseAireExcentriciteConique = "aEcran1" | "aEcran2" | "aEcran3" | "bEcran1" | "bEcran2";

export function phaseInitiale(exercice: ExerciceAireExcentriciteConique): PhaseAireExcentriciteConique {
  return exercice.famille === "A" ? "aEcran1" : "bEcran1";
}

const SUITE: Partial<Record<PhaseAireExcentriciteConique, PhaseAireExcentriciteConique>> = {
  aEcran1: "aEcran2",
  aEcran2: "aEcran3",
  bEcran1: "bEcran2",
};

export function phaseApres(phase: PhaseAireExcentriciteConique): PhaseAireExcentriciteConique | "termine" {
  return SUITE[phase] ?? "termine";
}

/** Liste ORDONNÉE des phases réellement traversées par CET exercice — purement fonction de
 * `phaseInitiale` (mirroir `phasesPourExercice`, 6gen59). */
export function phasesPourExercice(exercice: ExerciceAireExcentriciteConique): PhaseAireExcentriciteConique[] {
  const phases: PhaseAireExcentriciteConique[] = [];
  let phase: PhaseAireExcentriciteConique | "termine" = phaseInitiale(exercice);
  while (phase !== "termine") {
    phases.push(phase);
    phase = phaseApres(phase);
  }
  return phases;
}

export interface ResultatExerciceAireExcentriciteConique {
  exercice: ExerciceAireExcentriciteConique;
  scores: Partial<Record<PhaseAireExcentriciteConique, number>>;
}

export interface EtatSessionAireExcentriciteConique {
  reglages: ReglagesSession6e;
  generateur: () => ExerciceAireExcentriciteConique;
  exerciceCourant: ExerciceAireExcentriciteConique;
  phase: PhaseAireExcentriciteConique;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  scoresPartiels: Partial<Record<PhaseAireExcentriciteConique, number>>;
  indexExercice: number;
  resultats: ResultatExerciceAireExcentriciteConique[];
  terminee: boolean;
  /** Vrai UNIQUEMENT juste après l'appel qui a clos un écran par épuisement des tentatives — piège
   * "revele stale" documenté CLAUDE.md. */
  derniereTransitionRevelee: boolean;
}
