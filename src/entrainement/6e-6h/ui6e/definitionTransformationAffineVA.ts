import type { Exercice111, Phase111 } from "../core6e/transformationAffineVA";
import type { DefinitionEcrans } from "../../5e-4h/ui5e/ecransTrigo.types";
import { PHASES_111, aide1_111, aide2_111, champs111, consigne111, consigneGenerale111, libelle111, messageIllisible111, recap111, reponse111 } from "./formatTransformationAffineVA";
import { approchee111, diagnostiquer111, piege111 } from "../moteur6e/verificationTransformationAffineVA";
import { correctionDetaillee111 } from "../generateurs6e/transformationAffineVA/corrigeDetaille";

/** `6gen111` sur le socle d'écrans partagé : quatre écrans à champs (a et b, E(Y), V(Y), σ(Y)), trois
 * tentatives chacun ; illisible et valeur approchée sans tentative. */
export const DEFINITION_111: DefinitionEcrans<Exercice111, Phase111> = {
  phases: () => PHASES_111,
  estChoix: () => false,
  mode: (e, p) => ({ type: "champs", champs: champs111(e, p) }),
  libelle: libelle111,
  consigneGenerale: consigneGenerale111,
  consigne: consigne111,
  approchee: approchee111,
  aide1: aide1_111,
  aide2: aide2_111,
  diagnostiquer: diagnostiquer111,
  piege: piege111,
  messageIllisible: messageIllisible111,
  reponseAttendue: reponse111,
  recap: recap111,
  correction: correctionDetaillee111,
};
