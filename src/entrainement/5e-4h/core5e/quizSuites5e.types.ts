/**
 * Couche core (5e) — contrat pour "Suites" (quiz vrai/faux, chapitre 3, 5gen41). Réplique
 * mécaniquement le contrat du quiz vrai/faux chapitre 2 (`core5e/quizTrigonometrie5e.types.ts`,
 * 5gen40) et chapitre 1 (`core5e/quizFonctions5e.types.ts`, 5gen39), adapté aux thèmes propres à ce
 * chapitre 5e — jamais de contrat partagé entre les deux chantiers (CLAUDE.md, "Chantier 5e FWB
 * (4h)"), ni entre deux chapitres du même chantier.
 */
export type VarianteQuizSuites5e =
  | "suitesArithmetiques"
  | "suitesGeometriques"
  | "convergenceDivergence"
  | "problemesClassiques"
  | "comparaisonNumerique"
  | "suiteRecurrenteAffine"
  | "transversal";

export interface QuestionVraiFaux5e {
  enonce: string;
  reponse: boolean;
  justification: string;
}

export interface ExerciceQuizSuites5e {
  variante: VarianteQuizSuites5e;
  question: QuestionVraiFaux5e;
}

export type GenerateurExerciceQuizSuites5e = () => ExerciceQuizSuites5e;
