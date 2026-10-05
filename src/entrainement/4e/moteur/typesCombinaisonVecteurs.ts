import type { ExerciceCombinaisonVecteurs, GenerateurExerciceCombinaisonVecteurs, VarianteCombinaisonVecteurs } from "../core/combinaisonVecteurs.types";
import type { ReglagesSession } from "../core/session.types";
import type { EtatEtapeTentatives } from "./etapeTentatives";

/** 2 phases fixes, toujours dans le même ordre — pas d'écran "énoncé" séparé (l'expression à
 * calculer est affichée dès le premier écran, comme un rappel persistant, voir Présentation). */
export type PhaseCombinaisonVecteurs = "simplification" | "composantes";

export interface ResultatExerciceCombinaisonVecteurs {
  variante: VarianteCombinaisonVecteurs;
  scoreSimplification: number;
  simplificationRevele: boolean;
  niveauAideSimplification: number;
  scoreComposantes: number;
  composantesRevele: boolean;
  niveauAideComposantes: number;
}

export interface EtatSessionCombinaisonVecteurs {
  reglages: ReglagesSession;
  generateur: GenerateurExerciceCombinaisonVecteurs;
  indexExercice: number;
  exerciceCourant: ExerciceCombinaisonVecteurs;
  phase: PhaseCombinaisonVecteurs;
  etapeCourante: EtatEtapeTentatives;
  /**
   * Aide PROGRESSIVE par écran (même principe que "Triangle quelconque") — 0 à 3 niveaux pour
   * l'écran "simplification", 0 à 2 pour l'écran "composantes" (`activerAideSuivante`,
   * `sessionCombinaisonVecteurs.ts`), chacun révélant strictement plus que le précédent. Pénalité
   * ADDITIVE (-20 points par niveau atteint), appliquée au niveau atteint au moment précis où
   * l'écran se clôt — jamais rétroactivement.
   */
  niveauAideSimplification: number;
  niveauAideComposantes: number;
  /** Score/révélation de l'écran "simplification", conservés jusqu'à la clôture de l'écran
   * "composantes" (qui construit le `ResultatExerciceCombinaisonVecteurs` complet). */
  scoreSimplificationExercice: number | null;
  simplificationRevele: boolean;
  resultats: ResultatExerciceCombinaisonVecteurs[];
  terminee: boolean;
}
