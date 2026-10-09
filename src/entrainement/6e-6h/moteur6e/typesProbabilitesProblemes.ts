import type { ExerciceProbabilitesProblemes } from "../core6e/probabilitesProblemes.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

/**
 * Couche B (6e) — types de session pour `6gen33`. 7 familles, chaîne d'écrans de longueur FIXE par
 * FAMILLE+SOUS-TYPE (A:3, B:3, C:3, D:2, E/mixte:3, E/parametrique:3, F:3, G/derangements:4,
 * G/melangeObjets:4, G/financier:3) — `phaseInitiale` dispatche donc sur `exercice.famille` PUIS
 * `exercice.sousType` où pertinent. Même patron générique `phasesPourExercice` que
 * `typesIndependanceBayes.ts`/`typesTiragesArbres.ts` (6gen31/6gen32), gardé pour la cohérence
 * transversale du chapitre 8.
 *
 * **Sous-type "parametrique" (famille E) : 3 écrans, pas 4** — la spec source titre ce sous-type
 * "(4 écrans)" mais n'en DÉTAILLE que 3 (Écran 1 : expressions en x ; Écran 2 : fraction rationnelle
 * en x ; Écran 3 : inéquation résolue) — aucun 4e écran n'est décrit nulle part (ni dans le corps du
 * sous-type, ni dans ses aides, contrairement aux autres sous-types de la spec où chaque écran est
 * systématiquement numéroté ET décrit). Traité comme une coquille dans le décompte de l'en-tête —
 * implémenté avec les 3 écrans réellement spécifiés, jamais un 4e écran inventé sans contenu
 * pédagogique défini.
 */

export type PhaseProbabilitesProblemes =
  | "aEcran1"
  | "aEcran2"
  | "aEcran3"
  | "bEcran1"
  | "bEcran2"
  | "bEcran3"
  | "cEcran1"
  | "cEcran2"
  | "cEcran3"
  | "dEcran1"
  | "dEcran2"
  | "eMixteEcran1"
  | "eMixteEcran2"
  | "eMixteEcran3"
  | "eParamEcran1"
  | "eParamEcran2"
  | "eParamEcran3"
  | "fEcran1"
  | "fEcran2"
  | "fEcran3"
  | "gDerangEcran1"
  | "gDerangEcran2"
  | "gDerangEcran3"
  | "gDerangEcran4"
  | "gMelangeEcran1"
  | "gMelangeEcran2"
  | "gMelangeEcran3"
  | "gMelangeEcran4"
  | "gFinancierEcran1"
  | "gFinancierEcran2"
  | "gFinancierEcran3";

export function phaseInitiale(exercice: ExerciceProbabilitesProblemes): PhaseProbabilitesProblemes {
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
      return exercice.sousType === "mixte" ? "eMixteEcran1" : "eParamEcran1";
    case "F":
      return "fEcran1";
    case "G":
      if (exercice.sousType === "derangements") return "gDerangEcran1";
      if (exercice.sousType === "melangeObjets") return "gMelangeEcran1";
      return "gFinancierEcran1";
  }
}

export function phaseApres(phase: PhaseProbabilitesProblemes): PhaseProbabilitesProblemes | "termine" {
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
      return "bEcran3";
    case "bEcran3":
      return "termine";
    case "cEcran1":
      return "cEcran2";
    case "cEcran2":
      return "cEcran3";
    case "cEcran3":
      return "termine";
    case "dEcran1":
      return "dEcran2";
    case "dEcran2":
      return "termine";
    case "eMixteEcran1":
      return "eMixteEcran2";
    case "eMixteEcran2":
      return "eMixteEcran3";
    case "eMixteEcran3":
      return "termine";
    case "eParamEcran1":
      return "eParamEcran2";
    case "eParamEcran2":
      return "eParamEcran3";
    case "eParamEcran3":
      return "termine";
    case "fEcran1":
      return "fEcran2";
    case "fEcran2":
      return "fEcran3";
    case "fEcran3":
      return "termine";
    case "gDerangEcran1":
      return "gDerangEcran2";
    case "gDerangEcran2":
      return "gDerangEcran3";
    case "gDerangEcran3":
      return "gDerangEcran4";
    case "gDerangEcran4":
      return "termine";
    case "gMelangeEcran1":
      return "gMelangeEcran2";
    case "gMelangeEcran2":
      return "gMelangeEcran3";
    case "gMelangeEcran3":
      return "gMelangeEcran4";
    case "gMelangeEcran4":
      return "termine";
    case "gFinancierEcran1":
      return "gFinancierEcran2";
    case "gFinancierEcran2":
      return "gFinancierEcran3";
    case "gFinancierEcran3":
      return "termine";
  }
}

/** Liste ORDONNÉE des phases réellement traversées par CET exercice — parcourt la chaîne
 * `phaseInitiale → phaseApres`, jamais une table statique (même principe que `6gen30`/`6gen31`/
 * `6gen32`). Réutilisée par `ui6e/formatProbabilitesProblemes.ts` (récapitulatif) et
 * `sessionProbabilitesProblemes.ts`. */
export function phasesPourExercice(exercice: ExerciceProbabilitesProblemes): PhaseProbabilitesProblemes[] {
  const phases: PhaseProbabilitesProblemes[] = [];
  let phase: PhaseProbabilitesProblemes | "termine" = phaseInitiale(exercice);
  while (phase !== "termine") {
    phases.push(phase);
    phase = phaseApres(phase);
  }
  return phases;
}

export interface ResultatExerciceProbabilitesProblemes {
  exercice: ExerciceProbabilitesProblemes;
  scores: Partial<Record<PhaseProbabilitesProblemes, number>>;
}

export interface EtatSessionProbabilitesProblemes {
  reglages: ReglagesSession6e;
  generateur: () => ExerciceProbabilitesProblemes;
  exerciceCourant: ExerciceProbabilitesProblemes;
  phase: PhaseProbabilitesProblemes;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  /** Accumule au fil des écrans de l'exercice COURANT — remis à `{}` à chaque nouvel exercice. */
  scoresPartiels: Partial<Record<PhaseProbabilitesProblemes, number>>;
  indexExercice: number;
  resultats: ResultatExerciceProbabilitesProblemes[];
  terminee: boolean;
  /** Vrai UNIQUEMENT juste après l'appel qui a clos un écran par épuisement des tentatives — piège
   * "revele stale" (CLAUDE.md), patron `6gen30`/`6gen31`/`6gen32` répliqué à l'identique. */
  derniereTransitionRevelee: boolean;
}
