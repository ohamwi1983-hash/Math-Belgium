import type { ExerciceDenombrementFondamental } from "../core6e/denombrementFondamental.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

/**
 * Couche B (6e) — types de session pour `6gen43`. Longueur de chaîne d'écrans VARIABLE selon la
 * famille ET, pour A/B, le sous-type — mirroir du patron `typesIntegralesProblemes.ts` (6gen29) :
 * A=2 (total/positionFixee/borneSuperieure) ou 3 (contientUnChiffre/contientDeuxChiffres/parite),
 * B=1 (direct) ou 2 (inverse), C=2 (toujours), D=3 (toujours), E=2 (toujours).
 */

export type PhaseDenombrementFondamental =
  | "aTotalEcran1"
  | "aTotalEcran2"
  | "aPositionFixeeEcran1"
  | "aPositionFixeeEcran2"
  | "aContientUnEcran1"
  | "aContientUnEcran2"
  | "aContientUnEcran3"
  | "aContientDeuxEcran1"
  | "aContientDeuxEcran2"
  | "aContientDeuxEcran3"
  | "aBorneEcran1"
  | "aBorneEcran2"
  | "aPariteEcran1"
  | "aPariteEcran2"
  | "aPariteEcran3"
  | "bDirectEcran1"
  | "bInverseEcran1"
  | "bInverseEcran2"
  | "cEcran1"
  | "cEcran2"
  | "dEcran1"
  | "dEcran2"
  | "dEcran3"
  | "eEcran1"
  | "eEcran2";

export function phaseInitiale(exercice: ExerciceDenombrementFondamental): PhaseDenombrementFondamental {
  switch (exercice.famille) {
    case "A":
      switch (exercice.sousType) {
        case "total":
          return "aTotalEcran1";
        case "positionFixee":
          return "aPositionFixeeEcran1";
        case "contientUnChiffre":
          return "aContientUnEcran1";
        case "contientDeuxChiffres":
          return "aContientDeuxEcran1";
        case "borneSuperieure":
          return "aBorneEcran1";
        case "parite":
          return "aPariteEcran1";
      }
      break;
    case "B":
      return exercice.sousType === "direct" ? "bDirectEcran1" : "bInverseEcran1";
    case "C":
      return "cEcran1";
    case "D":
      return "dEcran1";
    case "E":
      return "eEcran1";
  }
  /* c8 ignore next */
  throw new Error("phaseInitiale : exercice inconnu");
}

export function phaseApres(phase: PhaseDenombrementFondamental): PhaseDenombrementFondamental | "termine" {
  switch (phase) {
    case "aTotalEcran1":
      return "aTotalEcran2";
    case "aTotalEcran2":
      return "termine";
    case "aPositionFixeeEcran1":
      return "aPositionFixeeEcran2";
    case "aPositionFixeeEcran2":
      return "termine";
    case "aContientUnEcran1":
      return "aContientUnEcran2";
    case "aContientUnEcran2":
      return "aContientUnEcran3";
    case "aContientUnEcran3":
      return "termine";
    case "aContientDeuxEcran1":
      return "aContientDeuxEcran2";
    case "aContientDeuxEcran2":
      return "aContientDeuxEcran3";
    case "aContientDeuxEcran3":
      return "termine";
    case "aBorneEcran1":
      return "aBorneEcran2";
    case "aBorneEcran2":
      return "termine";
    case "aPariteEcran1":
      return "aPariteEcran2";
    case "aPariteEcran2":
      return "aPariteEcran3";
    case "aPariteEcran3":
      return "termine";
    case "bDirectEcran1":
      return "termine";
    case "bInverseEcran1":
      return "bInverseEcran2";
    case "bInverseEcran2":
      return "termine";
    case "cEcran1":
      return "cEcran2";
    case "cEcran2":
      return "termine";
    case "dEcran1":
      return "dEcran2";
    case "dEcran2":
      return "dEcran3";
    case "dEcran3":
      return "termine";
    case "eEcran1":
      return "eEcran2";
    case "eEcran2":
      return "termine";
  }
}

/** Liste ORDONNÉE des phases réellement traversées par CET exercice précis — mirroir 6gen29/6gen37. */
export function phasesPourExercice(exercice: ExerciceDenombrementFondamental): PhaseDenombrementFondamental[] {
  const phases: PhaseDenombrementFondamental[] = [];
  let phase: PhaseDenombrementFondamental | "termine" = phaseInitiale(exercice);
  while (phase !== "termine") {
    phases.push(phase);
    phase = phaseApres(phase);
  }
  return phases;
}

export interface ResultatExerciceDenombrementFondamental {
  exercice: ExerciceDenombrementFondamental;
  scores: Partial<Record<PhaseDenombrementFondamental, number>>;
}

export interface EtatSessionDenombrementFondamental {
  reglages: ReglagesSession6e;
  generateur: () => ExerciceDenombrementFondamental;
  exerciceCourant: ExerciceDenombrementFondamental;
  phase: PhaseDenombrementFondamental;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  scoresPartiels: Partial<Record<PhaseDenombrementFondamental, number>>;
  indexExercice: number;
  resultats: ResultatExerciceDenombrementFondamental[];
  terminee: boolean;
  derniereTransitionRevelee: boolean;
}
