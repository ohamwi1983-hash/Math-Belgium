import type { ExerciceVariablesDiscretesEsperance } from "../core6e/variablesDiscretesEsperance.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

/**
 * Couche B (6e) — types de session pour `6gen49`. Longueur de chaîne d'écrans VARIABLE selon la
 * famille ET, pour C, le sous-type — mirroir `typesDenombrementFondamental.ts` (6gen43) :
 * A=3 (toujours), B=2 (toujours, les 2 sous-types partagent le même nombre d'écrans — voir
 * mission), C=2 ("vérifier") ou 3 ("imposer").
 *
 * Phases nommées par famille+sous-type SEULEMENT quand le NOMBRE d'écrans en dépend (famille C) —
 * famille B garde un seul nom de phase par écran pour les 2 sous-types (nombre d'écrans identique),
 * la protection contre le bug "état de champs figé entre 2 sous-types partageant la même phase"
 * (documenté par 6gen51, voir `docs/historique-6e.md`) étant assurée côté `App6gen49.tsx` par une
 * clé React composite (`${indexExercice}-${nonceForcage}-${phase}`), jamais seulement `phase`.
 */

export type PhaseVariablesDiscretesEsperance = "aEcran1" | "aEcran2" | "aEcran3" | "bEcran1" | "bEcran2" | "cVerifierEcran1" | "cVerifierEcran2" | "cImposerEcran1" | "cImposerEcran2" | "cImposerEcran3";

export function phaseInitiale(exercice: ExerciceVariablesDiscretesEsperance): PhaseVariablesDiscretesEsperance {
  switch (exercice.famille) {
    case "A":
      return "aEcran1";
    case "B":
      return "bEcran1";
    case "C":
      return exercice.sousType === "verifier" ? "cVerifierEcran1" : "cImposerEcran1";
  }
}

export function phaseApres(phase: PhaseVariablesDiscretesEsperance): PhaseVariablesDiscretesEsperance | "termine" {
  switch (phase) {
    case "aEcran1":
      return "aEcran2";
    case "aEcran2":
      return "aEcran3";
    case "aEcran3":
      return "termine";
    case "bEcran1":
      return "bEcran2";
    case "bEcran2":
      return "termine";
    case "cVerifierEcran1":
      return "cVerifierEcran2";
    case "cVerifierEcran2":
      return "termine";
    case "cImposerEcran1":
      return "cImposerEcran2";
    case "cImposerEcran2":
      return "cImposerEcran3";
    case "cImposerEcran3":
      return "termine";
  }
}

/** Liste ORDONNÉE des phases réellement traversées par CET exercice précis — mirroir 6gen43/6gen51. */
export function phasesPourExercice(exercice: ExerciceVariablesDiscretesEsperance): PhaseVariablesDiscretesEsperance[] {
  const phases: PhaseVariablesDiscretesEsperance[] = [];
  let phase: PhaseVariablesDiscretesEsperance | "termine" = phaseInitiale(exercice);
  while (phase !== "termine") {
    phases.push(phase);
    phase = phaseApres(phase);
  }
  return phases;
}

export interface ResultatExerciceVariablesDiscretesEsperance {
  exercice: ExerciceVariablesDiscretesEsperance;
  scores: Partial<Record<PhaseVariablesDiscretesEsperance, number>>;
}

export interface EtatSessionVariablesDiscretesEsperance {
  reglages: ReglagesSession6e;
  generateur: () => ExerciceVariablesDiscretesEsperance;
  exerciceCourant: ExerciceVariablesDiscretesEsperance;
  phase: PhaseVariablesDiscretesEsperance;
  /** Identifiant STRICTEMENT croissant, incrémenté à chaque nouvel exercice tiré (démarrage de
   * session, exercice suivant, relance dev, OU "Recommencer" — voir
   * `sessionVariablesDiscretesEsperance.ts`, `etatInitial`) — mirroir `6gen48`
   * (`typesBinomialeSequenceOrdonnee.ts`) : `key={phase}` seul collisionne dès que 2 exercices
   * DIFFÉRENTS partagent la même phase de départ avec un nombre de champs différent (ici `bEcran1`,
   * dont le nombre de champs dépend de `m`/de la taille du support hypergéométrique — jamais un
   * simple `indexExercice`, qui REPART À 0 après "Recommencer" et recollisionnerait). `App6gen49.tsx`
   * DOIT l'utiliser comme partie de la `key` React de l'écran (`key={`${generationId}-${phase}`}`),
   * jamais `phase` seul ni `indexExercice`. */
  generationId: number;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  scoresPartiels: Partial<Record<PhaseVariablesDiscretesEsperance, number>>;
  indexExercice: number;
  resultats: ResultatExerciceVariablesDiscretesEsperance[];
  terminee: boolean;
  derniereTransitionRevelee: boolean;
}
