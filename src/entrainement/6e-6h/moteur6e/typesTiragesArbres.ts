import type { ExerciceTiragesArbres } from "../core6e/tiragesArbres.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

/**
 * Couche B (6e) — types de session pour `6gen31`. 3 familles, chacune une longueur FIXE de chaîne
 * d'écrans (A : 3, B : 4, C : 3 — jamais de variation par sous-type/contexte à l'intérieur d'une
 * famille) — `phaseInitiale`/`phaseApres` dispatchent seulement sur `exercice.famille`. Même patron
 * générique `phasesPourExercice` que `typesProbabilitesEnsembles.ts` (6gen30), répliqué à
 * l'identique pour la cohérence transversale du chapitre 8.
 */

export type PhaseTiragesArbres = "aEcran1" | "aEcran2" | "aEcran3" | "bEcran1" | "bEcran2" | "bEcran3" | "bEcran4" | "cEcran1" | "cEcran2" | "cEcran3";

export function phaseInitiale(exercice: ExerciceTiragesArbres): PhaseTiragesArbres {
  if (exercice.famille === "A") return "aEcran1";
  if (exercice.famille === "B") return "bEcran1";
  return "cEcran1";
}

export function phaseApres(phase: PhaseTiragesArbres): PhaseTiragesArbres | "termine" {
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
  }
}

/** Liste ORDONNÉE des phases réellement traversées par CET exercice — parcourt la chaîne
 * `phaseInitiale → phaseApres`, jamais une table statique (même principe que `6gen30`). Réutilisée
 * par `ui6e/formatTiragesArbres.ts` (récapitulatif) et `sessionTiragesArbres.ts`. */
export function phasesPourExercice(exercice: ExerciceTiragesArbres): PhaseTiragesArbres[] {
  const phases: PhaseTiragesArbres[] = [];
  let phase: PhaseTiragesArbres | "termine" = phaseInitiale(exercice);
  while (phase !== "termine") {
    phases.push(phase);
    phase = phaseApres(phase);
  }
  return phases;
}

export interface ResultatExerciceTiragesArbres {
  exercice: ExerciceTiragesArbres;
  scores: Partial<Record<PhaseTiragesArbres, number>>;
}

export interface EtatSessionTiragesArbres {
  reglages: ReglagesSession6e;
  generateur: () => ExerciceTiragesArbres;
  exerciceCourant: ExerciceTiragesArbres;
  phase: PhaseTiragesArbres;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  /** Accumule au fil des écrans de l'exercice COURANT — remis à `{}` à chaque nouvel exercice. */
  scoresPartiels: Partial<Record<PhaseTiragesArbres, number>>;
  indexExercice: number;
  resultats: ResultatExerciceTiragesArbres[];
  terminee: boolean;
  /** Vrai UNIQUEMENT juste après l'appel qui a clos un écran par épuisement des tentatives — piège
   * "revele stale" documenté CLAUDE.md, patron `6gen30` répliqué à l'identique (voir
   * `sessionTiragesArbres.ts`, fonction `soumettreReponseEcran`). */
  derniereTransitionRevelee: boolean;
}
