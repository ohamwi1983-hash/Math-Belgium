/**
 * Couche core — contrat pour "Cercle trigonométrique & triangles quelconques" (quiz vrai/faux,
 * chapitre 3 dans la nomenclature du projet — `docs/liste-generateurs.md`). Structure identique aux
 * 4 quiz précédents (gen59/gen60/gen61/gen62) : mono-écran, une seule tentative, thème choisi par
 * l'élève.
 */
export type VarianteQuizCercleTriangles =
  | "placementCercle"
  | "valeursRemarquables"
  | "identiteFondamentale"
  | "anglesAssocies"
  | "resoudreAngle"
  | "triangleQuelconque"
  | "trianglesLies";

export interface QuestionVraiFaux {
  enonce: string;
  reponse: boolean;
  justification: string;
}

export interface ExerciceQuizCercleTriangles {
  variante: VarianteQuizCercleTriangles;
  question: QuestionVraiFaux;
}

export type GenerateurExerciceQuizCercleTriangles = () => ExerciceQuizCercleTriangles;
