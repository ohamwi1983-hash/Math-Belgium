import type { ExerciceExtensionsBinomialeNormaleBayes } from "../core6e/extensionsBinomialeNormaleBayes.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";
import type { ValeursReferenceExtensionsBinomialeNormaleBayes } from "./verificationExtensionsBinomialeNormaleBayes";

/**
 * Couche B (6e) — types de session pour `6gen52`. Longueur de chaîne d'écrans VARIABLE selon la
 * famille ET, pour A/B, le sous-type/la stratégie — mirroir `typesDenombrementFondamental.ts`
 * (6gen43) et `typesLoiBinomiale.ts` (6gen50) : A=3 (direct) ou 4 (compose), B=2 (termeUnique) ou 3
 * (somme/complement), C=3, D=4, E=2, F=4.
 *
 * **Famille B — la stratégie reste UNIQUEMENT dans le NOM des phases** (`bTermeUniqueEcran1/2` vs
 * `bSommeEcran1/2/3` vs `bComplementEcran1/2/3`), décidée UNE SEULE FOIS par `phaseInitiale` depuis
 * `exercice.strategie` — `phaseApres` reste une fonction PURE de la seule phase, jamais relue depuis
 * `exercice.strategie` (même patron que `6gen50`, CLAUDE.md "pas de moteur de session unifié" +
 * leçon documentée dans `docs/historique-6e.md`, section "Création — 6gen50").
 */

export type PhaseExtensionsBinomialeNormaleBayes =
  | "aComposeEcran1P"
  | "aEcranAucunAuMoins"
  | "aEcranTrouverN1"
  | "aEcranTrouverN2"
  | "bTermeUniqueEcran1"
  | "bTermeUniqueEcran2"
  | "bSommeEcran1"
  | "bSommeEcran2"
  | "bSommeEcran3"
  | "bComplementEcran1"
  | "bComplementEcran2"
  | "bComplementEcran3"
  | "cEcran1"
  | "cEcran2"
  | "cEcran3"
  | "dEcran1"
  | "dEcran2"
  | "dEcran3"
  | "dEcran4"
  | "eEcran1"
  | "eEcran2"
  | "fEcran1"
  | "fEcran2"
  | "fEcran3"
  | "fEcran4";

/** Injectée depuis l'EXTÉRIEUR, exactement comme `generateur` — voir en-tête `typesLoiNormale.ts`
 * (`6gen51`), MÊME PONT ici : famille C (loi normale inverse) a besoin d'une valeur DÉRIVÉE (`Phi`/
 * `PhiInverse`, Couche A `generateurs6e/loiNormale/`) que `moteur6e/` ne calcule jamais lui-même
 * (règle non négociable CLAUDE.md) — fournie par `ui6e/formatExtensionsBinomialeNormaleBayes.ts`
 * (qui, LUI, a le droit d'importer les 2 couches) et stockée dans l'état de session comme une boîte
 * noire, ignorée pour toutes les autres familles (A/B/D/E/F n'en ont pas besoin). */
export type CalculerReferenceExtensionsBinomialeNormaleBayes = (exercice: ExerciceExtensionsBinomialeNormaleBayes, phase: PhaseExtensionsBinomialeNormaleBayes) => ValeursReferenceExtensionsBinomialeNormaleBayes;

export function phaseInitiale(exercice: ExerciceExtensionsBinomialeNormaleBayes): PhaseExtensionsBinomialeNormaleBayes {
  switch (exercice.famille) {
    case "A":
      return exercice.sousType === "compose" ? "aComposeEcran1P" : "aEcranAucunAuMoins";
    case "B":
      if (exercice.strategie === "termeUnique") return "bTermeUniqueEcran1";
      return exercice.strategie === "somme" ? "bSommeEcran1" : "bComplementEcran1";
    case "C":
      return "cEcran1";
    case "D":
      return "dEcran1";
    case "E":
      return "eEcran1";
    case "F":
      return "fEcran1";
  }
}

export function phaseApres(phase: PhaseExtensionsBinomialeNormaleBayes): PhaseExtensionsBinomialeNormaleBayes | "termine" {
  switch (phase) {
    case "aComposeEcran1P":
      return "aEcranAucunAuMoins";
    case "aEcranAucunAuMoins":
      return "aEcranTrouverN1";
    case "aEcranTrouverN1":
      return "aEcranTrouverN2";
    case "aEcranTrouverN2":
      return "termine";
    case "bTermeUniqueEcran1":
      return "bTermeUniqueEcran2";
    case "bTermeUniqueEcran2":
      return "termine";
    case "bSommeEcran1":
      return "bSommeEcran2";
    case "bSommeEcran2":
      return "bSommeEcran3";
    case "bSommeEcran3":
      return "termine";
    case "bComplementEcran1":
      return "bComplementEcran2";
    case "bComplementEcran2":
      return "bComplementEcran3";
    case "bComplementEcran3":
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
      return "dEcran3";
    case "dEcran3":
      return "dEcran4";
    case "dEcran4":
      return "termine";
    case "eEcran1":
      return "eEcran2";
    case "eEcran2":
      return "termine";
    case "fEcran1":
      return "fEcran2";
    case "fEcran2":
      return "fEcran3";
    case "fEcran3":
      return "fEcran4";
    case "fEcran4":
      return "termine";
  }
}

/** Liste ORDONNÉE des phases réellement traversées par CET exercice précis — mirroir 6gen43/6gen50. */
export function phasesPourExercice(exercice: ExerciceExtensionsBinomialeNormaleBayes): PhaseExtensionsBinomialeNormaleBayes[] {
  const phases: PhaseExtensionsBinomialeNormaleBayes[] = [];
  let phase: PhaseExtensionsBinomialeNormaleBayes | "termine" = phaseInitiale(exercice);
  while (phase !== "termine") {
    phases.push(phase);
    phase = phaseApres(phase);
  }
  return phases;
}

export interface ResultatExerciceExtensionsBinomialeNormaleBayes {
  exercice: ExerciceExtensionsBinomialeNormaleBayes;
  scores: Partial<Record<PhaseExtensionsBinomialeNormaleBayes, number>>;
}

export interface EtatSessionExtensionsBinomialeNormaleBayes {
  reglages: ReglagesSession6e;
  generateur: () => ExerciceExtensionsBinomialeNormaleBayes;
  calculerReference: CalculerReferenceExtensionsBinomialeNormaleBayes;
  exerciceCourant: ExerciceExtensionsBinomialeNormaleBayes;
  phase: PhaseExtensionsBinomialeNormaleBayes;
  /** Identifiant STRICTEMENT croissant, incrémenté à chaque nouvel exercice tiré — mirroir
   * `generationId` de `typesLoiBinomiale.ts` (6gen50), qui corrige le même bug : la famille B ici a,
   * elle aussi, un nombre de CHAMPS variable (`termesACalculer.length`) à écran de départ constant
   * selon la stratégie (`bSommeEcran1`/`bSommeEcran2` peuvent porter 2 ou 3 champs selon l'exercice)
   * — `key={phase}` seul ne suffit donc PAS à garantir un remontage React entre 2 exercices
   * consécutifs de même stratégie mais de longueur différente. `App6gen52.tsx` DOIT l'utiliser comme
   * partie de la clé React (`key={`${generationId}-${phase}`}`), jamais `phase` seul. */
  generationId: number;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  scoresPartiels: Partial<Record<PhaseExtensionsBinomialeNormaleBayes, number>>;
  indexExercice: number;
  resultats: ResultatExerciceExtensionsBinomialeNormaleBayes[];
  terminee: boolean;
  derniereTransitionRevelee: boolean;
}
