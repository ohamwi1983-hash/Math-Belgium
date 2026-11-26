import type { DefinitionEcrans } from "../../../5e-4h/ui5e/ecransTrigo.types";
import { tx } from "../../../5e-4h/ui5e/ecransTrigo.types";
import type { ExerciceInteretSimple, PhaseInteretSimple } from "./index";
import { phasesInteretSimple } from "./index";
import {
  aide1,
  aide2,
  approchee,
  BONNE_FORMULE,
  champs,
  consigne,
  consigneGenerale,
  diagnostiquer,
  explicationChoix,
  libelle,
  messageIllisible,
  optionsFormule,
  piege,
  recap,
  reponse,
} from "./format";
import { correctionDetailleeInteretSimple } from "./corrigeDetaille";
import { eurT } from "../finance/commun";

/** `56gen24` : écrans « jours » / « durée », intérêt, valeur acquise, formule transformée (choix), grandeur retrouvée. */
export const DEFINITION_INTERET_SIMPLE: DefinitionEcrans<ExerciceInteretSimple, PhaseInteretSimple> = {
  phases: phasesInteretSimple,
  estChoix: (_e, p) => p === "formule",
  mode: (e, p) => (p === "formule" ? { type: "choix", options: optionsFormule(e) } : { type: "champs", champs: champs(e, p) }),
  libelle,
  consigneGenerale,
  consigne,
  aide1,
  aide2,
  aidesChoixDeuxNiveaux: true,
  approchee,
  diagnostiquer,
  piege,
  piegeChoixRevele: true,
  bonneOption: () => BONNE_FORMULE,
  messageIllisible,
  reponseAttendue: reponse,
  recap,
  explicationChoix,
  correction: correctionDetailleeInteretSimple,
  apercuEnonce: (e) => [tx(`Intérêt simple — ${e.variante === "capital" ? "capital à retrouver" : `${eurT(e.C0)}`}`)],
};
