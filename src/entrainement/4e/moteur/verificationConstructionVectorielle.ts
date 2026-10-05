/**
 * Couche B — vérification pour "Construction graphique de vecteurs sur grille" (chapitre "Calcul
 * vectoriel", quatrième générateur). Le vecteur tracé par l'élève (départ, arrivée) est comparé à
 * `exercice.cibleComposantes` par simple soustraction — indépendant du point d'ancrage choisi,
 * aucun ancrage imposé (voir `core/constructionVectorielle.types.ts`).
 */
import type { ExerciceConstructionVectorielle } from "../core/constructionVectorielle.types";
import type { Point } from "../core/vecteur.types";
import type { StatutVerification } from "./statutVerification";

const TOLERANCE = 0.05;

export function diagnostiquerConstruction(exercice: ExerciceConstructionVectorielle, depart: Point, arrivee: Point): StatutVerification {
  const dx = arrivee.x - depart.x;
  const dy = arrivee.y - depart.y;
  const ecartX = Math.abs(dx - exercice.cibleComposantes.x);
  const ecartY = Math.abs(dy - exercice.cibleComposantes.y);
  return ecartX <= TOLERANCE && ecartY <= TOLERANCE ? "correct" : "not_equivalent";
}

export function verifierConstruction(exercice: ExerciceConstructionVectorielle, depart: Point, arrivee: Point): boolean {
  return diagnostiquerConstruction(exercice, depart, arrivee) === "correct";
}
