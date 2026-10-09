import type { ExercicePDRT_A, Point } from "../../core6e/pointsDroitesRemarquablesTriangle.types";
import { tirerEntier } from "./aleatoire";
import { determinant, milieu } from "./geometrie";

/**
 * Couche A (6e) — famille A de `6gen54` : A', B', C' (milieux de [BC],[CA],[AB]) donnés, retrouver
 * A, B, C via A=B'+C'−A' (et les relations analogues).
 *
 * **Coordonnées toujours PAIRES** pour A, B, C (`pointAleatoire`) : la somme de deux entiers pairs
 * est paire, donc TOUT milieu (A', B', C') tombe automatiquement sur un entier — jamais besoin de
 * fraction ici (contrairement aux familles B et C), en échange d'un tirage légèrement plus large.
 */

function pointAleatoire(): Point {
  return { x: 2 * tirerEntier(-6, 6), y: 2 * tirerEntier(-6, 6) };
}

/** Aire doublée (déterminant) — sert seulement à écarter un triangle dégénéré/trop plat. */
function aireDoublee(A: Point, B: Point, C: Point): number {
  return determinant({ x: B.x - A.x, y: B.y - A.y }, { x: C.x - A.x, y: C.y - A.y });
}

export function construireFamilleA(): ExercicePDRT_A {
  let A: Point, B: Point, C: Point;
  do {
    A = pointAleatoire();
    B = pointAleatoire();
    C = pointAleatoire();
  } while (Math.abs(aireDoublee(A, B, C)) < 16);

  const Ap = milieu(B, C);
  const Bp = milieu(C, A);
  const Cp = milieu(A, B);
  return { famille: "A", A, B, C, Ap, Bp, Cp };
}
