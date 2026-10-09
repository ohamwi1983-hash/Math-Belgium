import type { ExerciceEquationConiqueCaracteristiques } from "../core6e/equationConiqueCaracteristiques.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

/**
 * Couche B (6e) — types de session pour `6gen59`. Contrairement à `typesIdentificationConiques.ts`
 * (6gen58), la longueur de la chaîne d'écrans dépend UNIQUEMENT de `famille`+`sousType` — jamais
 * d'une propriété numérique de l'exercice tiré (aucune branche "dégénérée" possible ici : toute
 * conique construite par ce générateur est valide par construction, voir `familleA.ts`-`familleD.ts`)
 * — `phaseApres` n'a donc PAS besoin de recevoir l'exercice en paramètre, contrairement au patron
 * `6gen58`/`6gen26`/`6gen29`.
 *
 * - A sous-type `memeAxe` : aMemeAxeEcran1 → aMemeAxeEcran2 → aMemeAxeEcran3.
 * - A sous-type `axesPerpendiculaires` : aAxesPerpEcran1 → aAxesPerpEcran2 → aAxesPerpEcran3.
 * - A sous-type `deuxSommets` : aDeuxSommetsEcran1 → aDeuxSommetsEcran2.
 * - B : bEcran1 → bEcran2 → bEcran3.
 * - C : cEcran1 → cEcran2 → cEcran3 → cEcran4.
 * - D : dEcran1 → dEcran2 → dEcran3.
 */

export type PhaseEquationConiqueCaracteristiques =
  | "aMemeAxeEcran1"
  | "aMemeAxeEcran2"
  | "aMemeAxeEcran3"
  | "aAxesPerpEcran1"
  | "aAxesPerpEcran2"
  | "aAxesPerpEcran3"
  | "aDeuxSommetsEcran1"
  | "aDeuxSommetsEcran2"
  | "bEcran1"
  | "bEcran2"
  | "bEcran3"
  | "cEcran1"
  | "cEcran2"
  | "cEcran3"
  | "cEcran4"
  | "dEcran1"
  | "dEcran2"
  | "dEcran3";

export function phaseInitiale(exercice: ExerciceEquationConiqueCaracteristiques): PhaseEquationConiqueCaracteristiques {
  if (exercice.famille === "A") {
    if (exercice.sousType === "memeAxe") return "aMemeAxeEcran1";
    if (exercice.sousType === "axesPerpendiculaires") return "aAxesPerpEcran1";
    return "aDeuxSommetsEcran1";
  }
  if (exercice.famille === "B") return "bEcran1";
  if (exercice.famille === "C") return "cEcran1";
  return "dEcran1";
}

const SUITE: Partial<Record<PhaseEquationConiqueCaracteristiques, PhaseEquationConiqueCaracteristiques>> = {
  aMemeAxeEcran1: "aMemeAxeEcran2",
  aMemeAxeEcran2: "aMemeAxeEcran3",
  aAxesPerpEcran1: "aAxesPerpEcran2",
  aAxesPerpEcran2: "aAxesPerpEcran3",
  aDeuxSommetsEcran1: "aDeuxSommetsEcran2",
  bEcran1: "bEcran2",
  bEcran2: "bEcran3",
  cEcran1: "cEcran2",
  cEcran2: "cEcran3",
  cEcran3: "cEcran4",
  dEcran1: "dEcran2",
  dEcran2: "dEcran3",
};

export function phaseApres(phase: PhaseEquationConiqueCaracteristiques): PhaseEquationConiqueCaracteristiques | "termine" {
  return SUITE[phase] ?? "termine";
}

/** Liste ORDONNÉE des phases réellement traversées par CET exercice précis — mirroir
 * `phasesPourExercice` (6gen58), ici purement fonction de `phaseInitiale` (aucune dépendance à une
 * propriété numérique de l'exercice, voir en-tête de fichier). */
export function phasesPourExercice(exercice: ExerciceEquationConiqueCaracteristiques): PhaseEquationConiqueCaracteristiques[] {
  const phases: PhaseEquationConiqueCaracteristiques[] = [];
  let phase: PhaseEquationConiqueCaracteristiques | "termine" = phaseInitiale(exercice);
  while (phase !== "termine") {
    phases.push(phase);
    phase = phaseApres(phase);
  }
  return phases;
}

export interface ResultatExerciceEquationConiqueCaracteristiques {
  exercice: ExerciceEquationConiqueCaracteristiques;
  scores: Partial<Record<PhaseEquationConiqueCaracteristiques, number>>;
}

export interface EtatSessionEquationConiqueCaracteristiques {
  reglages: ReglagesSession6e;
  generateur: () => ExerciceEquationConiqueCaracteristiques;
  exerciceCourant: ExerciceEquationConiqueCaracteristiques;
  phase: PhaseEquationConiqueCaracteristiques;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  scoresPartiels: Partial<Record<PhaseEquationConiqueCaracteristiques, number>>;
  indexExercice: number;
  resultats: ResultatExerciceEquationConiqueCaracteristiques[];
  terminee: boolean;
  /** Vrai UNIQUEMENT juste après l'appel qui a clos un écran par épuisement des tentatives — piège
   * "revele stale" documenté CLAUDE.md. */
  derniereTransitionRevelee: boolean;
}
