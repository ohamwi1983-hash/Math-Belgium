/**
 * Couche core (5e) — contrat pour "Trigonométrie" (quiz vrai/faux, chapitre 2, 5gen40). Réplique
 * mécaniquement le contrat du quiz vrai/faux chapitre 1 (`core5e/quizFonctions5e.types.ts`, 5gen39),
 * adapté aux thèmes propres à ce chapitre 5e — jamais de contrat partagé entre les deux chantiers
 * (CLAUDE.md, "Chantier 5e FWB (4h)"), ni entre deux chapitres du même chantier.
 */
export type VarianteQuizTrigonometrie5e =
  | "arcsEtSecteurs"
  | "parametresSinusoide"
  | "graphesSinusoides"
  | "equationsTrigonometriques"
  | "identitesEtFactorisation"
  | "extremumsSinusoide"
  | "geometrieEtModelisation";

export interface QuestionVraiFaux5e {
  enonce: string;
  reponse: boolean;
  justification: string;
}

export interface ExerciceQuizTrigonometrie5e {
  variante: VarianteQuizTrigonometrie5e;
  question: QuestionVraiFaux5e;
}

export type GenerateurExerciceQuizTrigonometrie5e = () => ExerciceQuizTrigonometrie5e;
