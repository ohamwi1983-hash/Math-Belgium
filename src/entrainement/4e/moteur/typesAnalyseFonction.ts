import type { Categorie } from "../core/generateur.types";
import type {
  EtapeAnalyseFonction,
  ExerciceAnalyseFonction,
  GenerateurExerciceAnalyseFonction,
} from "../core/analyseFonction.types";
import type { ReglagesSession } from "../core/session.types";
import type { EtatEtapeTentatives } from "./etapeTentatives";

/**
 * racinesReconnaissance/racinesChamp1/racinesChamp2 : sous-phases de l'étape 5 ("racines"),
 * réutilisant reconnaissance+factorisation+racines de l'exercice 1 — jamais d'isolement (l'énoncé
 * est toujours en forme canonique) ni de "factorisation après Δ" (categorie jamais cas_general,
 * voir generateurs/analyseFonction). tableauSignes : étape 6, le tableau "signe et variation"
 * (prompt-8-corrections-analyse-fonction.md, section 8) — soumis en un seul essai global comme la
 * grille de l'exercice 5.
 */
export type PhaseAnalyseFonction =
  | "coefficients"
  | "allure"
  | "axeSommet"
  | "domaineImage"
  | "racinesReconnaissance"
  | "racinesChamp1"
  | "racinesChamp2"
  | "tableauSignes";

/**
 * `xxxRevele`/`aideXxxUtilisee` — capturés à la clôture de chaque écran (jamais recalculés),
 * exposés pour piloter `statutRecap` (`components/LigneRecap.tsx`) sur le récapitulatif final
 * (`promptuniformisationrecap4e.md`) : rouge si révélé, orange si aide utilisée sans révélation,
 * vert sinon. "allure"/"racines*" n'ont aucun mécanisme d'aide (jamais orange, seulement vert/rouge).
 */
export interface ResultatExerciceAnalyseFonction {
  categorie: Categorie;
  scoreCoefficients: number | null;
  coefficientsRevele: boolean;
  aideCoefficientsUtilisee: boolean;
  scoreAllure: number | null;
  allureRevele: boolean;
  scoreAxeSommet: number | null;
  axeSommetRevele: boolean;
  aideAxeSommetUtilisee: boolean;
  scoreDomaineImage: number | null;
  domaineImageRevele: boolean;
  aideDomaineImageUtilisee: boolean;
  scoreRacinesReconnaissance: number | null;
  racinesReconnaissanceRevele: boolean;
  scoreRacinesChamp1: number | null;
  racinesChamp1Revele: boolean;
  scoreRacinesChamp2: number | null;
  racinesChamp2Revele: boolean;
  /** null si l'étape 6 est désactivée par le professeur ; number sinon. */
  scoreTableauSignes: number | null;
  tableauSignesRevele: boolean;
  aideTableauSignesUtilisee: boolean;
}

export interface EtatSessionAnalyseFonction {
  reglages: ReglagesSession;
  etapesActives: Record<EtapeAnalyseFonction, boolean>;
  generateur: GenerateurExerciceAnalyseFonction;
  indexExercice: number;
  exerciceCourant: ExerciceAnalyseFonction;
  phase: PhaseAnalyseFonction;
  etapeCourante: EtatEtapeTentatives;
  /** Boutons "Aide" — révélation à sens unique par étape, ×0,5 au score final de l'étape concernée
   * (même mécanisme partout, prompt-4-modifications-analyse-fonction.md). */
  aideCoefficientsUtilisee: boolean;
  aideAxeSommetUtilisee: boolean;
  aideDomaineImageUtilisee: boolean;
  aideTableauSignesUtilisee: boolean;
  /**
   * `xxxRevele` — persistés ici (jamais recalculés/hardcodés) dès la clôture de chaque écran, au
   * même titre que `scoreXxxExercice`, pour survivre jusqu'au `resultatPartielCourant` FINAL de
   * l'exercice (celui qui construit réellement `ResultatExerciceAnalyseFonction` — les
   * `resultatPartiel` intermédiaires passés à `avancerApres` sont silencieusement jetés tant que
   * l'étape close n'est pas la DERNIÈRE étape active). Nécessaire pour `statutRecap`
   * (`components/LigneRecap.tsx`, `promptuniformisationrecap4e.md`).
   */
  coefficientsRevele: boolean;
  allureRevele: boolean;
  axeSommetRevele: boolean;
  domaineImageRevele: boolean;
  racinesReconnaissanceRevele: boolean;
  racinesChamp1Revele: boolean;
  racinesChamp2Revele: boolean;
  tableauSignesRevele: boolean;
  scoreCoefficientsExercice: number | null;
  scoreAllureExercice: number | null;
  scoreAxeSommetExercice: number | null;
  scoreDomaineImageExercice: number | null;
  scoreRacinesReconnaissanceExercice: number | null;
  scoreRacinesChamp1Exercice: number | null;
  scoreRacinesChamp2Exercice: number | null;
  resultats: ResultatExerciceAnalyseFonction[];
  terminee: boolean;
}
