import type { ExerciceEquationConiqueCaracteristiques } from "../core6e/equationConiqueCaracteristiques.types";
import type { Attente } from "./attentesCombinatoire";
import { diagnostiquerAttentes } from "./attentesCombinatoire";
import type { DefinitionSession } from "./sessionCombinatoire";
import { phasesPourExercice } from "./typesEquationConiqueCaracteristiques";
import type { PhaseEquationConiqueCaracteristiques } from "./typesEquationConiqueCaracteristiques";
import { qNum } from "./algebreLieux";
import { polyConique } from "./algebreConiques";
import { champEquation, champNombre } from "./saisieLieux";

/**
 * Attentes des écrans de `6gen59` (audit du 6e ch. 10, lots B et C) : équation finale comparée par
 * PROPORTIONNALITÉ exacte (réduite, développée, multiples ; « − » lu) ; p du COURS (dist(F ; d), y² = 2px,
 * G13) ; a = demi-grand axe ou demi-axe focal (G15).
 */

type E = ExerciceEquationConiqueCaracteristiques;
type P = PhaseEquationConiqueCaracteristiques;

const nb = (x: number): Attente => ({ verif: champNombre(x) });

/** Code de l'option « forme » de la parabole : axe et sens. */
export function codeOuverture(e: Extract<E, { famille: "B" }>): string {
  return `${e.conique.axe}${e.conique.sens > 0 ? "+" : "-"}`;
}

export function attentesEquationConiqueCaracteristiques(e: E, p: P): Attente[] {
  const c = e.conique;
  switch (p) {
    case "mNature":
      return e.famille === "A" && e.sousType === "memeAxe" ? [{ choix: e.nature }] : [];
    case "mValeurs":
      return e.famille === "A" && e.sousType === "memeAxe" ? [nb(e.a), nb(e.c), nb(Math.abs(e.a * e.a - e.c * e.c))] : [];
    case "pAxe":
      return e.famille === "A" && e.sousType === "axesPerpendiculaires" ? [{ choix: e.axeFocal }] : [];
    case "pValeurs":
      return e.famille === "A" && e.sousType === "axesPerpendiculaires" ? [nb(e.b), nb(e.c), nb(e.b * e.b + e.c * e.c)] : [];
    case "sValeurs":
      return e.famille === "A" && e.sousType === "deuxSommets" ? [nb(e.a), nb(e.b)] : [];
    case "bOuverture":
      return e.famille === "B" ? [{ choix: codeOuverture(e) }] : [];
    case "bP":
      return e.famille === "B" ? [nb(qNum(e.conique.p))] : [];
    case "cValeurs":
      return e.famille === "C" ? [nb(e.a), nb(e.c)] : [];
    case "cNature":
      return e.famille === "C" ? [{ choix: e.nature }] : [];
    case "cEquation":
      return e.famille === "C" ? [nb(Math.abs(e.a * e.a - e.c * e.c)), { verif: champEquation(polyConique(c)) }] : [];
    case "dValeurs":
      return e.famille === "D" ? [nb(e.a), nb(e.b)] : [];
    case "equation":
      return [{ verif: champEquation(polyConique(c)) }];
  }
}

const CHOIX: P[] = ["mNature", "pAxe", "bOuverture", "cNature"];

export const DEFINITION_6GEN59: DefinitionSession<E, P> = {
  phases: phasesPourExercice,
  diagnostiquer: (e, p, v) => diagnostiquerAttentes(attentesEquationConiqueCaracteristiques(e, p), v),
  estChoix: (_e, p) => CHOIX.includes(p),
};
