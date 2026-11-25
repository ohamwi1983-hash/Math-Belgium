import type { Exercice137, Phase137 } from "../core6e/hyperboleEquilatere";
import type { DefinitionEcrans } from "../../5e-4h/ui5e/ecransTrigo.types";
import { aide1_137, aide2_137, champs137, consigne137, consigneGenerale137, figure137, libelle137, messageIllisible137, phases137, recap137, reponse137 } from "./formatHyperboleEquilatere";
import { approchee137, diagnostiquer137, piege137 } from "../moteur6e/verificationHyperboleEquilatere";
import { correctionDetaillee137 } from "../generateurs6e/hyperboleEquilatere/corrigeDetaille";

/** `6gen137` sur le socle d'écrans partagé : trois écrans à champs (trois tentatives, illisible et valeur
 * approchée sans tentative). */
export const DEFINITION_137: DefinitionEcrans<Exercice137, Phase137> = {
  phases: phases137,
  estChoix: () => false,
  mode: (e, p) => ({ type: "champs", champs: champs137(e, p) }),
  libelle: libelle137,
  consigneGenerale: consigneGenerale137,
  figure: (e) => figure137(e),
  consigne: consigne137,
  approchee: approchee137,
  aide1: aide1_137,
  aide2: aide2_137,
  diagnostiquer: diagnostiquer137,
  piege: piege137,
  messageIllisible: messageIllisible137,
  reponseAttendue: reponse137,
  recap: recap137,
  correction: correctionDetaillee137,
};
