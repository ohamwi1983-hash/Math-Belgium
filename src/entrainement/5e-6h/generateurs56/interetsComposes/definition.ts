import type { DefinitionEcrans } from "../../../5e-4h/ui5e/ecransTrigo.types";
import { tx } from "../../../5e-4h/ui5e/ecransTrigo.types";
import type { ExerciceInteretsComposes, PhaseInteretsComposes } from "./index";
import { phasesInteretsComposes } from "./index";
import { aide1, aide2, approchee, BONNE, champs, consigne, consigneGenerale, diagnostiquer, explicationChoix, libelle, messageIllisible, options, piege, recap, reponse } from "./format";
import { correctionDetailleeInteretsComposes } from "./corrigeDetaille";
import { pourcentT } from "../finance/commun";

const CHOIX: PhaseInteretsComposes[] = ["suite", "formule", "inequation"];

/** `56gen25` : choix (suite, formule, inéquation) et champs (montants au centime, taux, nombre d'années). */
export const DEFINITION_INTERETS_COMPOSES_56: DefinitionEcrans<ExerciceInteretsComposes, PhaseInteretsComposes> = {
  phases: phasesInteretsComposes,
  estChoix: (_e, p) => CHOIX.includes(p),
  mode: (e, p) => (CHOIX.includes(p) ? { type: "choix", options: options(e, p) } : { type: "champs", champs: champs(e, p) }),
  libelle,
  consigneGenerale,
  consigne,
  aide1,
  aide2,
  aidesChoixDeuxNiveaux: true,
  approchee,
  diagnostiquer,
  piege,
  bonneOption: () => BONNE,
  messageIllisible,
  reponseAttendue: reponse,
  recap,
  explicationChoix,
  correction: correctionDetailleeInteretsComposes,
  apercuEnonce: (e) => [tx(`Intérêts composés à ${pourcentT(e.tauxPct)}`)],
};
