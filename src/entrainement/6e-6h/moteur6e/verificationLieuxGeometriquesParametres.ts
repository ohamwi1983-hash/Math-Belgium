import type { ExerciceLieuxGeometriquesParametres, PhaseLieuxGeometriquesParametres } from "../core6e/lieuxGeometriquesParametres.types";
import type { Attente } from "./attentesCombinatoire";
import { diagnostiquerAttentes } from "./attentesCombinatoire";
import type { DefinitionSession } from "./sessionCombinatoire";
import { phasesPourExercice } from "./typesLieuxGeometriquesParametres";
import { polyDroite, ptNum, qNum } from "./algebreLieux";
import { champEquation, champEquations, champNombre, champPoint, champPoints } from "./saisieLieux";

/**
 * Attentes des écrans de `6gen56` : droites comparées par proportionnalité EXACTE et comme un
 * ensemble (G24), sommets comme un ensemble (G23), équations du lieu à une constante près, Ω et R
 * exacts (R peut être nul ou négatif : c'est lui qui décide la nature), choix fermés à une tentative.
 */

type E = ExerciceLieuxGeometriquesParametres;
type P = PhaseLieuxGeometriquesParametres;

export function attentesLieuxGeometriquesParametres(e: E, p: P): Attente[] {
  switch (p) {
    case "nature":
      return [{ choix: e.nature ?? "" }];
    case "restriction":
      return [{ choix: e.restriction ?? "" }];
    case "droites":
      return [{ verif: champEquations((e.droites ?? []).map(polyDroite), { droite: true }) }];
    case "sommets":
      return [{ verif: champPoints((e.sommets ?? []).map(ptNum)) }];
    case "equation":
      return [{ verif: champEquation(e.equation!) }];
    case "centreR":
      return [{ verif: champPoint(ptNum(e.centre!)) }, { verif: champNombre(qNum(e.R!)) }];
  }
}

export const DEFINITION_6GEN56: DefinitionSession<E, P> = {
  phases: phasesPourExercice,
  diagnostiquer: (e, p, v) => diagnostiquerAttentes(attentesLieuxGeometriquesParametres(e, p), v),
  estChoix: (_e, p) => p === "nature" || p === "restriction",
};
