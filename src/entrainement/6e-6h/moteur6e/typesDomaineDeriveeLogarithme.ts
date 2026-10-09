/**
 * Couche B (6e) — types pour `6gen16`. 7 familles STRUCTURELLEMENT DISJOINTES (2 ou 3 écrans
 * chacune, FIXE par famille) — `phaseInitiale`/`phaseApres` dispatchent sur `exercice.famille`,
 * même principe que `typesDomaineDeriveeExponentielles.ts` (`6gen7`). Famille G n'a PAS d'écran de
 * domaine (voir `core6e/domaineDeriveeLogarithme.types.ts`) — sa `phaseInitiale` est directement
 * `gIdentifier`.
 */
import type { ExerciceDomaineDeriveeLogarithme } from "../core6e/domaineDeriveeLogarithme.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

export type PhaseDomaineDeriveeLogarithme =
  | "aDomaine"
  | "aDerivee"
  | "bDomaine"
  | "bDerivee"
  | "cDomaine"
  | "cFacteurs"
  | "cAssemblage"
  | "dDomaine"
  | "dND"
  | "dAssemblage"
  | "eDomaine"
  | "eSimplifier"
  | "eDerivee"
  | "fDomaine"
  | "fDerivee"
  | "gIdentifier"
  | "gFPrimeSurF"
  | "gIsoler";

export function phaseInitiale(exercice: ExerciceDomaineDeriveeLogarithme): PhaseDomaineDeriveeLogarithme {
  switch (exercice.famille) {
    case "A":
      return "aDomaine";
    case "B":
      return "bDomaine";
    case "C":
      return "cDomaine";
    case "D":
      return "dDomaine";
    case "E":
      return "eDomaine";
    case "F":
      return "fDomaine";
    case "G":
      return "gIdentifier";
  }
}

export function phaseApres(phase: PhaseDomaineDeriveeLogarithme): PhaseDomaineDeriveeLogarithme | "termine" {
  switch (phase) {
    case "aDomaine":
      return "aDerivee";
    case "aDerivee":
      return "termine";
    case "bDomaine":
      return "bDerivee";
    case "bDerivee":
      return "termine";
    case "cDomaine":
      return "cFacteurs";
    case "cFacteurs":
      return "cAssemblage";
    case "cAssemblage":
      return "termine";
    case "dDomaine":
      return "dND";
    case "dND":
      return "dAssemblage";
    case "dAssemblage":
      return "termine";
    case "eDomaine":
      return "eSimplifier";
    case "eSimplifier":
      return "eDerivee";
    case "eDerivee":
      return "termine";
    case "fDomaine":
      return "fDerivee";
    case "fDerivee":
      return "termine";
    case "gIdentifier":
      return "gFPrimeSurF";
    case "gFPrimeSurF":
      return "gIsoler";
    case "gIsoler":
      return "termine";
  }
}

/** Détail de clôture d'un écran (`revele`/`niveauAide` AU MOMENT PRÉCIS de la clôture, avant que la
 * transition de phase suivante ne remette `niveauAide` à zéro) — jamais dérivé du score. Consommé
 * par `statutRecap` (`components6e/LigneRecap.tsx`). Même principe que `6gen7`. */
export interface DetailPhaseDomaineDeriveeLogarithme {
  revele: boolean;
  niveauAide: number;
}

export type ResultatExerciceDomaineDeriveeLogarithme =
  | { famille: "A"; exercice: ExerciceDomaineDeriveeLogarithme; scoreDomaine: number; scoreDerivee: number; details: Partial<Record<PhaseDomaineDeriveeLogarithme, DetailPhaseDomaineDeriveeLogarithme>> }
  | { famille: "B"; exercice: ExerciceDomaineDeriveeLogarithme; scoreDomaine: number; scoreDerivee: number; details: Partial<Record<PhaseDomaineDeriveeLogarithme, DetailPhaseDomaineDeriveeLogarithme>> }
  | {
      famille: "C";
      exercice: ExerciceDomaineDeriveeLogarithme;
      scoreDomaine: number;
      scoreFacteurs: number;
      scoreAssemblage: number;
      details: Partial<Record<PhaseDomaineDeriveeLogarithme, DetailPhaseDomaineDeriveeLogarithme>>;
    }
  | {
      famille: "D";
      exercice: ExerciceDomaineDeriveeLogarithme;
      scoreDomaine: number;
      scoreND: number;
      scoreAssemblage: number;
      details: Partial<Record<PhaseDomaineDeriveeLogarithme, DetailPhaseDomaineDeriveeLogarithme>>;
    }
  | {
      famille: "E";
      exercice: ExerciceDomaineDeriveeLogarithme;
      scoreDomaine: number;
      scoreSimplifier: number;
      scoreDerivee: number;
      details: Partial<Record<PhaseDomaineDeriveeLogarithme, DetailPhaseDomaineDeriveeLogarithme>>;
    }
  | { famille: "F"; exercice: ExerciceDomaineDeriveeLogarithme; scoreDomaine: number; scoreDerivee: number; details: Partial<Record<PhaseDomaineDeriveeLogarithme, DetailPhaseDomaineDeriveeLogarithme>> }
  | {
      famille: "G";
      exercice: ExerciceDomaineDeriveeLogarithme;
      scoreIdentifier: number;
      scoreFPrimeSurF: number;
      scoreIsoler: number;
      details: Partial<Record<PhaseDomaineDeriveeLogarithme, DetailPhaseDomaineDeriveeLogarithme>>;
    };

export interface EtatSessionDomaineDeriveeLogarithme {
  reglages: ReglagesSession6e;
  generateur: () => ExerciceDomaineDeriveeLogarithme;
  exerciceCourant: ExerciceDomaineDeriveeLogarithme;
  phase: PhaseDomaineDeriveeLogarithme;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  scoresPartiels: Partial<Record<PhaseDomaineDeriveeLogarithme, number>>;
  detailsPartiels: Partial<Record<PhaseDomaineDeriveeLogarithme, DetailPhaseDomaineDeriveeLogarithme>>;
  indexExercice: number;
  resultats: ResultatExerciceDomaineDeriveeLogarithme[];
  terminee: boolean;
}
