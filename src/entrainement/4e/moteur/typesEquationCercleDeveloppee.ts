import type { ExerciceEquationCercleDeveloppee, GenerateurExerciceEquationCercleDeveloppee, VarianteEquationCercleDeveloppee } from "../core/equationCercleDeveloppee.types";
import type { ReglagesSession } from "../core/session.types";
import type { EtatEtapeTentatives } from "./etapeTentatives";

/** 3 phases FIXES, toujours dans le même ordre — aucun saut conditionnel : les deux variantes
 * traversent exactement la même séquence (même principe que "Équation d'un cercle... à partir d'un
 * graphe"). "centreRayon" combine centre ET rayon dans un seul écran (une seule étape de
 * tentatives, un seul score), conformément à la spec. */
export type PhaseEquationCercleDeveloppee = "regroupement" | "completion" | "centreRayon";

export interface ReponseEcranCentreRayon {
  x: number;
  y: number;
  rayon: string;
}

export interface ResultatExerciceEquationCercleDeveloppee {
  variante: VarianteEquationCercleDeveloppee;
  scoreRegroupement: number;
  regroupementRevele: boolean;
  /** Capturé au moment précis où l'écran "regroupement" se ferme (récapitulatif final
   * `LigneRecap`, jamais dérivé du score a posteriori) — une tentative ratée sans aide reste donc
   * verte. */
  regroupementAideUtilisee: boolean;
  scoreCompletion: number;
  completionRevele: boolean;
  /** Écran "complétion du carré" — capturé à la clôture, voir `regroupementAideUtilisee`. */
  completionAideUtilisee: boolean;
  scoreCentreRayon: number;
  centreRayonRevele: boolean;
  /** Écran "centre et rayon" — capturé à la clôture, voir `regroupementAideUtilisee`. */
  centreRayonAideUtilisee: boolean;
}

export interface EtatSessionEquationCercleDeveloppee {
  reglages: ReglagesSession;
  generateur: GenerateurExerciceEquationCercleDeveloppee;
  indexExercice: number;
  exerciceCourant: ExerciceEquationCercleDeveloppee;
  phase: PhaseEquationCercleDeveloppee;
  etapeCourante: EtatEtapeTentatives;
  niveauAideRegroupement: number;
  niveauAideCompletion: number;
  niveauAideCentreRayon: number;
  /** Scores des écrans déjà clos de cet exercice, conservés jusqu'à la clôture de l'exercice
   * entier (même principe que `EtatSessionEquationCercle`). */
  scoreRegroupementExercice: number | null;
  regroupementRevele: boolean;
  regroupementAideUtilisee: boolean;
  scoreCompletionExercice: number | null;
  completionRevele: boolean;
  completionAideUtilisee: boolean;
  resultats: ResultatExerciceEquationCercleDeveloppee[];
  terminee: boolean;
}
