/**
 * Couche core — contrat pour "Géométrie dans l'espace" (quiz vrai/faux, chapitre 6 dans la
 * nomenclature du projet — `docs/liste-generateurs.md`, gen39-41, sous-groupe "Géométrie dans
 * l'espace"). Structure identique aux 7 quiz précédents (gen59-65) : mono-écran, une seule
 * tentative, thème choisi par l'élève.
 *
 * 3 thèmes, un par générateur (gen39 à gen41) — aucun doublon de contenu mathématique entre deux
 * générateurs distincts, donc aucune fusion de thèmes : chaque générateur teste une compétence
 * distincte (classification droite/plan, reconstruction d'un polygone de section, projection
 * parallèle). Exclut délibérément gen42-65 ("Géométrie analytique plane", autre sous-chapitre) et
 * gen55-58 (autres chapitres) — hors périmètre de "Géométrie dans l'espace".
 */
export type VarianteQuizGeometrieEspace = "positionDroitePlan" | "sectionPlaneSolide" | "ombreSoleil";

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
