/**
 * Couche core — contrat pour "Calcul vectoriel" (quiz vrai/faux, chapitre 4 dans la nomenclature du
 * projet — `docs/liste-generateurs.md`, gen20-29). Structure identique aux 5 quiz précédents
 * (gen59/gen60/gen61/gen62/gen63) : mono-écran, une seule tentative, thème choisi par l'élève.
 *
 * 12 thèmes : un par grande notion de gen20–29 (`relationVectorielle` couvre gen20 et gen21, même
 * contenu mathématique sous deux présentations), plus trois thèmes pour gen82–90 (lot E de l'audit du
 * chapitre 6) : `decomposerDemontrer` (gen82, gen85), `quadrilateresConstructions` (gen83, gen84),
 * `vecteursContexte` (gen86–90).
 */
export type VarianteQuizCalculVectoriel =
  | "decomposerDemontrer"
  | "quadrilateresConstructions"
  | "vecteursContexte"
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
