import type { ExerciceCalculAires } from "../core6e/calculAires.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

/**
 * Couche B (6e) — types de session pour `6gen26`. 4 familles, longueur de chaîne D'ÉCRANS variable
 * (2 à 4) — mirroir du patron `phaseInitiale`/`phaseApres` de `typesCalculPrimitives.ts` (6gen23),
 * PAS importé (moteur↔generateurs jamais partagé entre générateurs, seul le PATRON est répliqué —
 * voir CLAUDE.md, "Pas de moteur de session unifié").
 *
 * **Différence avec 6gen23** : `phaseApres` prend ICI un 2e paramètre `exercice` — la famille D a un
 * embranchement qui dépend du SOUS-TYPE de l'exercice, pas seulement de la phase courante (dEcran3 →
 * "termine" pour "bornesDonnees"/"bornesATrouver", mais → dEcran4 pour "parametre") ; 6gen23 n'avait
 * jamais ce besoin (chaque famille/sous-type y a une longueur de chaîne FIXE une fois choisie).
 */

export type PhaseCalculAires = "aEcran1" | "aEcran2" | "bEcran1" | "bEcran2" | "bEcran3" | "cEcran1" | "cEcran2" | "cEcran3" | "cEcran4" | "dEcran1" | "dEcran2" | "dEcran3" | "dEcran4";

export function phaseInitiale(exercice: ExerciceCalculAires): PhaseCalculAires {
  switch (exercice.famille) {
    case "A":
      return "aEcran1";
    case "B":
      return "bEcran1";
    case "C":
      return "cEcran1";
    case "D":
      return exercice.sousType === "bornesATrouver" ? "dEcran1" : "dEcran2";
  }
}

export function phaseApres(phase: PhaseCalculAires, exercice: ExerciceCalculAires): PhaseCalculAires | "termine" {
  switch (phase) {
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
    case "dEcran1":
      return "dEcran2";
    case "dEcran2":
      return "dEcran3";
    case "dEcran3":
      return exercice.famille === "D" && exercice.sousType === "parametre" ? "dEcran4" : "termine";
    case "dEcran4":
      return "termine";
  }
}

/** Liste ORDONNÉE des phases réellement traversées par CET exercice précis — parcourt la chaîne
 * `phaseInitiale → phaseApres`, jamais une table statique (mirroir 6gen23). Réutilisée par
 * `ui6e/formatCalculAires.ts` (récapitulatif) et `sessionCalculAires.ts`. */
export function phasesPourExercice(exercice: ExerciceCalculAires): PhaseCalculAires[] {
  const phases: PhaseCalculAires[] = [];
  let phase: PhaseCalculAires | "termine" = phaseInitiale(exercice);
  while (phase !== "termine") {
    phases.push(phase);
    phase = phaseApres(phase, exercice);
  }
  return phases;
}

export interface ResultatExerciceCalculAires {
  exercice: ExerciceCalculAires;
  scores: Partial<Record<PhaseCalculAires, number>>;
}

export interface EtatSessionCalculAires {
  reglages: ReglagesSession6e;
  generateur: () => ExerciceCalculAires;
  exerciceCourant: ExerciceCalculAires;
  phase: PhaseCalculAires;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  /** Accumule au fil des écrans de l'exercice COURANT — remis à `{}` à chaque nouvel exercice. */
  scoresPartiels: Partial<Record<PhaseCalculAires, number>>;
  indexExercice: number;
  resultats: ResultatExerciceCalculAires[];
  terminee: boolean;
  /** Vrai UNIQUEMENT juste après l'appel qui a clos un écran par épuisement des tentatives — piège
   * "revele stale" documenté CLAUDE.md, patron 6gen23 répliqué ici (voir `sessionCalculAires.ts`). */
  derniereTransitionRevelee: boolean;
}
