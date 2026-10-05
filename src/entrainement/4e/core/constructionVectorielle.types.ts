import type { Composantes, Point } from "./vecteur.types";

export interface ExerciceConstructionVectorielle {
  pointA: Point;
  labelA: string;
  pointB: Point;
  labelB: string;
  /** Coefficient non nul — l'élève doit tracer `coefficient * \vec{AB}`. */
  coefficient: number;
  /** = coefficient * (pointB - pointA) — la cible, indépendante du point d'ancrage choisi par
   * l'élève (aucun ancrage imposé pour cet exercice, voir CLAUDE.md). */
  cibleComposantes: Composantes;
}

export type GenerateurExerciceConstructionVectorielle = () => ExerciceConstructionVectorielle;
