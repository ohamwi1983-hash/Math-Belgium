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

/** Plafond de chaque composante de la cible `coefficient * \vec{AB}` — au-delà, le vecteur à
 * tracer ne tient plus confortablement dans la fenêtre du graphe (signalement chapitre 6, point 17). */
const CIBLE_COMPOSANTE_MAX = 12;
/** Quand |coefficient| = 3, chaque composante de \vec{AB} reste ≤ 3 (cible ≤ 9). */
const AB_COMPOSANTE_MAX_SI_TRIPLE = 3;

function tirageAcceptable(pointA: { x: number; y: number }, pointB: { x: number; y: number }, coefficient: number): boolean {
  const dx = pointB.x - pointA.x;
  const dy = pointB.y - pointA.y;
  if (dx === 0 && dy === 0) return false;
  if (Math.abs(coefficient) === 3 && (Math.abs(dx) > AB_COMPOSANTE_MAX_SI_TRIPLE || Math.abs(dy) > AB_COMPOSANTE_MAX_SI_TRIPLE)) return false;
  return Math.abs(coefficient * dx) <= CIBLE_COMPOSANTE_MAX && Math.abs(coefficient * dy) <= CIBLE_COMPOSANTE_MAX;
}

export const genererExerciceConstructionVectorielle: GenerateurExerciceConstructionVectorielle = () => {
  // Le coefficient est tiré d'abord (distribution uniforme conservée), puis B est re-tiré jusqu'à
  // respecter les plafonds ci-dessus — toujours atteignable (B voisin de A convient à tout coefficient).
  const coefficient = COEFFICIENTS[randomInt(0, COEFFICIENTS.length - 1)];
  const pointA = pointAleatoire(-4, 4);
  let pointB = pointAleatoire(-4, 4);
  while (!tirageAcceptable(pointA, pointB, coefficient)) {
    pointB = pointAleatoire(-4, 4);
  }

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
