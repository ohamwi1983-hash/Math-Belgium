/**
 * Couche core — contrat pour "Cercle trigonométrique & triangles quelconques" (quiz vrai/faux gen63,
 * chapitre 5 de 4e). Structure identique aux
 * 4 quiz précédents (gen59/gen60/gen61/gen62) : mono-écran, une seule tentative, thème choisi par
 * l'élève.
 */
export type VarianteQuizCercleTriangles =
  | "placementCercle"
  | "identiteFondamentale"
  | "valeursRemarquables"
  | "anglesAssocies"
  | "resoudreAngle"
  | "equationsContexte"
  | "triangleQuelconque"
  | "aireCasAmbigu"
  | "trianglesLies"
  | "forcesCaps";

/** `enonce` et `justification` : chaînes `RichText` (`$…$` = LaTeX en ligne), rendues par
 * `components/TexteRiche.tsx` à l'écran et par `lib/banquesVraiFaux.ts` sur papier. */
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
