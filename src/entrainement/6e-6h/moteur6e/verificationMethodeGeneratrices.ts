import type { ExerciceMethodeGeneratrices } from "../core6e/methodeGeneratrices.types";
import type { Attente } from "./attentesCombinatoire";
import { diagnostiquerAttentes } from "./attentesCombinatoire";
import type { DefinitionSession } from "./sessionCombinatoire";
import { phasesPourExercice } from "./typesMethodeGeneratrices";
import type { PhaseMethodeGeneratrices } from "./typesMethodeGeneratrices";
import { champEquation } from "./saisieLieux";

/**
 * Attentes des écrans de `6gen57` : génératrices et élimination comparées à une constante près
 * (« α » et « alpha » lus, « * » facultatif ; une inéquation est refusée sans tentative), forme
 * factorisée exigée quand l'équation a deux morceaux (une forme juste mais développée est refusée
 * SANS tentative, avec un message) ; statuts et restriction : choix fermés, une tentative.
 */

type E = ExerciceMethodeGeneratrices;
type P = PhaseMethodeGeneratrices;

export function attentesMethodeGeneratrices(e: E, p: P): Attente[] {
  switch (p) {
    case "generatrices":
      return e.generatrices.map((g) => ({ verif: champEquation(g, { variables: ["x", "y", e.parametre] }) }));
    case "elimination":
      return [{ verif: champEquation(e.elimine, { variables: ["x", "y"], facteurs: e.facteurs, reference: e.elimineTexte }) }];
    case "statut1":
      return [{ choix: e.morceaux[0].statut }];
    case "statut2":
      return [{ choix: e.morceaux[1].statut }];
    case "restriction":
      return [{ choix: e.idRestrictionCorrecte }];
  }
}

export const DEFINITION_6GEN57: DefinitionSession<E, P> = {
  phases: phasesPourExercice,
  diagnostiquer: (e, p, v) => diagnostiquerAttentes(attentesMethodeGeneratrices(e, p), v),
  estChoix: (_e, p) => p === "statut1" || p === "statut2" || p === "restriction",
};
