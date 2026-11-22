/**
 * Couche core — contrat pour "Géométrie analytique plane" (quiz vrai/faux, chapitre 6 dans la
 * nomenclature du projet — `docs/liste-generateurs.md`, gen42-54, sous-groupe "Géométrie
 * analytique (droites et cercles)"). Structure identique aux 6 quiz précédents (gen59-64) :
 * mono-écran, une seule tentative, thème choisi par l'élève.
 *
 * 17 thèmes : treize suivent les anciens générateurs gen42–54, quatre regroupent les générateurs
 * récents et le § 7 (lot E de l'audit 4e ch. 7) — « Cercle : tangente, position, conditions »
 * (gen92, gen93), « Triangle, projeté, symétrique » (gen94, gen96), « Paramètres et mobiles » (gen95,
 * gen97), « Lieux et deux cercles » (§ 7, gen98).
 */
export type VarianteQuizGeometrieAnalytique =
  | "equationDroite"
  | "lectureGraphiqueDroite"
  | "constructionDroite"
  | "relationsDroites"
  | "caracteristiquesDroite"
  | "distancePointDroite"
  | "intersectionDroites"
  | "equationCercleGraphe"
  | "centreRayonCercle"
  | "equationParaboleGraphe"
  | "sommetFoyerParabole"
  | "constructionParabole"
  | "lieuxGeometriques"
  | "cercleConditions"
  | "triangleProjete"
  | "parametresMobiles"
  | "lieuxDeuxCercles";

export interface QuestionVraiFaux {
  enonce: string;
  reponse: boolean;
  justification: string;
}

export interface ExerciceQuizGeometrieAnalytique {
  variante: VarianteQuizGeometrieAnalytique;
  question: QuestionVraiFaux;
}

export type GenerateurExerciceQuizGeometrieAnalytique = () => ExerciceQuizGeometrieAnalytique;
