/**
 * Couche B (6e) — types pour `6gen6`. 7 familles STRUCTURELLEMENT DISJOINTES (2 ou 3 écrans
 * chacune) — `phaseInitiale`/`phaseApres` dispatchent sur `exercice.famille`, jamais une séquence
 * commune (même principe que `typesEquationsCyclometriques.ts`, `6gen3`). Noms de phase préfixés
 * par la lettre de famille (`aExposant`, `bExponentielle`...) pour rester non-ambigus dans
 * `scoresPartiels`, qui accumule au fil des écrans RÉELLEMENT traversés (`Partial<Record<...>>`,
 * même principe que 5gen6/5gen10/5gen12/5gen13/6gen3).
 */
import type { ExerciceLimiteExponentielle } from "../core6e/limitesExponentielles.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

export type PhaseLimiteExponentielle =
  | "aExposant"
  | "aGlobale"
  | "bExponentielle"
  | "bPolynomiale"
  | "bGlobale"
  | "cFacteurs"
  | "cGlobale"
  | "gCombiner"
  | "gOrdre1"
  | "gConclure"
  | "hForme"
  | "hNumerateur"
  | "hDenominateur"
  | "hConclure"
  | "iForme"
  | "iNumerateur"
  | "iDenominateur"
  | "iConclure"
  | "jForme"
  | "jNumerateur"
  | "jDenominateur"
  | "jConclure"
  | "kForme"
  | "kNumerateur1"
  | "kDenominateur1"
  | "kNumerateur2"
  | "kDenominateur2"
  | "kConclure"
  | "lReformuler"
  | "lConclure"
  | "nCombiner"
  | "nConclure";

export function phaseInitiale(exercice: ExerciceLimiteExponentielle): PhaseLimiteExponentielle {
  switch (exercice.famille) {
    case "A":
      return "aExposant";
    case "B":
      return "bExponentielle";
    case "C":
      return "cFacteurs";
    case "G":
      return "gCombiner";
    case "H":
      return "hForme";
    case "I":
      return "iForme";
    case "J":
      return "jForme";
    case "K":
      return "kForme";
    case "L":
      return "lReformuler";
    case "N":
      return "nCombiner";
  }
}

export function phaseApres(phase: PhaseLimiteExponentielle): PhaseLimiteExponentielle | "termine" {
  switch (phase) {
    case "aExposant":
      return "aGlobale";
    case "aGlobale":
      return "termine";
    case "bExponentielle":
      return "bPolynomiale";
    case "bPolynomiale":
      return "bGlobale";
    case "bGlobale":
      return "termine";
    case "cFacteurs":
      return "cGlobale";
    case "cGlobale":
      return "termine";
    case "gCombiner":
      return "gOrdre1";
    case "gOrdre1":
      return "gConclure";
    case "gConclure":
      return "termine";
    case "hForme":
      return "hNumerateur";
    case "hNumerateur":
      return "hDenominateur";
    case "hDenominateur":
      return "hConclure";
    case "hConclure":
      return "termine";
    case "iForme":
      return "iNumerateur";
    case "iNumerateur":
      return "iDenominateur";
    case "iDenominateur":
      return "iConclure";
    case "iConclure":
      return "termine";
    case "jForme":
      return "jNumerateur";
    case "jNumerateur":
      return "jDenominateur";
    case "jDenominateur":
      return "jConclure";
    case "jConclure":
      return "termine";
    case "kForme":
      return "kNumerateur1";
    case "kNumerateur1":
      return "kDenominateur1";
    case "kDenominateur1":
      return "kNumerateur2";
    case "kNumerateur2":
      return "kDenominateur2";
    case "kDenominateur2":
      return "kConclure";
    case "kConclure":
      return "termine";
    case "lReformuler":
      return "lConclure";
    case "lConclure":
      return "termine";
    case "nCombiner":
      return "nConclure";
    case "nConclure":
      return "termine";
  }
}

/** Détail de clôture d'un écran (`revele`/`niveauAide` AU MOMENT PRÉCIS de la clôture, avant que la
 * transition de phase suivante ne remette `niveauAide` à zéro) — jamais dérivé du score, piège
 * documenté dans CLAUDE.md ("Récapitulatif final à plat, coloré") : une pénalité d'aide peut à elle
 * seule faire tomber le score à 0 sans que la réponse ait été révélée, `score===0` n'est donc PAS
 * un proxy fiable de `revele`. Consommé par `statutRecap` (`components6e/LigneRecap.tsx`) côté
 * présentation, indexé par nom de phase (`Partial<Record<...>>`, même principe que
 * `scoresPartiels`). */
export interface DetailPhaseLimiteExponentielle {
  revele: boolean;
  niveauAide: number;
}

export type ResultatExerciceLimiteExponentielle =
  | { famille: "A"; exercice: ExerciceLimiteExponentielle; scoreExposant: number; scoreGlobale: number; details: Partial<Record<PhaseLimiteExponentielle, DetailPhaseLimiteExponentielle>> }
  | {
      famille: "B";
      exercice: ExerciceLimiteExponentielle;
      scoreExponentielle: number;
      scorePolynomiale: number;
      scoreGlobale: number;
      details: Partial<Record<PhaseLimiteExponentielle, DetailPhaseLimiteExponentielle>>;
    }
  | { famille: "C"; exercice: ExerciceLimiteExponentielle; scoreFacteurs: number; scoreGlobale: number; details: Partial<Record<PhaseLimiteExponentielle, DetailPhaseLimiteExponentielle>> }
  | {
      famille: "G";
      exercice: ExerciceLimiteExponentielle;
      scoreCombiner: number;
      scoreOrdre1: number;
      scoreConclure: number;
      details: Partial<Record<PhaseLimiteExponentielle, DetailPhaseLimiteExponentielle>>;
    }
  | {
      famille: "H";
      exercice: ExerciceLimiteExponentielle;
      scoreForme: number;
      scoreNumerateur: number;
      scoreDenominateur: number;
      scoreConclure: number;
      details: Partial<Record<PhaseLimiteExponentielle, DetailPhaseLimiteExponentielle>>;
    }
  | {
      famille: "I";
      exercice: ExerciceLimiteExponentielle;
      scoreForme: number;
      scoreNumerateur: number;
      scoreDenominateur: number;
      scoreConclure: number;
      details: Partial<Record<PhaseLimiteExponentielle, DetailPhaseLimiteExponentielle>>;
    }
  | {
      famille: "J";
      exercice: ExerciceLimiteExponentielle;
      scoreForme: number;
      scoreNumerateur: number;
      scoreDenominateur: number;
      scoreConclure: number;
      details: Partial<Record<PhaseLimiteExponentielle, DetailPhaseLimiteExponentielle>>;
    }
  | {
      famille: "K";
      exercice: ExerciceLimiteExponentielle;
      scoreForme: number;
      scoreNumerateur1: number;
      scoreDenominateur1: number;
      scoreNumerateur2: number;
      scoreDenominateur2: number;
      scoreConclure: number;
      details: Partial<Record<PhaseLimiteExponentielle, DetailPhaseLimiteExponentielle>>;
    }
  | { famille: "L"; exercice: ExerciceLimiteExponentielle; scoreReformuler: number; scoreConclure: number; details: Partial<Record<PhaseLimiteExponentielle, DetailPhaseLimiteExponentielle>> }
  | { famille: "N"; exercice: ExerciceLimiteExponentielle; scoreCombiner: number; scoreConclure: number; details: Partial<Record<PhaseLimiteExponentielle, DetailPhaseLimiteExponentielle>> };

export interface EtatSessionLimiteExponentielle {
  reglages: ReglagesSession6e;
  generateur: () => ExerciceLimiteExponentielle;
  exerciceCourant: ExerciceLimiteExponentielle;
  phase: PhaseLimiteExponentielle;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  scoresPartiels: Partial<Record<PhaseLimiteExponentielle, number>>;
  detailsPartiels: Partial<Record<PhaseLimiteExponentielle, DetailPhaseLimiteExponentielle>>;
  indexExercice: number;
  resultats: ResultatExerciceLimiteExponentielle[];
  terminee: boolean;
}
