/**
 * Couche A — contrat du générateur "Simplifier" (fractions rationnelles avec CE, exercice 14).
 * Comme les deux autres verticales, ce module ne doit jamais importer quoi que ce soit de
 * src/moteur. Contrairement à elles, il réutilise délibérément le contrat Exercice de l'exercice
 * "méthode la plus rapide" (voir le plan) pour tout polynôme du 2nd degré de la fraction — c'est
 * ce qui permet de réutiliser directement sa mécanique de reconnaissance de méthode.
 */

import type { Exercice } from "./generateur.types";

export type TypeFraction = "P2/P2" | "P1/P2" | "P2/P1";

/** Polynôme du 1er degré k(x - p), k ≠ 0 — pas de technique à reconnaître, juste sa racine p. */
export interface PolynomeLineaire {
  k: number;
  p: number;
}

export interface ExerciceSimplification {
  type: TypeFraction;
  /** racine commune imposée au numérateur et au dénominateur (section 2 de la spec) */
  racineCommune: number;
  /** un Exercice (P2) pour P2/P2 et P1/P2 ; un PolynomeLineaire (P1) pour P2/P1 */
  denominateur: Exercice | PolynomeLineaire;
  /** un Exercice (P2) pour P2/P2 et P2/P1 ; un PolynomeLineaire (P1) pour P1/P2 */
  numerateur: Exercice | PolynomeLineaire;
}

export type GenerateurExerciceSimplification = () => ExerciceSimplification;
