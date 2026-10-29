import type { Point3D } from "../core/geometrieEspace.types";
import type { ExerciceOmbreSoleilDirectionInconnue, ExerciceOmbreSoleilObstacle, Piquet, PointCandidat } from "../core/ombreSoleil.types";
import { distance3D } from "./geometrieEspace";

/**
 * Couche B — vérification "Ombre au soleil" (41e générateur, chapitre "Géométrie dans l'espace").
 * Logique CATÉGORIELLE pure (sélection parmi des candidats, jamais de saisie libre) : un candidat
 * est juste s'il coïncide GÉOMÉTRIQUEMENT avec la vérité terrain déjà calculée par la Couche A
 * (vecteur égal à la direction de la lumière, point égal au point d'ombre), jamais par comparaison
 * d'identifiants. **N'importe jamais `src/generateurs/ombreSoleil/`.**
 */

const EPSILON_OMBRE = 1e-6;

export function sommetPiquet(piquet: Piquet): Point3D {
  return { x: piquet.base.x, y: piquet.base.y, z: piquet.hauteur };
}

/** Écran "direction" (variante obstacle) ou "directionInconnue" : le candidat choisi doit être la
 * direction réelle de la lumière (égalité de vecteurs, sens compris). */
export function verifierDirection(exercice: ExerciceOmbreSoleilObstacle | ExerciceOmbreSoleilDirectionInconnue, id: string): boolean {
  const candidat = exercice.directionsCandidates.find((d) => d.id === id);
  if (!candidat) return false;
  return distance3D(candidat.vecteur, exercice.direction) < EPSILON_OMBRE;
}

/** Écran "point" : le candidat choisi doit être le point d'ombre réel. */
export function verifierPoint(candidats: readonly PointCandidat[], ombre: Point3D, id: string): boolean {
  const candidat = candidats.find((c) => c.id === id);
  if (!candidat) return false;
  return distance3D(candidat.position, ombre) < EPSILON_OMBRE;
}
