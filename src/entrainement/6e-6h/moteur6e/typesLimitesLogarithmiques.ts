/**
 * Couche B (6e) — types pour `6gen17`. 5 familles STRUCTURELLEMENT DISJOINTES (2 ou 3 écrans
 * chacune) — `phaseInitiale`/`phaseApres` dispatchent sur `exercice.famille`, jamais une séquence
 * commune (même principe que `typesLimitesExponentielles.ts`, 6gen6). Noms de phase préfixés par
 * la lettre de famille pour rester non-ambigus dans `scoresPartiels`, qui accumule au fil des
 * écrans RÉELLEMENT traversés (`Partial<Record<...>>`, même principe que 6gen6).
 */
import type { ExerciceLimiteLogarithmique } from "../core6e/limitesLogarithmiques.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

export type PhaseLimiteLogarithmique =
  | "aDominance"
  | "aConclure"
  | "bReformuler"
  | "bConclure"
  | "cDiagnostic"
  | "cConclure"
  | "dExposant"
  | "dLimiteExposant"
  | "dConclure"
  | "eDevelopper"
  | "eSimplifier"
  | "eConclure";

export function phaseInitiale(exercice: ExerciceLimiteLogarithmique): PhaseLimiteLogarithmique {
  switch (exercice.famille) {
    case "A":
      return "aDominance";
    case "B":
      return "bReformuler";
    case "C":
      return "cDiagnostic";
    case "D":
      return "dExposant";
    case "E":
      return "eDevelopper";
  }
}

export function phaseApres(phase: PhaseLimiteLogarithmique): PhaseLimiteLogarithmique | "termine" {
  switch (phase) {
    case "aDominance":
      return "aConclure";
    case "aConclure":
      return "termine";
    case "bReformuler":
      return "bConclure";
    case "bConclure":
      return "termine";
    case "cDiagnostic":
      return "cConclure";
    case "cConclure":
      return "termine";
    case "dExposant":
      return "dLimiteExposant";
    case "dLimiteExposant":
      return "dConclure";
    case "dConclure":
      return "termine";
    case "eDevelopper":
      return "eSimplifier";
    case "eSimplifier":
      return "eConclure";
    case "eConclure":
      return "termine";
  }
}

/** Détail de clôture d'un écran (`revele`/`niveauAide` AU MOMENT PRÉCIS de la clôture, avant que la
 * transition de phase suivante ne remette `niveauAide` à zéro) — jamais dérivé du score, piège
 * documenté dans CLAUDE.md ("Récapitulatif final à plat, coloré"). Consommé par `statutRecap`
 * (`components6e/LigneRecap.tsx`), indexé par nom de phase. */
export interface DetailPhaseLimiteLogarithmique {
  revele: boolean;
  niveauAide: number;
}

export type ResultatExerciceLimiteLogarithmique =
  | { famille: "A"; exercice: ExerciceLimiteLogarithmique; scoreDominance: number; scoreConclure: number; details: Partial<Record<PhaseLimiteLogarithmique, DetailPhaseLimiteLogarithmique>> }
  | { famille: "B"; exercice: ExerciceLimiteLogarithmique; scoreReformuler: number; scoreConclure: number; details: Partial<Record<PhaseLimiteLogarithmique, DetailPhaseLimiteLogarithmique>> }
  | { famille: "C"; exercice: ExerciceLimiteLogarithmique; scoreDiagnostic: number; scoreConclure: number; details: Partial<Record<PhaseLimiteLogarithmique, DetailPhaseLimiteLogarithmique>> }
  | {
      famille: "D";
      exercice: ExerciceLimiteLogarithmique;
      scoreExposant: number;
      scoreLimiteExposant: number;
      scoreConclure: number;
      details: Partial<Record<PhaseLimiteLogarithmique, DetailPhaseLimiteLogarithmique>>;
    }
  | {
      famille: "E";
      exercice: ExerciceLimiteLogarithmique;
      scoreDevelopper: number;
      scoreSimplifier: number;
      scoreConclure: number;
      details: Partial<Record<PhaseLimiteLogarithmique, DetailPhaseLimiteLogarithmique>>;
    };

export interface EtatSessionLimiteLogarithmique {
  reglages: ReglagesSession6e;
  generateur: () => ExerciceLimiteLogarithmique;
  exerciceCourant: ExerciceLimiteLogarithmique;
  phase: PhaseLimiteLogarithmique;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  scoresPartiels: Partial<Record<PhaseLimiteLogarithmique, number>>;
  detailsPartiels: Partial<Record<PhaseLimiteLogarithmique, DetailPhaseLimiteLogarithmique>>;
  indexExercice: number;
  resultats: ResultatExerciceLimiteLogarithmique[];
  terminee: boolean;
}
