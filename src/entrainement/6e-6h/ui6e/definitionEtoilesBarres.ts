import type { Exercice104, Phase104 } from "../core6e/etoilesBarres";
import type { DefinitionEcrans } from "../../5e-4h/ui5e/ecransTrigo.types";
import { aide1_104, aide2_104, champs104, consigne104, consigneGenerale104, libelle104, messageIllisible104, phases104, recap104, reponse104Frag } from "./formatEtoilesBarres";
import { diagnostiquer104, piege104 } from "../moteur6e/verificationEtoilesBarres";
import { correctionDetaillee104 } from "../generateurs6e/etoilesBarres/corrigeDetaille";

/** `6gen104` sur le socle d'écrans partagé : trois écrans à champs (cases et objets, codage,
 * calcul), trois tentatives chacun ; illisible refusé sans tentative. */
export const DEFINITION_104: DefinitionEcrans<Exercice104, Phase104> = {
  phases: phases104,
  estChoix: () => false,
  mode: (e, p) => ({ type: "champs", champs: champs104(e, p) }),
  libelle: libelle104,
  consigneGenerale: consigneGenerale104,
  consigne: consigne104,
  aide1: aide1_104,
  aide2: aide2_104,
  diagnostiquer: diagnostiquer104,
  piege: piege104,
  messageIllisible: messageIllisible104,
  reponseAttendue: reponse104Frag,
  recap: recap104,
  correction: correctionDetaillee104,
};
