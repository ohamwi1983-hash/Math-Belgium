/**
 * Couche core (5e) — contrat pour "Fonctions : rappels et compléments" (quiz vrai/faux, chapitre 1,
 * 5gen39). Réplique mécaniquement le contrat du quiz vrai/faux 4e (`core/quizFonctionsReference.types.ts`,
 * gen59-62) adapté aux thèmes propres à ce chapitre 5e — jamais de contrat partagé entre les deux
 * chantiers (CLAUDE.md, "Chantier 5e FWB (4h)").
 */
export type VarianteQuizFonctions5e =
  | "vocabulaire"
  | "domaineRationnel"
  | "domaineRacines"
  | "decomposition"
  | "composition"
  | "lectureGraphique"
  | "problemesContexte";

export interface QuestionVraiFaux5e {
  enonce: string;
  reponse: boolean;
  justification: string;
}

export interface ExerciceQuizFonctions5e {
  variante: VarianteQuizFonctions5e;
  question: QuestionVraiFaux5e;
}

export type GenerateurExerciceQuizFonctions5e = () => ExerciceQuizFonctions5e;
