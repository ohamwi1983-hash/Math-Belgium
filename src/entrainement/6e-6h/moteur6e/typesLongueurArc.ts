import type { ExerciceLongueurArc } from "../core6e/longueurArc.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

/**
 * Couche B (6e) — types de session pour `6gen28`. 3 familles, chacune de LONGUEUR DE CHAÎNE FIXE
 * (3 écrans pour A/C, 4 pour B — jamais de branchement par sous-type, contrairement à 6gen26) :
 * `phaseApres` n'a donc PAS besoin du paramètre `exercice` (mirroir `typesCalculPrimitives.ts`,
 * 6gen23, plutôt que `typesCalculAires.ts`, 6gen26).
 */

export type PhaseLongueurArc = "aEcran1" | "aEcran2" | "aEcran3" | "bEcran1" | "bEcran2" | "bEcran3" | "bEcran4" | "cEcran1" | "cEcran2" | "cEcran3";

export function phaseInitiale(exercice: ExerciceLongueurArc): PhaseLongueurArc {
  switch (exercice.famille) {
    case "A":
      return "aEcran1";
    case "B":
      return "bEcran1";
    case "C":
      return "cEcran1";
  }
}

export function phaseApres(phase: PhaseLongueurArc): PhaseLongueurArc | "termine" {
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

/** Liste ORDONNÉE des phases réellement traversées par CET exercice précis — parcourt la chaîne
 * `phaseInitiale → phaseApres`, jamais une table statique (mirroir 6gen23/6gen26). Réutilisée par
 * `ui6e/formatLongueurArc.ts` (récapitulatif) et `sessionLongueurArc.ts`. */
export function phasesPourExercice(exercice: ExerciceLongueurArc): PhaseLongueurArc[] {
  const phases: PhaseLongueurArc[] = [];
  let phase: PhaseLongueurArc | "termine" = phaseInitiale(exercice);
  while (phase !== "termine") {
    phases.push(phase);
    phase = phaseApres(phase);
  }
  return phases;
}

export interface ResultatExerciceLongueurArc {
  exercice: ExerciceLongueurArc;
  scores: Partial<Record<PhaseLongueurArc, number>>;
}

export interface EtatSessionLongueurArc {
  reglages: ReglagesSession6e;
  generateur: () => ExerciceLongueurArc;
  exerciceCourant: ExerciceLongueurArc;
  phase: PhaseLongueurArc;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  /** Accumule au fil des écrans de l'exercice COURANT — remis à `{}` à chaque nouvel exercice. */
  scoresPartiels: Partial<Record<PhaseLongueurArc, number>>;
  indexExercice: number;
  resultats: ResultatExerciceLongueurArc[];
  terminee: boolean;
  /** Vrai UNIQUEMENT juste après l'appel qui a clos un écran par épuisement des tentatives — piège
   * "revele stale" documenté CLAUDE.md, patron 6gen23/6gen26 répliqué ici (voir
   * `sessionLongueurArc.ts`). */
  derniereTransitionRevelee: boolean;
}
