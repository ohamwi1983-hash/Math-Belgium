import type { ExerciceIndependanceBayes } from "../core6e/independanceBayes.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

/**
 * Couche B (6e) — types de session pour `6gen32`. 3 familles, chaîne d'écrans de longueur FIXE par
 * FAMILLE+SOUS-TYPE (A/pannes:2, A/union:3, B/histogramme:2, B/tableauDonne:1, B/reconstruire:3,
 * C:3) — `phaseInitiale` dispatche donc sur `exercice.famille` PUIS `exercice.sousType` où
 * pertinent. Même patron générique `phasesPourExercice` que `typesProbabilitesEnsembles.ts`
 * (6gen30), gardé pour la cohérence transversale du chapitre.
 */

export type PhaseIndependanceBayes = "aPannesEcran1" | "aPannesEcran2" | "aUnionEcran1" | "aUnionEcran2" | "aUnionEcran3" | "bHistoEcran1" | "bHistoEcran2" | "bTableEcran1" | "bReconEcran1" | "bReconEcran2" | "bReconEcran3" | "cEcran1" | "cEcran2" | "cEcran3";

export function phaseInitiale(exercice: ExerciceIndependanceBayes): PhaseIndependanceBayes {
  if (exercice.famille === "A") return exercice.sousType === "pannes" ? "aPannesEcran1" : "aUnionEcran1";
  if (exercice.famille === "B") {
    if (exercice.sousType === "histogramme") return "bHistoEcran1";
    if (exercice.sousType === "tableauDonne") return "bTableEcran1";
    return "bReconEcran1";
  }
  return "cEcran1";
}

export function phaseApres(phase: PhaseIndependanceBayes): PhaseIndependanceBayes | "termine" {
  switch (phase) {
    case "aPannesEcran1":
      return "aPannesEcran2";
    case "aPannesEcran2":
      return "termine";
    case "aUnionEcran1":
      return "aUnionEcran2";
    case "aUnionEcran2":
      return "aUnionEcran3";
    case "aUnionEcran3":
      return "termine";
    case "bHistoEcran1":
      return "bHistoEcran2";
    case "bHistoEcran2":
      return "termine";
    case "bTableEcran1":
      return "termine";
    case "bReconEcran1":
      return "bReconEcran2";
    case "bReconEcran2":
      return "bReconEcran3";
    case "bReconEcran3":
      return "termine";
    case "cEcran1":
      return "cEcran2";
    case "cEcran2":
      return "cEcran3";
    case "cEcran3":
      return "termine";
  }
}

/** Liste ORDONNÉE des phases réellement traversées par CET exercice — parcourt la chaîne
 * `phaseInitiale → phaseApres`, jamais une table statique. Réutilisée par
 * `ui6e/formatIndependanceBayes.ts` (récapitulatif) et `sessionIndependanceBayes.ts`. */
export function phasesPourExercice(exercice: ExerciceIndependanceBayes): PhaseIndependanceBayes[] {
  const phases: PhaseIndependanceBayes[] = [];
  let phase: PhaseIndependanceBayes | "termine" = phaseInitiale(exercice);
  while (phase !== "termine") {
    phases.push(phase);
    phase = phaseApres(phase);
  }
  return phases;
}

export interface ResultatExerciceIndependanceBayes {
  exercice: ExerciceIndependanceBayes;
  scores: Partial<Record<PhaseIndependanceBayes, number>>;
}

export interface EtatSessionIndependanceBayes {
  reglages: ReglagesSession6e;
  generateur: () => ExerciceIndependanceBayes;
  exerciceCourant: ExerciceIndependanceBayes;
  phase: PhaseIndependanceBayes;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  /** Accumule au fil des écrans de l'exercice COURANT — remis à `{}` à chaque nouvel exercice. */
  scoresPartiels: Partial<Record<PhaseIndependanceBayes, number>>;
  indexExercice: number;
  resultats: ResultatExerciceIndependanceBayes[];
  terminee: boolean;
  /** Vrai UNIQUEMENT juste après l'appel qui a clos un écran par épuisement des tentatives — piège
   * "revele stale" (CLAUDE.md), patron `6gen18`/`6gen21`/`6gen23`/`6gen30` répliqué à l'identique. */
  derniereTransitionRevelee: boolean;
}
