import type { Exercice115, Phase115 } from "../core6e/loiUniformeContinue";
import type { DefinitionEcrans } from "../../5e-4h/ui5e/ecransTrigo.types";
import { aide1_115, aide2_115, champs115, consigne115, consigneGenerale115, libelle115, messageIllisible115, phases115, recap115, reponse115 } from "./formatLoiUniformeContinue";
import { approchee115, diagnostiquer115, piege115 } from "../moteur6e/verificationLoiUniformeContinue";
import { correctionDetaillee115 } from "../generateurs6e/loiUniformeContinue/corrigeDetaille";

/** `6gen115` sur le socle d'écrans partagé : écrans à champs (trois tentatives, illisible, valeur
 * approchée et écart-type trop arrondi refusés sans tentative). */
export const DEFINITION_115: DefinitionEcrans<Exercice115, Phase115> = {
  phases: phases115,
  estChoix: () => false,
  mode: (e, p) => ({ type: "champs", champs: champs115(e, p) }),
  libelle: libelle115,
  consigneGenerale: consigneGenerale115,
  consigne: consigne115,
  approchee: approchee115,
  aide1: aide1_115,
  aide2: aide2_115,
  diagnostiquer: diagnostiquer115,
  piege: piege115,
  messageIllisible: messageIllisible115,
  reponseAttendue: reponse115,
  recap: recap115,
  correction: correctionDetaillee115,
};
