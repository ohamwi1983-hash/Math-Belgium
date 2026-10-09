import type { ExerciceAffixesRacines } from "../core6e/affixesRacines.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

/**
 * Couche B (6e) — types de session pour `6gen35`. 3 familles, longueur de chaîne d'écrans variable
 * (1 pour A, 2 pour B, 3 pour C) — mirroir du patron `typesNombresComplexes.ts` (6gen34) :
 * `phaseApres` n'a besoin que de la phase courante (aucune branche ne dépend d'un sous-type
 * d'exercice, contrairement à la famille B de 6gen34 — aucune famille de 6gen35 n'a de sous-type).
 */

export type PhaseAffixesRacines = "aEcran1" | "bEcran1" | "bEcran2" | "cEcran1" | "cEcran2" | "cEcran3";

export function phaseInitiale(exercice: ExerciceAffixesRacines): PhaseAffixesRacines {
  switch (exercice.famille) {
    case "A":
      return "aEcran1";
    case "B":
      return "bEcran1";
    case "C":
      return "cEcran1";
  }
}

export function phaseApres(phase: PhaseAffixesRacines): PhaseAffixesRacines | "termine" {
  switch (phase) {
    case "aEcran1":
      return "termine";
    case "bEcran1":
      return "bEcran2";
    case "bEcran2":
      return "termine";
    case "cEcran1":
      return "cEcran2";
    case "cEcran2":
      return "cEcran3";
    case "cEcran3":
      return "termine";
  }
}

/** Liste ORDONNÉE des phases réellement traversées par CET exercice précis — mirroir 6gen34. */
export function phasesPourExercice(exercice: ExerciceAffixesRacines): PhaseAffixesRacines[] {
  const phases: PhaseAffixesRacines[] = [];
  let phase: PhaseAffixesRacines | "termine" = phaseInitiale(exercice);
  while (phase !== "termine") {
    phases.push(phase);
    phase = phaseApres(phase);
  }
  return phases;
}

export interface ResultatExerciceAffixesRacines {
  exercice: ExerciceAffixesRacines;
  scores: Partial<Record<PhaseAffixesRacines, number>>;
}

export interface EtatSessionAffixesRacines {
  reglages: ReglagesSession6e;
  generateur: () => ExerciceAffixesRacines;
  exerciceCourant: ExerciceAffixesRacines;
  phase: PhaseAffixesRacines;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  /** Accumule au fil des écrans de l'exercice COURANT — remis à `{}` à chaque nouvel exercice. */
  scoresPartiels: Partial<Record<PhaseAffixesRacines, number>>;
  indexExercice: number;
  resultats: ResultatExerciceAffixesRacines[];
  terminee: boolean;
  /** Vrai UNIQUEMENT juste après l'appel qui a clos un écran par épuisement des tentatives — piège
   * "revele stale" documenté CLAUDE.md, patron 6gen34 répliqué ici. */
  derniereTransitionRevelee: boolean;
}
