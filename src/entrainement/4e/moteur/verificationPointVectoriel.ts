/**
 * Couche B — vérification pour "Point à partir d'une relation vectorielle" (chapitre "Calcul
 * vectoriel", premier générateur). Un seul champ à vérifier au sens mathématique (les coordonnées
 * du point cherché), toujours comparé à `exercice.reponse` — jamais recalculé différemment selon la
 * variante, `reponse` est déjà la vraie valeur calculée à la génération (Couche A).
 */
import type { ExercicePointVectoriel } from "../core/pointVectoriel.types";
import type { StatutVerification } from "./statutVerification";

const TOLERANCE = 0.01;

/** Statut par champ SÉPARÉ — même principe que "Point à partir d'une relation vectorielle" (version
 * guidée, position 20) : isoler une éventuelle erreur de signe sur une seule coordonnée plutôt que
 * de la noyer dans le couple combiné, pour marquer en rouge le SEUL champ fautif côté écran. */
export function diagnostiquerX(exercice: ExercicePointVectoriel, x: number): StatutVerification {
  if (!Number.isFinite(x)) return "parse_error";
  return Math.abs(x - exercice.reponse.x) <= TOLERANCE ? "correct" : "not_equivalent";
}

export function diagnostiquerY(exercice: ExercicePointVectoriel, y: number): StatutVerification {
  if (!Number.isFinite(y)) return "parse_error";
  return Math.abs(y - exercice.reponse.y) <= TOLERANCE ? "correct" : "not_equivalent";
}

export function diagnostiquerCoordonnees(exercice: ExercicePointVectoriel, x: number, y: number): StatutVerification {
  if (!Number.isFinite(x) || !Number.isFinite(y)) return "parse_error";
  const dx = Math.abs(x - exercice.reponse.x);
  const dy = Math.abs(y - exercice.reponse.y);
  return dx <= TOLERANCE && dy <= TOLERANCE ? "correct" : "not_equivalent";
}

export function verifierCoordonnees(exercice: ExercicePointVectoriel, x: number, y: number): boolean {
  return diagnostiquerCoordonnees(exercice, x, y) === "correct";
}
