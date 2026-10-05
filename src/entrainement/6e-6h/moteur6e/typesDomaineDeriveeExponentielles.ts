/**
 * Couche B (6e) — types pour `6gen7`. 6 familles STRUCTURELLEMENT DISJOINTES (2 ou 3 écrans
 * chacune, FIXE par famille — jamais de variance entre les sous-types d'une même famille, vérifié
 * à la conception, voir `core6e/domaineDeriveeExponentielles.types.ts`) — `phaseInitiale`/
 * `phaseApres` dispatchent sur `exercice.famille`, jamais une séquence commune (même principe que
 * `typesLimitesExponentielles.ts`, `6gen6`). Noms de phase préfixés par la lettre de famille
 * (`aDomaine`, `bDomaine`...) pour rester non-ambigus dans `scoresPartiels`, qui accumule au fil
 * des écrans RÉELLEMENT traversés (`Partial<Record<...>>`, même principe que 6gen3/6gen6).
 */
import type { ExerciceDomaineDeriveeExponentielle } from "../core6e/domaineDeriveeExponentielles.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

export type PhaseDomaineDeriveeExponentielle =
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
  | "fDerivee";

export function phaseInitiale(exercice: ExerciceDomaineDeriveeExponentielle): PhaseDomaineDeriveeExponentielle {
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
  }
}

export function phaseApres(phase: PhaseDomaineDeriveeExponentielle): PhaseDomaineDeriveeExponentielle | "termine" {
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
  }
}

/** Détail de clôture d'un écran (`revele`/`niveauAide` AU MOMENT PRÉCIS de la clôture, avant que la
 * transition de phase suivante ne remette `niveauAide` à zéro) — jamais dérivé du score, même
 * principe que `typesLimitesExponentielles.ts` (`6gen6`) : une pénalité d'aide peut à elle seule
 * faire tomber le score à 0 sans que la réponse ait été révélée, `score===0` n'est donc PAS un
 * proxy fiable de `revele`. Consommé par `statutRecap` (`components6e/LigneRecap.tsx`). */
export interface DetailPhaseDomaineDeriveeExponentielle {
  revele: boolean;
  niveauAide: number;
}

export type ResultatExerciceDomaineDeriveeExponentielle =
  | { famille: "A"; exercice: ExerciceDomaineDeriveeExponentielle; scoreDomaine: number; scoreDerivee: number; details: Partial<Record<PhaseDomaineDeriveeExponentielle, DetailPhaseDomaineDeriveeExponentielle>> }
  | { famille: "B"; exercice: ExerciceDomaineDeriveeExponentielle; scoreDomaine: number; scoreDerivee: number; details: Partial<Record<PhaseDomaineDeriveeExponentielle, DetailPhaseDomaineDeriveeExponentielle>> }
  | {
      famille: "C";
      exercice: ExerciceDomaineDeriveeExponentielle;
      scoreDomaine: number;
      scoreFacteurs: number;
      scoreAssemblage: number;
      details: Partial<Record<PhaseDomaineDeriveeExponentielle, DetailPhaseDomaineDeriveeExponentielle>>;
    }
  | {
      famille: "D";
      exercice: ExerciceDomaineDeriveeExponentielle;
      scoreDomaine: number;
      scoreND: number;
      scoreAssemblage: number;
      details: Partial<Record<PhaseDomaineDeriveeExponentielle, DetailPhaseDomaineDeriveeExponentielle>>;
    }
  | {
      famille: "E";
      exercice: ExerciceDomaineDeriveeExponentielle;
      scoreDomaine: number;
      scoreSimplifier: number;
      scoreDerivee: number;
      details: Partial<Record<PhaseDomaineDeriveeExponentielle, DetailPhaseDomaineDeriveeExponentielle>>;
    }
  | { famille: "F"; exercice: ExerciceDomaineDeriveeExponentielle; scoreDomaine: number; scoreDerivee: number; details: Partial<Record<PhaseDomaineDeriveeExponentielle, DetailPhaseDomaineDeriveeExponentielle>> };

export interface EtatSessionDomaineDeriveeExponentielle {
  reglages: ReglagesSession6e;
  generateur: () => ExerciceDomaineDeriveeExponentielle;
  exerciceCourant: ExerciceDomaineDeriveeExponentielle;
  phase: PhaseDomaineDeriveeExponentielle;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  scoresPartiels: Partial<Record<PhaseDomaineDeriveeExponentielle, number>>;
  detailsPartiels: Partial<Record<PhaseDomaineDeriveeExponentielle, DetailPhaseDomaineDeriveeExponentielle>>;
  indexExercice: number;
  resultats: ResultatExerciceDomaineDeriveeExponentielle[];
  terminee: boolean;
}
