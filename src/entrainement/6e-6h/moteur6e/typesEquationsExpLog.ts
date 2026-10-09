/**
 * Couche B (6e) — types pour `6gen14`. 7 familles STRUCTURELLEMENT DISJOINTES (2 ou 3 écrans selon
 * la famille) — `phaseInitiale`/`phaseApres` dispatchent sur `exercice.famille`, jamais une
 * séquence commune (même principe que `typesExponentiellesProblemes.ts`, 6gen12).
 */
import type { ExerciceEquationsExpLog } from "../core6e/equationsExpLog.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

export type PhaseEquationsExpLog =
  | "aEcran1"
  | "aEcran2"
  | "bEcran1"
  | "bEcran2"
  | "cEcran1"
  | "cEcran2"
  | "cEcran3"
  | "dEcran1"
  | "dEcran2"
  | "eEcran1"
  | "eEcran2"
  | "eEcran3"
  | "fEcran1"
  | "fEcran2"
  | "fEcran3"
  | "gEcran1"
  | "gEcran2";

export function phaseInitiale(exercice: ExerciceEquationsExpLog): PhaseEquationsExpLog {
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
      return "gEcran1";
  }
}

export function phaseApres(phase: PhaseEquationsExpLog): PhaseEquationsExpLog | "termine" {
  switch (phase) {
    case "aEcran1":
      return "aEcran2";
    case "aEcran2":
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
    case "dEcran1":
      return "dEcran2";
    case "dEcran2":
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
      return "termine";
    case "gEcran1":
      return "gEcran2";
    case "gEcran2":
      return "termine";
  }
}

/** Plafond du niveau d'aide, PAR PHASE — uniformément 2, SAUF `gEcran1` (0 : le prompt ne liste
 * aucune section "Aides écran 1" pour la famille G, contrairement à toutes les autres phases — un
 * écran "pose la CE et combine/simplifie en une seule fois", sans palier d'aide prévu). Même
 * convention "max=0 → pas de bouton" que `BoutonAide.tsx`. */
export const NIVEAU_AIDE_MAX_PAR_PHASE: Record<PhaseEquationsExpLog, number> = {
  aEcran1: 2,
  aEcran2: 2,
  bEcran1: 2,
  bEcran2: 2,
  cEcran1: 2,
  cEcran2: 2,
  cEcran3: 2,
  dEcran1: 2,
  dEcran2: 2,
  eEcran1: 2,
  eEcran2: 2,
  eEcran3: 2,
  fEcran1: 2,
  fEcran2: 2,
  fEcran3: 2,
  gEcran1: 0,
  gEcran2: 2,
};

export type ResultatExerciceEquationsExpLog =
  | { famille: "A"; exercice: ExerciceEquationsExpLog; scoreEcran1: number; scoreEcran2: number }
  | { famille: "B"; exercice: ExerciceEquationsExpLog; scoreEcran1: number; scoreEcran2: number }
  | { famille: "C"; exercice: ExerciceEquationsExpLog; scoreEcran1: number; scoreEcran2: number; scoreEcran3: number }
  | { famille: "D"; exercice: ExerciceEquationsExpLog; scoreEcran1: number; scoreEcran2: number }
  | { famille: "E"; exercice: ExerciceEquationsExpLog; scoreEcran1: number; scoreEcran2: number; scoreEcran3: number }
  | { famille: "F"; exercice: ExerciceEquationsExpLog; scoreEcran1: number; scoreEcran2: number; scoreEcran3: number }
  | { famille: "G"; exercice: ExerciceEquationsExpLog; scoreEcran1: number; scoreEcran2: number };

export interface EtatSessionEquationsExpLog {
  reglages: ReglagesSession6e;
  generateur: () => ExerciceEquationsExpLog;
  exerciceCourant: ExerciceEquationsExpLog;
  phase: PhaseEquationsExpLog;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  /** Accumule au fil des écrans (l'ensemble de phases réellement traversées varie par famille — voir
   * `phaseInitiale`/`phaseApres` — même principe que 6gen9/6gen12). */
  scoresPartiels: Partial<Record<PhaseEquationsExpLog, number>>;
  indexExercice: number;
  resultats: ResultatExerciceEquationsExpLog[];
  terminee: boolean;
  /** Vrai UNIQUEMENT juste après l'appel à `soumettreReponseXxx` qui a clos un écran par
   * épuisement des tentatives (réponse révélée) plutôt que par réussite — piège structurel connu
   * (`etapeCourante.revelee` est remis à `false` DANS LE MÊME appel qui fait avancer `phase`, donc
   * jamais fiable lu depuis l'état PRÉ-transition côté `App6gen14.tsx`) — voir
   * `moteur6e/sessionExponentiellesProblemes.ts` (6gen12) pour l'exemple de référence. */
  derniereTransitionRevelee: boolean;
}
