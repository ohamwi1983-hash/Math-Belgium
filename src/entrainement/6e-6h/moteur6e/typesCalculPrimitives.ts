import type { ExerciceCalculPrimitives } from "../core6e/calculPrimitives.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

/**
 * Couche B (6e) — types de session pour `6gen23`. 7 familles × 1 à 5 sous-types, chacun avec sa
 * PROPRE longueur de chaîne d'écrans (1 à 4) — `phaseInitiale`/`phaseApres` dispatchent sur
 * `exercice.famille` PUIS `exercice.sousType` (mirroir du patron `6gen18`/`6gen21`, CLAUDE.md point
 * 8 des clarifications), jamais une séquence commune.
 *
 * **Simplification délibérée par rapport à `6gen18`** : plutôt qu'une table `PHASES_PAR_FAMILLE`
 * statique (8 entrées pour 6gen18, en aurait fallu ~13 ici vu le nombre de sous-types),
 * `phasesPourExercice` ci-dessous PARCOURT la chaîne `phaseInitiale → phaseApres → ... → "termine"`
 * — une seule implémentation générique, jamais une table dupliquant ce que `phaseApres` sait déjà.
 */

export type PhaseCalculPrimitives =
  | "aEcranDirect"
  | "aEcran1"
  | "aEcran2"
  | "bEcran1"
  | "bEcran2"
  | "bEcran3"
  | "cEcran1"
  | "cEcran2"
  | "cEcran3"
  | "cEcran4"
  | "dEcranDirect"
  | "dEcran1"
  | "dEcran2"
  | "dEcran3"
  | "dEcran4"
  | "eEcran1"
  | "eEcran2"
  | "eEcran3"
  | "eEcran4"
  | "fEcran1"
  | "fEcran2"
  | "gEcran1"
  | "gEcran2"
  | "gEcran3"
  | "gEcran4";

export function phaseInitiale(exercice: ExerciceCalculPrimitives): PhaseCalculPrimitives {
  switch (exercice.famille) {
    case "A":
      return exercice.sousType === "direct" ? "aEcranDirect" : "aEcran1";
    case "B":
      return "bEcran1";
    case "C":
      return "cEcran1";
    case "D":
      return exercice.sousType === "5" ? "dEcranDirect" : "dEcran1";
    case "E":
      return "eEcran1";
    case "F":
      return "fEcran1";
    case "G":
      return exercice.sousType === "2" ? "gEcran1" : "gEcran2";
  }
}

export function phaseApres(phase: PhaseCalculPrimitives): PhaseCalculPrimitives | "termine" {
  switch (phase) {
    case "aEcranDirect":
      return "termine";
    case "aEcran1":
      return "aEcran2";
    case "aEcran2":
      return "termine";
    case "bEcran1":
      return "bEcran2";
    case "bEcran2":
      return "bEcran3";
    case "bEcran3":
      return "termine";
    case "cEcran1":
      return "cEcran2";
    case "cEcran2":
      return "cEcran3";
    case "cEcran3":
      return "cEcran4";
    case "cEcran4":
      return "termine";
    case "dEcranDirect":
      return "termine";
    case "dEcran1":
      return "dEcran2";
    case "dEcran2":
      return "dEcran3";
    case "dEcran3":
      return "dEcran4";
    case "dEcran4":
      return "termine";
    case "eEcran1":
      return "eEcran2";
    case "eEcran2":
      return "eEcran3";
    case "eEcran3":
      return "eEcran4";
    case "eEcran4":
      return "termine";
    case "fEcran1":
      return "fEcran2";
    case "fEcran2":
      return "termine";
    case "gEcran1":
      return "gEcran2";
    case "gEcran2":
      return "gEcran3";
    case "gEcran3":
      return "gEcran4";
    case "gEcran4":
      return "termine";
  }
}

/** Liste ORDONNÉE des phases réellement traversées par CET exercice précis — parcourt la chaîne
 * `phaseInitiale → phaseApres`, jamais une table statique (voir en-tête de fichier). Réutilisée par
 * `ui6e/formatCalculPrimitives.ts` (récapitulatif) et `sessionCalculPrimitives.ts`. */
export function phasesPourExercice(exercice: ExerciceCalculPrimitives): PhaseCalculPrimitives[] {
  const phases: PhaseCalculPrimitives[] = [];
  let phase: PhaseCalculPrimitives | "termine" = phaseInitiale(exercice);
  while (phase !== "termine") {
    phases.push(phase);
    phase = phaseApres(phase);
  }
  return phases;
}

export interface ResultatExerciceCalculPrimitives {
  exercice: ExerciceCalculPrimitives;
  scores: Partial<Record<PhaseCalculPrimitives, number>>;
}

export interface EtatSessionCalculPrimitives {
  reglages: ReglagesSession6e;
  generateur: () => ExerciceCalculPrimitives;
  exerciceCourant: ExerciceCalculPrimitives;
  phase: PhaseCalculPrimitives;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  /** Accumule au fil des écrans de l'exercice COURANT — l'ensemble de phases réellement traversées
   * varie par famille/sous-type (voir `phasesPourExercice`), remis à `{}` à chaque nouvel exercice. */
  scoresPartiels: Partial<Record<PhaseCalculPrimitives, number>>;
  indexExercice: number;
  resultats: ResultatExerciceCalculPrimitives[];
  terminee: boolean;
  /** Vrai UNIQUEMENT juste après l'appel qui a clos un écran par épuisement des tentatives — piège
   * "revele stale" documenté CLAUDE.md, patron `6gen18`/`6gen21` répliqué ici (voir
   * `sessionCalculPrimitives.ts`, fonction `avancerPhase`). */
  derniereTransitionRevelee: boolean;
}
