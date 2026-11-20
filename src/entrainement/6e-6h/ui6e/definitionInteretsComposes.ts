import type { ExerciceInteretsComposes } from "../core6e/interetsComposes";
import type { DefinitionEcrans } from "../../5e-4h/ui5e/ecransTrigo.types";
import type { PhaseInteretsComposes } from "./formatInteretsComposes";
import { PHASES_INTERETS, aide1, aide2, champs, consigne, consigneGenerale, libelle, messageIllisible, recap, reponse } from "./formatInteretsComposes";
import { diagnostiquer, piege } from "../moteur6e/verificationInteretsComposes";
import { correctionDetailleeInteretsComposes } from "../generateurs6e/interetsComposes/corrigeDetaille";

/** `6gen151` sur le socle d'écrans partagé : trois écrans à champs libres (le premier en a trois). */
export const DEFINITION_INTERETS_COMPOSES: DefinitionEcrans<ExerciceInteretsComposes, PhaseInteretsComposes> = {
  phases: () => PHASES_INTERETS,
  estChoix: () => false,
  mode: (e, p) => ({ type: "champs", champs: champs(e, p) }),
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
  correction: correctionDetailleeInteretsComposes,
};
