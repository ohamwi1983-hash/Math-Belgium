import type { ExerciceTrianglesComplexes } from "../core6e/trianglesComplexes.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

/**
 * Couche B (6e) — types de session pour `6gen41`. 5 familles, longueur de chaîne d'écrans fixe PAR
 * FAMILLE (3 pour A/C/D, 4 pour B, 2 pour E) — mirroir `typesFormeTrigonometrique.ts` (6gen37).
 */

export type PhaseTrianglesComplexes =
  | "aEcran1"
  | "aEcran2"
  | "aEcran3"
  | "bEcran1"
  | "bEcran2"
  | "bEcran3"
  | "bEcran4"
  | "cEcran1"
  | "cEcran2"
  | "cEcran3"
  | "dEcran1"
  | "dEcran2"
  | "dEcran3"
  | "eEcran1"
  | "eEcran2";

/** Écrans de CHOIX FERMÉ : UNE seule tentative (audit 6e ch. 5, point 6, décision F). Le verdict
 * de la famille C (équidistant ou non) a été détaché des 3 distances dans son propre écran
 * (`cEcran3`) pour la même raison. */
export const PHASES_CHOIX_UNIQUE: readonly PhaseTrianglesComplexes[] = ["aEcran2", "aEcran3", "bEcran2", "bEcran3", "cEcran3", "dEcran2", "eEcran2"];

export function tentativesMaxPhase(phase: PhaseTrianglesComplexes, tentativesMaxReglage: number): number {
  return PHASES_CHOIX_UNIQUE.includes(phase) ? 1 : tentativesMaxReglage;
}

export function phaseInitiale(exercice: ExerciceTrianglesComplexes): PhaseTrianglesComplexes {
  switch (exercice.famille) {
    case "A":
      return "aEcran1";
    case "B":
      return "bEcran1";
    case "C":
      return "cEcran1";
    case "D":
      return "dEcran1";
    case "E":
      return "eEcran1";
  }
}

export function phaseApres(phase: PhaseTrianglesComplexes): PhaseTrianglesComplexes | "termine" {
  switch (phase) {
    case "aEcran1":
      return "aEcran2";
    case "aEcran2":
      return "aEcran3";
    case "aEcran3":
      return "termine";
    case "bEcran1":
      return "bEcran2";
    case "bEcran2":
      return "bEcran3";
    case "bEcran3":
      return "bEcran4";
    case "bEcran4":
      return "termine";
    case "cEcran1":
      return "cEcran2";
    case "cEcran2":
      return "cEcran3";
    case "cEcran3":
      return "termine";
    case "dEcran1":
      return "dEcran2";
    case "dEcran2":
      return "dEcran3";
    case "dEcran3":
      return "termine";
    case "eEcran1":
      return "eEcran2";
    case "eEcran2":
      return "termine";
  }
}

/** Liste ORDONNÉE des phases réellement traversées par CET exercice précis — mirroir 6gen37. */
export function phasesPourExercice(exercice: ExerciceTrianglesComplexes): PhaseTrianglesComplexes[] {
  const phases: PhaseTrianglesComplexes[] = [];
  let phase: PhaseTrianglesComplexes | "termine" = phaseInitiale(exercice);
  while (phase !== "termine") {
    phases.push(phase);
    phase = phaseApres(phase);
  }
  return phases;
}

export interface ResultatExerciceTrianglesComplexes {
  exercice: ExerciceTrianglesComplexes;
  scores: Partial<Record<PhaseTrianglesComplexes, number>>;
}

export interface EtatSessionTrianglesComplexes {
  reglages: ReglagesSession6e;
  generateur: () => ExerciceTrianglesComplexes;
  exerciceCourant: ExerciceTrianglesComplexes;
  phase: PhaseTrianglesComplexes;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  scoresPartiels: Partial<Record<PhaseTrianglesComplexes, number>>;
  /** Un booléen "révélé" par écran déjà clos, même principe que `scoresPartiels` — jusqu'au 2025-10,
   * déduit de `scoresPartiels[phase] === 0`, heuristique fausse ici : l'ancienne pénalité d'aide (supprimée)
   * (`Math.max(0, score - niveauAide * PENALITE_PAR_NIVEAU_AIDE)`) pouvait faire tomber une RÉUSSITE
   * fortement aidée à exactement 0, affichée alors à tort comme "révélée". Champ explicite ajouté
   * pendant le balayage générique (point A). */
  revelesPartiels: Partial<Record<PhaseTrianglesComplexes, boolean>>;
  indexExercice: number;
  resultats: ResultatExerciceTrianglesComplexes[];
  terminee: boolean;
  derniereTransitionRevelee: boolean;
}
