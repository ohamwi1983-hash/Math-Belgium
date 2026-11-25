import type { ExercicePointsDroitesRemarquablesTriangle } from "../core6e/pointsDroitesRemarquablesTriangle.types";
import type { Attente } from "./attentesCombinatoire";
import { diagnostiquerAttentes } from "./attentesCombinatoire";
import type { DefinitionSession } from "./sessionCombinatoire";
import { phasesPourExercice } from "./typesPointsDroitesRemarquablesTriangle";
import type { PhasePointsDroitesRemarquablesTriangle } from "./typesPointsDroitesRemarquablesTriangle";
import { polyAdd, polyConst, polyDroite, polyScal, polyVar, ptNum, q } from "./algebreLieux";
import { champEquation, champEquations, champExpressionAuSigne, champNombre, champNombres, champPoint, champPoints } from "./saisieLieux";

/**
 * Attentes des écrans de `6gen54` (audit du 6e ch. 9, lots B et C) : équations de droite comparées
 * par proportionnalité EXACTE (fini le miroir accepté comme rayon réfléchi, G9), carré : tout
 * étiquetage valide (ensembles de sommets, G11), famille C : K + Mt au signe près (C(t) affiché, G10).
 */

type E = ExercicePointsDroitesRemarquablesTriangle;
type P = PhasePointsDroitesRemarquablesTriangle;

export function attentesPointsDroitesRemarquablesTriangle(e: E, p: P): Attente[] {
  const D = (d: Parameters<typeof polyDroite>[0]) => ({ verif: champEquation(polyDroite(d), { droite: true }) });
  switch (e.famille) {
    case "A":
      return p === "aSommetA" ? [{ verif: champPoint(ptNum(e.A)) }] : [{ verif: champPoint(ptNum(e.B)) }, { verif: champPoint(ptNum(e.C)) }];
    case "B":
      return p === "bLongueurs" ? [{ verif: champNombre(e.AB) }, { verif: champNombre(e.BC) }] : [{ verif: champPoint(ptNum(e.I)) }];
    case "C": {
      if (p === "cExpression") return [{ verif: champExpressionAuSigne(polyAdd(polyConst(q(e.K)), polyScal(polyVar("t"), q(e.M))), ["t"], `${e.K}+(${e.M})t`) }];
      if (p === "cValeursT") return [{ verif: champNombres([...e.t]) }];
      return [{ verif: champPoints(e.C.map(ptNum)) }];
    }
    case "D":
      if (p === "dPointB") return [{ verif: champPoint(ptNum(e.B)) }];
      if (p === "dPointC") return [{ verif: champPoint(ptNum(e.C)) }];
      return [D(e.AB), D(e.BC), D(e.CA)];
    case "E":
      if (p === "eNombre") return [{ choix: e.position === "milieu" ? "infinite" : e.position === "surAB" ? "une" : "deux" }];
      return [{ verif: champEquations(e.droites.map(polyDroite), { droite: true }) }];
    case "F":
      if (p === "fPerpendiculaire") return [D(e.perpendiculaire)];
      if (p === "fPied") return [{ verif: champPoint(ptNum(e.H)) }];
      return [{ verif: champPoint(ptNum(e.Q)) }];
    case "G":
      if (e.sousType === "sommetDiagonale") {
        if (p === "gPremier") return [{ verif: champPoint(ptNum(e.O)) }];
        if (p === "gDeuxieme") return [{ verif: champPoint(ptNum(e.C)) }];
        return [{ verif: champPoints([ptNum(e.B), ptNum(e.D)]) }];
      }
      if (p === "gPremier") return [{ verif: champPoint(ptNum(e.M)) }];
      if (p === "gDeuxieme") return [{ verif: champPoints([ptNum(e.A), ptNum(e.B)]) }];
      return [{ verif: champPoints([ptNum(e.C), ptNum(e.D)]) }];
    case "H":
      return p === "hSymetrique" ? [{ verif: champPoint(ptNum(e.Pp)) }] : [D(e.rayonReflechi)];
  }
}

export const DEFINITION_6GEN54: DefinitionSession<E, P> = {
  phases: phasesPourExercice,
  diagnostiquer: (e, p, v) => diagnostiquerAttentes(attentesPointsDroitesRemarquablesTriangle(e, p), v),
  estChoix: (_e, p) => p === "eNombre",
};
