import type {
  ExerciceFormeCanoniqueTransformation,
  GenerateurExerciceFormeCanoniqueTransformation,
} from "../../core/formeCanoniqueTransformations.types";

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Implémentation de la Couche A pour "Forme canonique et transformations" (section 1 de la spec) :
 * xS et yS tirés indépendamment comme de petits entiers dans [-5,5] ; ev/cv tirés indépendamment,
 * chacun un entier dans [1,5], sans contrainte d'exclusivité — même principe que "Transformations
 * graphiques" (`|a| = ev/cv` couvre nativement entiers, fractions unitaires et vrais rapports non
 * triviaux). sox tiré indépendamment et uniformément pour le signe.
 */
export const genererExerciceFormeCanoniqueTransformation: GenerateurExerciceFormeCanoniqueTransformation = () => {
  const xS = randomInt(-5, 5);
  const yS = randomInt(-5, 5);

  const ev = randomInt(1, 5);
  const cv = randomInt(1, 5);

  const sox = Math.random() < 0.5;

  const exercice: ExerciceFormeCanoniqueTransformation = { xS, yS, ev, cv, sox };
  return exercice;
};
