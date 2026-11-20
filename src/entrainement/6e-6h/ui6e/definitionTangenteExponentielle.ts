import type { ExerciceTangenteExpo } from "../core6e/tangenteExponentielle";
import type { DefinitionEcrans } from "../../5e-4h/ui5e/ecransTrigo.types";
import type { PhaseTangenteExpo } from "./formatTangenteExponentielle";
import { aide1, aide2, champs, consigne, consigneGenerale, explicationChoix, libelle, messageIllisible, options, phases, recap, reponse } from "./formatTangenteExponentielle";
import { diagnostiquer, piege } from "../moteur6e/verificationTangenteExponentielle";
import { correctionDetailleeTangenteExpo } from "../generateurs6e/tangenteExponentielle/corrigeDetaille";

/** `6gen149` sur le socle d'écrans partagé : verdict « signe » (choix fermé, 1 tentative, 2 niveaux
 * d'aide) puis champs libres. */
export const DEFINITION_TANGENTE_EXPO: DefinitionEcrans<ExerciceTangenteExpo, PhaseTangenteExpo> = {
  phases,
  estChoix: (_e, p) => p === "signe",
  mode: (e, p) => (p === "signe" ? { type: "choix", options: options(e) } : { type: "champs", champs: champs(e, p) }),
  libelle,
  consigneGenerale,
  consigne,
  aide1,
  aide2,
  aidesChoixDeuxNiveaux: true,
  diagnostiquer,
  piege,
  messageIllisible,
  reponseAttendue: reponse,
  recap,
  explicationChoix: (e) => explicationChoix(e),
  correction: correctionDetailleeTangenteExpo,
};
