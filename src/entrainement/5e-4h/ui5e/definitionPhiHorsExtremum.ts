import type { ExercicePhiHorsExtremum } from "../core5e/phiHorsExtremum";
import type { DefinitionEcrans } from "./ecransTrigo.types";
import type { PhasePhi } from "./formatPhiHorsExtremum";
import { aide1, aide2, champs, consigne, consigneGenerale, explicationChoix, libelle, messageIllisible, optionsChoix, PHASES_PHI, recap, reponse } from "./formatPhiHorsExtremum";
import { diagnostiquer, piege } from "../moteur5e/verificationPhiHorsExtremum";
import { correctionDetailleePhiHorsExtremum } from "../generateurs5e/phiHorsExtremum/corrigeDetaille";

/** Définition des cinq écrans de `5gen54` (toujours les mêmes : les puces ne trahissent rien). */
export const DEFINITION_PHI_HORS_EXTREMUM: DefinitionEcrans<ExercicePhiHorsExtremum, PhasePhi> = {
  phases: () => PHASES_PHI,
  estChoix: (_e, p) => p === "choix",
  mode: (e, p) => (p === "choix" ? { type: "choix", options: optionsChoix(e) } : { type: "champs", champs: champs(e, p) }),
  libelle,
  consigneGenerale,
  consigne,
  aide1,
  aide2,
  diagnostiquer,
  piege,
  messageIllisible,
  reponseAttendue: reponse,
  recap,
  explicationChoix: (e) => explicationChoix(e),
  correction: correctionDetailleePhiHorsExtremum,
};
