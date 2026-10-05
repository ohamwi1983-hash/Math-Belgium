import type { Point3D, Solide3D } from "../core/geometrieEspace.types";
import type { ExerciceOmbreSoleil, ObstacleAResoudre, ObstacleOmbreSoleil, Piquet, PiquetAResoudre } from "../core/ombreSoleil.types";
import { additionner3D, distance3D, intersectionAvecSolide, intersectionDroitePlan } from "./geometrieEspace";

/**
 * Couche B — vérification "Ombre au soleil" (41e générateur, chapitre "Géométrie dans l'espace").
 * Logique CATÉGORIELLE pure (sélection parmi des candidats, jamais de saisie libre) — aucun statut
 * à 3 valeurs `StatutVerification` ici, aucune équivalence algébrique à tester (spec, section
 * "Vérification").
 *
 * **N'importe jamais `src/generateurs/ombreSoleil/`** (règle Couche A↔B non négociable) — réutilise
 * en revanche directement `intersectionDroitePlan`/`intersectionAvecSolide` (moteur de vérité
 * terrain PARTAGÉ du chapitre, import moteur→moteur, même principe que
 * `verifierReponseParallele`/`verifierReponseSecante` de "Position droite/plan") pour le sol et pour
 * tout solide-obstacle (caisse ou escalier) — plus de logique bespoke "mur plat" depuis l'extension
 * de "Ombre au soleil".
 *
 * **Chaque candidat est vérifié GÉOMÉTRIQUEMENT** (comparaison de vecteurs/points réels), jamais
 * par comparaison d'un identifiant stocké contre un autre — même principe que
 * `verifierReponseParallele`/`verifierReponseSecante` ("Position droite/plan"). La comparaison de
 * direction utilise une égalité de VECTEURS (jamais `sontParalleles3D`, qui ignore le sens : la
 * direction opposée d'un candidat distracteur donnerait une ombre entièrement fausse, pas
 * simplement "sur la même droite").
 */

const EPSILON_OMBRE = 1e-6;

export function sommetPiquet(piquet: Piquet): Point3D {
  return { x: piquet.base.x, y: piquet.base.y, z: piquet.hauteur };
}

const PLAN_SOL: [Point3D, Point3D, Point3D] = [
  { x: 0, y: 0, z: 0 },
  { x: 1, y: 0, z: 0 },
  { x: 0, y: 1, z: 0 },
];

export function intersectionAvecSol(origine: Point3D, direction: Point3D): Point3D {
  const cible = additionner3D(origine, direction);
  return intersectionDroitePlan([origine, cible], PLAN_SOL) ?? { x: origine.x, y: origine.y, z: 0 };
}

/** Solide de COLLISION d'un obstacle — DUPLIQUÉ (jamais importé) depuis `generateurs/ombreSoleil/index.ts`,
 * même principe que le reste du chapitre : exclut les 2 faces de profil de l'escalier (polygones en
 * escalier CONCAVES, jamais réductibles à un simple rectangle axis-aligned), garde ses faces
 * latérales (déjà rectangulaires) — une caisse n'a, elle, que des faces déjà rectangulaires.
 * **Exportée** (contrairement au reste des primitives internes de ce fichier) : `ui/formatOmbreSoleil.ts`
 * en a besoin pour construire l'aperçu du candidat "point" de la variante `obstacle` — même
 * principe déjà établi par ce fichier de réutiliser `ombreDepuis`/`sommetPiquet`/`verifierDirection`
 * directement depuis la présentation, jamais une troisième duplication. */
export function solideCollision(obstacle: ObstacleOmbreSoleil): Solide3D {
  if (obstacle.type !== "escalier") return obstacle.solide;
  return { ...obstacle.solide, faces: obstacle.solide.faces.slice(2) };
}

export function ombreDepuis(origine: Point3D, direction: Point3D, obstacle?: Solide3D): Point3D {
  if (obstacle) {
    const impact = intersectionAvecSolide(origine, direction, obstacle);
    if (impact) return impact;
  }
  return intersectionAvecSol(origine, direction);
}

function resoudreDirection(exercice: ExerciceOmbreSoleil, id: string): Point3D | null {
  return exercice.directionsCandidates.find((d) => d.id === id)?.vecteur ?? null;
}

/** Écran "direction" (variantes B/C, étape 0 de C incluse) : le candidat choisi doit être
 * RÉELLEMENT la direction de lumière cachée de l'exercice. */
export function verifierDirection(exercice: ExerciceOmbreSoleil, id: string): boolean {
  const vecteur = resoudreDirection(exercice, id);
  if (!vecteur) return false;
  return distance3D(vecteur, exercice.direction) < EPSILON_OMBRE;
}

/** Écran "point" (variante A directe, ou boucle de la variante C) : le candidat choisi doit
 * réellement projeter ce piquet à l'endroit exact de sa vérité terrain déjà calculée — recalculé
 * ici depuis le vecteur candidat (jamais une comparaison d'identifiant). Toujours contre le sol
 * seul : aucun consommateur restant ne passe d'obstacle à cette fonction (la variante B a désormais
 * sa propre `verifierPointObstacle`, ci-dessous, testant contre un solide réel). */
export function verifierPointOmbre(exercice: ExerciceOmbreSoleil, piquetResoudre: PiquetAResoudre, id: string): boolean {
  const vecteur = resoudreDirection(exercice, id);
  if (!vecteur) return false;
  const point = ombreDepuis(sommetPiquet(piquetResoudre.piquet), vecteur, undefined);
  return distance3D(point, piquetResoudre.ombre) < EPSILON_OMBRE;
}

/** Écran "point" de la boucle de la variante B — une itération par solide-obstacle (jamais par
 * face/marche) : le candidat choisi doit réellement projeter le BÂTON à l'endroit exact de la
 * vérité terrain déjà calculée pour CET obstacle précis (`obstacleResoudre.ombre`, testé en
 * isolation contre ce seul solide — voir `core/ombreSoleil.types.ts::ObstacleAResoudre`). */
export function verifierPointObstacle(exercice: ExerciceOmbreSoleil, origine: Point3D, obstacleResoudre: ObstacleAResoudre, id: string): boolean {
  const vecteur = resoudreDirection(exercice, id);
  if (!vecteur) return false;
  const point = ombreDepuis(origine, vecteur, solideCollision(obstacleResoudre.obstacle));
  return distance3D(point, obstacleResoudre.ombre) < EPSILON_OMBRE;
}
