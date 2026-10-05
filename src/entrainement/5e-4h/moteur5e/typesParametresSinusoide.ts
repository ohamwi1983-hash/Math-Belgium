/**
 * Couche B (5e) — types pour 5gen8 ("Paramètres d'une fonction sinusoïdale"). Séquence FIXE à 5
 * écrans, jamais de saut conditionnel (contrairement à 5gen6/5gen7) — ordre A, φ, T, f, b (spec).
 */
import type { ExerciceParametresSinusoide } from "../core5e/parametresSinusoide.types";
import type { ReglagesSession5e } from "../core5e/session5e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

export type PhaseParametresSinusoide = "amplitude" | "phi" | "periode" | "frequence" | "decalage";

export const ORDRE_PHASES_SINUSOIDE: PhaseParametresSinusoide[] = ["amplitude", "phi", "periode", "frequence", "decalage"];

export function phaseInitiale(): PhaseParametresSinusoide {
  return ORDRE_PHASES_SINUSOIDE[0];
}

export function phaseApres(phaseActuelle: PhaseParametresSinusoide): PhaseParametresSinusoide | "termine" {
  const index = ORDRE_PHASES_SINUSOIDE.indexOf(phaseActuelle);
  return index + 1 < ORDRE_PHASES_SINUSOIDE.length ? ORDRE_PHASES_SINUSOIDE[index + 1] : "termine";
}

export interface ResultatExerciceParametresSinusoide {
  exercice: ExerciceParametresSinusoide;
  scoreAmplitude: number;
  scorePhi: number;
  scorePeriode: number;
  scoreFrequence: number;
  scoreDecalage: number;
}

export interface EtatSessionParametresSinusoide {
  reglages: ReglagesSession5e;
  generateur: () => ExerciceParametresSinusoide;
  exerciceCourant: ExerciceParametresSinusoide;
  phase: PhaseParametresSinusoide;
  etapeCourante: EtatEtapeTentatives;
  /** Remis à 0 à chaque transition de phase (même principe que 5gen6/5gen7). */
  niveauAide: number;
  scoreAmplitudePartiel: number | null;
  scorePhiPartiel: number | null;
  scorePeriodePartiel: number | null;
  scoreFrequencePartiel: number | null;
  indexExercice: number;
  resultats: ResultatExerciceParametresSinusoide[];
  terminee: boolean;
  /** `revele` de la phase qui vient de SE FERMER (celle qui a produit CET état), capturé au moment
   * précis de la transition — jamais celui de `etat.phase` courante (qui n'a pas encore de verdict).
   * Corrige le bug où `App5gen8.tsx::terminerEtape` lisait `etat.etapeCourante.revelee`
   * PRÉ-soumission (donc structurellement toujours `false`). Lire ce champ sur l'état RETOURNÉ par
   * `soumettreReponseParametresSinusoide`, jamais sur l'état pré-soumission. `false` à l'état
   * initial (aucune phase encore fermée). */
  derniereEtapeRevelee: boolean;
}
