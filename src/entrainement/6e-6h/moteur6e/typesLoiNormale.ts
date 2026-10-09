import type { ExerciceLoiNormale } from "../core6e/loiNormale.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";
import type { ValeursReferenceLoiNormale } from "./verificationLoiNormale";

/**
 * Couche B (6e) — types de session pour `6gen51`. 5 familles, longueur de chaîne D'ÉCRANS variable
 * — mirroir du patron `phaseInitiale`/`phaseApres` de `typesCalculAires.ts` (6gen26) : `phaseApres`
 * prend ICI un 2e paramètre `exercice` (familles B et E ont un écran 3 OPTIONNEL, présent
 * uniquement si `exercice.population !== undefined` — voir `core6e/loiNormale.types.ts`).
 *
 * **`calculerReference` — injecté depuis l'EXTÉRIEUR, exactement comme `generateur`** : ce
 * générateur est le premier du chantier où la vérification a besoin d'une valeur DÉRIVÉE (`Phi`/
 * `PhiInverse`, Couche A) plutôt que d'un simple champ de `exercice`. Comme `moteur6e/` n'importe
 * JAMAIS `generateurs6e/` (règle non négociable CLAUDE.md), cette fonction est fournie par
 * l'appelant (`ui6e/formatLoiNormale.ts`, `calculerReferenceLoiNormale`, qui LUI a le droit
 * d'importer les 2 couches) et stockée dans l'état de session comme une boîte noire — mirroir
 * exact du champ `generateur: () => ExerciceLoiNormale` déjà présent sur tous les moteurs 6e.
 */

export type PhaseLoiNormale = "aEcran1" | "aEcran2" | "bEcran1" | "bEcran2" | "bEcran3" | "cEcran1" | "cEcran2" | "dEcran1" | "dEcran2" | "dEcran3" | "eEcran1" | "eEcran2" | "eEcran3";

export type CalculerReferenceLoiNormale = (exercice: ExerciceLoiNormale, phase: PhaseLoiNormale) => ValeursReferenceLoiNormale;

export function phaseInitiale(exercice: ExerciceLoiNormale): PhaseLoiNormale {
  switch (exercice.famille) {
    case "A":
      return "aEcran1";
    case "B":
      return "bEcran1";
    case "C":
      return "cEcran1";
    case "D":
      return "dEcran1";
    case "E":
      return "eEcran1";
  }
}

export function phaseApres(phase: PhaseLoiNormale, exercice: ExerciceLoiNormale): PhaseLoiNormale | "termine" {
  switch (phase) {
    case "aEcran1":
      return "aEcran2";
    case "aEcran2":
      return "termine";
    case "bEcran1":
      return "bEcran2";
    case "bEcran2":
      return exercice.famille === "B" && exercice.population !== undefined ? "bEcran3" : "termine";
    case "bEcran3":
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
      return exercice.famille === "E" && exercice.population !== undefined ? "eEcran3" : "termine";
    case "eEcran3":
      return "termine";
  }
}

/** Liste ORDONNÉE des phases réellement traversées par CET exercice précis — mirroir 6gen26. */
export function phasesPourExercice(exercice: ExerciceLoiNormale): PhaseLoiNormale[] {
  const phases: PhaseLoiNormale[] = [];
  let phase: PhaseLoiNormale | "termine" = phaseInitiale(exercice);
  while (phase !== "termine") {
    phases.push(phase);
    phase = phaseApres(phase, exercice);
  }
  return phases;
}

export interface ResultatExerciceLoiNormale {
  exercice: ExerciceLoiNormale;
  scores: Partial<Record<PhaseLoiNormale, number>>;
}

export interface EtatSessionLoiNormale {
  reglages: ReglagesSession6e;
  generateur: () => ExerciceLoiNormale;
  calculerReference: CalculerReferenceLoiNormale;
  exerciceCourant: ExerciceLoiNormale;
  phase: PhaseLoiNormale;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  scoresPartiels: Partial<Record<PhaseLoiNormale, number>>;
  indexExercice: number;
  resultats: ResultatExerciceLoiNormale[];
  terminee: boolean;
  derniereTransitionRevelee: boolean;
}
