import type { ExerciceIntegralesProblemes } from "../core6e/integralesProblemes.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

/**
 * Couche B (6e) — types de session pour `6gen29`. Longueur de chaîne d'écrans VARIABLE une fois la
 * famille (et, pour B/C/G, le sous-type) connue : A=2, B=3, C=2 ou 4 (variante), D=4, E=3, F=2,
 * G=2 (soustraction) ou 3 (archimède/calotte) — mirroir du patron `phaseInitiale`/`phaseApres`
 * répliqué (jamais importé, CLAUDE.md "Pas de moteur de session unifié").
 */

export type PhaseIntegralesProblemes =
  | "aEcran1"
  | "aEcran2"
  | "bEcran1"
  | "bEcran2"
  | "bEcran3"
  | "cEcran1"
  | "cEcran2"
  | "cEcran3"
  | "cEcran4"
  | "dEcran1"
  | "dEcran2"
  | "dEcran3"
  | "dEcran4"
  | "eEcran1"
  | "eEcran2"
  | "eEcran3"
  | "fEcran1"
  | "fEcran2"
  | "gSoustractionEcran1"
  | "gSoustractionEcran2"
  | "gArchimedeEcran1"
  | "gArchimedeEcran2"
  | "gArchimedeEcran3"
  | "gCalotteEcran1"
  | "gCalotteEcran2"
  | "gCalotteEcran3";

export function phaseInitiale(exercice: ExerciceIntegralesProblemes): PhaseIntegralesProblemes {
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
    case "F":
      return "fEcran1";
    case "G":
      if (exercice.sousType === "soustraction") return "gSoustractionEcran1";
      if (exercice.sousType === "archimede") return "gArchimedeEcran1";
      return "gCalotteEcran1";
  }
}

/** `exercice` nécessaire pour famille C (variante comparaison, 2 vs 4 écrans) — jamais résolu par
 * `phase` seule. */
export function phaseApres(exercice: ExerciceIntegralesProblemes, phase: PhaseIntegralesProblemes): PhaseIntegralesProblemes | "termine" {
  switch (phase) {
    case "aEcran1":
      return "aEcran2";
    case "aEcran2":
      return "termine";
    case "bEcran1":
      return "bEcran2";
    case "bEcran2":
      return "bEcran3";
    case "bEcran3":
      return "termine";
    case "cEcran1":
      return "cEcran2";
    case "cEcran2":
      return exercice.famille === "C" && exercice.a2 !== null ? "cEcran3" : "termine";
    case "cEcran3":
      return "cEcran4";
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
    case "fEcran1":
      return "fEcran2";
    case "fEcran2":
      return "termine";
    case "gSoustractionEcran1":
      return "gSoustractionEcran2";
    case "gSoustractionEcran2":
      return "termine";
    case "gArchimedeEcran1":
      return "gArchimedeEcran2";
    case "gArchimedeEcran2":
      return "gArchimedeEcran3";
    case "gArchimedeEcran3":
      return "termine";
    case "gCalotteEcran1":
      return "gCalotteEcran2";
    case "gCalotteEcran2":
      return "gCalotteEcran3";
    case "gCalotteEcran3":
      return "termine";
  }
}

/** Liste ORDONNÉE des phases réellement traversées par CET exercice précis (mirroir 6gen26/27). */
export function phasesPourExercice(exercice: ExerciceIntegralesProblemes): PhaseIntegralesProblemes[] {
  const phases: PhaseIntegralesProblemes[] = [];
  let phase: PhaseIntegralesProblemes | "termine" = phaseInitiale(exercice);
  while (phase !== "termine") {
    phases.push(phase);
    phase = phaseApres(exercice, phase);
  }
  return phases;
}

export interface ResultatExerciceIntegralesProblemes {
  exercice: ExerciceIntegralesProblemes;
  scores: Partial<Record<PhaseIntegralesProblemes, number>>;
}

export interface EtatSessionIntegralesProblemes {
  reglages: ReglagesSession6e;
  generateur: () => ExerciceIntegralesProblemes;
  exerciceCourant: ExerciceIntegralesProblemes;
  phase: PhaseIntegralesProblemes;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  scoresPartiels: Partial<Record<PhaseIntegralesProblemes, number>>;
  indexExercice: number;
  resultats: ResultatExerciceIntegralesProblemes[];
  terminee: boolean;
  derniereTransitionRevelee: boolean;
}
