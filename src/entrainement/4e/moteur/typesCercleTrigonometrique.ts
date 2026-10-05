import type {
  ExerciceCercleTrigonometrique,
  GenerateurExerciceCercleTrigonometrique,
  VarianteCercleTrigId,
} from "../core/cercleTrigonometrique.types";
import type { ReglagesSession } from "../core/session.types";
import type { EtatEtapeTentatives } from "./etapeTentatives";

/**
 * Aucun écran "énoncé" séparé (correction 1, promptcorrectionsgenerateurcercletrigo1.md — supprimé
 * depuis la version d'origine) : la séquence démarre directement sur "reduction" (si nécessaire)
 * ou "quadrant" sinon. "reduction" est donc la seule phase conditionnellement absente — les 3
 * suivantes ont toujours lieu.
 */
export type PhaseCercleTrigonometrique = "reduction" | "quadrant" | "anglePremierQuadrant" | "signes";

export interface ResultatExerciceCercleTrigonometrique {
  variante: VarianteCercleTrigId;
  /** null ⟺ l'angle de l'énoncé était déjà dans [0°,360°[, l'écran de réduction n'a pas eu lieu. */
  scoreReduction: number | null;
  reductionRevele: boolean;
  /** Capturé au moment précis où l'écran se ferme (récapitulatif final `LigneRecap`, jamais dérivé
   * du score a posteriori) — `false` par défaut si l'écran a été sauté. */
  reductionAideUtilisee: boolean;
  scoreQuadrant: number;
  quadrantRevele: boolean;
  scoreAnglePremierQuadrant: number;
  anglePremierQuadrantRevele: boolean;
  /** Écran "Angle du premier quadrant" — capturé à la clôture, voir `reductionAideUtilisee`. */
  anglePremierQuadrantAideUtilisee: boolean;
  scoreSignes: number;
  signesRevele: boolean;
  /** Écran "Signes" — capturé à la clôture, voir `reductionAideUtilisee`. */
  signesAideUtilisee: boolean;
}

export interface EtatSessionCercleTrigonometrique {
  reglages: ReglagesSession;
  generateur: GenerateurExerciceCercleTrigonometrique;
  indexExercice: number;
  exerciceCourant: ExerciceCercleTrigonometrique;
  phase: PhaseCercleTrigonometrique;
  etapeCourante: EtatEtapeTentatives;
  /**
   * Bouton "Aide" — un bouton par écran (Réduction/Angle du premier quadrant/Signes ; l'écran
   * Quadrant n'en a pas), chacun avec son propre état de révélation à sens unique et sa propre
   * pénalité ×0,5, strictement indépendants entre eux (promptcorrectionsgenerateur14lot2.md,
   * section 1 — corrige un bug où un seul flag partagé faisait qu'activer l'aide sur un écran
   * l'activait, et pénalisait, tous les autres écrans de l'exercice, y compris l'écran Quadrant qui
   * n'a pourtant aucun bouton Aide).
   */
  aideReductionUtilisee: boolean;
  aideAnglePremierQuadrantUtilisee: boolean;
  aideSignesUtilisee: boolean;
  scoreReductionExercice: number | null;
  reductionRevele: boolean;
  scoreQuadrantExercice: number | null;
  quadrantRevele: boolean;
  scoreAnglePremierQuadrantExercice: number | null;
  anglePremierQuadrantRevele: boolean;
  resultats: ResultatExerciceCercleTrigonometrique[];
  terminee: boolean;
}
