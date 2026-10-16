import type { ExerciceEquationInequationSecondDegre, GenerateurExerciceEquationInequationSecondDegre } from "../core/equationInequationSecondDegre.types";
import type { ReglagesSession } from "../core/session.types";
import type { EtatEtapeTentatives } from "./etapeTentatives";

/** Séquence à 4 ou 6 écrans selon `exercice.voieSysteme` (architecture D uniquement — voir
 * `core/equationInequationSecondDegre.types.ts`, en-tête) : `voieSysteme=false` (architectures
 * A/B/C) → `poserEquationInequation → resoudre → validation → interpretation` ; `voieSysteme=true`
 * (architecture D) → `poserSysteme → isolerSubstituer → resoudre → validation → interpretation`. */
export type PhaseEquationInequationSecondDegre = "poserSysteme" | "isolerSubstituer" | "poserEquationInequation" | "resoudre" | "validation" | "interpretation";

export interface ResultatExerciceEquationInequationSecondDegre {
  variante: ExerciceEquationInequationSecondDegre["variante"];
  famille: ExerciceEquationInequationSecondDegre["famille"];
  scorePoserSysteme: number | null;
  poserSystemeRevele: boolean;
  niveauAidePoserSysteme: number;
  scoreIsolerSubstituer: number | null;
  isolerSubstituerRevele: boolean;
  niveauAideIsolerSubstituer: number;
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
  niveauAidePoserSysteme: number;
  niveauAideIsolerSubstituer: number;
  niveauAidePoserEquationInequation: number;
  niveauAideResoudre: number;
  niveauAideValidation: number;
  niveauAideInterpretation: number;
  scorePoserSystemeExercice: number | null;
  poserSystemeRevele: boolean;
  scoreIsolerSubstituerExercice: number | null;
  isolerSubstituerRevele: boolean;
  scorePoserEquationInequationExercice: number | null;
  poserEquationInequationRevele: boolean;
  scoreResoudreExercice: number | null;
  resoudreRevele: boolean;
  scoreValidationExercice: number | null;
  validationRevele: boolean;
  resultats: ResultatExerciceEquationInequationSecondDegre[];
  terminee: boolean;
}
