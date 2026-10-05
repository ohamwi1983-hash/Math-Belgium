/**
 * Couche core (5e) — contrat pour "Limites et asymptotes" (quiz vrai/faux, chapitre 4, 5gen42).
 * Réplique mécaniquement le contrat du quiz vrai/faux chapitre 3 (`core5e/quizSuites5e.types.ts`,
 * 5gen41), chapitre 2 (`core5e/quizTrigonometrie5e.types.ts`, 5gen40) et chapitre 1
 * (`core5e/quizFonctions5e.types.ts`, 5gen39), adapté aux thèmes propres à ce chapitre 5e — jamais
 * de contrat partagé entre les deux chantiers (CLAUDE.md, "Chantier 5e FWB (4h)"), ni entre deux
 * chapitres du même chantier.
 */
export type VarianteQuizLimites5e =
  | "reconnaissanceEtCalcul"
  | "asymptoteOblique"
  | "lectureGraphique"
  | "limitesEnContexte"
  | "etudeComplete"
  | "piegesClassiques"
  | "transversal";

export interface QuestionVraiFaux5e {
  enonce: string;
  reponse: boolean;
  justification: string;
}

export interface ExerciceQuizLimites5e {
  variante: VarianteQuizLimites5e;
  question: QuestionVraiFaux5e;
}

export type GenerateurExerciceQuizLimites5e = () => ExerciceQuizLimites5e;
