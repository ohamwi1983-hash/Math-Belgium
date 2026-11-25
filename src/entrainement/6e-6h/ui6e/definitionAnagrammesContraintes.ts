import type { Exercice103, Phase103 } from "../core6e/anagrammesContraintes";
import type { DefinitionEcrans } from "../../5e-4h/ui5e/ecransTrigo.types";
import { aide1_103, aide2_103, champs103, consigne103, consigneGenerale103, libelle103, messageIllisible103, phases103, recap103, reponse103 } from "./formatAnagrammesContraintes";
import { diagnostiquer103, piege103 } from "../moteur6e/verificationAnagrammesContraintes";
import { correctionDetaillee103 } from "../generateurs6e/anagrammesContraintes/corrigeDetaille";

/** `6gen103` sur le socle d'écrans partagé : deux ou trois écrans à champ (trois tentatives chacun),
 * illisible refusé sans tentative (le nombre d'écrans suit la variante, qui n'est pas un verdict). */
export const DEFINITION_103: DefinitionEcrans<Exercice103, Phase103> = {
  phases: phases103,
  estChoix: () => false,
  mode: (e, p) => ({ type: "champs", champs: champs103(e, p) }),
  libelle: libelle103,
  consigneGenerale: consigneGenerale103,
  consigne: consigne103,
  aide1: aide1_103,
  aide2: aide2_103,
  diagnostiquer: diagnostiquer103,
  piege: piege103,
  messageIllisible: messageIllisible103,
  reponseAttendue: reponse103,
  recap: recap103,
  correction: correctionDetaillee103,
};
