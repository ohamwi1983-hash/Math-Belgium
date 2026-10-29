import type { CritereRelation, ExerciceRelationsDroites, FamilleRelationsDroites, FormeEntreeRelation, FormeSortieRelation, GenerateurExerciceRelationsDroites } from "../core/relationsDroites.types";
import type { ReglagesSession } from "../core/session.types";
import type { EtatEtapeTentatives } from "./etapeTentatives";
import type { ReponseParametrique } from "./verificationRelationsDroites";

/** Réponse de l'écran "equation" — texte libre pour une sortie cartésienne, 4 champs numériques
 * pour une sortie paramétrique ; le composant appelant sait déjà quelle forme cibler
 * (`exercice.formeSortie`), jamais un dispatch supplémentaire côté réponse. */
export type ReponseEquation = string | ReponseParametrique;

/** 3 phases par exercice, séquence fixée par la famille, jamais un saut conditionnel :
 * - `construction` : `extraction → construction → equation` ;
 * - `reconnaissance` : `extraction → extraction2 → relation`.
 * Aucun cas "impossible" (contrairement à "Équation d'une droite") : les formes d'entrée sont
 * toujours choisies parmi celles qui existent pour le vecteur tiré (voir Couche A). */
export type PhaseRelationsDroites = "extraction" | "construction" | "equation" | "extraction2" | "relation";

export const SEQUENCES_RELATIONS_DROITES: Record<FamilleRelationsDroites, PhaseRelationsDroites[]> = {
  construction: ["extraction", "construction", "equation"],
  reconnaissance: ["extraction", "extraction2", "relation"],
};

export interface ResultatExerciceRelationsDroites {
  variante: string;
  famille: FamilleRelationsDroites;
  formeEntree: FormeEntreeRelation;
  formeSortie: FormeSortieRelation;
  critere: CritereRelation;
  scoreExtraction: number;
  extractionRevele: boolean;
  /** Aide utilisée sur l'écran "extraction" (`niveauAideExtraction > 0` au moment de sa clôture) —
   * pour le récapitulatif final uniformisé (`LigneRecap`/`statutRecap`), qui distingue "correct sans
   * aide" (vert) de "correct avec aide" (orange). */
  extractionAideUtilisee: boolean;
  /** Écran 2 — "construction" (famille `construction`) ou "extraction2" (famille
   * `reconnaissance`). */
  scoreConstruction: number;
  constructionRevele: boolean;
  /** Même principe que `extractionAideUtilisee`, pour l'écran 2. */
  constructionAideUtilisee: boolean;
  /** Écran 3 — "equation" ou "relation". */
  scoreEquation: number;
  equationRevele: boolean;
  /** Même principe que `extractionAideUtilisee`, pour l'écran 3. */
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
  /** Écran 2 — "construction" ou "extraction2" (une seule des deux phases par exercice). */
  niveauAideConstruction: number;
  /** Écran 3 — "equation" ou "relation". */
  niveauAideEquation: number;
  /** Scores des écrans déjà clos de cet exercice, conservés jusqu'à la clôture de l'exercice
   * entier (même principe que `scoreExtractionExercice`/`scorePossibiliteExercice`,
   * `typesEquationDroite.ts`). */
  scoreExtractionExercice: number | null;
  extractionRevele: boolean;
  /** Écran 2 — "construction" ou "extraction2". */
  scoreConstructionExercice: number | null;
  constructionRevele: boolean;
  resultats: ResultatExerciceRelationsDroites[];
  terminee: boolean;
}
