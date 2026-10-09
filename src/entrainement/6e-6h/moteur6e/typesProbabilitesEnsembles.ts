import type { ExerciceProbabilitesEnsembles } from "../core6e/probabilitesEnsembles.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

/**
 * Couche B (6e) — types de session pour `6gen30`. 2 familles, chacune une longueur FIXE de chaîne
 * d'écrans (A : 3, B : 4 — jamais de variation par sous-type/contexte à l'intérieur d'une famille,
 * contrairement à `typesCalculPrimitives.ts`/6gen23) — `phaseInitiale`/`phaseApres` dispatchent
 * seulement sur `exercice.famille`. Même patron générique `phasesPourExercice`
 * (parcourt la chaîne plutôt qu'une table statique) que `typesCalculPrimitives.ts`, gardé pour la
 * cohérence transversale du chantier même si la structure ici est plus simple.
 */

export type PhaseProbabilitesEnsembles = "aEcran1" | "aEcran2" | "aEcran3" | "bEcran1" | "bEcran2" | "bEcran3" | "bEcran4";

export function phaseInitiale(exercice: ExerciceProbabilitesEnsembles): PhaseProbabilitesEnsembles {
  return exercice.famille === "A" ? "aEcran1" : "bEcran1";
}

export function phaseApres(phase: PhaseProbabilitesEnsembles): PhaseProbabilitesEnsembles | "termine" {
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
  }
}

/** Liste ORDONNÉE des phases réellement traversées par CET exercice — parcourt la chaîne
 * `phaseInitiale → phaseApres`, jamais une table statique (voir en-tête de fichier). Réutilisée par
 * `ui6e/formatProbabilitesEnsembles.ts` (récapitulatif) et `sessionProbabilitesEnsembles.ts`. */
export function phasesPourExercice(exercice: ExerciceProbabilitesEnsembles): PhaseProbabilitesEnsembles[] {
  const phases: PhaseProbabilitesEnsembles[] = [];
  let phase: PhaseProbabilitesEnsembles | "termine" = phaseInitiale(exercice);
  while (phase !== "termine") {
    phases.push(phase);
    phase = phaseApres(phase);
  }
  return phases;
}

export interface ResultatExerciceProbabilitesEnsembles {
  exercice: ExerciceProbabilitesEnsembles;
  scores: Partial<Record<PhaseProbabilitesEnsembles, number>>;
}

export interface EtatSessionProbabilitesEnsembles {
  reglages: ReglagesSession6e;
  generateur: () => ExerciceProbabilitesEnsembles;
  exerciceCourant: ExerciceProbabilitesEnsembles;
  phase: PhaseProbabilitesEnsembles;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  /** Accumule au fil des écrans de l'exercice COURANT — remis à `{}` à chaque nouvel exercice. */
  scoresPartiels: Partial<Record<PhaseProbabilitesEnsembles, number>>;
  indexExercice: number;
  resultats: ResultatExerciceProbabilitesEnsembles[];
  terminee: boolean;
  /** Vrai UNIQUEMENT juste après l'appel qui a clos un écran par épuisement des tentatives — piège
   * "revele stale" documenté CLAUDE.md, patron `6gen18`/`6gen21`/`6gen23` répliqué à l'identique
   * (voir `sessionProbabilitesEnsembles.ts`, fonction `soumettreReponseEcran`). */
  derniereTransitionRevelee: boolean;
}
