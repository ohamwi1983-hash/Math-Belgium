/**
 * Couche B (6e) — types pour `6gen18`. 3 familles STRUCTURELLEMENT DISJOINTES (2 ou 3 écrans selon
 * la famille) — `phaseInitiale`/`phaseApres` dispatchent sur `exercice.famille`, jamais une
 * séquence commune (même principe que `typesExponentiellesProblemes.ts`, 6gen12).
 */
import type { ExerciceDeterminerParametresLogarithme } from "../core6e/determinerParametresLogarithme.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

export type PhaseDeterminerParametresLogarithme = "aEcran1" | "aEcran2" | "bEcran1" | "bEcran2" | "bEcran3" | "cEcran1" | "cEcran2" | "cEcran3";

export function phaseInitiale(exercice: ExerciceDeterminerParametresLogarithme): PhaseDeterminerParametresLogarithme {
  switch (exercice.famille) {
    case "A":
      return "aEcran1";
    case "B":
      return "bEcran1";
    case "C":
      return "cEcran1";
  }
}

export function phaseApres(phase: PhaseDeterminerParametresLogarithme): PhaseDeterminerParametresLogarithme | "termine" {
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
      return "cEcran3";
    case "cEcran3":
      return "termine";
  }
}

export type ResultatExerciceDeterminerParametresLogarithme =
  | { famille: "A"; exercice: ExerciceDeterminerParametresLogarithme; scoreEcran1: number; scoreEcran2: number }
  | { famille: "B"; exercice: ExerciceDeterminerParametresLogarithme; scoreEcran1: number; scoreEcran2: number; scoreEcran3: number }
  | { famille: "C"; exercice: ExerciceDeterminerParametresLogarithme; scoreEcran1: number; scoreEcran2: number; scoreEcran3: number };

export interface EtatSessionDeterminerParametresLogarithme {
  reglages: ReglagesSession6e;
  generateur: () => ExerciceDeterminerParametresLogarithme;
  exerciceCourant: ExerciceDeterminerParametresLogarithme;
  phase: PhaseDeterminerParametresLogarithme;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  /** Accumule au fil des écrans (l'ensemble de phases réellement traversées varie par famille —
   * voir `phaseInitiale`/`phaseApres` — même principe que 6gen12/6gen16). */
  scoresPartiels: Partial<Record<PhaseDeterminerParametresLogarithme, number>>;
  indexExercice: number;
  resultats: ResultatExerciceDeterminerParametresLogarithme[];
  terminee: boolean;
  /** Vrai UNIQUEMENT juste après l'appel à `soumettreReponseXxx` qui a clos un écran par
   * épuisement des tentatives (réponse révélée) plutôt que par réussite — `etapeCourante.revelee`
   * est remis à `false` DANS LE MÊME appel qui fait avancer `phase` (voir `avancerPhase` dans
   * `sessionDeterminerParametresLogarithme.ts`), donc jamais fiable lu depuis l'état PRÉ-transition
   * côté `App6gen18.tsx` — piège structurel documenté dans `docs/historique-6e.md` (déjà rencontré
   * sur chaque générateur 6e précédent).
   */
  derniereTransitionRevelee: boolean;
}
