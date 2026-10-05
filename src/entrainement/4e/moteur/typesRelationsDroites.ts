import type { CritereRelation, ExerciceRelationsDroites, FormeEntreeRelation, FormeSortieRelation, GenerateurExerciceRelationsDroites } from "../core/relationsDroites.types";
import type { ReglagesSession } from "../core/session.types";
import type { EtatEtapeTentatives } from "./etapeTentatives";
import type { ReponseParametrique } from "./verificationRelationsDroites";

/** Réponse de l'écran "equation" — texte libre pour une sortie cartésienne, 4 champs numériques
 * pour une sortie paramétrique ; le composant appelant sait déjà quelle forme cibler
 * (`exercice.formeSortie`), jamais un dispatch supplémentaire côté réponse. */
export type ReponseEquation = string | ReponseParametrique;

/** 3 phases FIXES, toujours dans le même ordre — aucun saut conditionnel (contrairement à
 * "Équation d'une droite", ce générateur n'a structurellement aucun cas "impossible" : le vecteur
 * de référence a toujours ses deux composantes non nulles, voir Couche A). */
export type PhaseRelationsDroites = "extraction" | "construction" | "equation";

export interface ResultatExerciceRelationsDroites {
  variante: string;
  formeEntree: FormeEntreeRelation;
  formeSortie: FormeSortieRelation;
  critere: CritereRelation;
  scoreExtraction: number;
  extractionRevele: boolean;
  /** Aide utilisée sur l'écran "extraction" (`niveauAideExtraction > 0` au moment de sa clôture) —
   * pour le récapitulatif final uniformisé (`LigneRecap`/`statutRecap`), qui distingue "correct sans
   * aide" (vert) de "correct avec aide" (orange). */
  extractionAideUtilisee: boolean;
  scoreConstruction: number;
  constructionRevele: boolean;
  /** Même principe que `extractionAideUtilisee`, pour l'écran "construction". */
  constructionAideUtilisee: boolean;
  scoreEquation: number;
  equationRevele: boolean;
  /** Même principe que `extractionAideUtilisee`, pour l'écran "equation". */
  equationAideUtilisee: boolean;
}

export interface EtatSessionRelationsDroites {
  reglages: ReglagesSession;
  generateur: GenerateurExerciceRelationsDroites;
  indexExercice: number;
  exerciceCourant: ExerciceRelationsDroites;
  phase: PhaseRelationsDroites;
  etapeCourante: EtatEtapeTentatives;
  niveauAideExtraction: number;
  niveauAideConstruction: number;
  niveauAideEquation: number;
  /** Scores des écrans déjà clos de cet exercice, conservés jusqu'à la clôture de l'exercice
   * entier (même principe que `scoreExtractionExercice`/`scorePossibiliteExercice`,
   * `typesEquationDroite.ts`). */
  scoreExtractionExercice: number | null;
  extractionRevele: boolean;
  scoreConstructionExercice: number | null;
  constructionRevele: boolean;
  resultats: ResultatExerciceRelationsDroites[];
  terminee: boolean;
}
