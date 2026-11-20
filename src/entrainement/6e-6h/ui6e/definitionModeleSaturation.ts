import type { ExerciceModeleSaturation } from "../core6e/modeleSaturation";
import type { DefinitionEcrans } from "../../5e-4h/ui5e/ecransTrigo.types";
import type { PhaseModeleSaturation } from "./formatModeleSaturation";
import { PHASES_MODELE_SATURATION, aide1, aide2, champs, consigne, consigneGenerale, libelle, messageIllisible, recap, reponse, tableau } from "./formatModeleSaturation";
import { diagnostiquer, piege } from "../moteur6e/verificationModeleSaturation";
import { correctionDetailleeModeleSaturation } from "../generateurs6e/modeleSaturation/corrigeDetaille";

/** `6gen150` sur le socle d'écrans partagé : cinq écrans à champs libres, tableau des mesures. */
export const DEFINITION_MODELE_SATURATION: DefinitionEcrans<ExerciceModeleSaturation, PhaseModeleSaturation> = {
  phases: () => PHASES_MODELE_SATURATION,
  estChoix: () => false,
  mode: (e, p) => ({ type: "champs", champs: champs(e, p) }),
  libelle,
  consigneGenerale,
  tableau,
  consigne,
  aide1,
  aide2,
  diagnostiquer,
  piege,
  messageIllisible,
  reponseAttendue: reponse,
  recap,
  correction: correctionDetailleeModeleSaturation,
};
