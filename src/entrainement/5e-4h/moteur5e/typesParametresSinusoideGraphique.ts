/**
 * Couche B (5e) — types pour 5gen9 ("Paramètres d'une fonction sinusoïdale — lecture graphique").
 * Séquence FIXE à 5 écrans, ordre DIFFÉRENT de 5gen8 : b, A, T, f, φ (situer le bon passage
 * ascendant, écran φ, suppose d'avoir déjà établi où se trouve la ligne médiane, écran b — spec).
 */
import type { ExerciceParametresSinusoideGraphique } from "../core5e/parametresSinusoideGraphique.types";
import type { ReglagesSession5e } from "../core5e/session5e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

export type PhaseParametresSinusoideGraphique = "decalage" | "amplitude" | "periode" | "frequence" | "phi";

export const ORDRE_PHASES_SINUSOIDE_GRAPHIQUE: PhaseParametresSinusoideGraphique[] = ["decalage", "amplitude", "periode", "frequence", "phi"];

export function phaseInitiale(): PhaseParametresSinusoideGraphique {
  return ORDRE_PHASES_SINUSOIDE_GRAPHIQUE[0];
}

export function phaseApres(phaseActuelle: PhaseParametresSinusoideGraphique): PhaseParametresSinusoideGraphique | "termine" {
  const index = ORDRE_PHASES_SINUSOIDE_GRAPHIQUE.indexOf(phaseActuelle);
  return index + 1 < ORDRE_PHASES_SINUSOIDE_GRAPHIQUE.length ? ORDRE_PHASES_SINUSOIDE_GRAPHIQUE[index + 1] : "termine";
}

export interface ResultatExerciceParametresSinusoideGraphique {
  exercice: ExerciceParametresSinusoideGraphique;
  scoreDecalage: number;
  scoreAmplitude: number;
  scorePeriode: number;
  scoreFrequence: number;
  scorePhi: number;
}

export interface EtatSessionParametresSinusoideGraphique {
  reglages: ReglagesSession5e;
  generateur: () => ExerciceParametresSinusoideGraphique;
  exerciceCourant: ExerciceParametresSinusoideGraphique;
  phase: PhaseParametresSinusoideGraphique;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  scoreDecalagePartiel: number | null;
  scoreAmplitudePartiel: number | null;
  scorePeriodePartiel: number | null;
  scoreFrequencePartiel: number | null;
  indexExercice: number;
  resultats: ResultatExerciceParametresSinusoideGraphique[];
  terminee: boolean;
  /** `revele` de la phase qui vient de SE FERMER (celle qui a produit CET état), capturé au moment
   * précis de la transition — jamais celui de `etat.phase` courante (qui n'a pas encore de verdict).
   * Corrige le bug où `App5gen9.tsx::terminerEtape` lisait `etat.etapeCourante.revelee`
   * PRÉ-soumission (donc structurellement toujours `false`). Lire ce champ sur l'état RETOURNÉ par
   * `soumettreReponseParametresSinusoideGraphique`, jamais sur l'état pré-soumission. `false` à
   * l'état initial (aucune phase encore fermée). */
  derniereEtapeRevelee: boolean;
}
