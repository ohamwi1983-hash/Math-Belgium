/**
 * Couche core — contrat pour "Géométrie analytique plane" (quiz vrai/faux, chapitre 6 dans la
 * nomenclature du projet — `docs/liste-generateurs.md`, gen42-54, sous-groupe "Géométrie
 * analytique (droites et cercles)"). Structure identique aux 6 quiz précédents (gen59-64) :
 * mono-écran, une seule tentative, thème choisi par l'élève.
 *
 * 13 thèmes, un par générateur (gen42 à gen54) — contrairement à "Calcul vectoriel" (gen64), aucun
 * doublon de contenu mathématique ici entre deux générateurs distincts, donc aucune fusion de
 * thèmes : chaque générateur teste une compétence distincte (extraction de données différente,
 * forme de sortie différente, ou concept géométrique différent). Exclut délibérément gen39-41
 * ("Géométrie dans l'espace", autre sous-chapitre) et gen55-58 (autres chapitres) — hors périmètre
 * de "Géométrie analytique plane".
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
  | "lieuxGeometriques";

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
