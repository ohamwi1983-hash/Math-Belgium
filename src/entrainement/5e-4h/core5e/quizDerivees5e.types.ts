/**
 * Couche core (5e) — contrat pour "Dérivées et applications" (quiz vrai/faux, chapitre 5, 5gen43).
 * Réplique mécaniquement le contrat du quiz vrai/faux chapitre 4 (`core5e/quizLimites5e.types.ts`,
 * 5gen42), chapitre 3 (`core5e/quizSuites5e.types.ts`, 5gen41), chapitre 2
 * (`core5e/quizTrigonometrie5e.types.ts`, 5gen40) et chapitre 1 (`core5e/quizFonctions5e.types.ts`,
 * 5gen39), adapté aux thèmes propres à ce chapitre 5e — jamais de contrat partagé entre les deux
 * chantiers (CLAUDE.md, "Chantier 5e FWB (4h)"), ni entre deux chapitres du même chantier.
 */
export type VarianteQuizDerivees5e =
  | "reconnaissanceGraphique"
  | "calculParDefinition"
  | "fonctionDerivee"
  | "tangentes"
  | "etudeLocaleEtGraphique"
  | "etudeComplete"
  | "applicationsEnContexte";

export interface QuestionVraiFaux5e {
  enonce: string;
  reponse: boolean;
  justification: string;
}

export interface ExerciceQuizDerivees5e {
  variante: VarianteQuizDerivees5e;
  question: QuestionVraiFaux5e;
}

export type GenerateurExerciceQuizDerivees5e = () => ExerciceQuizDerivees5e;
