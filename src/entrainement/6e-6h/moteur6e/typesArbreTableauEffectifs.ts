import type { ExerciceArbreTableauEffectifs } from "../core6e/arbreTableauEffectifs.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

/**
 * Couche B (6e) — types de session de `6gen74`. Quatre écrans, dont l'ORDRE dépend du sens de
 * départ : l'écriture donnée est complétée d'abord, l'autre est construite ensuite.
 * - `pourcentages`, `arbrePartiel` : arbre → tableau → conditionnelles → indépendance ;
 * - `tableauPartiel` : tableau → arbre → conditionnelles → indépendance.
 * `phaseApres` prend donc l'exercice en argument (contrairement à `typesIndependanceBayes.ts`).
 */

export type PhaseArbreTableauEffectifs = "arbre" | "tableau" | "conditionnelles" | "independance";

export function phasesPourExercice(exercice: ExerciceArbreTableauEffectifs): PhaseArbreTableauEffectifs[] {
  return exercice.mode === "tableauPartiel" ? ["tableau", "arbre", "conditionnelles", "independance"] : ["arbre", "tableau", "conditionnelles", "independance"];
}

export function phaseInitiale(exercice: ExerciceArbreTableauEffectifs): PhaseArbreTableauEffectifs {
  return phasesPourExercice(exercice)[0];
}

export function phaseApres(exercice: ExerciceArbreTableauEffectifs, phase: PhaseArbreTableauEffectifs): PhaseArbreTableauEffectifs | "termine" {
  const phases = phasesPourExercice(exercice);
  const i = phases.indexOf(phase);
  return i < 0 || i === phases.length - 1 ? "termine" : phases[i + 1];
}

export interface ResultatExerciceArbreTableauEffectifs {
  exercice: ExerciceArbreTableauEffectifs;
  scores: Partial<Record<PhaseArbreTableauEffectifs, number>>;
}

export interface EtatSessionArbreTableauEffectifs {
  reglages: ReglagesSession6e;
  generateur: () => ExerciceArbreTableauEffectifs;
  exerciceCourant: ExerciceArbreTableauEffectifs;
  phase: PhaseArbreTableauEffectifs;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  scoresPartiels: Partial<Record<PhaseArbreTableauEffectifs, number>>;
  revelesPartiels: Partial<Record<PhaseArbreTableauEffectifs, boolean>>;
  indexExercice: number;
  resultats: ResultatExerciceArbreTableauEffectifs[];
  terminee: boolean;
  derniereTransitionRevelee: boolean;
}
