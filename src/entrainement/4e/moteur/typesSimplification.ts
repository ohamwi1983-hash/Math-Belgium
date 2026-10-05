import type {
  ExerciceSimplification,
  GenerateurExerciceSimplification,
  TypeFraction,
} from "../core/simplification.types";
import type { ReglagesSession } from "../core/session.types";
import type { EtatEtapeTentatives } from "./etapeTentatives";

/**
 * P2/P2 : [denomReduction→]denomReconnaissance→denomChamp1→denomChamp2→[numReduction→]numReconnaissance→numChamp1→numChamp2→simplification
 * P1/P2 : [denomReduction→]denomReconnaissance→denomChamp1→denomChamp2→[numReductionP1→]simplification
 * P2/P1 : [denomReductionP1→]ceDirecte→[numReduction→]numReconnaissance→numChamp1→numChamp2→simplification
 * "denomReduction"/"numReduction" (prompt utilisateur du 26/09) : réduisent à pgcd(|a|,|b|,|c|)=1
 * le P2 concerné, uniquement quand nécessaire (voir necessiteSimplification,
 * simplificationEquation.ts) — même principe que la phase "simplification" de gen1/gen2, mais au
 * niveau d'UN polynôme plutôt que de l'exercice entier (un numérateur ET un dénominateur peuvent
 * chacun en avoir besoin indépendamment). Jamais à confondre avec la phase "simplification"
 * ci-dessous (finale, simplifie la FRACTION en factorisant les deux côtés).
 * "denomReductionP1"/"numReductionP1" (nouvelles, gen3 image 6/7 du prompt du 27/09) : même
 * principe, mais pour le P1 de la fraction (`{k,p}`, jusqu'ici affiché d'emblée sous sa forme
 * factorisée sans jamais demander à l'élève de la produire) — uniquement quand k≠±1 (voir
 * necessiteMiseEnEvidenceP1, verificationSimplification.ts). Placée avant toute autre question sur
 * ce côté : tout au début de l'exercice pour P2/P1 (dénominateur P1), juste avant "simplification"
 * pour P1/P2 (numérateur P1, qui n'a sinon aucune étape propre).
 */
export type PhaseSimplification =
  | "denomReduction"
  | "denomReductionP1"
  | "denomReconnaissance"
  | "denomChamp1"
  | "denomChamp2"
  | "denomFactorisation"
  | "ceDirecte"
  | "numReduction"
  | "numReductionP1"
  | "numReconnaissance"
  | "numChamp1"
  | "numChamp2"
  | "numFactorisation"
  | "simplification";

export interface ResultatExerciceSimplification {
  type: TypeFraction;
  /** null si l'étape n'a pas eu lieu pour ce type de fraction (voir la séquence ci-dessus) */
  scoreDenomReduction: number | null;
  aideDenomReductionUtilisee: boolean;
  /** score de l'étape "denomReductionP1" (mise en évidence du dénominateur P1), null sauf pour un
   * dénominateur P1 avec k≠±1 (type P2/P1). */
  scoreDenomReductionP1: number | null;
  aideDenomReductionP1Utilisee: boolean;
  scoreDenomReconnaissance: number | null;
  denomCategorieRevelee: boolean;
  scoreDenomChamp1: number | null;
  aideDenomChamp1Utilisee: boolean;
  scoreDenomChamp2: number | null;
  aideDenomChamp2Utilisee: boolean;
  /** score de l'étape "denomFactorisation" (prompt-corrections-etat-actuel-et-duplication.md,
   * point 1), null sauf si le dénominateur est un P2 cas_general. */
  scoreDenomFactorisation: number | null;
  aideDenomFactorisationUtilisee: boolean;
  scoreCEDirecte: number | null;
  scoreNumReduction: number | null;
  aideNumReductionUtilisee: boolean;
  /** score de l'étape "numReductionP1" (mise en évidence du numérateur P1), null sauf pour un
   * numérateur P1 avec k≠±1 (type P1/P2). */
  scoreNumReductionP1: number | null;
  aideNumReductionP1Utilisee: boolean;
  scoreNumReconnaissance: number | null;
  numCategorieRevelee: boolean;
  scoreNumChamp1: number | null;
  aideNumChamp1Utilisee: boolean;
  scoreNumChamp2: number | null;
  aideNumChamp2Utilisee: boolean;
  /** score de l'étape "numFactorisation", null sauf si le numérateur est un P2 cas_general. */
  scoreNumFactorisation: number | null;
  aideNumFactorisationUtilisee: boolean;
  scoreSimplification: number;
  aideSimplificationUtilisee: boolean;
}

export interface EtatSessionSimplification {
  reglages: ReglagesSession;
  generateur: GenerateurExerciceSimplification;
  indexExercice: number;
  exerciceCourant: ExerciceSimplification;
  phase: PhaseSimplification;
  etapeCourante: EtatEtapeTentatives;
  scoreDenomReductionExercice: number | null;
  scoreDenomReductionP1Exercice: number | null;
  scoreDenomReconnaissanceExercice: number | null;
  denomCategorieRevelee: boolean;
  scoreDenomChamp1Exercice: number | null;
  scoreDenomChamp2Exercice: number | null;
  scoreDenomFactorisationExercice: number | null;
  scoreCEDirecteExercice: number | null;
  scoreNumReductionExercice: number | null;
  scoreNumReductionP1Exercice: number | null;
  scoreNumReconnaissanceExercice: number | null;
  numCategorieRevelee: boolean;
  scoreNumChamp1Exercice: number | null;
  scoreNumChamp2Exercice: number | null;
  scoreNumFactorisationExercice: number | null;
  /**
   * Aides à sens unique (1 seul niveau, ×0,5 sur le score de l'étape concernée à sa clôture —
   * conceptionaidescomposantspartageshistorique.md) — remises à false au passage à l'exercice
   * suivant, comme les autres champs "transitoires" ci-dessus.
   */
  aideDenomReductionUtilisee: boolean;
  aideDenomReductionP1Utilisee: boolean;
  aideDenomChamp1Utilisee: boolean;
  aideDenomChamp2Utilisee: boolean;
  aideDenomFactorisationUtilisee: boolean;
  aideNumReductionUtilisee: boolean;
  aideNumReductionP1Utilisee: boolean;
  aideNumChamp1Utilisee: boolean;
  aideNumChamp2Utilisee: boolean;
  aideNumFactorisationUtilisee: boolean;
  aideSimplificationUtilisee: boolean;
  resultats: ResultatExerciceSimplification[];
  terminee: boolean;
}
