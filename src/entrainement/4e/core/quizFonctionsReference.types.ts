/**
 * Couche core — contrat pour "Caractéristiques d'une fonction & fonctions de référence" (quiz
 * vrai/faux, chapitre 2, nommage propre à sa spec). Structure identique aux 3 quiz précédents
 * (gen59/gen60/gen61) : mono-écran, une seule tentative, thème choisi par l'élève.
 */
export type VarianteQuizFonctionsReference =
  | "vocabulaire"
  | "sixFonctions"
  | "carreCube"
  | "racines"
  | "inverse"
  | "valeurAbsolue"
  | "transformations";

export interface QuestionVraiFaux {
  enonce: string;
  reponse: boolean;
  justification: string;
}

export interface ExerciceQuizFonctionsReference {
  variante: VarianteQuizFonctionsReference;
  question: QuestionVraiFaux;
}

export type GenerateurExerciceQuizFonctionsReference = () => ExerciceQuizFonctionsReference;
