import type { ExerciceEquationInequationSecondDegre, GenerateurExerciceEquationInequationSecondDegre } from "../core/equationInequationSecondDegre.types";
import type { ReglagesSession } from "../core/session.types";
import type { EtatEtapeTentatives } from "./etapeTentatives";

/** Séquence UNIQUE à 4 écrans, pour TOUTES les familles depuis la refonte (voir
 * `core/equationInequationSecondDegre.types.ts`, en-tête) : `poserEquationInequation → resoudre →
 * validation → interpretation` (terminale) — plus aucune variation par famille (l'ancienne
 * version avait une séquence à 4, 6 ou 9 écrans selon `voieSysteme`/`base.variante`). */
export type PhaseEquationInequationSecondDegre = "poserEquationInequation" | "resoudre" | "validation" | "interpretation";

export interface ResultatExerciceEquationInequationSecondDegre {
  variante: ExerciceEquationInequationSecondDegre["variante"];
  famille: ExerciceEquationInequationSecondDegre["famille"];
  scorePoserEquationInequation: number | null;
  poserEquationInequationRevele: boolean;
  niveauAidePoserEquationInequation: number;
  scoreResoudre: number;
  resoudreRevele: boolean;
  niveauAideResoudre: number;
  scoreValidation: number;
  validationRevele: boolean;
  niveauAideValidation: number;
  scoreInterpretation: number;
  interpretationRevele: boolean;
  niveauAideInterpretation: number;
}

export interface EtatSessionEquationInequationSecondDegre {
  reglages: ReglagesSession;
  generateur: GenerateurExerciceEquationInequationSecondDegre;
  indexExercice: number;
  exerciceCourant: ExerciceEquationInequationSecondDegre;
  phase: PhaseEquationInequationSecondDegre;
  etapeCourante: EtatEtapeTentatives;
  niveauAidePoserEquationInequation: number;
  niveauAideResoudre: number;
  niveauAideValidation: number;
  niveauAideInterpretation: number;
  scorePoserEquationInequationExercice: number | null;
  poserEquationInequationRevele: boolean;
  scoreResoudreExercice: number | null;
  resoudreRevele: boolean;
  scoreValidationExercice: number | null;
  validationRevele: boolean;
  resultats: ResultatExerciceEquationInequationSecondDegre[];
  terminee: boolean;
}
