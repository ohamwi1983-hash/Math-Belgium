import type { Point3D } from "../../core/geometrieEspace.types";
import type { Boite3D, DirectionCandidate, ObstacleOmbreSoleil, Piquet } from "../../core/ombreSoleil.types";
import { additionner3D, distance3D, multiplierScalaire3D } from "../solide3D/geometrieEspace";

/**
 * Couche A — géométrie de projection pour "Ombre au soleil" (41e générateur, chapitre "Géométrie
 * dans l'espace"). Les obstacles sont des UNIONS DE BOÎTES alignées sur les axes (une caisse = une
 * boîte, l'escalier = une boîte par colonne de marche) : l'intersection rayon/boîte (méthode des
 * « dalles ») prend en compte toutes les faces, y compris les faces de profil de l'escalier, que
 * l'ancien test face par face ignorait (audit du chapitre 8, point 33). Le premier impact de la
 * scène est toujours le t minimal sur l'ensemble des obstacles (point 34), jamais le premier
 * obstacle du tableau.
 */

export const EPSILON_OMBRE = 1e-6;

/** Sommet (point projeté) d'un piquet — le seul point utile à projeter, jamais sa base. */
export function sommetPiquet(piquet: Piquet): Point3D {
  return { x: piquet.base.x, y: piquet.base.y, z: piquet.hauteur };
}

/** Intersection avec le sol (z=0) — `direction.z` est toujours strictement négative par
 * construction (`construireDirection`). */
export function intersectionAvecSol(origine: Point3D, direction: Point3D): Point3D {
  const t = -origine.z / direction.z;
  return { x: origine.x + t * direction.x, y: origine.y + t * direction.y, z: 0 };
}

const AXES = ["x", "y", "z"] as const;

/** Paramètre d'entrée du rayon `origine + t·direction` dans une boîte (t > 0), ou `null` s'il la
 * manque — méthode des dalles. Une origine intérieure à la boîte renvoie `null` (scène incohérente,
 * rejetée en amont par la génération). */
export function entreeRayonBoite(origine: Point3D, direction: Point3D, boite: Boite3D): number | null {
  let tMin = -Infinity;
  let tMax = Infinity;
  for (const axe of AXES) {
    const o = origine[axe];
    const d = direction[axe];
    const bMin = boite.min[axe];
    const bMax = boite.max[axe];
    if (Math.abs(d) < EPSILON_OMBRE) {
      if (o < bMin || o > bMax) return null;
      continue;
    }
    const t1 = (bMin - o) / d;
    const t2 = (bMax - o) / d;
    tMin = Math.max(tMin, Math.min(t1, t2));
    tMax = Math.min(tMax, Math.max(t1, t2));
  }
  if (tMin > tMax || tMin <= EPSILON_OMBRE) return null;
  return tMin;
}

/** Premier impact du rayon sur un obstacle (union de boîtes), ou `null`. */
export function entreeRayonObstacle(origine: Point3D, direction: Point3D, obstacle: ObstacleOmbreSoleil): number | null {
  let meilleur: number | null = null;
  for (const boite of obstacle.boites) {
    const t = entreeRayonBoite(origine, direction, boite);
    if (t !== null && (meilleur === null || t < meilleur)) meilleur = t;
  }
  return meilleur;
}

export interface ImpactScene {
  point: Point3D;
  /** Index de l'obstacle touché en premier, `null` si le rayon atteint le sol. */
  indexObstacle: number | null;
  t: number;
}

/** Premier impact réel du rayon dans la scène : t minimal sur tous les obstacles, sinon le sol. */
export function impactScene(origine: Point3D, direction: Point3D, obstacles: readonly ObstacleOmbreSoleil[]): ImpactScene {
  const tSol = -origine.z / direction.z;
  let meilleur: ImpactScene = { point: intersectionAvecSol(origine, direction), indexObstacle: null, t: tSol };
  obstacles.forEach((obstacle, index) => {
    const t = entreeRayonObstacle(origine, direction, obstacle);
    if (t !== null && t < meilleur.t) {
      meilleur = { point: additionner3D(origine, multiplierScalaire3D(direction, t)), indexObstacle: index, t };
    }
  });
  return meilleur;
}

/** Tous les impacts du rayon sur les obstacles (entrée de chaque obstacle touché), triés par t. */
export function impactsObstacles(origine: Point3D, direction: Point3D, obstacles: readonly ObstacleOmbreSoleil[]): ImpactScene[] {
  const impacts: ImpactScene[] = [];
  obstacles.forEach((obstacle, index) => {
    const t = entreeRayonObstacle(origine, direction, obstacle);
    if (t !== null) impacts.push({ point: additionner3D(origine, multiplierScalaire3D(direction, t)), indexObstacle: index, t });
  });
  return impacts.sort((a, b) => a.t - b.t);
}

/** Le point (x, y) tombe dans l'emprise au sol d'une boîte, élargie de `marge`. */
export function dansEmprise(p: Point3D, boite: Boite3D, marge = 0): boolean {
  return p.x >= boite.min.x - marge && p.x <= boite.max.x + marge && p.y >= boite.min.y - marge && p.y <= boite.max.y + marge;
}

export function dansEmpriseObstacle(p: Point3D, obstacle: ObstacleOmbreSoleil, marge = 0): boolean {
  return obstacle.boites.some((b) => dansEmprise(p, b, marge));
}

/** Le point est sur la surface d'un obstacle (dans une boîte, à ε près) — sert aux contrôles. */
export function surSurfaceObstacle(p: Point3D, obstacle: ObstacleOmbreSoleil): boolean {
  const e = 1e-6;
  return obstacle.boites.some(
    (b) => p.x >= b.min.x - e && p.x <= b.max.x + e && p.y >= b.min.y - e && p.y <= b.max.y + e && p.z >= b.min.z - e && p.z <= b.max.z + e,
  );
}

// --- Projection cavalière (dupliquée de `ui/projectionCavaliere.ts` : la Couche A n'importe jamais
// la présentation) — sert uniquement à garantir des candidats DISCERNABLES à l'écran. -------------

const K_CAVALIER = Math.cos(Math.PI / 4) * 0.5;
const LARGEUR_UTILE = 400 - 2 * 36;
const HAUTEUR_UTILE = 320 - 2 * 36;

export function projeter2D(p: Point3D): { x: number; y: number } {
  return { x: p.x + K_CAVALIER * p.y, y: p.z + K_CAVALIER * p.y };
}

/** Pixels par unité du croquis (même formule que `ui/solide3DSketch.ts::calculerEchelleProjection`). */
export function echellePixel(points: readonly Point3D[]): number {
  const projetes = points.map(projeter2D);
  const xs = projetes.map((p) => p.x);
  const ys = projetes.map((p) => p.y);
  const largeur = Math.max(...xs) - Math.min(...xs) || 1;
  const hauteur = Math.max(...ys) - Math.min(...ys) || 1;
  return Math.min(LARGEUR_UTILE / largeur, HAUTEUR_UTILE / hauteur);
}

export function distancePixel(a: Point3D, b: Point3D, echelle: number): number {
  const pa = projeter2D(a);
  const pb = projeter2D(b);
  return Math.hypot(pa.x - pb.x, pa.y - pb.y) * echelle;
}

function angle2D(v: Point3D): number {
  const p = projeter2D(v);
  return Math.atan2(p.y, p.x);
}

/** Écart angulaire (en degrés, dans [0 ; 180]) entre les images à l'écran de deux directions. */
export function ecartAngulaireEcran(a: Point3D, b: Point3D): number {
  let d = Math.abs(angle2D(a) - angle2D(b)) % (2 * Math.PI);
  if (d > Math.PI) d = 2 * Math.PI - d;
  return (d * 180) / Math.PI;
}

const ECART_ANGULAIRE_MIN = 18;

/** `longueurEcran` en unités projetées (la même pour les 4 aperçus). */
function extremiteApercu(origine: Point3D, vecteur: Point3D, longueurEcran: number): Point3D {
  const p = projeter2D(vecteur);
  const longueurProjetee = Math.hypot(p.x, p.y) || 1;
  return additionner3D(origine, multiplierScalaire3D(vecteur, longueurEcran / longueurProjetee));
}

function melanger<T>(tableau: readonly T[]): T[] {
  const copie = [...tableau];
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copie[i], copie[j]] = [copie[j], copie[i]];
  }
  return copie;
}

/**
 * 4 directions candidates — la vraie + 3 pièges plausibles, tous DISCERNABLES à l'écran (écart
 * angulaire d'au moins 18° entre leurs images) : sens horizontal opposé, composantes permutées,
 * symétriques, rayon plus ou moins incliné. La verticale a été retirée (audit, point 31) : son
 * aperçu tombait tout droit et s'éliminait à l'œil. `null` si aucun trio ne convient.
 */
export function construireDirectionsCandidates(direction: Point3D, origineApercu: Point3D, longueurApercuEcran: number): DirectionCandidate[] | null {
  const { x: dx, y: dy, z: dz } = direction;
  const pool: Point3D[] = [
    { x: -dx, y: -dy, z: dz },
    { x: dy, y: dx, z: dz },
    { x: -dy, y: -dx, z: dz },
    { x: dx, y: -dy, z: dz },
    { x: -dx, y: dy, z: dz },
    { x: dx, y: dy, z: 2 * dz },
    { x: 2 * dx, y: 2 * dy, z: dz },
    { x: -dx, y: -dy, z: 2 * dz },
    { x: dy, y: dx, z: 2 * dz },
  ].filter((v) => distance3D(v, direction) > EPSILON_OMBRE);

  const retenus: Point3D[] = [direction];
  for (const v of melanger(pool)) {
    if (retenus.length === 4) break;
    if (retenus.every((r) => ecartAngulaireEcran(r, v) >= ECART_ANGULAIRE_MIN)) retenus.push(v);
  }
  if (retenus.length < 4) return null;
  return retenus.map((vecteur, i) => ({ id: `d${i}`, vecteur, extremiteApercu: extremiteApercu(origineApercu, vecteur, longueurApercuEcran) }));
}

export function vecteursEgaux(a: Point3D, b: Point3D): boolean {
  return distance3D(a, b) < EPSILON_OMBRE;
}
