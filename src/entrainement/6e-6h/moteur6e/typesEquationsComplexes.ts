import type { ExerciceEquationsComplexes } from "../core6e/equationsComplexes.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

/**
 * Couche B (6e) — types de session pour `6gen36`. 6 familles, longueur de chaîne d'écrans
 * variable (1 ou 2 pour A selon le sous-type, 2 pour B, 2 pour C, 3 pour D, 3 pour E, 5 pour F) —
 * mirroir du patron `typesAffixesRacines.ts` (6gen35)/`typesNombresComplexes.ts` (6gen34) :
 * `phaseInitiale` regarde `famille` PUIS `sousType` (uniquement pour A, seule famille à en avoir
 * un, mirroir la famille B de 6gen34).
 */

export type PhaseEquationsComplexes =
  | "aSansEcran1"
  | "aAvecEcran1"
  | "aAvecEcran2"
  | "bEcran1"
  | "bEcran2"
  | "cEcran1"
  | "cEcran2"
  | "dEcran1"
  | "dEcran2"
  | "dEcran3"
  | "eEcran1"
  | "eEcran2"
  | "eEcran3"
  | "fEcran1"
  | "fEcran2"
  | "fEcran3"
  | "fEcran4"
  | "fEcran5";

export function phaseInitiale(exercice: ExerciceEquationsComplexes): PhaseEquationsComplexes {
  switch (exercice.famille) {
    case "A":
      return exercice.sousType === "sansBarre" ? "aSansEcran1" : "aAvecEcran1";
    case "B":
      return "bEcran1";
    case "C":
      return "cEcran1";
    case "D":
      return "dEcran1";
    case "E":
      return "eEcran1";
    case "F":
      return "fEcran1";
  }
}

export function phaseApres(phase: PhaseEquationsComplexes): PhaseEquationsComplexes | "termine" {
  switch (phase) {
    case "aSansEcran1":
      return "termine";
    case "aAvecEcran1":
      return "aAvecEcran2";
    case "aAvecEcran2":
      return "termine";
    case "bEcran1":
      return "bEcran2";
    case "bEcran2":
      return "termine";
    case "cEcran1":
      return "cEcran2";
    case "cEcran2":
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
      return "eEcran3";
    case "eEcran3":
      return "termine";
    case "fEcran1":
      return "fEcran2";
    case "fEcran2":
      return "fEcran3";
    case "fEcran3":
      return "fEcran4";
    case "fEcran4":
      return "fEcran5";
    case "fEcran5":
      return "termine";
  }
}

/** Liste ORDONNÉE des phases réellement traversées par CET exercice précis — mirroir 6gen34/6gen35. */
export function phasesPourExercice(exercice: ExerciceEquationsComplexes): PhaseEquationsComplexes[] {
  const phases: PhaseEquationsComplexes[] = [];
  let phase: PhaseEquationsComplexes | "termine" = phaseInitiale(exercice);
  while (phase !== "termine") {
    phases.push(phase);
    phase = phaseApres(phase);
  }
  return phases;
}

export interface ResultatExerciceEquationsComplexes {
  exercice: ExerciceEquationsComplexes;
  scores: Partial<Record<PhaseEquationsComplexes, number>>;
}

export interface EtatSessionEquationsComplexes {
  reglages: ReglagesSession6e;
  generateur: () => ExerciceEquationsComplexes;
  exerciceCourant: ExerciceEquationsComplexes;
  phase: PhaseEquationsComplexes;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  /** Accumule au fil des écrans de l'exercice COURANT — remis à `{}` à chaque nouvel exercice. */
  scoresPartiels: Partial<Record<PhaseEquationsComplexes, number>>;
  indexExercice: number;
  resultats: ResultatExerciceEquationsComplexes[];
  terminee: boolean;
  /** Vrai UNIQUEMENT juste après l'appel qui a clos un écran par épuisement des tentatives — piège
   * "revele stale" documenté CLAUDE.md, patron 6gen34/6gen35 répliqué ici. */
  derniereTransitionRevelee: boolean;
}
