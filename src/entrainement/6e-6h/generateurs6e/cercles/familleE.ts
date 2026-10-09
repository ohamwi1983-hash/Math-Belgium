import type { DonneesTriangleInscrit, ExerciceCerclesE } from "../../core6e/cercles.types";
import type { Point } from "./geometrie";
import { aireTriangle, distance, sontAlignes, tirerEntier } from "./geometrie";

/**
 * Couche A (6e) — génération, famille E ("Cercle inscrit à un triangle") de `6gen55`.
 *
 * **RÉUTILISATION PAR LA FAMILLE G** (exigence explicite de la mission) : `construireDepuisTriangle`
 * est la SEULE fonction qui calcule côtés/incentre/rayon depuis 3 sommets quelconques — exportée
 * pure (aucun tirage aléatoire à l'intérieur), importée TELLE QUELLE par `familleG.ts` après que
 * celle-ci a trouvé les 3 sommets par intersection de droites. Jamais réimplémentée : `familleG.ts`
 * ne connaît que `construireDepuisTriangle`, jamais le détail de la formule barycentrique.
 */
export function calculerCotes(A: Point, B: Point, C: Point): { a: number; b: number; c: number } {
  return { a: distance(B, C), b: distance(C, A), c: distance(A, B) };
}

/** Incentre = moyenne barycentrique des sommets, pondérée par le côté OPPOSÉ à chacun. Rayon =
 * aire/demi-périmètre (formule classique du cercle inscrit). */
export function construireDepuisTriangle(A: Point, B: Point, C: Point): DonneesTriangleInscrit {
  const { a, b, c } = calculerCotes(A, B, C);
  const perimetre = a + b + c;
  const incentreX = (a * A.x + b * B.x + c * C.x) / perimetre;
  const incentreY = (a * A.y + b * B.y + c * C.y) / perimetre;
  const aire = aireTriangle(A, B, C);
  const rayon = aire / (perimetre / 2);
  return { A, B, C, a, b, c, incentreX, incentreY, rayon };
}

function tirerPoint(): Point {
  return { x: tirerEntier(-6, 6), y: tirerEntier(-6, 6) };
}

/** Triangle non dégénéré (aire strictement positive, sommets distincts) — coordonnées entières,
 * quitte à donner des côtés irrationnels (aucune contrainte de "joliesse" imposée par l'énoncé pour
 * cette famille). */
export function construireFamilleE(): ExerciceCerclesE {
  let A: Point;
  let B: Point;
  let C: Point;
  do {
    A = tirerPoint();
    B = tirerPoint();
    C = tirerPoint();
  } while (sontAlignes(A, B, C));

  return { famille: "E", ...construireDepuisTriangle(A, B, C) };
}
