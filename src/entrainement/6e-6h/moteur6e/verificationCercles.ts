import type { ExerciceCercles } from "../core6e/cercles.types";
import type { Attente } from "./attentesCombinatoire";
import { diagnostiquerAttentes } from "./attentesCombinatoire";
import type { DefinitionSession } from "./sessionCombinatoire";
import { phasesPourExercice } from "./typesCercles";
import type { PhaseCercles } from "./typesCercles";
import { polyAdd, polyCercle, polyConst, polyDroite, polyMul, polyScal, polySub, polyVar, ptNum, q, qNum } from "./algebreLieux";
import type { Poly, Pt } from "./algebreLieux";
import { champEquation, champNombre, champPoint, champPoints } from "./saisieLieux";

/**
 * Attentes des écrans de `6gen55` (audit du 6e ch. 9, lots B et C) : tout est EXACT et accepté en
 * chaîne (une valeur exacte d'un écran redonne la référence de l'écran suivant ; une valeur arrondie
 * est refusée sans tentative, avec un message qui demande la valeur exacte) ; équations de droite et
 * de cercle sous n'importe quelle forme équivalente (ax + by + c = 0, verticale comprise, forme
 * centre-rayon ou développée).
 */

type E = ExerciceCercles;
type P = PhaseCercles;

/** x_P·D + y_P·E + F + x_P² + y_P² = 0 (polynôme en D, E, F). */
export function polySysteme(p: Pt): Poly {
  const x = qNum(p.x);
  const y = qNum(p.y);
  return polyAdd(polyAdd(polyAdd(polyScal(polyVar("D"), q(x)), polyScal(polyVar("E"), q(y))), polyVar("F")), polyConst(q(x * x + y * y)));
}

/** Condition « ΩA = rayon » avec Ω(x_T ; k) (ou (k ; y_T)) : (x_A − x_Ω)² + (y_A − y_Ω)² − k² (polynôme en k). */
export function polyEquationK(e: Extract<E, { famille: "D" }>): Poly {
  const k = polyVar("k");
  const A = ptNum(e.A);
  const T = ptNum(e.T);
  const dx = e.axe === "abscisses" ? polyConst(q(A.x - T.x)) : polySub(polyConst(q(A.x)), k);
  const dy = e.axe === "abscisses" ? polySub(polyConst(q(A.y)), k) : polyConst(q(A.y - T.y));
  return polySub(polyAdd(polyMul(dx, dx), polyMul(dy, dy)), polyMul(k, k));
}

export function attentesCercles(e: E, p: P): Attente[] {
  const pt = (x: Pt) => ({ verif: champPoint(ptNum(x)) });
  const nb = (x: number) => ({ verif: champNombre(x) });
  switch (e.famille) {
    case "A":
      if (p === "aSysteme") return [e.A, e.B, e.C].map((x) => ({ verif: champEquation(polySysteme(x), { variables: ["D", "E", "F"] }) }));
      if (p === "aCoefficients") return [nb(e.D), nb(e.E), nb(e.F)];
      return [pt(e.centre), nb(Math.sqrt(qNum(e.r2)))];
    case "B":
      if (p === "bNombre") return [{ choix: String(e.verdict) }];
      if (p === "bMediatrice") return [{ verif: champEquation(polyDroite(e.mediatrice), { droite: true }) }];
      return [{ verif: champPoints(e.centres.map(ptNum)) }];
    case "C":
      if (p === "cMediatrice") return [{ verif: champEquation(polyDroite(e.mediatrice), { droite: true }) }];
      if (p === "cCentre") return [pt(e.centre)];
      return [{ verif: champEquation(polyCercle(e.centre, e.r2)) }];
    case "D":
      if (p === "dEquationK") return [{ verif: champEquation(polyEquationK(e), { variables: ["k"] }) }];
      if (p === "dCentreRayon") return [pt(e.centre), nb(Math.abs(qNum(e.k)))];
      return [{ verif: champEquation(polyCercle(e.centre, e.r2)) }];
    case "E":
      if (p === "eCotes") return [nb(e.triangle.a), nb(e.triangle.b), nb(e.triangle.c)];
      if (p === "eCentre") return [pt(e.centre)];
      return [nb(qNum(e.r))];
    case "F":
      if (p === "fDistance") return [nb(Math.sqrt(qNum(e.dist2)))];
      if (p === "fRayon2") return [nb(qNum(e.r2))];
      return [{ verif: champEquation(polyCercle(e.centre, e.r2)) }];
    case "G":
      if (p === "gSommets") return [pt(e.triangle.A), pt(e.triangle.B), pt(e.triangle.C)];
      if (p === "gCotes") return [nb(e.triangle.a), nb(e.triangle.b), nb(e.triangle.c)];
      if (p === "gCentre") return [pt(e.centre)];
      return [nb(qNum(e.r))];
  }
}

export const DEFINITION_6GEN55: DefinitionSession<E, P> = {
  phases: phasesPourExercice,
  diagnostiquer: (e, p, v) => diagnostiquerAttentes(attentesCercles(e, p), v),
  estChoix: (_e, p) => p === "bNombre",
};
