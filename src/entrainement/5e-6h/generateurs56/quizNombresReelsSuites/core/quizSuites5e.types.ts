// Copie 5e (6h) de `5e-4h/core5e/quizSuites5e.types.ts` (56gen13 ← 5gen41, chantier D du 26/11/2026) — copiée pour que les deux années puissent diverger.
/**
 * Couche core (5e) — contrat pour "Suites" (quiz vrai/faux, chapitre 3, 5gen41). Réplique
 * mécaniquement le contrat du quiz vrai/faux chapitre 2 (`core5e/quizTrigonometrie5e.types.ts`,
 * 5gen40) et chapitre 1 (`core5e/quizFonctions5e.types.ts`, 5gen39), adapté aux thèmes propres à ce
 * chapitre 5e — jamais de contrat partagé entre les deux chantiers (CLAUDE.md, "Chantier 5e FWB
 * (4h)"), ni entre deux chapitres du même chantier.
 */
export type VarianteQuizSuites5e =
  | "irrationnels"
  | "ecrituresDecimales"
  | "quantificateursAxiomes"
  | "valeurAbsolue"
  | "densiteApproximation"
  | "suitesArithmetiques"
  | "suitesGeometriques"
  | "convergenceDivergence"
  | "problemesClassiques"
  | "comparaisonNumerique"
  | "suiteRecurrenteAffine"
  | "transversal"
  | "interetsSimplesComposes"
  | "tauxEquivalents"
  | "annuites"
  | "creditTaeg";

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
