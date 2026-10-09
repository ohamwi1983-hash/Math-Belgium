import type { ExerciceFormuleMoivre } from "../core6e/formuleMoivre.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

/**
 * Couche B (6e) — types de session pour `6gen38`. UNE SEULE famille, chaîne d'écrans FIXE (3 écrans,
 * quel que soit `n`) — beaucoup plus simple que `typesNombresComplexes.ts` (7 familles, longueur
 * variable) : `phaseInitiale`/`phaseApres` ci-dessous ignorent volontairement `exercice` (paramètre
 * conservé uniquement pour garder la même SIGNATURE que `typesNombresComplexes.ts`, permettant de
 * répliquer `sessionNombresComplexes.ts`/`App6gen34.tsx` quasiment tels quels).
 */

export type PhaseFormuleMoivre = "ecran1" | "ecran2" | "ecran3";

export function phaseInitiale(_exercice: ExerciceFormuleMoivre): PhaseFormuleMoivre {
  return "ecran1";
}

export function phaseApres(phase: PhaseFormuleMoivre): PhaseFormuleMoivre | "termine" {
  switch (phase) {
    case "ecran1":
      return "ecran2";
    case "ecran2":
      return "ecran3";
    case "ecran3":
      return "termine";
  }
}

/** Liste ORDONNÉE des phases réellement traversées — toujours les 3 mêmes, quel que soit `n`. */
export function phasesPourExercice(exercice: ExerciceFormuleMoivre): PhaseFormuleMoivre[] {
  const phases: PhaseFormuleMoivre[] = [];
  let phase: PhaseFormuleMoivre | "termine" = phaseInitiale(exercice);
  while (phase !== "termine") {
    phases.push(phase);
    phase = phaseApres(phase);
  }
  return phases;
}

export interface ResultatExerciceFormuleMoivre {
  exercice: ExerciceFormuleMoivre;
  scores: Partial<Record<PhaseFormuleMoivre, number>>;
}

export interface EtatSessionFormuleMoivre {
  reglages: ReglagesSession6e;
  generateur: () => ExerciceFormuleMoivre;
  exerciceCourant: ExerciceFormuleMoivre;
  phase: PhaseFormuleMoivre;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  /** Accumule au fil des écrans de l'exercice COURANT — remis à `{}` à chaque nouvel exercice. */
  scoresPartiels: Partial<Record<PhaseFormuleMoivre, number>>;
  indexExercice: number;
  resultats: ResultatExerciceFormuleMoivre[];
  terminee: boolean;
  /** Vrai UNIQUEMENT juste après l'appel qui a clos un écran par épuisement des tentatives — piège
   * "revele stale" documenté CLAUDE.md, patron 6gen23/6gen28/6gen34 répliqué ici. */
  derniereTransitionRevelee: boolean;
}
