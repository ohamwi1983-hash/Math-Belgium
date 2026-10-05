/**
 * Couche core — contrat pour "Calcul vectoriel" (quiz vrai/faux, chapitre 4 dans la nomenclature du
 * projet — `docs/liste-generateurs.md`, gen20-29). Structure identique aux 5 quiz précédents
 * (gen59/gen60/gen61/gen62/gen63) : mono-écran, une seule tentative, thème choisi par l'élève.
 *
 * 9 thèmes pour 10 générateurs : `relationVectorielle` couvre à la fois gen20 et gen21, qui testent
 * exactement le même contenu mathématique (translation/milieu/relation générale) sous 2 présentations
 * différentes (guidée vs directe) — un doublon de banque n'aurait aucune valeur pédagogique
 * supplémentaire.
 */
export type VarianteQuizCalculVectoriel =
  | "relationVectorielle"
  | "combinaisonLineaire"
  | "constructionGraphique"
  | "colinearite"
  | "orthogonalite"
  | "normeDistance"
  | "chasles"
  | "comparaisonVisuelle"
  | "applicationsPhysiques";

export interface QuestionVraiFaux {
  enonce: string;
  reponse: boolean;
  justification: string;
}

export interface ExerciceQuizCalculVectoriel {
  variante: VarianteQuizCalculVectoriel;
  question: QuestionVraiFaux;
}

export type GenerateurExerciceQuizCalculVectoriel = () => ExerciceQuizCalculVectoriel;
