import type { CaracteristiqueDemandee, ExerciceCaracteristiquesDroite, GenerateurExerciceCaracteristiquesDroite, VarianteCaracteristiquesDroite } from "../core/caracteristiquesDroite.types";
import type { ReglagesSession } from "../core/session.types";
import type { EtatEtapeTentatives } from "./etapeTentatives";

/** 2 phases FIXES, toujours dans le même ordre — TOUJOURS traversées toutes les deux, y compris
 * pour une instance verticale (qui utilise alors des réponses catégorielles "n'existe pas" plutôt
 * que d'être routée autour de l'écran 2, jamais un saut conditionnel). */
export type PhaseCaracteristiquesDroite = "extraction" | "caracteristiques";

export interface ResultatExerciceCaracteristiquesDroite {
  variante: VarianteCaracteristiquesDroite;
  verticale: boolean;
  caracteristiqueDemandee: CaracteristiqueDemandee;
  scoreExtraction: number;
  extractionRevele: boolean;
  /** Capturé à la clôture de l'écran "extraction" — jamais dérivé du score seul (récapitulatif
   * final, `promptuniformisationrecap4e.md` : une tentative ratée sans aide reste verte). */
  niveauAideExtraction: number;
  scoreCaracteristiques: number;
  caracteristiquesRevele: boolean;
  /** Capturé à la clôture de l'écran "caracteristiques", même principe que `niveauAideExtraction`. */
  niveauAideCaracteristiques: number;
}

export interface EtatSessionCaracteristiquesDroite {
  reglages: ReglagesSession;
  generateur: GenerateurExerciceCaracteristiquesDroite;
  indexExercice: number;
  exerciceCourant: ExerciceCaracteristiquesDroite;
  phase: PhaseCaracteristiquesDroite;
  etapeCourante: EtatEtapeTentatives;
  niveauAideExtraction: number;
  niveauAideCaracteristiques: number;
  scoreExtractionExercice: number | null;
  extractionRevele: boolean;
  resultats: ResultatExerciceCaracteristiquesDroite[];
  terminee: boolean;
}
