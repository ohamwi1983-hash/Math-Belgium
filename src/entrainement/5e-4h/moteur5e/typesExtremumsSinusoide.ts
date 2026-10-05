/**
 * Couche B (5e) — types pour 5gen11 ("Extremums d'une fonction sinusoïdale"). Séquence FIXE à 3
 * écrans, jamais de saut conditionnel (le nombre de solutions de l'écran 3 est garanti entre 1 et 5
 * par le reroll borné de la génération, voir `generateurs5e/extremumsSinusoide/index.ts`) — ordre
 * poser l'équation fusionnée → isoler x → solutions (bonus), même principe de séquence fixe que
 * 5gen8/5gen9.
 */
import type { ExerciceExtremumsSinusoide } from "../core5e/extremumsSinusoide.types";
import type { ReglagesSession5e } from "../core5e/session5e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

export type PhaseExtremumsSinusoide = "poserEquation" | "isolerX" | "solutions";

export const ORDRE_PHASES_EXTREMUMS: PhaseExtremumsSinusoide[] = ["poserEquation", "isolerX", "solutions"];

export function phaseInitiale(): PhaseExtremumsSinusoide {
  return ORDRE_PHASES_EXTREMUMS[0];
}

export function phaseApres(phaseActuelle: PhaseExtremumsSinusoide): PhaseExtremumsSinusoide | "termine" {
  const index = ORDRE_PHASES_EXTREMUMS.indexOf(phaseActuelle);
  return index + 1 < ORDRE_PHASES_EXTREMUMS.length ? ORDRE_PHASES_EXTREMUMS[index + 1] : "termine";
}

export interface ResultatExerciceExtremumsSinusoide {
  exercice: ExerciceExtremumsSinusoide;
  scorePoserEquation: number;
  scoreIsolerX: number;
  scoreSolutions: number;
}

export interface EtatSessionExtremumsSinusoide {
  reglages: ReglagesSession5e;
  generateur: () => ExerciceExtremumsSinusoide;
  exerciceCourant: ExerciceExtremumsSinusoide;
  phase: PhaseExtremumsSinusoide;
  etapeCourante: EtatEtapeTentatives;
  /** Remis à 0 à chaque transition de phase (même principe que 5gen6/5gen7/5gen8/5gen10). */
  niveauAide: number;
  scorePoserEquationPartiel: number | null;
  scoreIsolerXPartiel: number | null;
  indexExercice: number;
  resultats: ResultatExerciceExtremumsSinusoide[];
  terminee: boolean;
  /** `revele` de la phase qui vient de SE FERMER (celle qui a produit CET état), capturé au moment
   * précis de la transition — jamais celui de `etat.phase` courante (qui n'a pas encore de
   * verdict). A.1, même correctif que 5gen10 (`typesEquationTrig.ts`, commit 122064a) : corrige le
   * bug où `App5gen11.tsx::terminerEtape` lisait `etat.etapeCourante.revelee` PRÉ-soumission (donc
   * structurellement toujours `false` — une phase révélée transite IMMÉDIATEMENT, jamais de render
   * intermédiaire où `etat.etapeCourante.revelee` serait vrai). Lire ce champ sur l'état RETOURNÉ
   * par `soumettreReponseXxx`, jamais sur l'état pré-soumission. `false` à l'état initial (aucune
   * phase encore fermée). */
  derniereEtapeRevelee: boolean;
}
