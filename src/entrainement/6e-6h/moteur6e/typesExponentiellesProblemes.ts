/**
 * Couche B (6e) — types pour `6gen12`. 7 familles STRUCTURELLEMENT DISJOINTES (2 à 4 écrans selon
 * la famille) — `phaseInitiale`/`phaseApres` dispatchent sur `exercice.famille`, jamais une
 * séquence commune (même principe que `typesEquationsExponentielles.ts`, 6gen9).
 */
import type { ExerciceExponentiellesProblemes } from "../core6e/exponentiellesProblemes.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

export type PhaseExponentiellesProblemes =
  | "aEcran1"
  | "aEcran2"
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
  | "dEcran4"
  | "eEcran1"
  | "eEcran2"
  | "eEcran3"
  | "fEcran1"
  | "fEcran2"
  | "fEcran3"
  | "fEcran4"
  | "gEcran1"
  | "gEcran2"
  | "gEcran3";

export function phaseInitiale(exercice: ExerciceExponentiellesProblemes): PhaseExponentiellesProblemes {
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

export function phaseApres(phase: PhaseExponentiellesProblemes): PhaseExponentiellesProblemes | "termine" {
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
      return "fEcran3";
    case "fEcran3":
      return "fEcran4";
    case "fEcran4":
      return "termine";
    case "gEcran1":
      return "gEcran2";
    case "gEcran2":
      return "gEcran3";
    case "gEcran3":
      return "termine";
  }
}

export type ResultatExerciceExponentiellesProblemes =
  | { famille: "A"; exercice: ExerciceExponentiellesProblemes; scoreEcran1: number; scoreEcran2: number }
  | { famille: "B"; exercice: ExerciceExponentiellesProblemes; scoreEcran1: number; scoreEcran2: number; scoreEcran3: number; scoreEcran4: number }
  | { famille: "C"; exercice: ExerciceExponentiellesProblemes; scoreEcran1: number; scoreEcran2: number; scoreEcran3: number }
  | { famille: "D"; exercice: ExerciceExponentiellesProblemes; scoreEcran1: number; scoreEcran2: number; scoreEcran3: number; scoreEcran4: number }
  | { famille: "E"; exercice: ExerciceExponentiellesProblemes; scoreEcran1: number; scoreEcran2: number; scoreEcran3: number }
  | { famille: "F"; exercice: ExerciceExponentiellesProblemes; scoreEcran1: number; scoreEcran2: number; scoreEcran3: number; scoreEcran4: number }
  | { famille: "G"; exercice: ExerciceExponentiellesProblemes; scoreEcran1: number; scoreEcran2: number; scoreEcran3: number };

export interface EtatSessionExponentiellesProblemes {
  reglages: ReglagesSession6e;
  generateur: () => ExerciceExponentiellesProblemes;
  exerciceCourant: ExerciceExponentiellesProblemes;
  phase: PhaseExponentiellesProblemes;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  /** Accumule au fil des écrans (l'ensemble de phases réellement traversées varie par famille —
   * voir `phaseInitiale`/`phaseApres` — même principe que 6gen9/6gen11). */
  scoresPartiels: Partial<Record<PhaseExponentiellesProblemes, number>>;
  indexExercice: number;
  resultats: ResultatExerciceExponentiellesProblemes[];
  terminee: boolean;
  /** Vrai UNIQUEMENT juste après l'appel à `soumettreReponseXxx` qui a clos un écran par
   * épuisement des tentatives (réponse révélée) plutôt que par réussite — voir
   * `moteur6e/sessionEquationsExponentielles.ts`/`docs/historique-6e.md` pour le piège structurel
   * évité ici (`etapeCourante.revelee` est remis à `false` DANS LE MÊME appel qui fait avancer
   * `phase`, donc jamais fiable lu depuis l'état PRÉ-transition côté `App6gen12.tsx`). */
  derniereTransitionRevelee: boolean;
}
