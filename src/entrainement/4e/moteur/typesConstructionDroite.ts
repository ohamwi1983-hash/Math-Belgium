import type {
  ExerciceConstructionDroite,
  GenerateurExerciceConstructionDroite,
  VarianteConstructionDroite,
} from "../core/constructionDroite.types";
import type { ReglagesSession } from "../core/session.types";
import type { Point } from "../core/vecteur.types";
import type { EtatEtapeTentatives } from "./etapeTentatives";

/** 2 phases FIXES, toujours dans le même ordre — jamais de saut conditionnel (contrairement à
 * "Équation d'une droite", ce générateur n'a pas de cas "forme impossible"). */
export type PhaseConstructionDroite = "points" | "trace";

export interface ResultatExerciceConstructionDroite {
  variante: VarianteConstructionDroite;
  scorePoints: number;
  pointsRevele: boolean;
  /** Aide utilisée sur l'écran "points" (`niveauAidePoints > 0` au moment de sa clôture) — pour le
   * récapitulatif final uniformisé (`LigneRecap`/`statutRecap`), qui distingue "correct sans aide"
   * (vert) de "correct avec aide" (orange). */
  pointsAideUtilisee: boolean;
  scoreTrace: number;
  traceRevele: boolean;
  /** Même principe que `pointsAideUtilisee`, pour l'écran "trace". */
  traceAideUtilisee: boolean;
}

export interface EtatSessionConstructionDroite {
  reglages: ReglagesSession;
  generateur: GenerateurExerciceConstructionDroite;
  indexExercice: number;
  exerciceCourant: ExerciceConstructionDroite;
  phase: PhaseConstructionDroite;
  etapeCourante: EtatEtapeTentatives;
  niveauAidePoints: number;
  niveauAideTrace: number;
  scorePointsExercice: number | null;
  pointsRevele: boolean;
  /** Points cibles de l'écran "trace" — jamais recalculés indépendamment de ce qui a réellement
   * clos l'écran "points" : si l'élève a réussi sans révélation, ce sont EXACTEMENT ses propres
   * valeurs soumises (n'importe quelle paire entière valide de la droite est acceptée à l'écran
   * "points", jamais un couple canonique unique imposé — voir `verificationConstructionDroite.ts`) ;
   * si révélé (tentatives épuisées, aucune réponse élève à reporter), repli sur la paire
   * canonique `exercice.point`/`exercice.point+exercice.vecteur`. `null` tant que l'écran "points"
   * n'est pas encore clos. */
  cible1: Point | null;
  cible2: Point | null;
  resultats: ResultatExerciceConstructionDroite[];
  terminee: boolean;
}
