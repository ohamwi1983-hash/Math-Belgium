/**
 * Couche B (5e) — types pour 5gen8 ("Paramètres d'une fonction sinusoïdale"). Séquence FIXE à 7
 * écrans, jamais de saut conditionnel (contrairement à 5gen6/5gen7) — ordre du cours (section
 * « Paramètres », f(x) = A·sin(ωx + φ) + b) : amplitude, pulsation ω, période T, fréquence, déphasage
 * φ, décalage horizontal Φ = −φ/ω, décalage vertical b.
 *
 * Identifiants de phase historiques conservés : "phi" désigne le DÉCALAGE HORIZONTAL Φ (champ
 * `exercice.phi`), "dephasage" le déphasage φ du cours (`exercice.C`), "pulsation" ω (`exercice.B`).
 */
import type { ExerciceParametresSinusoide } from "../core5e/parametresSinusoide.types";
import type { ReglagesSession5e } from "../core5e/session5e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

export type PhaseParametresSinusoide = "amplitude" | "pulsation" | "periode" | "frequence" | "dephasage" | "phi" | "decalage";

export const ORDRE_PHASES_SINUSOIDE: PhaseParametresSinusoide[] = ["amplitude", "pulsation", "periode", "frequence", "dephasage", "phi", "decalage"];

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
  scorePulsation: number;
  scoreDephasage: number;
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
  /** vrai signal "révélé", peuplé depuis `etapeCourante.revelee` à la clôture (même principe que
   * les autres générateurs 5e migrés) — jusqu'au 2025-10, le récapitulatif le déduisait de
   * `scoreAmplitudePartiel === 0` ; champ explicite ajouté pendant le balayage générique
   * (point A). */
  amplitudeRevele: boolean;
  scorePulsationPartiel: number | null;
  /** même principe que `amplitudeRevele` ci-dessus. */
  pulsationRevele: boolean;
  scoreDephasagePartiel: number | null;
  /** même principe que `amplitudeRevele` ci-dessus. */
  dephasageRevele: boolean;
  scorePhiPartiel: number | null;
  /** même principe que `amplitudeRevele` ci-dessus. */
  phiRevele: boolean;
  scorePeriodePartiel: number | null;
  /** même principe que `amplitudeRevele` ci-dessus. */
  periodeRevele: boolean;
  scoreFrequencePartiel: number | null;
  /** même principe que `amplitudeRevele` ci-dessus. */
  frequenceRevele: boolean;
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
