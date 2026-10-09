import type { ExerciceCerclesF } from "../../core6e/cercles.types";
import type { DroiteAffine, Point } from "./geometrie";
import { distancePointDroite, tirerEntier } from "./geometrie";

/**
 * Couche A (6e) — génération, famille F ("Cercle avec corde de longueur donnée") de `6gen55`.
 * Construction "vers l'avant" — centre, droite `d` et longueur de corde `L` sont tous les 3 des
 * DONNÉES choisies librement, le rayon en est ENTIÈREMENT DÉDUIT (`r²=distance²+(L/2)²`) : la
 * cohérence "la corde existe bien" (`r>distance`) est donc garantie automatiquement par la formule
 * elle-même (`r²` est TOUJOURS strictement supérieur à `distance²` dès que `L>0`), jamais une
 * contrainte à vérifier après coup.
 */

function tirerDroite(): DroiteAffine {
  return { m: tirerEntier(-3, 3), p: tirerEntier(-6, 6) };
}

export function construireFamilleF(): ExerciceCerclesF {
  const centre: Point = { x: tirerEntier(-6, 6), y: tirerEntier(-6, 6) };
  const d = tirerDroite();
  const L = tirerEntier(4, 12);

  const distanceCentreDroite = distancePointDroite(centre, d);
  const rCarre = distanceCentreDroite * distanceCentreDroite + (L / 2) * (L / 2);
  const rayon = Math.sqrt(rCarre);

  return { famille: "F", centre, d, L, distanceCentreDroite, rCarre, rayon };
}
