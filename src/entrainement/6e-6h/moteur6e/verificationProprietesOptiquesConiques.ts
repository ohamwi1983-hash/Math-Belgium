import type { ExerciceProprietesOptiquesConiques } from "../core6e/proprietesOptiquesConiques.types";
import type { Attente } from "./attentesCombinatoire";
import { diagnostiquerAttentes } from "./attentesCombinatoire";
import type { DefinitionSession } from "./sessionCombinatoire";
import { phasesPourExercice } from "./typesProprietesOptiquesConiques";
import type { PhaseProprietesOptiquesConiques } from "./typesProprietesOptiquesConiques";
import { polyDroite, ptNum } from "./algebreLieux";
import { champEquation, champPoint } from "./saisieLieux";

/**
 * Attentes des écrans de `6gen63` (audit du 6e ch. 10, lots B et C) : points exacts, droite du rayon
 * réfléchi par proportionnalité exacte, propriété optique en choix fermé à une tentative parmi quatre
 * (un vrai choix pour les trois coniques, G23).
 */

type E = ExerciceProprietesOptiquesConiques;
type P = PhaseProprietesOptiquesConiques;

export function attentesProprietesOptiquesConiques(e: E, p: P): Attente[] {
  switch (p) {
    case "foyers":
      return e.Fp ? [{ verif: champPoint(ptNum(e.F)) }, { verif: champPoint(ptNum(e.Fp)) }] : [{ verif: champPoint(ptNum(e.F)) }];
    case "impact":
      return [{ verif: champPoint(ptNum(e.R)) }];
    case "propriete":
      return [{ choix: e.propriete }];
    case "reflechi":
      return [{ verif: champEquation(polyDroite(e.reflechi), { droite: true }) }];
  }
}

export const DEFINITION_6GEN63: DefinitionSession<E, P> = {
  phases: phasesPourExercice,
  diagnostiquer: (e, p, v) => diagnostiquerAttentes(attentesProprietesOptiquesConiques(e, p), v),
  estChoix: (_e, p) => p === "propriete",
};
