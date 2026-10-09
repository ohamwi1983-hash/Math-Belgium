import type { ExercicePDRT_E, Point } from "../../core6e/pointsDroitesRemarquablesTriangle.types";
import { tirerEntier } from "./aleatoire";
import { ligneParDeuxPoints, milieu, parallelePassantPar, pointSurDroite, pointsEgaux } from "./geometrie";

/**
 * Couche A (6e) — famille E de `6gen54` : P, A, B donnés, droites passant par P équidistantes de A
 * et de B. 2 solutions structurelles : la parallèle à (AB) passant par P, et la droite passant par
 * P et le milieu de [AB] — **piège central** : n'identifier que l'une des deux (la « parallèle » est
 * souvent oubliée). `P` ne doit être ni sur (AB) (sinon les 2 constructions coïncident avec (AB)
 * elle-même) ni confondu avec le milieu de [AB] (sinon la 2ᵉ construction serait indéterminée).
 *
 * **BUG trouvé et corrigé (vérification Playwright manuelle, build de production)** : A, B tirés à
 * coordonnées entières QUELCONQUES rendaient `milieu(A,B)` parfois demi-entier, produisant des
 * coefficients décimaux dans `droiteMilieu` — violation de "jamais de décimal pour une valeur
 * générée" (CLAUDE.md). Fix, même technique que `familleA.ts`/`familleD.ts` : A et B (les 2 points
 * dont le milieu sert de construction) tirés à coordonnées PAIRES — `P` n'a pas cette contrainte
 * (aucun milieu ne le concerne).
 */

function pointAleatoire(): Point {
  return { x: tirerEntier(-6, 6), y: tirerEntier(-6, 6) };
}

function pointAleatoirePair(): Point {
  return { x: 2 * tirerEntier(-6, 6), y: 2 * tirerEntier(-6, 6) };
}

export function construireFamilleE(): ExercicePDRT_E {
  let P: Point, A: Point, B: Point;
  for (;;) {
    P = pointAleatoire();
    A = pointAleatoirePair();
    B = pointAleatoirePair();
    if (A.x === B.x && A.y === B.y) continue;
    const droiteAB = ligneParDeuxPoints(A, B);
    if (pointSurDroite(P, droiteAB)) continue;
    if (pointsEgaux(P, milieu(A, B))) continue;
    break;
  }
  const droiteAB = ligneParDeuxPoints(A, B);
  const droiteParallele = parallelePassantPar(droiteAB, P);
  const droiteMilieu = ligneParDeuxPoints(P, milieu(A, B));
  return { famille: "E", P, A, B, droiteParallele, droiteMilieu };
}
