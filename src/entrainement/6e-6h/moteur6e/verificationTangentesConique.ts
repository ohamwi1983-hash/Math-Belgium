import type { DroiteMK, ExerciceTangentesConique } from "../core6e/tangentesConique.types";
import type { Attente } from "./attentesCombinatoire";
import { diagnostiquerAttentes } from "./attentesCombinatoire";
import type { DefinitionSession } from "./sessionCombinatoire";
import { phasesPourExercice } from "./typesTangentesConique";
import type { PhaseTangentesConique } from "./typesTangentesConique";
import { droiteNormalisee, polyAdd, polyConst, polyDroite, polyMul, polyScal, polySub, polyVar, ptNum, q, qNum } from "./algebreLieux";
import type { Droite, Poly, Q } from "./algebreLieux";
import { polyConique } from "./algebreConiques";
import { champEquation, champEquations, champNombre, champPoints } from "./saisieLieux";

/**
 * Attentes des écrans de `6gen62` (audit du 6e ch. 10, lots B et C) : équations par PROPORTIONNALITÉ
 * exacte (G19 : la bonne hyperbole verticale enfin acceptée), tangentes et points comme des ENSEMBLES
 * (ordre libre, G20), valeurs exactes.
 */

type E = ExerciceTangentesConique;
type P = PhaseTangentesConique;

export const droiteMK = (d: DroiteMK): Droite => droiteNormalisee(d.m, q(-1), d.k);

/** a·v² + b·v + c en la variable v. */
export function polyDegre2(v: string, [a, b, c]: [Q, Q, Q]): Poly {
  const x = polyVar(v);
  return polyAdd(polyAdd(polyScal(polyMul(x, x), a), polyScal(x, b)), polyConst(c));
}

export function attentesTangentesConique(e: E, p: P): Attente[] {
  switch (e.famille) {
    case "A":
      return p === "aPente" ? [{ verif: champNombre(qNum(e.pente)) }] : [{ verif: champEquation(polyDroite(e.tangente), { droite: true }) }];
    case "B":
      if (p === "bEquationK") return [{ verif: champEquation(polySub(polyMul(polyVar("k"), polyVar("k")), polyConst(e.k2)), { variables: ["k"] }) }];
      if (p === "bNombre") return [{ choix: String(e.verdict) }];
      return [{ verif: champEquations(e.tangentes.map((t) => polyDroite(droiteMK(t))), { droite: true }) }];
    case "C":
      if (p === "cEquationM") return [{ verif: champEquation(polyDegre2("m", e.eqM), { variables: ["m"] }) }];
      if (p === "cNombre") return [{ choix: String(e.verdict) }];
      return [{ verif: champEquations(e.tangentes.map((t) => polyDroite(droiteMK(t))), { droite: true }) }];
    case "D":
      return p === "dValeurs" ? [{ verif: champNombre(qNum(e.alpha)) }, { verif: champNombre(qNum(e.beta)) }] : [{ verif: champEquation(polyConique(e.conique)) }];
    case "E":
      return p === "eContacts" ? [{ verif: champPoints(e.points.map(ptNum)) }] : [{ choix: String(e.proche) }];
  }
}

const CHOIX: P[] = ["bNombre", "cNombre", "eProche"];

export const DEFINITION_6GEN62: DefinitionSession<E, P> = {
  phases: phasesPourExercice,
  diagnostiquer: (e, p, v) => diagnostiquerAttentes(attentesTangentesConique(e, p), v),
  estChoix: (_e, p) => CHOIX.includes(p),
};
