import type { ExerciceTangentesConique } from "../core6e/tangentesConique.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

/**
 * Couche B (6e) — types de session pour `6gen62`. Longueur de chaîne VARIABLE pour les familles B/C
 * (l'écran final "donner les équations complètes" n'a de sens que si des tangentes réelles existent
 * — `aSolution`) — `phaseApres` prend donc un 2e paramètre `exercice`, même patron que
 * `typesIdentificationConiques.ts` (6gen58).
 *
 * - A : aEcran1 → aEcran2 → aEcran3 (TOUJOURS les 3, quel que soit le type de conique).
 * - B : bEcran1 → bEcran2 → bEcran3 → [bEcran4 si `aSolution`].
 * - C : cEcran1 → cEcran2 → cEcran3 → [cEcran4 si `aSolution`].
 * - D : dEcran1 → dEcran2 → dEcran3 → dEcran4 (TOUJOURS les 4 — jamais de cas dégénéré, voir
 *   `familleD.ts`).
 * - E : eEcran1 → eEcran2 → eEcran3 (TOUJOURS les 3 — `base.aSolution` toujours forcé `true`, voir
 *   `familleE.ts`).
 */

export type PhaseTangentesConique = "aEcran1" | "aEcran2" | "aEcran3" | "bEcran1" | "bEcran2" | "bEcran3" | "bEcran4" | "cEcran1" | "cEcran2" | "cEcran3" | "cEcran4" | "dEcran1" | "dEcran2" | "dEcran3" | "dEcran4" | "eEcran1" | "eEcran2" | "eEcran3";

export function phaseInitiale(exercice: ExerciceTangentesConique): PhaseTangentesConique {
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

export function phaseApres(phase: PhaseTangentesConique, exercice: ExerciceTangentesConique): PhaseTangentesConique | "termine" {
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
      return exercice.famille === "B" && exercice.aSolution ? "bEcran4" : "termine";
    case "bEcran4":
      return "termine";
    case "cEcran1":
      return "cEcran2";
    case "cEcran2":
      return "cEcran3";
    case "cEcran3":
      return exercice.famille === "C" && exercice.aSolution ? "cEcran4" : "termine";
    case "cEcran4":
      return "termine";
    case "dEcran1":
      return "dEcran2";
    case "dEcran2":
      return "dEcran3";
    case "dEcran3":
      return "dEcran4";
    case "dEcran4":
      return "termine";
    case "eEcran1":
      return "eEcran2";
    case "eEcran2":
      return "eEcran3";
    case "eEcran3":
      return "termine";
  }
}

/** Liste ORDONNÉE des phases réellement traversées par CET exercice précis — parcourt la chaîne
 * `phaseInitiale → phaseApres`, jamais une table statique (mirroir 6gen58/6gen26/6gen29). */
export function phasesPourExercice(exercice: ExerciceTangentesConique): PhaseTangentesConique[] {
  const phases: PhaseTangentesConique[] = [];
  let phase: PhaseTangentesConique | "termine" = phaseInitiale(exercice);
  while (phase !== "termine") {
    phases.push(phase);
    phase = phaseApres(phase, exercice);
  }
  return phases;
}

export interface ResultatExerciceTangentesConique {
  exercice: ExerciceTangentesConique;
  scores: Partial<Record<PhaseTangentesConique, number>>;
}

export interface EtatSessionTangentesConique {
  reglages: ReglagesSession6e;
  generateur: () => ExerciceTangentesConique;
  exerciceCourant: ExerciceTangentesConique;
  phase: PhaseTangentesConique;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  scoresPartiels: Partial<Record<PhaseTangentesConique, number>>;
  indexExercice: number;
  resultats: ResultatExerciceTangentesConique[];
  terminee: boolean;
  /** Vrai UNIQUEMENT juste après l'appel qui a clos un écran par épuisement des tentatives — piège
   * "revele stale" documenté CLAUDE.md. */
  derniereTransitionRevelee: boolean;
}
