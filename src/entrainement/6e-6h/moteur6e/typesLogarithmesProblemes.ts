/**
 * Couche B (6e) — types pour `6gen22`. 7 familles STRUCTURELLEMENT DISJOINTES (2 à 4 écrans selon
 * la famille) — `phaseInitiale`/`phaseApres` dispatchent sur `exercice.famille`, jamais une
 * séquence commune (même principe que `typesExponentiellesProblemes.ts`, 6gen12).
 *
 * **Famille E — nombre d'écrans VARIABLE PAR INSTANCE** (pas seulement par famille) : l'écran 1
 * n'existe que si `exercice.deduireAB===true` (spec : "sauf si a,b déjà fournis..., cet écran est
 * sauté pour cette instance") — `phaseInitiale` est donc la SEULE fonction de ce fichier qui lit un
 * champ de l'exercice au-delà de `famille` (mêmes noms de phase `eEcran1..4` réutilisés, `eEcran1`
 * simplement absent de la séquence traversée quand il est sauté).
 */
import type { ExerciceLogarithmesProblemes } from "../core6e/logarithmesProblemes.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

export type PhaseLogarithmesProblemes =
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
  | "eEcran1"
  | "eEcran2"
  | "eEcran3"
  | "eEcran4"
  | "fEcran1"
  | "fEcran2"
  | "fEcran3"
  | "gEcran1"
  | "gEcran2"
  | "gEcran3"
  | "gEcran4";

export function phaseInitiale(exercice: ExerciceLogarithmesProblemes): PhaseLogarithmesProblemes {
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
      return exercice.deduireAB ? "eEcran1" : "eEcran2";
    case "F":
      return "fEcran1";
    case "G":
      return "gEcran1";
  }
}

export function phaseApres(phase: PhaseLogarithmesProblemes): PhaseLogarithmesProblemes | "termine" {
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
      return "termine";
    case "eEcran1":
      return "eEcran2";
    case "eEcran2":
      return "eEcran3";
    case "eEcran3":
      return "eEcran4";
    case "eEcran4":
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
      return "gEcran3";
    case "gEcran3":
      return "gEcran4";
    case "gEcran4":
      return "termine";
  }
}

export type ResultatExerciceLogarithmesProblemes =
  | { famille: "A"; exercice: ExerciceLogarithmesProblemes; scoreEcran1: number; scoreEcran2: number; scoreEcran3: number }
  | { famille: "B"; exercice: ExerciceLogarithmesProblemes; scoreEcran1: number; scoreEcran2: number; scoreEcran3: number; scoreEcran4: number }
  | { famille: "C"; exercice: ExerciceLogarithmesProblemes; scoreEcran1: number; scoreEcran2: number; scoreEcran3: number }
  | { famille: "D"; exercice: ExerciceLogarithmesProblemes; scoreEcran1: number; scoreEcran2: number }
  /** `scoreEcran1` — `null` quand `exercice.deduireAB===false` (écran sauté pour cette instance,
   * jamais noté). */
  | { famille: "E"; exercice: ExerciceLogarithmesProblemes; scoreEcran1: number | null; scoreEcran2: number; scoreEcran3: number; scoreEcran4: number }
  | { famille: "F"; exercice: ExerciceLogarithmesProblemes; scoreEcran1: number; scoreEcran2: number; scoreEcran3: number }
  | { famille: "G"; exercice: ExerciceLogarithmesProblemes; scoreEcran1: number; scoreEcran2: number; scoreEcran3: number; scoreEcran4: number };

export interface EtatSessionLogarithmesProblemes {
  reglages: ReglagesSession6e;
  generateur: () => ExerciceLogarithmesProblemes;
  exerciceCourant: ExerciceLogarithmesProblemes;
  phase: PhaseLogarithmesProblemes;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  scoresPartiels: Partial<Record<PhaseLogarithmesProblemes, number>>;
  indexExercice: number;
  resultats: ResultatExerciceLogarithmesProblemes[];
  terminee: boolean;
  /** Vrai UNIQUEMENT juste après l'appel à `soumettreReponseXxx` qui a clos un écran par
   * épuisement des tentatives — calculé DANS `avancerPhase` AVANT que `etapeCourante` ne soit remis
   * à `false` par la transition, jamais lu depuis l'état PRÉ-transition (piège structurel documenté
   * pour tout générateur 6e, voir `docs/historique-6e.md`). */
  derniereTransitionRevelee: boolean;
}
