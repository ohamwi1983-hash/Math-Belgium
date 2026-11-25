import type { ExerciceIntersectionB, ExerciceIntersectionsConiques } from "../core6e/intersectionsConiques.types";
import type { Attente } from "./attentesCombinatoire";
import { diagnostiquerAttentes } from "./attentesCombinatoire";
import type { DefinitionSession } from "./sessionCombinatoire";
import { phasesPourExercice } from "./typesIntersectionsConiques";
import type { PhaseIntersectionsConiques } from "./typesIntersectionsConiques";
import { polyAdd, polyCercle, polyConst, polyDroite, polyMul, polyScal, polyVar, ptNum, q } from "./algebreLieux";
import type { Poly } from "./algebreLieux";
import { polyConique } from "./algebreConiques";
import { champEquation, champNombre, champPoint, champPoints } from "./saisieLieux";
import { champCoupleProportionnel } from "./saisieConiques";

/**
 * Attentes des écrans de `6gen61` (audit du 6e ch. 10, lots B et C) : équations comparées par
 * PROPORTIONNALITÉ EXACTE (fini le cercle accepté pour une ellipse, G17) ; l'équation en x est acceptée
 * sous TOUTE forme proportionnelle — divisée par le pgcd ou non, avec des fractions (G17 : 57 % de
 * discriminants justes refusés) ; points exacts, dans n'importe quel ordre.
 */

type E = ExerciceIntersectionsConiques;
type P = PhaseIntersectionsConiques;

export function polyEquationX(eq: [bigint, bigint, bigint]): Poly {
  const x = polyVar("x");
  return polyAdd(polyAdd(polyScal(polyMul(x, x), q(eq[0])), polyScal(x, q(eq[1]))), polyConst(q(eq[2])));
}

export function polyCercleB(e: ExerciceIntersectionB): Poly {
  return polyCercle(e.centre, q(e.rayon * e.rayon));
}

export function attentesIntersectionsConiques(e: E, p: P): Attente[] {
  if (e.famille === "A") {
    switch (p) {
      case "aConique":
        return [{ verif: champEquation(polyConique(e.conique)) }];
      case "aDroite":
        return [{ verif: champEquation(polyDroite(e.droite), { droite: true }) }];
      case "aEquationX":
        return [{ verif: champEquation(polyEquationX(e.eq), { variables: ["x"] }) }];
      case "aNombre":
        return [{ choix: String(e.verdict) }];
      default:
        return [{ verif: champPoints(e.points.map(ptNum)) }];
    }
  }
  switch (p) {
    case "bCouple":
      return [{ verif: champCoupleProportionnel(e.lambda, e.mu) }];
    case "bCercle":
      return [{ verif: champEquation(polyCercleB(e)) }];
    default:
      return [{ verif: champPoint(ptNum(e.centre)) }, { verif: champNombre(e.rayon) }];
  }
}

export const DEFINITION_6GEN61: DefinitionSession<E, P> = {
  phases: phasesPourExercice,
  diagnostiquer: (e, p, v) => diagnostiquerAttentes(attentesIntersectionsConiques(e, p), v),
  estChoix: (_e, p) => p === "aNombre",
};
