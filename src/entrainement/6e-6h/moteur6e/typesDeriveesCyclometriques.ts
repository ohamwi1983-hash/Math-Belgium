/**
 * Couche B (6e) — types pour `6gen4`. 7 familles STRUCTURELLEMENT DISJOINTES (2 à 4 écrans) —
 * `phaseInitiale`/`phaseApres` dispatchent sur `exercice.famille`, jamais une séquence commune.
 * Chaque phase est nommée PRÉFIXÉE par sa famille (jamais de nom générique réutilisé entre
 * familles, même convention que 6gen3) — 18 phases distinctes au total.
 */
import type { ExerciceDeriveesCyclometriques } from "../core6e/deriveesCyclometriques.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

export type PhaseDeriveesCyclometriques =
  | "aDeriveeU"
  | "aDeriveeFinale"
  | "bDeriveeU"
  | "bDeriveeArc"
  | "bDeriveeFinale"
  | "cNumerateur"
  | "cDenominateur"
  | "cDeriveeFinale"
  | "dNumerateur"
  | "dDenominateur"
  | "dBrut"
  | "dSimplifiee"
  | "eDeriveeInterne"
  | "eDeriveeFinale"
  | "fBrute"
  | "fSimplifiee"
  | "gDeriveeInterne"
  | "gDeriveeFinale";

export function phaseInitiale(exercice: ExerciceDeriveesCyclometriques): PhaseDeriveesCyclometriques {
  switch (exercice.famille) {
    case "A":
      return "aDeriveeU";
    case "B":
      return "bDeriveeU";
    case "C":
      return "cNumerateur";
    case "D":
      return "dNumerateur";
    case "E":
      return "eDeriveeInterne";
    case "F":
      return "fBrute";
    case "G":
      return "gDeriveeInterne";
  }
}

export function phaseApres(phase: PhaseDeriveesCyclometriques): PhaseDeriveesCyclometriques | "termine" {
  switch (phase) {
    case "aDeriveeU":
      return "aDeriveeFinale";
    case "aDeriveeFinale":
      return "termine";
    case "bDeriveeU":
      return "bDeriveeArc";
    case "bDeriveeArc":
      return "bDeriveeFinale";
    case "bDeriveeFinale":
      return "termine";
    case "cNumerateur":
      return "cDenominateur";
    case "cDenominateur":
      return "cDeriveeFinale";
    case "cDeriveeFinale":
      return "termine";
    case "dNumerateur":
      return "dDenominateur";
    case "dDenominateur":
      return "dBrut";
    case "dBrut":
      return "dSimplifiee";
    case "dSimplifiee":
      return "termine";
    case "eDeriveeInterne":
      return "eDeriveeFinale";
    case "eDeriveeFinale":
      return "termine";
    case "fBrute":
      return "fSimplifiee";
    case "fSimplifiee":
      return "termine";
    case "gDeriveeInterne":
      return "gDeriveeFinale";
    case "gDeriveeFinale":
      return "termine";
  }
}

export type ResultatExerciceDeriveesCyclometriques =
  | { famille: "A"; exercice: ExerciceDeriveesCyclometriques; scoreDeriveeU: number; scoreDeriveeFinale: number }
  | { famille: "B"; exercice: ExerciceDeriveesCyclometriques; scoreDeriveeU: number; scoreDeriveeArc: number; scoreDeriveeFinale: number }
  | { famille: "C"; exercice: ExerciceDeriveesCyclometriques; scoreNumerateur: number; scoreDenominateur: number; scoreDeriveeFinale: number }
  | { famille: "D"; exercice: ExerciceDeriveesCyclometriques; scoreNumerateur: number; scoreDenominateur: number; scoreBrut: number; scoreSimplifiee: number }
  | { famille: "E"; exercice: ExerciceDeriveesCyclometriques; scoreDeriveeInterne: number; scoreDeriveeFinale: number }
  | { famille: "F"; exercice: ExerciceDeriveesCyclometriques; scoreBrute: number; scoreSimplifiee: number }
  | { famille: "G"; exercice: ExerciceDeriveesCyclometriques; scoreDeriveeInterne: number; scoreDeriveeFinale: number };

/** Niveau d'aide réellement consommé + révélation éventuelle, capturés à l'INSTANT PRÉCIS où un
 * écran se ferme (dans `avancerPhase`, avant que `niveauAide`/`etapeCourante` ne soient remis à
 * zéro pour l'écran suivant) — jamais reconstruits après coup depuis un état React déjà obsolète.
 * Même principe que `typesEquationsCyclometriques.ts` (6gen3). */
export interface AideInfoEcran {
  niveauAide: number;
  revele: boolean;
}

export interface EtatSessionDeriveesCyclometriques {
  reglages: ReglagesSession6e;
  generateur: () => ExerciceDeriveesCyclometriques;
  exerciceCourant: ExerciceDeriveesCyclometriques;
  phase: PhaseDeriveesCyclometriques;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  /** Accumule au fil des écrans (l'ensemble de phases réellement traversées varie par famille —
   * même principe que 6gen3/5gen6/5gen10/5gen12/5gen13). */
  scoresPartiels: Partial<Record<PhaseDeriveesCyclometriques, number>>;
  /** Dernier écran fermé (phase + aide/révélation) — `null` avant la toute première fermeture
   * d'écran. Alimente le récapitulatif final (`ResultatPanelDeriveesCyclometriques`) via
   * `App6gen4.tsx::terminerEtape`, sans jamais dépendre du timing d'un closure React. */
  derniereCloture: { phase: PhaseDeriveesCyclometriques; info: AideInfoEcran } | null;
  indexExercice: number;
  resultats: ResultatExerciceDeriveesCyclometriques[];
  terminee: boolean;
}
