/**
 * Couche B (6e) — types pour `6gen1` ("Fonctions injectives/surjectives/bijectives"). Séquence
 * FIXE à 5 écrans, jamais de saut conditionnel : domaine → injective(+intervalle) → réciproque →
 * image → bijection.
 */
import type { ExerciceInjectiviteFonctions } from "../core6e/injectiviteFonctions.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

export type PhaseInjectiviteFonctions = "domaine" | "injective" | "reciproque" | "image" | "bijection";

export const ORDRE_PHASES_INJECTIVITE: PhaseInjectiviteFonctions[] = ["domaine", "injective", "reciproque", "image", "bijection"];

export function phaseInitiale(): PhaseInjectiviteFonctions {
  return ORDRE_PHASES_INJECTIVITE[0];
}

export function phaseApres(phaseActuelle: PhaseInjectiviteFonctions): PhaseInjectiviteFonctions | "termine" {
  const index = ORDRE_PHASES_INJECTIVITE.indexOf(phaseActuelle);
  return index + 1 < ORDRE_PHASES_INJECTIVITE.length ? ORDRE_PHASES_INJECTIVITE[index + 1] : "termine";
}

/** Côté du pivot choisi/confirmé par l'élève à l'écran "injective" — mémorisé pour noter l'écran
 * "réciproque" avec la BONNE closure (`fInverseGauche`/`fInverseDroite`, voir en-tête de
 * `core6e/injectiviteFonctions.types.ts`). Sans effet si `exercice.injective===true` (branche
 * unique, `fInverseGauche===fInverseDroite`). */
export type CoteBranche = "gauche" | "droite";

export interface ResultatExerciceInjectiviteFonctions {
  exercice: ExerciceInjectiviteFonctions;
  scoreDomaine: number;
  scoreInjective: number;
  scoreReciproque: number;
  scoreImage: number;
  scoreBijection: number;
  /**
   * Révélation PAR ÉCRAN — tracée côté Couche B au moment exact où `etapeCourante.revelee` est
   * encore disponible (même piège documenté que l'ancienne version de ce générateur : redevient
   * TOUJOURS `false` avant qu'un `App6gen1.tsx` puisse jamais l'observer après la transition de
   * phase — voir `avancerPhase`, `sessionInjectiviteFonctions.ts`).
   */
  reveleDomaine: boolean;
  reveleInjective: boolean;
  reveleReciproque: boolean;
  reveleImage: boolean;
  reveleBijection: boolean;
}

export interface EtatSessionInjectiviteFonctions {
  reglages: ReglagesSession6e;
  generateur: () => ExerciceInjectiviteFonctions;
  exerciceCourant: ExerciceInjectiviteFonctions;
  phase: PhaseInjectiviteFonctions;
  etapeCourante: EtatEtapeTentatives;
  /** Remis à 0 à chaque transition de phase. */
  niveauAide: number;
  /** Fixé à la clôture de la phase "injective" (voir en-tête) — `"droite"` par défaut tant que
   * cette phase n'est pas encore résolue (sans effet avant, aucune phase ne le consulte plus tôt). */
  coteChoisi: CoteBranche;
  scoreDomainePartiel: number | null;
  scoreInjectivePartiel: number | null;
  scoreReciproquePartiel: number | null;
  scoreImagePartiel: number | null;
  reveleDomainePartiel: boolean | null;
  reveleInjectivePartiel: boolean | null;
  reveleReciproquePartiel: boolean | null;
  reveleImagePartiel: boolean | null;
  indexExercice: number;
  resultats: ResultatExerciceInjectiviteFonctions[];
  terminee: boolean;
}
