import type { ExerciceBinomialeSequenceOrdonnee } from "../core6e/binomialeSequenceOrdonnee.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

/**
 * Couche B (6e) — types de session pour `6gen48`. Longueur de chaîne d'écrans VARIABLE selon la
 * famille ET, pour la famille A, selon la STRATÉGIE tirée — mirroir du patron
 * `typesDenombrementFondamental.ts` (6gen43) : la stratégie (`termeUnique`/`somme`/`complement`)
 * est encodée DIRECTEMENT dans le nom de la phase (`aTermeUniqueEcran1` vs `aSommeEcran1` vs
 * `aComplementEcran1`), jamais lue depuis `exercice.strategie` dans `phaseApres` — celui-ci reste
 * une fonction PURE de la phase, comme 6gen43. Famille A : 2 écrans si `termeUnique` (questions
 * "exactement k"/"aucun"/"tous"), 3 écrans si `somme`/`complement` (questions "au moins k"/"au plus
 * k", écran 3 = combinaison des termes CONFIRMÉS de l'écran 2). Famille B : toujours 2 écrans.
 */

export type PhaseBinomialeSequenceOrdonnee = "aTermeUniqueEcran1" | "aTermeUniqueEcran2" | "aSommeEcran1" | "aSommeEcran2" | "aSommeEcran3" | "aComplementEcran1" | "aComplementEcran2" | "aComplementEcran3" | "bEcran1" | "bEcran2";

export function phaseInitiale(exercice: ExerciceBinomialeSequenceOrdonnee): PhaseBinomialeSequenceOrdonnee {
  if (exercice.famille === "B") return "bEcran1";
  switch (exercice.strategie) {
    case "termeUnique":
      return "aTermeUniqueEcran1";
    case "somme":
      return "aSommeEcran1";
    case "complement":
      return "aComplementEcran1";
  }
}

export function phaseApres(phase: PhaseBinomialeSequenceOrdonnee): PhaseBinomialeSequenceOrdonnee | "termine" {
  switch (phase) {
    case "aTermeUniqueEcran1":
      return "aTermeUniqueEcran2";
    case "aTermeUniqueEcran2":
      return "termine";
    case "aSommeEcran1":
      return "aSommeEcran2";
    case "aSommeEcran2":
      return "aSommeEcran3";
    case "aSommeEcran3":
      return "termine";
    case "aComplementEcran1":
      return "aComplementEcran2";
    case "aComplementEcran2":
      return "aComplementEcran3";
    case "aComplementEcran3":
      return "termine";
    case "bEcran1":
      return "bEcran2";
    case "bEcran2":
      return "termine";
  }
}

/** Liste ORDONNÉE des phases réellement traversées par CET exercice précis — mirroir 6gen43. */
export function phasesPourExercice(exercice: ExerciceBinomialeSequenceOrdonnee): PhaseBinomialeSequenceOrdonnee[] {
  const phases: PhaseBinomialeSequenceOrdonnee[] = [];
  let phase: PhaseBinomialeSequenceOrdonnee | "termine" = phaseInitiale(exercice);
  while (phase !== "termine") {
    phases.push(phase);
    phase = phaseApres(phase);
  }
  return phases;
}

export interface ResultatExerciceBinomialeSequenceOrdonnee {
  exercice: ExerciceBinomialeSequenceOrdonnee;
  scores: Partial<Record<PhaseBinomialeSequenceOrdonnee, number>>;
}

export interface EtatSessionBinomialeSequenceOrdonnee {
  reglages: ReglagesSession6e;
  generateur: () => ExerciceBinomialeSequenceOrdonnee;
  exerciceCourant: ExerciceBinomialeSequenceOrdonnee;
  phase: PhaseBinomialeSequenceOrdonnee;
  /** Identifiant STRICTEMENT croissant, incrémenté à chaque nouvel exercice tiré (démarrage de
   * session, exercice suivant, OU relance dev via `SelecteurVarianteDev`) — voir
   * `sessionBinomialeSequenceOrdonnee.ts`, `etatInitial`, pour le contrat complet et le bug qu'il
   * corrige (`key={phase}` seul collisionne entre 2 exercices différents de famille B dont le champ
   * `k` diffère, dès qu'ils partagent la même première phase "bEcran1"). `App6gen48.tsx` DOIT
   * l'utiliser comme partie de la `key` React de l'écran (`key={`${generationId}-${phase}`}`),
   * jamais `phase` seul. */
  generationId: number;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  scoresPartiels: Partial<Record<PhaseBinomialeSequenceOrdonnee, number>>;
  indexExercice: number;
  resultats: ResultatExerciceBinomialeSequenceOrdonnee[];
  terminee: boolean;
  derniereTransitionRevelee: boolean;
}
