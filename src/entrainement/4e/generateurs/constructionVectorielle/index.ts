/**
 * Couche A — "Construction graphique de vecteurs sur grille" (chapitre "Calcul vectoriel",
 * quatrième générateur). Deux points A, B distincts (le vecteur de référence \vec{AB}) et un
 * coefficient non nul — l'élève doit tracer `coefficient * \vec{AB}` sur la grille, à partir de
 * n'importe quel point d'ancrage (aucun ancrage imposé, voir `core/constructionVectorielle.types.ts`).
 */
import type { ExerciceConstructionVectorielle, GenerateurExerciceConstructionVectorielle } from "../../core/constructionVectorielle.types";
import { randomInt } from "./aleatoire";

const COEFFICIENTS = [-3, -2, -1, 1, 2, 3];

function pointAleatoire(min: number, max: number): { x: number; y: number } {
  return { x: randomInt(min, max), y: randomInt(min, max) };
}

export const genererExerciceConstructionVectorielle: GenerateurExerciceConstructionVectorielle = () => {
  const pointA = pointAleatoire(-4, 4);
  let pointB = pointAleatoire(-4, 4);
  while (pointA.x === pointB.x && pointA.y === pointB.y) {
    pointB = pointAleatoire(-4, 4);
  }

  const coefficient = COEFFICIENTS[randomInt(0, COEFFICIENTS.length - 1)];

  const exercice: ExerciceConstructionVectorielle = {
    pointA,
    labelA: "A",
    pointB,
    labelB: "B",
    coefficient,
    cibleComposantes: {
      x: coefficient * (pointB.x - pointA.x),
      y: coefficient * (pointB.y - pointA.y),
    },
  };
  return exercice;
};
