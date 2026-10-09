import type { ExercicePDRT_B, Point } from "../../core6e/pointsDroitesRemarquablesTriangle.types";
import { tirerEntier, tirerParmi } from "./aleatoire";
import { VECTEURS_LONGUEUR_ENTIERE, determinant } from "./geometrie";
import { simplifier, versNombre } from "./fraction";

/**
 * Couche A (6e) — famille B de `6gen54` : bissectrice issue de B, coupant [AC] en I, avec
 * AI/IC=AB/BC (théorème de la bissectrice). A et C sont construits depuis B via des vecteurs de
 * longueur ENTIÈRE (`VECTEURS_LONGUEUR_ENTIERE`) — sans cela, AB/BC serait un rapport de racines
 * carrées quelconques, impossible à donner comme rapport d'entiers "propre" à l'écran 2. I lui-même
 * reste une fraction exacte (dénominateur AB+BC, rarement 1) — `IFrac`.
 */

function pointAleatoire(): Point {
  return { x: tirerEntier(-6, 6), y: tirerEntier(-6, 6) };
}

export function construireFamilleB(): ExercicePDRT_B {
  const B = pointAleatoire();
  let vA: { dx: number; dy: number; longueur: number };
  let vC: { dx: number; dy: number; longueur: number };
  do {
    vA = tirerParmi(VECTEURS_LONGUEUR_ENTIERE);
    vC = tirerParmi(VECTEURS_LONGUEUR_ENTIERE);
  } while (determinant({ x: vA.dx, y: vA.dy }, { x: vC.dx, y: vC.dy }) === 0);

  const A: Point = { x: B.x + vA.dx, y: B.y + vA.dy };
  const C: Point = { x: B.x + vC.dx, y: B.y + vC.dy };
  const AB = vA.longueur;
  const BC = vC.longueur;

  const IxFrac = simplifier(BC * A.x + AB * C.x, AB + BC);
  const IyFrac = simplifier(BC * A.y + AB * C.y, AB + BC);
  const I: Point = { x: versNombre(IxFrac), y: versNombre(IyFrac) };

  return { famille: "B", A, B, C, AB, BC, IFrac: { x: IxFrac, y: IyFrac }, I };
}
