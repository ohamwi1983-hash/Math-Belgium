import type { Point3D, Solide3D } from "../../core/geometrieEspace.types";
import type { DirectionCandidate, Piquet } from "../../core/ombreSoleil.types";
import { additionner3D, distance3D, intersectionAvecSolide, intersectionDroitePlan } from "../solide3D/geometrieEspace";

/**
 * Couche A — géométrie de projection pour "Ombre au soleil" (41e générateur, chapitre "Géométrie
 * dans l'espace"). Module FRÈRE de `generateurs/solide3D/geometrieEspace.ts` (import
 * générateur→générateur, jamais Couche B) — réutilise directement `intersectionDroitePlan` pour le
 * cas GÉNÉRAL (sol, plan infini z=0) et `intersectionAvecSolide` pour tout solide-obstacle réel de la
 * variante `obstacle` (caisse ou escalier, testés comme un bloc ATOMIQUE via l'algorithme général
 * rayon/solide — plus de logique bespoke "mur plat", remplacée par cette réutilisation directe depuis
 * l'extension de "Ombre au soleil").
 */

export const EPSILON_OMBRE = 1e-6;

/** Sommet (point projeté) d'un piquet — le seul point utile à projeter, jamais sa base. */
export function sommetPiquet(piquet: Piquet): Point3D {
  return { x: piquet.base.x, y: piquet.base.y, z: piquet.hauteur };
}

const PLAN_SOL: [Point3D, Point3D, Point3D] = [
  { x: 0, y: 0, z: 0 },
  { x: 1, y: 0, z: 0 },
  { x: 0, y: 1, z: 0 },
];

/** Intersection avec le sol (z=0) — jamais `null` en pratique : `direction.z` est toujours
 * strictement négative par construction (`construireDirection`), donc le rayon n'est jamais
 * parallèle au sol. Repli défensif sur le point à l'aplomb de l'origine si jamais atteint. */
export function intersectionAvecSol(origine: Point3D, direction: Point3D): Point3D {
  const cible = additionner3D(origine, direction);
  return intersectionDroitePlan([origine, cible], PLAN_SOL) ?? { x: origine.x, y: origine.y, z: 0 };
}

export interface PointOmbre {
  position: Point3D;
  surObstacle: boolean;
}

/** Point d'ombre réel d'une origine (le sommet d'un piquet/bâton) selon une direction — priorité au
 * solide-obstacle s'il existe et si le rayon le touche RÉELLEMENT (`intersectionAvecSolide`, déjà
 * "premier hit" sur un solide opaque, jamais besoin d'une comparaison explicite au sol : tout hit
 * valide d'un solide posé au sol survient nécessairement avant que le rayon n'atteigne z=0), sinon
 * le sol. */
export function ombreDepuis(origine: Point3D, direction: Point3D, obstacle?: Solide3D): PointOmbre {
  if (obstacle) {
    const impact = intersectionAvecSolide(origine, direction, obstacle);
    if (impact) return { position: impact, surObstacle: true };
  }
  return { position: intersectionAvecSol(origine, direction), surObstacle: false };
}

export function ombrePiquet(piquet: Piquet, direction: Point3D, obstacle?: Solide3D): PointOmbre {
  return ombreDepuis(sommetPiquet(piquet), direction, obstacle);
}

/**
 * 4 directions candidates pour les écrans de sélection — toujours la vraie direction + 3 pièges
 * classiques (verticale, opposée, composantes horizontales permutées). `direction` doit toujours
 * vérifier `dx≠0, dy≠0, dx≠dy, dx≠-dy` (garanti par `construireDirection`) pour que les 4 candidats
 * restent deux à deux distincts.
 */
export function construireDirectionsCandidates(direction: Point3D): DirectionCandidate[] {
  const { x: dx, y: dy, z: dz } = direction;
  return [
    { id: "d0", vecteur: direction },
    { id: "d1", vecteur: { x: 0, y: 0, z: dz } },
    { id: "d2", vecteur: { x: -dx, y: -dy, z: dz } },
    { id: "d3", vecteur: { x: dy, y: dx, z: dz } },
  ];
}

/** Égalité de vecteurs à tolérance — réutilise `distance3D` (structurellement valide sur des
 * vecteurs comme sur des points, même type `Point3D`). */
export function vecteursEgaux(a: Point3D, b: Point3D): boolean {
  return distance3D(a, b) < EPSILON_OMBRE;
}
