/**
 * Couche core — contrat pour "Géométrie dans l'espace" (quiz vrai/faux, chapitre 8 de 4e). Structure
 * identique aux 7 quiz précédents (gen59-65) : mono-écran, une seule tentative, thème choisi par
 * l'élève.
 *
 * 7 thèmes qui suivent les sections du cours (`src/content/chapters/4e/geometrie-dans-espace.ts`) —
 * audit chapitre 8, points 44 et 46 : l'ancienne banque (3 thèmes calqués sur gen39-41) décrivait
 * surtout l'interface des générateurs et ignorait la moitié du cours (perspective cavalière, plans et
 * droites, parallélisme, point de percée, perspective centrale). Les identifiants des 3 thèmes
 * d'origine sont conservés.
 */
export type VarianteQuizGeometrieEspace =
  | "perspectiveCavaliere"
  | "plansEtDroites"
  | "positionDroitePlan"
  | "parallelismePercee"
  | "sectionPlaneSolide"
  | "perspectiveCentrale"
  | "ombreSoleil";

export interface QuestionVraiFaux {
  enonce: string;
  reponse: boolean;
  justification: string;
}

export interface ExerciceQuizGeometrieEspace {
  variante: VarianteQuizGeometrieEspace;
  question: QuestionVraiFaux;
}

export type GenerateurExerciceQuizGeometrieEspace = () => ExerciceQuizGeometrieEspace;
