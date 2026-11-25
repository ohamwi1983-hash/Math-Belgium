import type { Exercice101, Phase101 } from "../core6e/equationsCombinatoires";
import type { DefinitionEcrans } from "../../5e-4h/ui5e/ecransTrigo.types";
import { aide1_101, aide2_101, champs101, consigne101, consigneGenerale101, libelle101, messageIllisible101, options101, phases101, recap101, reponse101 } from "./formatEquationsCombinatoires";
import { BONNE_PROPRIETE, aReprendre101, diagnostiquer101, piege101 } from "../moteur6e/verificationEquationsCombinatoires";
import { correctionDetaillee101 } from "../generateurs6e/equationsCombinatoires/corrigeDetaille";

/** `6gen101` sur le socle d'écrans partagé : polynôme (aperçu KaTeX ; forme de départ « à reprendre »
 * sans tentative), deux racines, valeur admissible ; symétrie : propriété (choix fermé, une
 * tentative, jugé ✗ / ✓) puis la solution. */
export const DEFINITION_101: DefinitionEcrans<Exercice101, Phase101> = {
  phases: phases101,
  estChoix: (_e, p) => p === "propriete",
  mode: (e, p) => (p === "propriete" ? { type: "choix", options: options101(e) } : { type: "champs", champs: champs101(e, p) }),
  libelle: libelle101,
  consigneGenerale: consigneGenerale101,
  consigne: consigne101,
  aide1: aide1_101,
  aide2: aide2_101,
  diagnostiquer: diagnostiquer101,
  aReprendre: aReprendre101,
  piege: piege101,
  messageIllisible: messageIllisible101,
  reponseAttendue: reponse101,
  recap: recap101,
  aidesChoixDeuxNiveaux: true,
  piegeChoixRevele: true,
  bonneOption: () => BONNE_PROPRIETE,
  correction: correctionDetaillee101,
};
