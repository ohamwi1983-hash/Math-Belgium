import type { ExerciceProprietesOptiquesConiques } from "../core6e/proprietesOptiquesConiques.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

/**
 * Couche B (6e) — types de session pour `6gen63`. Une seule famille, TOUJOURS 4 écrans (jamais de
 * branchement selon l'exercice, contrairement à `6gen61`/`6gen62`) — `phaseInitiale`/`phaseApres` ne
 * dépendent donc d'aucun champ de l'exercice, mais gardent la même signature que les autres
 * générateurs du chapitre pour rester interchangeables avec le dispatcher générique de `App6gen63.tsx`.
 */

export type PhaseProprietesOptiquesConiques = "ecran1" | "ecran2" | "ecran3" | "ecran4";

export function phaseInitiale(): PhaseProprietesOptiquesConiques {
  return "ecran1";
}

const SUITE: Record<PhaseProprietesOptiquesConiques, PhaseProprietesOptiquesConiques | "termine"> = {
  ecran1: "ecran2",
  ecran2: "ecran3",
  ecran3: "ecran4",
  ecran4: "termine",
};

export function phaseApres(phase: PhaseProprietesOptiquesConiques): PhaseProprietesOptiquesConiques | "termine" {
  return SUITE[phase];
}

export const TOUTES_LES_PHASES: PhaseProprietesOptiquesConiques[] = ["ecran1", "ecran2", "ecran3", "ecran4"];

export interface ResultatExerciceProprietesOptiquesConiques {
  exercice: ExerciceProprietesOptiquesConiques;
  scores: Partial<Record<PhaseProprietesOptiquesConiques, number>>;
}

export interface EtatSessionProprietesOptiquesConiques {
  reglages: ReglagesSession6e;
  generateur: () => ExerciceProprietesOptiquesConiques;
  exerciceCourant: ExerciceProprietesOptiquesConiques;
  phase: PhaseProprietesOptiquesConiques;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  scoresPartiels: Partial<Record<PhaseProprietesOptiquesConiques, number>>;
  indexExercice: number;
  resultats: ResultatExerciceProprietesOptiquesConiques[];
  terminee: boolean;
  /** Vrai UNIQUEMENT juste après l'appel qui a clos un écran par épuisement des tentatives — piège
   * "revele stale" documenté CLAUDE.md. */
  derniereTransitionRevelee: boolean;
}
