import type { ExerciceBinomeNewton } from "../core6e/binomeNewton.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

/**
 * Couche B (6e) — types de session pour `6gen45`. Longueur de chaîne d'écrans VARIABLE : A=3
 * (toujours), B=2 (sous-type "rang", écran "trouver k" sauté) ou 3 (sous-type "puissance"), C=3
 * (toujours) — mirroir du patron `typesDenombrementFondamental.ts` (6gen43).
 */

export type PhaseBinomeNewton = "aEcran1" | "aEcran2" | "aEcran3" | "bTrouverKEcran" | "bPoserEcran" | "bCalculerEcran" | "cEcran1" | "cEcran2" | "cEcran3";

export function phaseInitiale(exercice: ExerciceBinomeNewton): PhaseBinomeNewton {
  switch (exercice.famille) {
    case "A":
      return "aEcran1";
    case "B":
      return exercice.sousType === "puissance" ? "bTrouverKEcran" : "bPoserEcran";
    case "C":
      return "cEcran1";
  }
}

export function phaseApres(phase: PhaseBinomeNewton): PhaseBinomeNewton | "termine" {
  switch (phase) {
    case "aEcran1":
      return "aEcran2";
    case "aEcran2":
      return "aEcran3";
    case "aEcran3":
      return "termine";
    case "bTrouverKEcran":
      return "bPoserEcran";
    case "bPoserEcran":
      return "bCalculerEcran";
    case "bCalculerEcran":
      return "termine";
    case "cEcran1":
      return "cEcran2";
    case "cEcran2":
      return "cEcran3";
    case "cEcran3":
      return "termine";
  }
}

/** Liste ORDONNÉE des phases réellement traversées par CET exercice précis — mirroir 6gen43. */
export function phasesPourExercice(exercice: ExerciceBinomeNewton): PhaseBinomeNewton[] {
  const phases: PhaseBinomeNewton[] = [];
  let phase: PhaseBinomeNewton | "termine" = phaseInitiale(exercice);
  while (phase !== "termine") {
    phases.push(phase);
    phase = phaseApres(phase);
  }
  return phases;
}

export interface ResultatExerciceBinomeNewton {
  exercice: ExerciceBinomeNewton;
  scores: Partial<Record<PhaseBinomeNewton, number>>;
  /** même principe que `EtatSessionBinomeNewton.revelesPartiels` (voir son commentaire). */
  revelesPartiels: Partial<Record<PhaseBinomeNewton, boolean>>;
}

export interface EtatSessionBinomeNewton {
  reglages: ReglagesSession6e;
  generateur: () => ExerciceBinomeNewton;
  exerciceCourant: ExerciceBinomeNewton;
  phase: PhaseBinomeNewton;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  scoresPartiels: Partial<Record<PhaseBinomeNewton, number>>;
  /** Vrai signal "révélé" par écran déjà clos — jusqu'au 2025-10, déduit de
   * `scoresPartiels[phase] === 0`, une heuristique fausse ici : l'ancienne pénalité d'aide (supprimée)
   * (`Math.max(0, score - niveauAide*20)` dans `sessionBinomeNewton.ts`) pouvait ramener une RÉUSSITE
   * fortement aidée à exactement 0, affichée à tort comme "révélée". Champ explicite ajouté
   * pendant le balayage générique (point A), peuplé depuis `etapeCourante.revelee`. */
  revelesPartiels: Partial<Record<PhaseBinomeNewton, boolean>>;
  indexExercice: number;
  resultats: ResultatExerciceBinomeNewton[];
  terminee: boolean;
  derniereTransitionRevelee: boolean;
}
