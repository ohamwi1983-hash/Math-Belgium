import type { ExerciceCerclesC } from "../../core6e/cercles.types";
import type { DroiteAffine, Point } from "./geometrie";
import { distance, intersectionDroites, mediatrice, tirerEntier } from "./geometrie";

/**
 * Couche A (6e) — génération, famille C ("Cercle par 2 points, centre sur une droite donnée") de
 * `6gen55`. Partage la construction de la médiatrice avec `familleB.ts` (A,B choisis pour que (AB)
 * ne soit ni verticale ni horizontale — voir son en-tête) — mais PAS le fichier lui-même, chaque
 * famille reste autonome (mirroir de la structure du projet, une famille = un fichier). La droite
 * `d` est tirée avec une pente DIFFÉRENTE de celle de la médiatrice (retirage sinon), garantissant
 * une intersection unique — jamais de parallélisme, condition explicite de l'énoncé.
 */

function tirerPoint(): Point {
  return { x: tirerEntier(-6, 6), y: tirerEntier(-6, 6) };
}

function tirerDroiteDifferenteDe(pente: number): DroiteAffine {
  let md: number;
  do {
    md = tirerEntier(-4, 4);
  } while (Math.abs(md - pente) < 1e-6);
  const pd = tirerEntier(-6, 6);
  return { m: md, p: pd };
}

export function construireFamilleC(): ExerciceCerclesC {
  let A: Point;
  let B: Point;
  do {
    A = tirerPoint();
    B = tirerPoint();
  } while (A.x === B.x || A.y === B.y);

  const med = mediatrice(A, B);
  const d = tirerDroiteDifferenteDe(med.m);

  const centre = intersectionDroites(med, d);
  if (!centre) return construireFamilleC(); // défense en profondeur — ne devrait jamais arriver.

  const rayon = distance(centre, A);

  return { famille: "C", A, B, d, mediatrice: med, centre, rayon };
}
