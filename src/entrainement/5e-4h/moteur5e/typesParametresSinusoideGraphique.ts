/**
 * Couche B (5e) — types pour 5gen9 ("Paramètres d'une fonction sinusoïdale — lecture graphique").
 * Séquence FIXE à 7 écrans, ordre de la méthode du cours (section « lecture graphique ») : b, A, T,
 * pulsation ω = 2π/T, fréquence, décalage horizontal Φ (abscisse x₀ d'un passage ASCENDANT par la
 * ligne médiane — situer le bon passage suppose d'avoir établi la médiane, écran b), puis phase
 * φ = −ω·x₀. Identifiant historique : "phi" = Φ (x₀), "dephasage" = φ.
 */
import type { ExerciceParametresSinusoideGraphique } from "../core5e/parametresSinusoideGraphique.types";
import type { ReglagesSession5e } from "../core5e/session5e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

export type PhaseParametresSinusoideGraphique = "decalage" | "amplitude" | "periode" | "pulsation" | "frequence" | "phi" | "dephasage";

export const ORDRE_PHASES_SINUSOIDE_GRAPHIQUE: PhaseParametresSinusoideGraphique[] = ["decalage", "amplitude", "periode", "pulsation", "frequence", "phi", "dephasage"];

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
  scorePulsation: number;
  scoreFrequence: number;
  scorePhi: number;
  scoreDephasage: number;
}

export interface EtatSessionParametresSinusoideGraphique {
  reglages: ReglagesSession5e;
  generateur: () => ExerciceParametresSinusoideGraphique;
  exerciceCourant: ExerciceParametresSinusoideGraphique;
  phase: PhaseParametresSinusoideGraphique;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  scoreDecalagePartiel: number | null;
  /** vrai signal "révélé", peuplé depuis `etapeCourante.revelee` à la clôture (même principe que
   * les autres générateurs 5e migrés) — jusqu'au 2025-10, le récapitulatif le déduisait de
   * `scoreDecalagePartiel === 0` ; champ explicite ajouté pendant le balayage générique
   * (point A). */
  decalageRevele: boolean;
  scoreAmplitudePartiel: number | null;
  /** même principe que `decalageRevele` ci-dessus. */
  amplitudeRevele: boolean;
  scorePeriodePartiel: number | null;
  /** même principe que `decalageRevele` ci-dessus. */
  periodeRevele: boolean;
  scorePulsationPartiel: number | null;
  /** même principe que `decalageRevele` ci-dessus. */
  pulsationRevele: boolean;
  scoreFrequencePartiel: number | null;
  /** même principe que `decalageRevele` ci-dessus. */
  frequenceRevele: boolean;
  scorePhiPartiel: number | null;
  /** même principe que `decalageRevele` ci-dessus. */
  phiRevele: boolean;
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
