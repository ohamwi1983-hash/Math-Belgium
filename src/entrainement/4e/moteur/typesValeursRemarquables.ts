import type { AngleRemarquable, ExerciceValeursRemarquables, GenerateurExerciceValeursRemarquables } from "../core/valeursRemarquables.types";
import type { ReglagesSession } from "../core/session.types";
import type { EtatEtapeTentatives } from "./etapeTentatives";

/** 3 phases fixes, toujours dans le même ordre — aucune n'est conditionnellement absente
 * (contrairement au premier générateur, qui saute "reduction" quand inutile) : l'angle de départ
 * est directement utilisable pour identifier le quadrant ici, aucune réduction n'est jamais
 * demandée à l'élève (`promptcreationgenerateur15.md`). */
export type PhaseValeursRemarquables = "quadrant" | "anglePremierQuadrant" | "valeursExactes";

export interface ResultatExerciceValeursRemarquables {
  anglePremierQuadrant: AngleRemarquable;
  scoreQuadrant: number;
  quadrantRevele: boolean;
  /** Capturé au moment précis où l'écran se ferme (récapitulatif final `LigneRecap`, jamais dérivé
   * du score a posteriori) — contrairement au générateur 14, l'écran "Quadrant" a bien un bouton
   * Aide ici (les 3 écrans en ont un, voir `sessionValeursRemarquables.ts`). */
  quadrantAideUtilisee: boolean;
  scoreAnglePremierQuadrant: number;
  anglePremierQuadrantRevele: boolean;
  anglePremierQuadrantAideUtilisee: boolean;
  scoreValeursExactes: number;
  valeursExactesRevele: boolean;
  valeursExactesAideUtilisee: boolean;
}

export interface EtatSessionValeursRemarquables {
  reglages: ReglagesSession;
  generateur: GenerateurExerciceValeursRemarquables;
  indexExercice: number;
  exerciceCourant: ExerciceValeursRemarquables;
  phase: PhaseValeursRemarquables;
  etapeCourante: EtatEtapeTentatives;
  /**
   * Bouton "Aide" — un bouton par écran (les 3 en ont un, contrairement au premier générateur du
   * chapitre où l'écran "Quadrant" n'en a pas), chacun avec son propre état de révélation à sens
   * unique et sa propre pénalité ×0,5, strictement indépendants entre eux — même principe que le
   * premier générateur post-correctif (`promptcorrectionsgenerateur14lot2.md`, section 1) :
   * `activerAide` route sur `etat.phase`, jamais un flag partagé qui pénaliserait les 3 écrans à la
   * fois.
   */
  aideQuadrantUtilisee: boolean;
  aideAnglePremierQuadrantUtilisee: boolean;
  aideValeursExactesUtilisee: boolean;
  scoreQuadrantExercice: number | null;
  quadrantRevele: boolean;
  scoreAnglePremierQuadrantExercice: number | null;
  anglePremierQuadrantRevele: boolean;
  resultats: ResultatExerciceValeursRemarquables[];
  terminee: boolean;
}
