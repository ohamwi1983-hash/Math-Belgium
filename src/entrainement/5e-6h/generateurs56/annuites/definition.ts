import type { DefinitionEcrans } from "../../../5e-4h/ui5e/ecransTrigo.types";
import { tx } from "../../../5e-4h/ui5e/ecransTrigo.types";
import type { ExerciceAnnuites, PhaseAnnuites } from "./index";
import { nbVersements, phasesAnnuites } from "./index";
import { aide1, aide2, approchee, BONNE, champs, consigne, consigneGenerale, diagnostiquer, explicationChoix, libelle, messageIllisible, options, piege, recap, reponse } from "./format";
import { correctionDetailleeAnnuites } from "./corrigeDetaille";

const CHOIX: PhaseAnnuites[] = ["formule", "moment"];

/** `56gen27` : formule ou moment (choix), valeur acquise / actuelle, versement, intérêts, taux mensuel. */
export const DEFINITION_ANNUITES: DefinitionEcrans<ExerciceAnnuites, PhaseAnnuites> = {
  phases: phasesAnnuites,
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
  correction: correctionDetailleeAnnuites,
  apercuEnonce: (e) => [tx(`Annuités — ${nbVersements(e)} versements`)],
};
