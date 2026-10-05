/**
 * Couche B — types de session pour "Lecture graphique — équation d'une droite". Un seul écran par
 * exercice (comme "Quel angle ?"/"Transformations graphiques") — pas de `Phase`, l'écran affiché
 * est déterminé directement par `exerciceCourant.variante`.
 */
import type { ExerciceLectureGraphiqueDroite, VarianteLectureGraphiqueDroite } from "../core/lectureGraphiqueDroite.types";
import type { ReglagesSession } from "../core/session.types";
import type { EtatEtapeTentatives } from "./etapeTentatives";

export interface ResultatExerciceLectureGraphiqueDroite {
  variante: VarianteLectureGraphiqueDroite;
  score: number;
  revele: boolean;
  /** Aide utilisée (`niveauAide > 0` au moment de la clôture de l'exercice) — pour le récapitulatif
   * final uniformisé (`LigneRecap`/`statutRecap`), qui distingue "correct sans aide" (vert) de
   * "correct avec aide" (orange). */
  aideUtilisee: boolean;
}

export interface EtatSessionLectureGraphiqueDroite {
  reglages: ReglagesSession;
  generateur: () => ExerciceLectureGraphiqueDroite;
  indexExercice: number;
  exerciceCourant: ExerciceLectureGraphiqueDroite;
  etapeCourante: EtatEtapeTentatives;
  /** Aide progressive de l'exercice EN COURS — remise à 0 au passage à l'exercice suivant. */
  niveauAide: number;
  resultats: ResultatExerciceLectureGraphiqueDroite[];
  terminee: boolean;
}
