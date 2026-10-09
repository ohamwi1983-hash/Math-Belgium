import type { ExerciceVolumesRevolution } from "../core6e/volumesRevolution.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

/**
 * Couche B (6e) — types de session pour `6gen27`. 4 familles, longueur de chaîne d'écrans FIXE une
 * fois la famille connue (A=3, B=4, C=4, D=3) — PLUS SIMPLE que `typesCalculAires.ts` (6gen26), qui
 * avait un embranchement dépendant du SOUS-TYPE de la famille D : ici aucune famille n'a de
 * sous-type affectant le nombre d'écrans, mirroir du patron `phaseInitiale`/`phaseApres` répliqué
 * (jamais importé, CLAUDE.md "Pas de moteur de session unifié").
 */

export type PhaseVolumesRevolution = "aEcran1" | "aEcran2" | "aEcran3" | "bEcran1" | "bEcran2" | "bEcran3" | "bEcran4" | "cEcran1" | "cEcran2" | "cEcran3" | "cEcran4" | "dEcran1" | "dEcran2" | "dEcran3";

export function phaseInitiale(exercice: ExerciceVolumesRevolution): PhaseVolumesRevolution {
  switch (exercice.famille) {
    case "A":
      return "aEcran1";
    case "B":
      return "bEcran1";
    case "C":
      return "cEcran1";
    case "D":
      return "dEcran1";
  }
}

export function phaseApres(phase: PhaseVolumesRevolution): PhaseVolumesRevolution | "termine" {
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
      return "cEcran4";
    case "cEcran4":
      return "termine";
    case "dEcran1":
      return "dEcran2";
    case "dEcran2":
      return "dEcran3";
    case "dEcran3":
      return "termine";
  }
}

/** Liste ORDONNÉE des phases réellement traversées par CET exercice précis — parcourt la chaîne
 * `phaseInitiale → phaseApres`, jamais une table statique (mirroir 6gen26). Réutilisée par
 * `ui6e/formatVolumesRevolution.ts` (récapitulatif) et `sessionVolumesRevolution.ts`. */
export function phasesPourExercice(exercice: ExerciceVolumesRevolution): PhaseVolumesRevolution[] {
  const phases: PhaseVolumesRevolution[] = [];
  let phase: PhaseVolumesRevolution | "termine" = phaseInitiale(exercice);
  while (phase !== "termine") {
    phases.push(phase);
    phase = phaseApres(phase);
  }
  return phases;
}

export interface ResultatExerciceVolumesRevolution {
  exercice: ExerciceVolumesRevolution;
  scores: Partial<Record<PhaseVolumesRevolution, number>>;
}

export interface EtatSessionVolumesRevolution {
  reglages: ReglagesSession6e;
  generateur: () => ExerciceVolumesRevolution;
  exerciceCourant: ExerciceVolumesRevolution;
  phase: PhaseVolumesRevolution;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  /** Accumule au fil des écrans de l'exercice COURANT — remis à `{}` à chaque nouvel exercice. */
  scoresPartiels: Partial<Record<PhaseVolumesRevolution, number>>;
  indexExercice: number;
  resultats: ResultatExerciceVolumesRevolution[];
  terminee: boolean;
  /** Vrai UNIQUEMENT juste après l'appel qui a clos un écran par épuisement des tentatives — piège
   * "revele stale" documenté CLAUDE.md, patron 6gen26 répliqué ici (voir
   * `sessionVolumesRevolution.ts`). */
  derniereTransitionRevelee: boolean;
}
